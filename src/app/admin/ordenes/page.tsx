import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OrdenesPage() {
  const supabase = await createClient()

  const { data: ordenes, error } = await supabase
    .from('ordenes_medicas')
    .select(`
      *,
      alumnos (
        nombre,
        apellidos,
        nivel_educativo
      )
    `)
    .order('id_orden', { ascending: false })

  if (error) {
    console.error('Error al cargar órdenes:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes Médicas</h1>
        <Link
          href="/admin/ordenes/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + Nueva Orden Médica
        </Link>
      </div>

      {ordenes && ordenes.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenes.map((orden) => (
                <tr key={orden.id_orden}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {orden.alumnos?.nombre} {orden.alumnos?.apellidos}
                    </div>
                    <div className="text-sm text-gray-500">
                      {orden.alumnos?.nivel_educativo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {orden.nombre_farmaco}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {orden.dosis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(orden.fecha_inicio).toLocaleDateString('es-CL')}</div>
                    <div>al {new Date(orden.fecha_termino).toLocaleDateString('es-CL')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      orden.estado === 'Activa' ? 'bg-green-100 text-green-800' :
                      orden.estado === 'Completada' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/ordenes/${orden.id_orden}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-500 text-lg mb-4">No hay órdenes médicas registradas</div>
          <Link
            href="/admin/ordenes/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            + Crear primera orden médica
          </Link>
        </div>
      )}
    </div>
  )
}