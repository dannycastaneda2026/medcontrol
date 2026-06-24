import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AlumnoDetallePage({ params }: Props) {
  const { id } = await params
  const idAlumno = parseInt(id, 10)

  if (Number.isNaN(idAlumno)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select(`
      *,
      apoderados (
        nombre_completo,
        telefono,
        correo,
        direccion,
        parentesco
      )
    `)
    .eq('id_alumno', idAlumno)
    .single()

  if (alumnoError || !alumno) {
    console.error('Error al cargar alumno:', alumnoError)
    notFound()
  }

  const { data: ordenes, error: ordenesError } = await supabase
    .from('ordenes_medicas')
    .select('*')
    .eq('id_alumno', idAlumno)
    .order('created_at', { ascending: false })

  if (ordenesError) {
    console.error('Error al cargar órdenes médicas:', ordenesError)
  }

  const totalOrdenes = ordenes?.length ?? 0
  const ordenesActivas = ordenes?.filter((orden) => orden.estado === 'Activa').length ?? 0
  const ordenesCompletadas = ordenes?.filter((orden) => orden.estado === 'Completada').length ?? 0

  const formatDate = (value: string | null | undefined) => {
    if (!value) return 'No disponible'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Fecha inválida'
    return date.toLocaleDateString('es-CL')
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/alumnos" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Alumnos
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Alumno #{alumno.id_alumno}
            </h1>
            <p className="text-gray-600">
              {alumno.nombre} {alumno.apellidos}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Registrado el</div>
            <div className="text-sm font-medium">{formatDate(alumno.created_at)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Alumno</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <span className="block text-gray-500">Fecha de nacimiento</span>
              <p className="font-medium">{formatDate(alumno.fecha_nacimiento)}</p>
            </div>
            <div>
              <span className="block text-gray-500">Nivel educativo</span>
              <p className="font-medium">{alumno.nivel_educativo || 'No especificado'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Dirección</span>
              <p className="font-medium">{alumno.direccion || 'No especificada'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Teléfono de emergencia</span>
              <p className="font-medium">{alumno.telefono_contacto_emergencias || 'No disponible'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Plan de salud</span>
              <p className="font-medium">{alumno.plan_salud || 'No especificado'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Centros recomendados</span>
              <p className="font-medium">{alumno.centros_medicos_recomendados || 'Ninguno'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Apoderado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="block text-gray-500">Nombre completo</span>
              <p className="font-medium">{alumno.apoderados?.nombre_completo || 'No disponible'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Teléfono</span>
              <p className="font-medium">{alumno.apoderados?.telefono || 'No disponible'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Correo</span>
              <p className="font-medium">{alumno.apoderados?.correo || 'No disponible'}</p>
            </div>
            <div>
              <span className="block text-gray-500">Parentesco</span>
              <p className="font-medium">{alumno.apoderados?.parentesco || 'No disponible'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="block text-gray-500">Dirección</span>
              <p className="font-medium">{alumno.apoderados?.direccion || 'No disponible'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Órdenes médicas</h2>
            <p className="text-sm text-gray-500">Resumen de los registros asociados al alumno.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">{totalOrdenes}</div>
              <div className="text-xs uppercase tracking-wide text-blue-600">Total</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{ordenesActivas}</div>
              <div className="text-xs uppercase tracking-wide text-green-600">Activas</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-700">{ordenesCompletadas}</div>
              <div className="text-xs uppercase tracking-wide text-slate-600">Completadas</div>
            </div>
          </div>
        </div>

        {ordenes && ordenes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fármaco</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Término</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ordenes.map((orden) => (
                  <tr key={orden.id_orden}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{orden.id_orden}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{orden.nombre_farmaco}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{orden.dosis}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        orden.estado === 'Activa'
                          ? 'bg-green-100 text-green-800'
                          : orden.estado === 'Completada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {orden.estado || 'Sin estado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(orden.fecha_inicio)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(orden.fecha_termino)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-sm py-6 text-center">
            No se encontraron órdenes médicas para este alumno.
          </div>
        )}
      </div>
    </div>
  )
}
