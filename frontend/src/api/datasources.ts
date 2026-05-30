import client from './client'
import type { DataSource } from '../types'

export const listSources = () =>
  client.get<DataSource[]>('/datasources/').then((r) => r.data)

export const addPostgres = (data: {
  name: string; host: string; port: number; database: string; username: string; password: string; query: string
}) => client.post<DataSource>('/datasources/postgres', data).then((r) => r.data)

export const syncSource = (id: string, type: string) =>
  client.post<{ synced: number }>(`/datasources/${type}/${id}/sync`).then((r) => r.data)

export const deleteSource = (id: string) =>
  client.delete<{ deleted: boolean }>(`/datasources/${id}`).then((r) => r.data)

export const getBigQueryOAuthUrl = () =>
  client.get<{ url: string }>('/datasources/bigquery/oauth').then((r) => r.data.url)

export const configureBigQuery = (sourceId: string, data: {
  name: string; project_id: string; dataset: string; query: string
}) => client.post<DataSource>(`/datasources/bigquery/${sourceId}/configure`, data).then((r) => r.data)
