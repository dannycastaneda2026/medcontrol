import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // ignore
          }
        },
      },
    }
  )
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const params = await context.params
  const userId = Number(params.id)

  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 })
  }

  const { data: userRow, error: fetchError } = await supabase
    .from('usuarios')
    .select('auth_id')
    .eq('id_usuario', userId)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!userRow) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // Obtener apoderados vinculados al usuario
  const { data: apoderadosList, error: apoderadosFetchError } = await supabase
    .from('apoderados')
    .select('id_apoderado')
    .eq('id_usuario', userId)

  if (apoderadosFetchError) {
    return NextResponse.json({ error: apoderadosFetchError.message }, { status: 500 })
  }

  const apoderadoIds = (apoderadosList || []).map((a: any) => a.id_apoderado).filter(Boolean)
  // Si existen apoderados, recorrer dependencias y borrarlas en orden
  if (apoderadoIds.length > 0) {
    // Obtener alumnos vinculados a los apoderados
    const { data: alumnosList, error: alumnosFetchError } = await supabase
      .from('alumnos')
      .select('id_alumno')
      .in('id_apoderado', apoderadoIds)

    if (alumnosFetchError) {
      return NextResponse.json({ error: alumnosFetchError.message }, { status: 500 })
    }

    const alumnoIds = (alumnosList || []).map((a: any) => a.id_alumno).filter(Boolean)

    if (alumnoIds.length > 0) {
      // Obtener órdenes médicas de los alumnos
      const { data: ordenesList, error: ordenesFetchError } = await supabase
        .from('ordenes_medicas')
        .select('id_orden')
        .in('id_alumno', alumnoIds)

      if (ordenesFetchError) {
        return NextResponse.json({ error: ordenesFetchError.message }, { status: 500 })
      }

      const ordenIds = (ordenesList || []).map((o: any) => o.id_orden).filter(Boolean)

      if (ordenIds.length > 0) {
        // Obtener horarios de las órdenes
        const { data: horariosList, error: horariosFetchError } = await supabase
          .from('horarios_medicacion')
          .select('id_horario')
          .in('id_orden', ordenIds)

        if (horariosFetchError) {
          return NextResponse.json({ error: horariosFetchError.message }, { status: 500 })
        }

        const horarioIds = (horariosList || []).map((h: any) => h.id_horario).filter(Boolean)

        if (horarioIds.length > 0) {
          // Borrar entregas vinculadas a horarios
          const { error: deleteEntregasError } = await supabase
            .from('entregas_medicamentos')
            .delete()
            .in('id_horario', horarioIds)

          if (deleteEntregasError) {
            return NextResponse.json({ error: deleteEntregasError.message }, { status: 500 })
          }

          // Borrar horarios
          const { error: deleteHorariosError } = await supabase
            .from('horarios_medicacion')
            .delete()
            .in('id_horario', horarioIds)

          if (deleteHorariosError) {
            return NextResponse.json({ error: deleteHorariosError.message }, { status: 500 })
          }
        }

        // Borrar órdenes médicas
        const { error: deleteOrdenesError } = await supabase
          .from('ordenes_medicas')
          .delete()
          .in('id_orden', ordenIds)

        if (deleteOrdenesError) {
          return NextResponse.json({ error: deleteOrdenesError.message }, { status: 500 })
        }
      }

      // Borrar alumnos
      const { error: deleteAlumnosError } = await supabase
        .from('alumnos')
        .delete()
        .in('id_alumno', alumnoIds)

      if (deleteAlumnosError) {
        return NextResponse.json({ error: deleteAlumnosError.message }, { status: 500 })
      }
    }

    // Borrar apoderados
    const { error: deleteApoderadosError } = await supabase
      .from('apoderados')
      .delete()
      .in('id_apoderado', apoderadoIds)

    if (deleteApoderadosError) {
      return NextResponse.json({ error: deleteApoderadosError.message }, { status: 500 })
    }
  }

  // Borrar usuario
  const { error: deleteError } = await supabase
    .from('usuarios')
    .delete()
    .eq('id_usuario', userId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (serviceRoleKey && userRow.auth_id) {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { error: authError } = await adminClient.auth.admin.deleteUser(userRow.auth_id)

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
