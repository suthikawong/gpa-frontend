import { Button } from '@/components/ui/button'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { cn } from '@/lib/utils'
import { Upload, X } from 'lucide-react'
import * as React from 'react'
import toast from './toast'

export enum FileTypes {
  XLSX = 'xlsx',
  CSV = 'csv',
  JPEG = 'jpeg',
  PNG = 'png',
}

export const FileTypeMapping = {
  [FileTypes.XLSX]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  [FileTypes.CSV]: 'text/csv',
  [FileTypes.JPEG]: 'image/jpeg',
  [FileTypes.PNG]: 'image/png',
}

interface UploaderProps {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  allowFileTypes?: (typeof FileTypes)[keyof typeof FileTypes][]
  showUploadedFiles?: boolean
  className?: string
}

const Uploader = ({ files, setFiles, allowFileTypes, showUploadedFiles = true, className }: UploaderProps) => {
  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      if (files.length > 1) {
        return 'You can only upload one file'
      }

      if (allowFileTypes && !allowFileTypes.find((type) => FileTypeMapping[type] === file.type)) {
        return `Only${allowFileTypes.map((type) => ' .' + type).join(',')} files are allowed`
      }

      const MAX_SIZE = 2 * 1024 * 1024 // 2MB
      if (file.size > MAX_SIZE) {
        return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`
      }

      return null
    },
    [files]
  )

  const onUpload: NonNullable<FileUploadProps['onUpload']> = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        const uploadPromises = files.map(async (file) => {
          try {
            const totalChunks = 10
            let uploadedChunks = 0

            for (let i = 0; i < totalChunks; i++) {
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))

              uploadedChunks++
              const progress = (uploadedChunks / totalChunks) * 100
              onProgress(file, progress)
            }

            await new Promise((resolve) => setTimeout(resolve, 500))
            onSuccess(file)
          } catch (error) {
            onError(file, error instanceof Error ? error : new Error('Upload failed'))
          }
        })

        await Promise.all(uploadPromises)
      } catch (error) {
        console.error('Unexpected error during upload:', error)
      }
    },
    []
  )

  const onFileReject = React.useCallback((_: File, message: string) => {
    toast.error(message)
  }, [])

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      onUpload={onUpload}
      onFileValidate={onFileValidate}
      onFileReject={onFileReject}
      maxFiles={1}
      className={cn('w-full max-w-md', className)}
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">Or click to browse</p>
        </div>
        <FileUploadTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
          >
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      {showUploadedFiles && (
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem
              key={index}
              value={file}
              className="flex-col"
            >
              <div className="flex w-full items-center gap-2">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                  >
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress />
            </FileUploadItem>
          ))}
        </FileUploadList>
      )}
    </FileUpload>
  )
}

export default Uploader
