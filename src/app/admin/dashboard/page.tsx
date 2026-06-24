import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import LiveClock from '@/components/LiveClock'
import DashboardAutoRefresh from '@/components/DashboardAutoRefresh'

const getToday = () => new Date().toISOString().split('T')[0]

const formatTime = (datetime: string | null | undefined) => {
  if (!datetime) return '--:--'
  const date = new Date(datetime)
  if (Number.isNaN(date.getTime())) return datetime
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export default async function AdminDashboard() {
  const today = getToday()
  const supabase = await createClient()

  const { count: totalAlumnos } = await supabase
    .from('alumnos')
    .select('*', { count: 'exact', head: true })

  const { count: totalOrdenes } = await supabase
    .from('ordenes_medicas')
    .select('*', { count: 'exact', head: true })

  const { count: ordenesActivas } = await supabase
    .from('ordenes_medicas')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'Activa')

  const { count: entregasHoy } = await supabase
    .from('entregas_medicamentos')
    .select('*', { count: 'exact', head: true })
    .eq('fecha_entrega', today)

  const { count: entregasPendientes } = await supabase
    .from('entregas_medicamentos')
    .select('*', { count: 'exact', head: true })
    .eq('fecha_entrega', today)
    .eq('entregado', false)

  const { data: entregasHoyDetalle, error: entregasHoyError } = await supabase
    .from('entregas_medicamentos')
    .select(`
      *,
      horarios_medicacion (
        hora_administracion,
        id_orden,
        ordenes_medicas (
          id_orden,
          nombre_farmaco,
          dosis,
          id_alumno,
          alumnos (
            id_alumno,
            nombre,
            apellidos
          )
        )
      )
    `)
    .eq('fecha_entrega', today)
    .order('hora_entrega_real', { ascending: true })

  if (entregasHoyError) {
    console.error('Error al cargar las entregas de hoy:', entregasHoyError)
  }

  return (
    <div>
      <DashboardAutoRefresh />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Alumnos</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{totalAlumnos || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Órdenes</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{totalOrdenes || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Órdenes Activas</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">{ordenesActivas || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Entregas Hoy</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            {entregasHoy || 0}
            <span className="text-sm text-red-500 ml-2">({entregasPendientes || 0} pendientes)</span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/usuarios"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Gestionar Usuarios
          </Link>
          <Link
            href="/admin/alumnos"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Gestionar Alumnos
          </Link>
          <Link
            href="/admin/ordenes"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            Gestionar Órdenes
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{today}</span>
          </div>
          <LiveClock />
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Órdenes del día</h2>
          <p className="text-sm text-gray-500">Revisa las medicaciones programadas para hoy y su estado de entrega.</p>
        </div>

        {entregasHoyDetalle && entregasHoyDetalle.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicació﻿n</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora programada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de entrega</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entregasHoyDetalle.map((entrega) => {
                  const alumnoNombre = entrega.horarios_medicacion?.ordenes_medicas?.alumnos
                    ? `${entrega.horarios_medicacion.ordenes_medicas.alumnos.nombre} ${entrega.horarios_medicacion.ordenes_medicas.alumnos.apellidos}`
                    : '—'
                  const medicacion = entrega.horarios_medicacion?.ordenes_medicas
                    ? `${entrega.horarios_medicacion.ordenes_medicas.nombre_farmaco} — ${entrega.horarios_medicacion.ordenes_medicas.dosis}`
                    : '—'
                  const ordenId = entrega.horarios_medicacion?.ordenes_medicas?.id_orden

                  return (
                    <tr key={entrega.id_entrega}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {alumnoNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {medicacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ordenId ? (
                          <Link
                            href={`/admin/ordenes/${ordenId}`}
                            title="Ver detalles de la orden"
                            aria-label={`Ver detalles de la orden #${ordenId}`}
                            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            <span>#{ordenId}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {entrega.horarios_medicacion?.hora_administracion || '--:--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entrega.entregado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entrega.entregado ? 'Entregado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTime(entrega.hora_entrega_real)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-sm py-6 text-center">
            No hay órdenes programadas para hoy.
          </div>
        )}
      </div>
    </div>
  )
}
