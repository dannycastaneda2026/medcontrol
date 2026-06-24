import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  User, 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays,
  Activity,
  Phone,
  MapPin,
  Heart
} from 'lucide-react'
import LiveClock from '@/components/LiveClock'
import DashboardAutoRefresh from '@/components/DashboardAutoRefresh'

type EntregaReciente = {
  id_entrega: number
  fecha_entrega: string
  entregado: boolean
  hora_entrega_real: string | null
  observaciones_entrega: string | null
  horarios_medicacion?: {
    hora_administracion?: string | null
    ordenes_medicas?: {
      nombre_farmaco?: string
      dosis?: string
    }
  }
}

export default async function ApoderadoDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener el usuario actual y su apoderado
  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre_completo')
    .eq('auth_id', user.id)
    .single()

  if (!usuarioData) {
    redirect('/login')
  }

  // Obtener el apoderado vinculado
  const { data: apoderado } = await supabase
    .from('apoderados')
    .select('id_apoderado, nombre_completo, telefono, telefono_alternativo, correo, direccion')
    .eq('id_usuario', usuarioData.id_usuario)
    .single()

  if (!apoderado) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes alumnos registrados</h2>
        <p className="text-gray-500">Contacta al administrador para vincular a tu pupilo.</p>
      </div>
    )
  }

  // Obtener alumnos del apoderado
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id_apoderado', apoderado.id_apoderado)

  if (!alumnos || alumnos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes alumnos registrados</h2>
        <p className="text-gray-500">Contacta al administrador para vincular a tu pupilo.</p>
      </div>
    )
  }

  const alumno = alumnos[0] // Tomamos el primer alumno (un apoderado puede tener varios)

  // Obtener órdenes médicas del alumno
  const { data: ordenes } = await supabase
    .from('ordenes_medicas')
    .select('*')
    .eq('id_alumno', alumno.id_alumno)
    .eq('estado', 'Activa')
    .order('fecha_inicio', { ascending: false })

  // Obtener entregas recientes (últimos 7 días)
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  
  const { data: entregasRecientes } = await supabase
    .from('entregas_medicamentos')
    .select(`
      id_entrega,
      fecha_entrega,
      entregado,
      hora_entrega_real,
      observaciones_entrega,
      horarios_medicacion!inner (
        hora_administracion,
        ordenes_medicas!inner (
          nombre_farmaco,
          dosis
        )
      )
    `)
    .eq('entregado', true)
    .gte('fecha_entrega', hace7Dias.toISOString().split('T')[0])
    .order('fecha_entrega', { ascending: false })
    .limit(10)

  // Contar estadísticas
  const totalOrdenes = ordenes?.length || 0
  const totalEntregasSemana = entregasRecientes?.length || 0

  return (
    <div>
      <DashboardAutoRefresh />
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-500 text-sm mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <LiveClock />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Pupilo</h1>
        <p className="text-gray-500 mt-1">Información y seguimiento médico</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Info del alumno */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card del Alumno */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{alumno.nombre} {alumno.apellidos}</h2>
              <p className="text-sm text-gray-500">{alumno.nivel_educativo}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Fecha de nacimiento</div>
                  <div className="font-medium">{new Date(alumno.fecha_nacimiento).toLocaleDateString('es-CL')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Plan de salud</div>
                  <div className="font-medium">{alumno.plan_salud}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Teléfono emergencias</div>
                  <div className="font-medium">{alumno.telefono_contacto_emergencias}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Dirección</div>
                  <div className="font-medium">{alumno.direccion}</div>
                </div>
              </div>
              {alumno.centros_medicos_recomendados && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Centros médicos recomendados</div>
                    <div className="font-medium text-sm">{alumno.centros_medicos_recomendados}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card del Apoderado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Apoderado</div>
                  <div className="font-medium">{apoderado.nombre_completo}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Teléfono</div>
                  <div className="font-medium">{apoderado.telefono}</div>
                  {apoderado.telefono_alternativo && (
                    <div className="text-sm text-gray-500">Alt: {apoderado.telefono_alternativo}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Órdenes y entregas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Órdenes Activas</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{totalOrdenes}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Entregas esta semana</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{totalEntregasSemana}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Órdenes Médicas Activas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              Órdenes Médicas Activas
            </h2>
            
            {ordenes && ordenes.length > 0 ? (
              <div className="space-y-3">
                {ordenes.map((orden) => (
                  <div key={orden.id_orden} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{orden.nombre_farmaco}</div>
                        <div className="text-sm text-gray-600">Dosis: {orden.dosis}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Activa
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(orden.fecha_inicio).toLocaleDateString('es-CL')} al {new Date(orden.fecha_termino).toLocaleDateString('es-CL')}
                      </div>
                    </div>
                    {orden.documento_orden_medica && (
                      <a 
                        href={orden.documento_orden_medica}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        📄 Ver documento adjunto
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay órdenes médicas activas</p>
              </div>
            )}
          </div>

          {/* Historial de Entregas Recientes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Entregas Recientes (Últimos 7 días)
            </h2>
            
            {entregasRecientes && entregasRecientes.length > 0 ? (
              <div className="space-y-3">
                {entregasRecientes.map((entrega) => (
                  <div key={entrega.id_entrega} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {entrega.horarios_medicacion?.[0]?.ordenes_medicas?.[0]?.nombre_farmaco}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entrega.horarios_medicacion?.[0]?.ordenes_medicas?.[0]?.dosis} — {entrega.horarios_medicacion?.[0]?.hora_administracion?.slice(0, 5)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(entrega.fecha_entrega).toLocaleDateString('es-CL')}
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Entregado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay entregas registradas en los últimos 7 días</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}