'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminLoggedIn } from '@/lib/admin'

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/admin/login')
    }
  }, [])
  return (
    <div style={{ minHeight:'100vh', background:'var(--green-deep)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(249,243,227,0.4)', fontFamily:"'Tajawal',sans-serif" }}>
      ⏳ Mengalihkan...
    </div>
  )
}
