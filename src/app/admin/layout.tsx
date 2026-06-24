import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_id', user.id)
    .single()

  if (userData?.rol !== 'Administrativo') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">MedControl Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/admin/usuarios" className="text-gray-700 hover:text-blue-600">
                Usuarios
              </Link>
              <Link href="/admin/alumnos" className="text-gray-700 hover:text-blue-600">
                Alumnos
              </Link>
              <Link href="/admin/ordenes" className="text-gray-700 hover:text-blue-600">
                Órdenes
              </Link>
              <Link href="/admin/configuracion" className="text-gray-700 hover:text-blue-600">
  Configuración
</Link>
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="text-red-600 hover:text-red-800">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}