export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id_usuario: number
          auth_id: string | null
          nombre_usuario: string
          rut: string
          nombre_completo: string
          correo: string
          contrasena: string
          rol: 'Administrativo' | 'Educadora' | 'Apoderado'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id_usuario?: number
          auth_id?: string | null
          nombre_usuario: string
          rut: string
          nombre_completo: string
          correo: string
          contrasena: string
          rol: 'Administrativo' | 'Educadora' | 'Apoderado'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id_usuario?: number
          auth_id?: string | null
          nombre_usuario?: string
          rut?: string
          nombre_completo?: string
          correo?: string
          contrasena?: string
          rol?: 'Administrativo' | 'Educadora' | 'Apoderado'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      apoderados: {
        Row: {
          id_apoderado: number
          id_usuario: number
          rut: string
          nombre_completo: string
          telefono: string
          telefono_alternativo: string | null
          correo: string
          direccion: string
          parentesco: string
          es_contacto_emergencia: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id_apoderado?: number
          id_usuario: number
          rut: string
          nombre_completo: string
          telefono: string
          telefono_alternativo?: string | null
          correo: string
          direccion: string
          parentesco: string
          es_contacto_emergencia?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id_apoderado?: number
          id_usuario?: number
          rut?: string
          nombre_completo?: string
          telefono?: string
          telefono_alternativo?: string | null
          correo?: string
          direccion?: string
          parentesco?: string
          es_contacto_emergencia?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      alumnos: {
        Row: {
          id_alumno: number
          nombre: string
          apellidos: string
          fecha_nacimiento: string
          nivel_educativo: string
          direccion: string
          telefono_contacto_emergencias: string
          plan_salud: string
          centros_medicos_recomendados: string | null
          id_apoderado: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id_alumno?: number
          nombre: string
          apellidos: string
          fecha_nacimiento: string
          nivel_educativo: string
          direccion: string
          telefono_contacto_emergencias: string
          plan_salud: string
          centros_medicos_recomendados?: string | null
          id_apoderado: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id_alumno?: number
          nombre?: string
          apellidos?: string
          fecha_nacimiento?: string
          nivel_educativo?: string
          direccion?: string
          telefono_contacto_emergencias?: string
          plan_salud?: string
          centros_medicos_recomendados?: string | null
          id_apoderado?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ordenes_medicas: {
        Row: {
          id_orden: number
          id_alumno: number
          nombre_farmaco: string
          dosis: string
          fecha_inicio: string
          fecha_termino: string
          documento_orden_medica: string | null
          estado: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id_orden?: number
          id_alumno: number
          nombre_farmaco: string
          dosis: string
          fecha_inicio: string
          fecha_termino: string
          documento_orden_medica?: string | null
          estado?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id_orden?: number
          id_alumno?: number
          nombre_farmaco?: string
          dosis?: string
          fecha_inicio?: string
          fecha_termino?: string
          documento_orden_medica?: string | null
          estado?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      horarios_medicacion: {
        Row: {
          id_horario: number
          id_orden: number
          hora_administracion: string
          observaciones: string | null
          dias_semana: string | null
          created_at: string | null
        }
        Insert: {
          id_horario?: number
          id_orden: number
          hora_administracion: string
          observaciones?: string | null
          dias_semana?: string | null
          created_at?: string | null
        }
        Update: {
          id_horario?: number
          id_orden?: number
          hora_administracion?: string
          observaciones?: string | null
          dias_semana?: string | null
          created_at?: string | null
        }
      }
      entregas_medicamentos: {
        Row: {
          id_entrega: number
          id_horario: number
          fecha_entrega: string
          entregado: boolean
          hora_entrega_real: string | null
          id_entregado_por: number | null
          observaciones_entrega: string | null
          created_at: string | null
        }
        Insert: {
          id_entrega?: number
          id_horario: number
          fecha_entrega: string
          entregado?: boolean
          hora_entrega_real?: string | null
          id_entregado_por?: number | null
          observaciones_entrega?: string | null
          created_at?: string | null
        }
        Update: {
          id_entrega?: number
          id_horario?: number
          fecha_entrega?: string
          entregado?: boolean
          hora_entrega_real?: string | null
          id_entregado_por?: number | null
          observaciones_entrega?: string | null
          created_at?: string | null
        }
      }
      auditoria_cambios: {
        Row: {
          id_auditoria: number
          tabla_afectada: string
          id_registro: number
          tipo_operacion: string
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          id_usuario: number | null
          fecha_hora: string | null
        }
        Insert: {
          id_auditoria?: number
          tabla_afectada: string
          id_registro: number
          tipo_operacion: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id_usuario?: number | null
          fecha_hora?: string | null
        }
        Update: {
          id_auditoria?: number
          tabla_afectada?: string
          id_registro?: number
          tipo_operacion?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id_usuario?: number | null
          fecha_hora?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}