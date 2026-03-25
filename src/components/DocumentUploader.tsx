import { useState, useRef } from 'react'
import { Camera, Image as ImageIcon, ArrowLeft, CheckCircle } from 'lucide-react'
import type { Child } from '../lib/supabase'
import { processDocument } from '../lib/parseDocument'
import ChildPill from './ChildPill'

interface DocumentUploaderProps {
  familyId: string
  children: Child[]
  onComplete: () => void
  onBack: () => void
}

type Stage = 'select' | 'preview' | 'scanning' | 'success' | 'error'

export default function DocumentUploader({
  familyId,
  children,
  onComplete,
  onBack,
}: DocumentUploaderProps) {
  const [stage, setStage] = useState<Stage>('select')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '')
  const [result, setResult] = useState<{ summary: string; itemCount: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
    setStage('preview')
  }

  async function handleExtract() {
    if (!file || !selectedChild) return
    setStage('scanning')

    try {
      const res = await processDocument(file, familyId, selectedChild)
      setResult(res)
      setStage('success')
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Extraction failed'
      )
      setStage('error')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-rally-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={20} className="text-rally-text" />
        </button>
        <h2 className="text-lg font-semibold">Scan a document</h2>
      </div>

      <div className="flex-1 px-5 pb-8">
        {/* Select stage */}
        {stage === 'select' && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-rally-muted/30 p-8">
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex w-full items-center gap-4 rounded-xl bg-rally-card p-5 shadow-sm transition-colors hover:bg-rally-purple/5"
              >
                <div className="rounded-full bg-rally-purple/10 p-3">
                  <Camera size={24} className="text-rally-purple" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-rally-text">Take a photo</p>
                  <p className="text-[13px] text-rally-muted">
                    Use your camera to capture
                  </p>
                </div>
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center gap-4 rounded-xl bg-rally-card p-5 shadow-sm transition-colors hover:bg-rally-purple/5"
              >
                <div className="rounded-full bg-rally-teal/10 p-3">
                  <ImageIcon size={24} className="text-rally-teal" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-rally-text">
                    Choose from library
                  </p>
                  <p className="text-[13px] text-rally-muted">
                    Upload an image or PDF
                  </p>
                </div>
              </button>
            </div>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Preview stage */}
        {stage === 'preview' && preview && (
          <div className="animate-fade-in">
            <div className="mb-4 overflow-hidden rounded-2xl border border-rally-border">
              <img
                src={preview}
                alt="Document preview"
                className="w-full object-contain"
                style={{ maxHeight: '300px' }}
              />
            </div>

            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-rally-muted">
              Which child is this for?
            </p>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
              {children.map((child) => (
                <ChildPill
                  key={child.id}
                  name={child.name}
                  color={child.color}
                  selected={selectedChild === child.id}
                  onClick={() => setSelectedChild(child.id)}
                />
              ))}
            </div>

            <button
              onClick={handleExtract}
              disabled={!selectedChild}
              className="w-full rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-rally-purple/90 disabled:opacity-50"
            >
              Extract & save
            </button>
          </div>
        )}

        {/* Scanning stage */}
        {stage === 'scanning' && preview && (
          <div className="animate-fade-in">
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-rally-border">
              <img
                src={preview}
                alt="Scanning"
                className="w-full object-contain opacity-60"
                style={{ maxHeight: '300px' }}
              />
              <div
                className="animate-scan absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rally-purple to-transparent"
                style={{ position: 'absolute' }}
              />
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-rally-purple/20 border-t-rally-purple" />
              <p className="text-[15px] font-medium text-rally-text">
                Rally is reading your document...
              </p>
              <p className="mt-1 text-[13px] text-rally-muted">
                Extracting dates, deadlines, and events
              </p>
            </div>
          </div>
        )}

        {/* Success stage */}
        {stage === 'success' && result && (
          <div className="animate-slide-in mt-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rally-teal/10">
              <CheckCircle size={32} className="text-rally-teal" />
            </div>
            <h3 className="text-lg font-semibold text-rally-text">
              Found {result.itemCount} item{result.itemCount !== 1 ? 's' : ''}
            </h3>
            <p className="mt-2 text-[13px] text-rally-muted">
              {result.summary}
            </p>
            <p className="mt-1 text-[13px] text-rally-muted">
              Added to your feed!
            </p>
            <button
              onClick={onComplete}
              className="mt-8 w-full rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white shadow-sm"
            >
              Go to Today
            </button>
          </div>
        )}

        {/* Error stage */}
        {stage === 'error' && (
          <div className="animate-fade-in mt-12 text-center">
            <p className="text-[15px] font-medium text-rally-danger">
              We couldn't extract items
            </p>
            <p className="mt-2 text-[13px] text-rally-muted">{errorMsg}</p>
            <p className="mt-1 text-[13px] text-rally-muted">
              The document has been saved to your files.
            </p>
            <button
              onClick={onComplete}
              className="mt-8 w-full rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white shadow-sm"
            >
              Go to Today
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
