'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [namaToko, setNamaToko] = useState('')
  const [loading, setLoading] = useState(true)
  const [omzet, setOmzet] = useState(0)
  const [totalTransaksi, setTotalTransaksi] = useState(0)
  const [totalKonten, setTotalKonten] = useState(0)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('nama_toko').eq('id', user.id).single()
      if (profile) setNamaToko(profile.nama_toko)

      const { data: transaksi } = await supabase
        .from('transaksi').select('harga_jual, qty').eq('user_id', user.id)
      if (transaksi) {
        setTotalTransaksi(transaksi.length)
        setOmzet(transaksi.reduce((acc, t) => acc + (t.harga_jual * t.qty), 0))
      }

      const { count } = await supabase
        .from('konten_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count) setTotalKonten(count)

      setLoading(false)
    }
    getData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { icon: 'ti-layout-dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'ti-camera', label: 'Generator Konten', href: '/dashboard/konten' },
    { icon: 'ti-wallet', label: 'Keuangan', href: '/dashboard/keuangan' },
    { icon: 'ti-brand-whatsapp', label: 'Template WhatsApp', href: '/dashboard/whatsapp' },
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#ecfeff'}}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{borderColor:'#0e7490',borderTopColor:'transparent'}} />
        <p className="text-sm" style={{color:'#0e7490'}}>Memuat dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{background:'#ecfeff'}}>

      {/* Sidebar */}
      <div className="w-56 flex flex-col fixed h-full" style={{background:'white',borderRight:'0.5px solid #a5f3fc'}}>

        {/* Logo */}
        <div className="p-5" style={{borderBottom:'0.5px solid #a5f3fc'}}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'#0e7490'}}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-sm" style={{color:'#164e63'}}>TokoAI</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={isActive
                  ? {background:'#cffafe', color:'#0e7490'}
                  : {color:'#6b7280'}}
              >
                <i className={`ti ${item.icon} text-base`} />
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3" style={{borderTop:'0.5px solid #a5f3fc'}}>
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:'#cffafe'}}>
              <span className="text-xs font-bold" style={{color:'#0e7490'}}>
                {namaToko?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <span className="text-xs font-medium truncate" style={{color:'#164e63'}}>{namaToko || 'Toko Kamu'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{color:'#ef4444'}}
            onMouseEnter={e => (e.currentTarget.style.background='#fef2f2')}
            onMouseLeave={e => (e.currentTarget.style.background='transparent')}
          >
            <i className="ti ti-logout text-base" />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-56 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{color:'#164e63'}}>
            Selamat datang, {namaToko || 'Toko Kamu'} 👋
          </h1>
          <p className="text-sm mt-1" style={{color:'#0891b2'}}>Kelola bisnis kamu dengan bantuan AI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Omzet Bulan Ini', value: `Rp ${omzet.toLocaleString('id-ID')}`, icon: 'ti-coin', bg: '#cffafe', color: '#0e7490' },
            { label: 'Total Transaksi', value: totalTransaksi.toString(), icon: 'ti-receipt', bg: '#d1fae5', color: '#065f46' },
            { label: 'Konten Dibuat', value: totalKonten.toString(), icon: 'ti-photo', bg: '#ede9fe', color: '#5b21b6' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{background:stat.bg}}>
                <i className={`ti ${stat.icon} text-lg`} style={{color:stat.color}} />
              </div>
              <p className="text-2xl font-bold" style={{color:'#164e63'}}>{stat.value}</p>
              <p className="text-sm mt-1" style={{color:'#6b7280'}}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <h2 className="text-base font-bold mb-4" style={{color:'#164e63'}}>Fitur Utama</h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              icon: 'ti-camera', iconColor: '#0e7490', iconBg: '#cffafe',
              title: 'Generator Konten',
              desc: 'Buat caption Instagram, teks Shopee, dan iklan otomatis dari foto produk kamu.',
              href: '/dashboard/konten',
              accent: 'linear-gradient(90deg,#0e7490,#06b6d4)',
            },
            {
              icon: 'ti-wallet', iconColor: '#065f46', iconBg: '#d1fae5',
              title: 'Catat Keuangan',
              desc: 'Catat transaksi cukup dengan mengetik seperti chat. AI yang akan parsing datanya.',
              href: '/dashboard/keuangan',
              accent: 'linear-gradient(90deg,#16a34a,#22c55e)',
            },
            {
              icon: 'ti-brand-whatsapp', iconColor: '#5b21b6', iconBg: '#ede9fe',
              title: 'Template WhatsApp',
              desc: 'Generate template balasan otomatis untuk pertanyaan pelanggan di WhatsApp.',
              href: '/dashboard/whatsapp',
              accent: 'linear-gradient(90deg,#7c3aed,#a855f7)',
            },
          ].map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="rounded-2xl overflow-hidden transition-all group cursor-pointer block"
              style={{background:'white', border:'0.5px solid #a5f3fc'}}
              onMouseEnter={e => (e.currentTarget.style.boxShadow='0 4px 20px rgba(14,116,144,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow='none')}
            >
              <div className="h-1.5" style={{background:feature.accent}} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:feature.iconBg}}>
                  <i className={`ti ${feature.icon} text-xl`} style={{color:feature.iconColor}} />
                </div>
                <h3 className="font-bold mb-1.5 text-sm" style={{color:'#164e63'}}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{color:'#6b7280'}}>{feature.desc}</p>
                <div className="mt-4 text-xs font-semibold inline-flex items-center gap-1" style={{color:'#0e7490'}}>
                  Mulai <i className="ti ti-arrow-right text-xs" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}