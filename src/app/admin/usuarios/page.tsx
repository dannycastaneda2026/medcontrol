import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ResetPasswordButton from './ResetPasswordButton'
import DeleteUserButton from './DeleteUserButton'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('id_usuario', { ascending: false })

  if (error) {
    console.error('Error al cargar usuarios:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Link
          href="/admin/usuarios/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Usuario
        </Link>
      </div>

      {usuarios && usuarios.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nombre_completo}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{usuario.nombre_usuario}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.rut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.rol === 'Administrativo' ? 'bg-red-100 text-red-800' :
                      usuario.rol === 'Educadora' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-y-2">
                    <div>
                      <ResetPasswordButton email={usuario.correo} />
                    </div>
                    <div>
                      <DeleteUserButton userId={usuario.id_usuario} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-500 text-lg mb-4">No hay usuarios registrados</div>
        </div>
      )}
    </div>
  )
}