import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Pill, User, Heart } from 'lucide-react'

export default async function ApoderadoLayout({
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
    .select('rol, nombre_completo')
    .eq('auth_id', user.id)
    .single()

  if (userData?.rol !== 'Apoderado') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">MedControl</span>
                <span className="hidden sm:inline text-gray-300 mx-2">|</span>
                <span className="hidden sm:inline text-sm text-gray-500">Instituto Parvulario Laudelina Araneda</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/apoderado/dashboard" 
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                Mi Pupilo
              </Link>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{userData?.nombre_completo}</div>
                  <div className="text-xs text-gray-500">Apoderado</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-700" />
                </div>
              </div>

              {/* Logout */}
              <form action="/api/auth/signout" method="post" className="pl-6 border-l border-gray-200">
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 gap-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Instituto Parvulario Laudelina Araneda</span>
            </div>
            <div>MedControl v1.0 — Sistema de control médico</div>
          </div>
        </div>
      </footer>
    </div>
  )
}