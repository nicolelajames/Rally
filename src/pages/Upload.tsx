import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Child } from '../lib/supabase'
import DocumentUploader from '../components/DocumentUploader'

interface UploadProps {
  familyId: string
}

export default function Upload({ familyId }: UploadProps) {
  const [children, setChildren] = useState<Child[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .then(({ data }) => setChildren(data || []))
  }, [familyId])

  return (
    <DocumentUploader
      familyId={familyId}
      children={children}
      onComplete={() => navigate('/')}
      onBack={() => navigate(-1)}
    />
  )
}
