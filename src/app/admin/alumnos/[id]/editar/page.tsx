'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Apoderado {
  id_apoderado: number
  nombre_completo: string
  rut: string
}

interface FormData {
  nombre: string
  apellidos: string
  fecha_nacimiento: string
  nivel_educativo: string
  direccion: string
  telefono_contacto_emergencias: string
  plan_salud: string
  centros_medicos_recomendados: string
  id_apoderado: string
}

export default function EditarAlumnoPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState<FormData>({
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
  const [apoderados, setApoderados] = useState<Apoderado[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingApoderados, setLoadingApoderados] = useState(true)
  const [error, setError] = useState('')

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
  }, [supabase])

  useEffect(() => {
    async function cargarAlumno() {
      const id = params?.id
      const idString = Array.isArray(id) ? id[0] : id
      if (!idString) {
        setError('ID de alumno no válido')
        setLoadingData(false)
        return
      }

      const idAlumno = parseInt(idString, 10)
      if (Number.isNaN(idAlumno)) {
        setError('ID de alumno no válido')
        setLoadingData(false)
        return
      }

      const { data: alumno, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('id_alumno', idAlumno)
        .single()

      if (error || !alumno) {
        console.error('Error cargando alumno:', error)
        setError('No se pudo cargar el alumno')
        setLoadingData(false)
        return
      }

      setFormData({
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        fecha_nacimiento: alumno.fecha_nacimiento,
        nivel_educativo: alumno.nivel_educativo,
        direccion: alumno.direccion,
        telefono_contacto_emergencias: alumno.telefono_contacto_emergencias,
        plan_salud: alumno.plan_salud,
        centros_medicos_recomendados: alumno.centros_medicos_recomendados || '',
        id_apoderado: alumno.id_apoderado.toString(),
      })
      setLoadingData(false)
    }

    cargarAlumno()
  }, [params?.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const id = params?.id
    const idString = Array.isArray(id) ? id[0] : id
    if (!idString) {
      setError('ID de alumno no válido')
      setLoading(false)
      return
    }

    const idAlumno = parseInt(idString, 10)
    if (Number.isNaN(idAlumno)) {
      setError('ID de alumno no válido')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('alumnos')
        .update({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento,
          nivel_educativo: formData.nivel_educativo,
          direccion: formData.direccion,
          telefono_contacto_emergencias: formData.telefono_contacto_emergencias,
          plan_salud: formData.plan_salud,
          centros_medicos_recomendados: formData.centros_medicos_recomendados || null,
          id_apoderado: parseInt(formData.id_apoderado, 10),
        })
        .eq('id_alumno', idAlumno)

      if (error) {
        throw error
      }

      router.push(`/admin/alumnos/${idAlumno}`)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el alumno'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-600">
        Cargando datos del alumno...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Alumno</h1>
          <p className="text-sm text-gray-500">Actualiza los datos del alumno y su apoderado asociado.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/alumnos')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Volver a Alumnos
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Educativo *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Apoderado *</label>
            <select
              name="id_apoderado"
              required
              value={formData.id_apoderado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{loadingApoderados ? 'Cargando apoderados...' : 'Seleccionar apoderado...'}</option>
              {apoderados.map((apoderado) => (
                <option key={apoderado.id_apoderado} value={apoderado.id_apoderado}>
                  {apoderado.nombre_completo} ({apoderado.rut})
                </option>
              ))}
            </select>
            {apoderados.length === 0 && !loadingApoderados && (
              <p className="text-sm text-red-500 mt-1">
                No hay apoderados registrados. <a href="/admin/usuarios" className="underline">Crear apoderado primero</a>
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Emergencias *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Salud *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Centros Médicos Recomendados</label>
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
            {loading ? 'Guardando...' : 'Actualizar Alumno'}
          </button>
        </div>
      </form>
    </div>
  )
}
