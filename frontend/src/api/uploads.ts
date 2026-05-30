import client from './client'
import type { FileUpload } from '../types'

export const uploadFile = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return client.post<FileUpload>('/uploads/', form).then((r) => r.data)
}

export const listUploads = () =>
  client.get<FileUpload[]>('/uploads/').then((r) => r.data)

export const updateMapping = (id: string, mapping: Record<string, string>) =>
  client.patch<FileUpload>(`/uploads/${id}/mapping`, { mapping }).then((r) => r.data)
