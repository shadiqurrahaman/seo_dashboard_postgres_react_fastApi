export interface User {
  id: string
  email: string
  name: string
  role: string
  org_id: string
}

export interface KPI {
  id: string
  label: string
  value: string
  delta: number
  vs: string
  featured?: boolean
  invert_delta?: boolean
}

export interface TrendPoint {
  date: string
  value: number
}

export interface Channel {
  name: string
  spend: number
  clicks: number
  value: number
  color: string
}

export interface Campaign {
  name: string
  channel: string
  spend: number
  roas: number
  cpa: number
  cvr: number
}

export interface DataSource {
  id: string
  name: string
  source_type: string
  status: string
  last_synced_at: string | null
  created_at: string
}

export interface FileUpload {
  id: string
  filename: string
  file_type: string
  status: string
  row_count: number
  detected_columns: {
    raw_columns: string[]
    detected: Record<string, string | null>
    sample: Record<string, unknown>[]
  }
  column_mapping: Record<string, string>
  created_at: string
}
