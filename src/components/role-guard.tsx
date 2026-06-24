'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'Administrativo' | 'Educadora' | 'Apoderado'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_id', user.id)
          .single()

        if (error || !userData) {
          router.push('/login')
          return
        }

        if (!allowedRoles.includes(userData.rol as UserRole)) {
          // Redirigir al dashboard correspondiente
          switch (userData.rol) {
            case 'Administrativo':
              router.push('/admin/dashboard')
              break
            case 'Educadora':
              router.push('/educadora/dashboard')
              break
            case 'Apoderado':
              router.push('/apoderado/dashboard')
              break
          }
          return
        }

        setAuthorized(true)
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkRole()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}