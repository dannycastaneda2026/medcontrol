'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onSuccess: (userId: number, userData: { rut: string; nombre_completo: string; email: string }) => void
}

export default function UsuarioForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre_usuario: '',
    rut: '',
    nombre_completo: '',
    rol: 'Apoderado' as 'Administrativo' | 'Educadora' | 'Apoderado',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const { data: userRecord, error: userError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: authData.user.id,
          nombre_usuario: form.nombre_usuario,
          rut: form.rut,
          nombre_completo: form.nombre_completo,
          correo: form.email,
          contrasena: 'AUTH_MANAGED',
          rol: form.rol,
        })
        .select()
        .single()

      if (userError) throw userError

      onSuccess(userRecord.id_usuario, {
        rut: form.rut,
        nombre_completo: form.nombre_completo,
        email: form.email,
      })
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Usuario *</label>
          <input
            type="text"
            required
            value={form.nombre_usuario}
            onChange={e => setForm(f => ({ ...f, nombre_usuario: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
          <input
            type="text"
            required
            value={form.rut}
            onChange={e => setForm(f => ({ ...f, rut: e.target.value }))}
            placeholder="12.345.678-9"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input
            type="text"
            required
            value={form.nombre_completo}
            onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select
            value={form.rol}
            onChange={e => setForm(f => ({ ...f, rol: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Apoderado">Apoderado</option>
            <option value="Educadora">Educadora</option>
            <option value="Administrativo">Administrativo</option>
          </select>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Usuario y Continuar →'}
      </button>
    </form>
  )
}