import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AlumnosPage() {
  const supabase = await createClient()

  const { data: alumnos, error } = await supabase
    .from('alumnos')
    .select(`
      *,
      apoderados (
        nombre_completo,
        telefono,
        correo
      )
    `)
    .order('id_alumno', { ascending: false })

  if (error) {
    console.error('Error al cargar alumnos:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
        <Link
          href="/admin/alumnos/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Alumno
        </Link>
      </div>

      {alumnos && alumnos.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel Educativo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apoderado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alumnos.map((alumno) => (
                <tr key={alumno.id_alumno}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {alumno.nombre} {alumno.apellidos}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(alumno.fecha_nacimiento).toLocaleDateString('es-CL')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {alumno.nivel_educativo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {alumno.apoderados?.nombre_completo || 'Sin apoderado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{alumno.apoderados?.telefono}</div>
                    <div>{alumno.apoderados?.correo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/alumnos/${alumno.id_alumno}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/alumnos/${alumno.id_alumno}/editar`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-500 text-lg mb-4">No hay alumnos registrados</div>
          <p className="text-gray-400 mb-6">Comienza creando el primer alumno del sistema</p>
          <Link
            href="/admin/alumnos/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            + Crear primer alumno
          </Link>
        </div>
      )}
    </div>
  )
}