import client from './client'
import type { KPI, TrendPoint, Channel, Campaign } from '../types'

export const getKPIs = (range: string) =>
  client.get<{ has_data: boolean; kpis: KPI[] }>('/dashboard/kpis', { params: { range } }).then((r) => r.data)

export const getTrend = (range: string, metric: string) =>
  client.get<TrendPoint[]>('/dashboard/trend', { params: { range, metric } }).then((r) => r.data)

export const getChannels = (range: string) =>
  client.get<Channel[]>('/dashboard/channels', { params: { range } }).then((r) => r.data)

export const getCampaigns = (range: string) =>
  client.get<Campaign[]>('/dashboard/campaigns', { params: { range } }).then((r) => r.data)
