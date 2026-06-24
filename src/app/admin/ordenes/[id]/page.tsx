import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrdenDetallePage({ params }: Props) {
  // Desempaquetar params (Next.js 16 requiere esto)
  const { id } = await params
  const idOrden = parseInt(id)

  const supabase = await createClient()

  if (isNaN(idOrden)) {
    notFound()
  }

  // Obtener la orden con datos del alumno
  const { data: orden, error: ordenError } = await supabase
    .from('ordenes_medicas')
    .select(`
      *,
      alumnos (
        nombre,
        apellidos,
        nivel_educativo,
        fecha_nacimiento,
        apoderados (
          nombre_completo,
          telefono,
          correo
        )
      )
    `)
    .eq('id_orden', idOrden)
    .single()

  if (ordenError || !orden) {
    console.error('Error al cargar orden:', ordenError)
    notFound()
  }

  // Obtener horarios de medicación
  const { data: horarios, error: horariosError } = await supabase
    .from('horarios_medicacion')
    .select('*')
    .eq('id_orden', idOrden)

  if (horariosError) {
    console.error('Error al cargar horarios:', horariosError)
  }

  // Obtener IDs de horarios para filtrar entregas
  const horariosIds = horarios?.map(h => h.id_horario) || []

  // Obtener entregas relacionadas
  let entregas: any[] = []
  if (horariosIds.length > 0) {
    const { data: entregasData, error: entregasError } = await supabase
      .from('entregas_medicamentos')
      .select(`
        *,
        horarios_medicacion (
          hora_administracion
        ),
        usuarios (
          nombre_completo
        )
      `)
      .in('id_horario', horariosIds)
      .order('fecha_entrega', { ascending: true })
      .limit(50)

    if (entregasError) {
      console.error('Error al cargar entregas:', entregasError)
    } else {
      entregas = entregasData || []
    }
  }

  const entregasPendientes = entregas.filter(e => !e.entregado).length
  const entregasCompletadas = entregas.filter(e => e.entregado).length

  // Helper para formatear fechas de forma segura
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No disponible'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha inválida'
      return date.toLocaleDateString('es-CL')
    } catch {
      return 'Fecha inválida'
    }
  }

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '--:--'
    try {
      if (typeof timeString === 'string' && timeString.includes(':')) {
        return timeString.slice(0, 5)
      }
      const date = new Date(timeString)
      if (isNaN(date.getTime())) return '--:--'
      return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '--:--'
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleString('es-CL')
    } catch {
      return '-'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/ordenes"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Volver a Órdenes
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Orden Médica #{orden.id_orden}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              orden.estado === 'Activa' ? 'bg-green-100 text-green-800' :
              orden.estado === 'Completada' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {orden.estado || 'Activa'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Creada el</div>
            <div className="text-sm font-medium">
              {formatDate(orden.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Alumno */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alumno</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Nombre:</span>
              <p className="font-medium">
                {orden.alumnos?.nombre || 'No disponible'} {orden.alumnos?.apellidos || ''}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Nivel:</span>
              <p className="font-medium">{orden.alumnos?.nivel_educativo || 'No disponible'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Fecha de Nacimiento:</span>
              <p className="font-medium">{formatDate(orden.alumnos?.fecha_nacimiento)}</p>
            </div>
          </div>

          <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Apoderado</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Nombre:</span>
              <p className="font-medium">{orden.alumnos?.apoderados?.nombre_completo || 'No disponible'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Teléfono:</span>
              <p className="font-medium">{orden.alumnos?.apoderados?.telefono || 'No disponible'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Correo:</span>
              <p className="font-medium">{orden.alumnos?.apoderados?.correo || 'No disponible'}</p>
            </div>
          </div>
        </div>

        {/* Información del Medicamento */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medicamento</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Fármaco:</span>
              <p className="font-medium text-lg">{orden.nombre_farmaco || 'No especificado'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Dosis:</span>
              <p className="font-medium">{orden.dosis || 'No especificada'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div>
                <span className="text-sm text-gray-500">Inicio:</span>
                <p className="font-medium">{formatDate(orden.fecha_inicio)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Término:</span>
                <p className="font-medium">{formatDate(orden.fecha_termino)}</p>
              </div>
            </div>
          </div>

          {orden.documento_orden_medica && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Documento adjunto:</span>
              <a
                href={orden.documento_orden_medica}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                📄 Ver orden médica PDF
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Horarios de Medicación */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Horarios de Administración</h2>
        {horarios && horarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {horarios.map((horario) => (
              <div key={horario.id_horario} className="border rounded-lg p-4 bg-gray-50">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatTime(horario.hora_administracion)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {horario.dias_semana || 'Lunes a Viernes'}
                </div>
                {horario.observaciones && (
                  <div className="text-sm text-gray-500 italic">
                    &ldquo;{horario.observaciones}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay horarios configurados</p>
        )}
      </div>

      {/* Resumen de Entregas */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Entregas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{entregasPendientes}</div>
            <div className="text-sm text-yellow-600">Pendientes</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{entregasCompletadas}</div>
            <div className="text-sm text-green-600">Completadas</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{entregas.length}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
        </div>

        {/* Tabla de entregas recientes */}
        {entregas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora Programada</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entregado por</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entregas.map((entrega) => (
                  <tr key={entrega.id_entrega}>
                    <td className="px-4 py-2 text-sm">
                      {formatDate(entrega.fecha_entrega)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {formatTime(entrega.horarios_medicacion?.hora_administracion)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entrega.entregado
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entrega.entregado ? 'Entregado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {entrega.usuarios?.nombre_completo || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {formatDateTime(entrega.hora_entrega_real)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {entregas.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No hay entregas generadas todavía. Verifica que los horarios se hayan creado correctamente.
          </p>
        )}
      </div>
    </div>
  )
}