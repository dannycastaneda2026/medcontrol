'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Apoderado {
  id_apoderado: number
  nombre_completo: string
  rut: string
}

export default function NuevoAlumnoPage() {
  const [apoderados, setApoderados] = useState<Apoderado[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingApoderados, setLoadingApoderados] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    nivel_educativo: '',
    direccion: '',
    telefono_contacto_emergencias: '',
    plan_salud: '',
    centros_medicos_recomendados: '',
    id_apoderado: '',
  })

  useEffect(() => {
    async function cargarApoderados() {
      const { data, error } = await supabase
        .from('apoderados')
        .select('id_apoderado, nombre_completo, rut')
        .order('nombre_completo')

      if (error) {
        console.error('Error cargando apoderados:', error)
      } else {
        setApoderados(data || [])
      }
      setLoadingApoderados(false)
    }

    cargarApoderados()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .insert([
          {
            ...formData,
            id_apoderado: parseInt(formData.id_apoderado),
          },
        ])
        .select()

      if (error) throw error

      router.push('/admin/alumnos')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear el alumno')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Alumno</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              name="apellidos"
              required
              value={formData.apellidos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              required
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel Educativo *
            </label>
            <select
              name="nivel_educativo"
              required
              value={formData.nivel_educativo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="Sala Cuna">Sala Cuna</option>
              <option value="Medio Menor">Medio Menor</option>
              <option value="Medio Mayor">Medio Mayor</option>
              <option value="Transición">Transición</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apoderado *
            </label>
            <select
              name="id_apoderado"
              required
              value={formData.id_apoderado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {loadingApoderados ? 'Cargando apoderados...' : 'Seleccionar apoderado...'}
              </option>
              {apoderados.map((apoderado) => (
                <option key={apoderado.id_apoderado} value={apoderado.id_apoderado}>
                  {apoderado.nombre_completo} ({apoderado.rut})
                </option>
              ))}
            </select>
            {apoderados.length === 0 && !loadingApoderados && (
              <p className="text-sm text-red-500 mt-1">
                No hay apoderados registrados.{' '}
                <a href="/admin/usuarios" className="underline">
                  Crear apoderado primero
                </a>
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="direccion"
              required
              value={formData.direccion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono Emergencias *
            </label>
            <input
              type="tel"
              name="telefono_contacto_emergencias"
              required
              value={formData.telefono_contacto_emergencias}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan de Salud *
            </label>
            <select
              name="plan_salud"
              required
              value={formData.plan_salud}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="FONASA">FONASA</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="Particular">Particular</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centros Médicos Recomendados
            </label>
            <textarea
              name="centros_medicos_recomendados"
              rows={3}
              value={formData.centros_medicos_recomendados}
              onChange={handleChange}
              placeholder="Hospital de Niños, Clínica Alemana, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/alumnos')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || apoderados.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Alumno'}
          </button>
        </div>
      </form>
    </div>
  )
}