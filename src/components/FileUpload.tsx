'use client'

import { useState, useRef } from 'react'
import { Upload, File, X, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onUpload: (url: string) => void
  currentUrl?: string | null
  label?: string
}

export default function FileUpload({ onUpload, currentUrl, label = 'Subir documento PDF' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setError('Solo se permiten archivos PDF o imágenes')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar los 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `ordenes/${fileName}`

      // Subir archivo
      const { error: uploadError } = await supabase
        .storage
        .from('ordenes-medicas')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase
        .storage
        .from('ordenes-medicas')
        .getPublicUrl(filePath)

      setPreviewUrl(publicUrl)
      onUpload(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isImage = previewUrl?.match(/\.(jpg|jpeg|png|webp)$/i)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {previewUrl ? (
        <div className="relative border rounded-lg p-4 bg-gray-50">
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {isImage ? (
            <div className="space-y-2">
              <img 
                src={previewUrl} 
                alt="Vista previa" 
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <p className="text-xs text-center text-gray-500">Imagen subida correctamente</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4">
              <File className="w-10 h-10 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Documento PDF subido</p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver documento →
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Subiendo archivo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Haz clic para subir</span> o arrastra un archivo
              </p>
              <p className="text-xs text-gray-400">PDF o imagen (máx. 5MB)</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
