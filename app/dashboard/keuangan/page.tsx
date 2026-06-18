'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

interface Transaksi {
  id: string
  deskripsi_asli: string
  qty: number
  harga_jual: number
  modal: number
  profit: number
  tanggal: string
  created_at: string
}

export default function KeuanganPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [namaToko, setNamaToko] = useState('')
  const [teks, setTeks] = useState('')
  const [loading, setLoading] = useState(false)
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles').select('nama_toko').eq('id', user.id).single()
      if (profile) setNamaToko(profile.nama_toko)

      await fetchTransaksi(user.id)
      setLoadingData(false)
    }
    init()
  }, [router])

  const fetchTransaksi = async (uid: string) => {
    const { data } = await supabase
      .from('transaksi')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setTransaksi(data)
  }

  const handleCatat = async () => {
    if (!teks.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    try {
      const res = await fetch('/api/catat-transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teks })
      })
      const json = await res.json()

      if (json.success) {
        const d = json.data
        const { error: insertError } = await supabase.from('transaksi').insert({
          user_id: userId,
          deskripsi_asli: teks,
          qty: d.qty || 1,
          harga_jual: d.harga_jual || 0,
          modal: d.modal || 0,
          profit: d.profit || 0,
          tanggal: new Date().toISOString().split('T')[0],
        })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          setError('Gagal simpan: ' + insertError.message)
          setLoading(false)
          return
        }
        
        setSuccess(`✓ Transaksi dicatat: ${d.deskripsi}`)
        setTeks('')
        await fetchTransaksi(userId)
      } else {
        setError('Gagal parsing transaksi, coba tulis lebih jelas')
      }
    } catch {
      setError('Terjadi kesalahan, coba lagi')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('transaksi').delete().eq('id', id)
    setTransaksi(prev => prev.filter(t => t.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalOmzet = transaksi.reduce((acc, t) => acc + (t.harga_jual * t.qty), 0)
  const totalProfit = transaksi.reduce((acc, t) => acc + t.profit, 0)
  const totalModal = transaksi.reduce((acc, t) => acc + (t.modal * t.qty), 0)

  const navItems = [
    { icon: 'ti-layout-dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'ti-camera', label: 'Generator Konten', href: '/dashboard/konten' },
    { icon: 'ti-wallet', label: 'Keuangan', href: '/dashboard/keuangan' },
    { icon: 'ti-brand-whatsapp', label: 'Template WhatsApp', href: '/dashboard/whatsapp' },
  ]

  return (
    <div className="min-h-screen flex" style={{background:'#ecfeff'}}>

      {/* Sidebar */}
      <div className="w-56 flex flex-col fixed h-full" style={{background:'white', borderRight:'0.5px solid #a5f3fc'}}>
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
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={pathname === item.href ? {background:'#cffafe', color:'#0e7490'} : {color:'#6b7280'}}
            >
              <i className={`ti ${item.icon} text-base`} />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-3" style={{borderTop:'0.5px solid #a5f3fc'}}>
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:'#cffafe'}}>
              <span className="text-xs font-bold" style={{color:'#0e7490'}}>{namaToko?.charAt(0)?.toUpperCase() || 'T'}</span>
            </div>
            <span className="text-xs font-medium truncate" style={{color:'#164e63'}}>{namaToko || 'Toko Kamu'}</span>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{color:'#ef4444'}}
          >
            <i className="ti ti-logout text-base" />
            Keluar
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 ml-56 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{color:'#164e63'}}>Catat Keuangan 💰</h1>
          <p className="text-sm mt-1" style={{color:'#0891b2'}}>Ketik transaksi seperti chat, AI akan parsing otomatis</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          {[
            { label: 'Total Omzet', value: `Rp ${totalOmzet.toLocaleString('id-ID')}`, icon: 'ti-coin', bg: '#cffafe', color: '#0e7490' },
            { label: 'Total Modal', value: `Rp ${totalModal.toLocaleString('id-ID')}`, icon: 'ti-shopping-cart', bg: '#fef9c3', color: '#ca8a04' },
            { label: 'Total Keuntungan', value: `Rp ${totalProfit.toLocaleString('id-ID')}`, icon: 'ti-trending-up', bg: totalProfit >= 0 ? '#d1fae5' : '#fee2e2', color: totalProfit >= 0 ? '#065f46' : '#dc2626' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:stat.bg}}>
                <i className={`ti ${stat.icon} text-lg`} style={{color:stat.color}} />
              </div>
              <p className="text-xl font-bold" style={{color:'#164e63'}}>{stat.value}</p>
              <p className="text-xs mt-1" style={{color:'#6b7280'}}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Input Chat */}
          <div className="rounded-2xl p-6" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
            <h2 className="font-bold text-sm mb-4" style={{color:'#164e63'}}>Catat Transaksi Baru</h2>

            <div className="rounded-xl p-4 mb-4" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
              <p className="text-xs font-medium mb-1" style={{color:'#0e7490'}}>📝 Format: [jual/beli] [jumlah] [barang] [harga] modal [harga modal]</p>
              <p className="text-xs mb-3" style={{color:'#0891b2'}}>Tulis seperti chat biasa, AI akan otomatis membaca jumlah, harga jual, dan modalnya.</p>
              <p className="text-xs font-medium mb-2" style={{color:'#0e7490'}}>💡 Klik salah satu contoh untuk coba:</p>
              <div className="space-y-1">
                {[
                  'jual 3 baju batik @85rb modal 60rb',
                  'jual 1 tas anyaman seharga 120000 modal 75rb',
                  'beli stok kain 500ribu',
                  'jual sepatu kulit 250000 modal 150rb',
                  'jual 5 kerupuk @5rb modal 2rb per bungkus',
                ].map((c) => (
                  <button key={c} onClick={() => setTeks(c)}
                    className="block text-xs px-2 py-1 rounded-lg w-full text-left transition-all"
                    style={{background:'#cffafe', color:'#0e7490'}}
                  >
                    "{c}"
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCatat() } }}
              placeholder="Ketik transaksi kamu di sini..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none mb-3"
              style={{border:'1px solid #a5f3fc', background:'#f0fdfe'}}
            />

            {success && (
              <div className="rounded-xl px-4 py-3 mb-3 text-sm" style={{background:'#d1fae5', color:'#065f46'}}>
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-3 mb-3 text-sm" style={{background:'#fee2e2', color:'#dc2626'}}>
                {error}
              </div>
            )}

            <button
              onClick={handleCatat}
              disabled={loading || !teks.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{background:'#0e7490'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  AI sedang memproses...
                </span>
              ) : '+ Catat Transaksi'}
            </button>
            <p className="text-xs text-center mt-2" style={{color:'#6b7280'}}>atau tekan Enter</p>
          </div>

          {/* Riwayat Transaksi */}
          <div className="rounded-2xl p-6" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
            <h2 className="font-bold text-sm mb-4" style={{color:'#164e63'}}>Riwayat Transaksi</h2>

            {loadingData ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{borderColor:'#0e7490', borderTopColor:'transparent'}} />
              </div>
            ) : transaksi.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <i className="ti ti-receipt-off text-4xl mb-3" style={{color:'#a5f3fc'}} />
                <p className="text-sm" style={{color:'#0891b2'}}>Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-96">
                {transaksi.map((t) => (
                  <div key={t.id} className="rounded-xl p-4" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-1" style={{color:'#164e63'}}>{t.deskripsi_asli}</p>
                        <div className="flex gap-3 flex-wrap">
                          {t.harga_jual > 0 && (
                            <span className="text-xs" style={{color:'#0e7490'}}>
                              💰 Rp {(t.harga_jual * t.qty).toLocaleString('id-ID')}
                            </span>
                          )}
                          {t.modal > 0 && (
                            <span className="text-xs" style={{color:'#ca8a04'}}>
                              📦 Modal: Rp {(t.modal * t.qty).toLocaleString('id-ID')}
                            </span>
                          )}
                          <span className="text-xs font-medium" style={{color: t.profit >= 0 ? '#065f46' : '#dc2626'}}>
                            {t.profit >= 0 ? '↑' : '↓'} Rp {Math.abs(t.profit).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{color:'#9ca3af'}}>{t.tanggal}</p>
                      </div>
                      <button onClick={() => handleDelete(t.id)}
                        className="ml-2 text-xs px-2 py-1 rounded-lg"
                        style={{color:'#ef4444', background:'#fee2e2'}}
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}