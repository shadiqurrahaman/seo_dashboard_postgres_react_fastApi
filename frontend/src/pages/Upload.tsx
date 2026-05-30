import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFile, listUploads, updateMapping } from '../api/uploads'
import Topbar from '../components/layout/Topbar'
import type { FileUpload } from '../types'
import toast from 'react-hot-toast'

const METRIC_OPTIONS = ['clicks', 'impressions', 'spend', 'sessions', 'conversions', 'revenue', 'date', 'channel', 'campaign', '—ignore—']

function MappingEditor({ upload, onSave }: { upload: FileUpload; onSave: () => void }) {
  const [mapping, setMapping] = useState<Record<string, string>>(upload.column_mapping)
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => updateMapping(upload.id, mapping),
    onSuccess: () => { toast.success('Mapping saved'); qc.invalidateQueries({ queryKey: ['uploads'] }); onSave() },
    onError: () => toast.error('Failed to save mapping'),
  })

  const cols = upload.detected_columns?.raw_columns || []

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <div>
          <div className="card-title">Map columns — {upload.filename}</div>
          <div className="card-sub">Tell us which column maps to which metric</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {cols.map((col) => (
          <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1, fontFamily: 'JetBrains Mono', fontSize: 12 }}>{col}</span>
            <span style={{ color: 'var(--text-3)' }}>→</span>
            <select
              value={mapping[col] || '—ignore—'}
              onChange={(e) => setMapping((m) => ({ ...m, [col]: e.target.value === '—ignore—' ? '' : e.target.value }))}
              className="form-input"
              style={{ width: 150 }}
            >
              {METRIC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button className="ctrl-primary" onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? 'Saving…' : 'Save & ingest'}
        </button>
        <button className="ctrl" onClick={onSave}>Cancel</button>
      </div>
    </div>
  )
}

export default function Upload() {
  const [editing, setEditing] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: uploads } = useQuery({ queryKey: ['uploads'], queryFn: listUploads })

  const uploadMut = useMutation({
    mutationFn: uploadFile,
    onSuccess: (u) => {
      toast.success(`${u.filename} uploaded — ${u.row_count} rows`)
      qc.invalidateQueries({ queryKey: ['uploads'] })
      setEditing(u.id)
    },
    onError: () => toast.error('Upload failed'),
  })

  const onDrop = useCallback((files: File[]) => {
    files.forEach((f) => uploadMut.mutate(f))
  }, [uploadMut])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: true,
  })

  const editingUpload = uploads?.find((u) => u.id === editing)

  return (
    <>
      <Topbar title="Upload Data" />
      <div className="page-content">
        <div className="page-head">
          <div>
            <h1>Upload data</h1>
            <div className="sub">Import CSV or Excel files — we auto-detect your columns.</div>
          </div>
        </div>

        <div {...getRootProps()} className={`upload-zone${isDragActive ? ' active' : ''}`}>
          <input {...getInputProps()} />
          <div className="upload-zone-icon" style={{ fontSize: 24 }}>↑</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{isDragActive ? 'Drop files here' : 'Drag & drop CSV or Excel files'}</div>
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>or click to browse — .csv and .xlsx supported</div>
          {uploadMut.isPending && <div style={{ marginTop: 12, color: 'var(--accent-1)', fontSize: 13 }}>Uploading…</div>}
        </div>

        {editingUpload && (
          <MappingEditor upload={editingUpload} onSave={() => setEditing(null)} />
        )}

        {(uploads?.length ?? 0) > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-head">
              <div className="card-title">Uploaded files</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th className="r">Rows</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {uploads!.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.filename}</td>
                    <td><span className="chip">{u.file_type.toUpperCase()}</span></td>
                    <td className="r num">{u.row_count.toLocaleString()}</td>
                    <td>
                      <span style={{
                        color: u.status === 'ready' ? 'var(--pos)' : u.status === 'error' ? 'var(--neg)' : 'var(--accent-1)',
                        fontSize: 13, fontWeight: 500
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="ctrl" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => setEditing(u.id)}>
                        Edit mapping
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
