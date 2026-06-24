'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NuevoUsuarioPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Usuario, 2: Apoderado
  const router = useRouter()
  const supabase = createClient()

  // Datos del usuario (Supabase Auth + tabla usuarios)
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    nombre_usuario: '',
    rut: '',
    nombre_completo: '',
    rol: 'Apoderado' as 'Administrativo' | 'Educadora' | 'Apoderado',
  })

  // Datos del apoderado (solo si rol es Apoderado)
  const [apoderadoData, setApoderadoData] = useState({
    telefono: '',
    telefono_alternativo: '',
    correo: '',
    direccion: '',
    parentesco: '',
    es_contacto_emergencia: true,
  })

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      // 2. Crear en tabla usuarios
      const { data: userRecord, error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            auth_id: authData.user.id,
            nombre_usuario: userData.nombre_usuario,
            rut: userData.rut,
            nombre_completo: userData.nombre_completo,
            correo: userData.email,
            contrasena: 'AUTH_MANAGED',
            rol: userData.rol,
          },
        ])
        .select()
        .single()

      if (userError) throw userError

      // 3. Si es apoderado, crear en tabla apoderados
      if (userData.rol === 'Apoderado') {
        setStep(2)
        // Guardamos el id_usuario para el siguiente paso
        localStorage.setItem('temp_user_id', userRecord.id_usuario.toString())
      } else {
        router.push('/admin/usuarios')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApoderado = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const userId = localStorage.getItem('temp_user_id')
      if (!userId) throw new Error('Error de sesión')

      const { error: apoderadoError } = await supabase
        .from('apoderados')
        .insert([
          {
            id_usuario: parseInt(userId),
            rut: userData.rut,
            nombre_completo: userData.nombre_completo,
            telefono: apoderadoData.telefono,
            telefono_alternativo: apoderadoData.telefono_alternativo || null,
            correo: apoderadoData.correo || userData.email,
            direccion: apoderadoData.direccion,
            parentesco: apoderadoData.parentesco,
            es_contacto_emergencia: apoderadoData.es_contacto_emergencia,
          },
        ])

      if (apoderadoError) throw apoderadoError

      localStorage.removeItem('temp_user_id')
      router.push('/admin/usuarios')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear el apoderado')
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Completar Datos de Apoderado</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateApoderado} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Principal *
              </label>
              <input
                type="tel"
                required
                value={apoderadoData.telefono}
                onChange={(e) => setApoderadoData({...apoderadoData, telefono: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Alternativo
              </label>
              <input
                type="tel"
                value={apoderadoData.telefono_alternativo}
                onChange={(e) => setApoderadoData({...apoderadoData, telefono_alternativo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Apoderado
              </label>
              <input
                type="email"
                value={apoderadoData.correo}
                onChange={(e) => setApoderadoData({...apoderadoData, correo: e.target.value})}
                placeholder={userData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parentesco *
              </label>
              <select
                required
                value={apoderadoData.parentesco}
                onChange={(e) => setApoderadoData({...apoderadoData, parentesco: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Abuela">Abuela</option>
                <option value="Abuelo">Abuelo</option>
                <option value="Tía">Tía</option>
                <option value="Tío">Tío</option>
                <option value="Tutor legal">Tutor legal</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                required
                value={apoderadoData.direccion}
                onChange={(e) => setApoderadoData({...apoderadoData, direccion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={apoderadoData.es_contacto_emergencia}
                  onChange={(e) => setApoderadoData({...apoderadoData, es_contacto_emergencia: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Es contacto de emergencia principal</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Completar Registro'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Usuario</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateUser} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              required
              value={userData.nombre_usuario}
              onChange={(e) => setUserData({...userData, nombre_usuario: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUT *
            </label>
            <input
              type="text"
              required
              value={userData.rut}
              onChange={(e) => setUserData({...userData, rut: e.target.value})}
              placeholder="12.345.678-9"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={userData.nombre_completo}
              onChange={(e) => setUserData({...userData, nombre_completo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              required
              value={userData.rol}
              onChange={(e) => setUserData({...userData, rol: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Apoderado">Apoderado</option>
              <option value="Educadora">Educadora</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/usuarios')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Siguiente'}
          </button>
        </div>
      </form>
    </div>
  )
}