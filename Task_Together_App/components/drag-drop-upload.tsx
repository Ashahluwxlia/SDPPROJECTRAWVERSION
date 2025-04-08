"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, ImageIcon, Film, Music, Archive, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DragDropUploadProps {
  onUpload: (files: File[]) => Promise<void>
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  className?: string
  children?: React.ReactNode
  isDemoMode?: boolean
}

export function DragDropUpload({
  onUpload,
  accept,
  multiple = true,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  children,
  isDemoMode,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFiles = (fileList: FileList | File[]) => {
    const validFiles: File[] = []
    const newErrors: string[] = []
    const newPreviews: string[] = []

    // Convert FileList to array
    const filesArray = Array.from(fileList)

    // Check max files
    if (filesArray.length > maxFiles) {
      newErrors.push(`You can only upload a maximum of ${maxFiles} files`)
      return { validFiles, newErrors, newPreviews }
    }

    // Validate each file
    for (const file of filesArray) {
      // Check file type if accept is specified
      if (accept && !file.type.match(accept.replace(/,/g, "|").replace(/\*/g, ".*"))) {
        newErrors.push(`File "${file.name}" has an invalid type`)
        continue
      }

      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}`)
        continue
      }

      validFiles.push(file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (result) {
            newPreviews.push(result as string)
            setPreviews((prev) => [...prev, result as string])
          }
        }
        reader.readAsDataURL(file)
      } else {
        newPreviews.push("")
      }
    }

    return { validFiles, newErrors, newPreviews }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length === 0) return

    const { validFiles, newErrors } = validateFiles(e.dataTransfer.files)

    if (newErrors.length > 0) {
      setErrors(newErrors)
    }

    if (validFiles.length > 0) {
      setFiles(validFiles)
      setUploadProgress(validFiles.map(() => 0))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const { validFiles, newErrors } = validateFiles(e.target.files)

    if (newErrors.length > 0) {
      setErrors(newErrors)
    }

    if (validFiles.length > 0) {
      setFiles(validFiles)
      setUploadProgress(validFiles.map(() => 0))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setErrors([])

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => prev.map((progress) => Math.min(progress + Math.random() * 10, 99)))
      }, 200)

      // Actual upload
      await onUpload(files)

      // Complete progress
      clearInterval(interval)
      setUploadProgress(files.map(() => 100))

      // Reset after a delay
      setTimeout(() => {
        setFiles([])
        setPreviews([])
        setUploadProgress([])
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      setErrors(["Upload failed. Please try again."])
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setUploadProgress((prev) => prev.filter((_, i) => i !== index))
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-6 w-6 text-blue-500" />
    if (file.type.startsWith("video/")) return <Film className="h-6 w-6 text-purple-500" />
    if (file.type.startsWith("audio/")) return <Music className="h-6 w-6 text-green-500" />
    if (file.type.includes("zip") || file.type.includes("rar") || file.type.includes("tar"))
      return <Archive className="h-6 w-6 text-yellow-500" />
    if (file.type.includes("pdf") || file.type.includes("doc") || file.type.includes("text"))
      return <FileText className="h-6 w-6 text-red-500" />

    return <File className="h-6 w-6 text-gray-500" />
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : isDemoMode ? "border-muted-foreground/30" : "border-muted-foreground/25",
          "hover:border-primary/50 hover:bg-muted/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-medium text-lg">Drag & drop files here</h3>
          <p className="text-sm text-muted-foreground mt-1">
            or <span className="text-primary font-medium">browse files</span>
          </p>
          {children && <div className="mt-3">{children}</div>}
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files, up to {formatBytes(maxSize)} each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
        />
      </div>

      {errors.length > 0 && (
        <div className="mt-3 text-destructive text-sm">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((file, index) => (
            <div key={index} className={`flex items-center gap-3 p-2 border rounded-md bg-muted/50 ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
              <div className="flex-shrink-0">
                {previews[index] ? (
                  <div className="relative h-10 w-10 rounded overflow-hidden">
                    <Image src={previews[index] || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
                  </div>
                ) : (
                  getFileIcon(file)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              {isUploading ? (
                <Progress value={uploadProgress[index]} className="w-20 h-2" isDemoMode={isDemoMode} />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  isDemoMode={isDemoMode}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleUpload()
              }}
              disabled={isUploading}
              isDemoMode={isDemoMode}
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

