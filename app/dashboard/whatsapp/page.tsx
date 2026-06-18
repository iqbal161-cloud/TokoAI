'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function WhatsAppPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [namaToko, setNamaToko] = useState('')
  const [katalog, setKatalog] = useState('')
  const [pertanyaan, setPertanyaan] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [result, setResult] = useState<{
    tanya_harga: string
    tanya_stok: string
    tanya_ongkir: string
    cara_order: string
    tanya_spesifik: string
    follow_up: string
  } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('nama_toko').eq('id', user.id).single()
        .then(({ data }) => { if (data) { setNamaToko(data.nama_toko); setKatalog(`Nama toko: ${data.nama_toko}`) } })
    })
  }, [router])

  const handleGenerate = async () => {
    if (!katalog.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ katalog, pertanyaan })
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

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

  const templateItems = result ? [
    { key: 'tanya_harga', label: '💰 Tanya Harga', text: result.tanya_harga },
    { key: 'tanya_stok', label: '📦 Tanya Stok', text: result.tanya_stok },
    { key: 'tanya_ongkir', label: '🚚 Tanya Ongkir', text: result.tanya_ongkir },
    { key: 'cara_order', label: '🛒 Cara Order', text: result.cara_order },
    { key: 'tanya_spesifik', label: '❓ Pertanyaan Spesifik', text: result.tanya_spesifik },
    { key: 'follow_up', label: '📩 Follow Up', text: result.follow_up },
  ] : []

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
          <h1 className="text-2xl font-bold" style={{color:'#164e63'}}>Template WhatsApp 💬</h1>
          <p className="text-sm mt-1" style={{color:'#0891b2'}}>Generate template balasan otomatis untuk pelanggan WhatsApp kamu</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="rounded-2xl p-6" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
            <h2 className="font-bold text-sm mb-4" style={{color:'#164e63'}}>Info Toko & Produk</h2>

            <label className="text-sm font-medium block mb-1.5" style={{color:'#164e63'}}>
              Informasi Toko / Katalog Produk
            </label>

            <div className="rounded-xl p-3 mb-2" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
              <p className="text-xs font-medium" style={{color:'#0e7490'}}>📝 Isi minimal: nama toko, daftar produk & harga, cara kirim, cara bayar</p>
            </div>

            <textarea
              value={katalog}
              onChange={(e) => setKatalog(e.target.value)}
              placeholder={`Contoh:\nNama toko: Batik Bu Sari\nProduk: Baju batik anak (Rp 85.000), dewasa (Rp 150.000-250.000)\nBahan: Katun adem, motif cap khas Solo\nPengiriman: JNE, J&T, Gojek/Grab (area Solo), COD tersedia\nPembayaran: Transfer BCA/Mandiri atau COD\nWA: 081234567890`}
              rows={8}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none mb-4"
              style={{border:'1px solid #a5f3fc', background:'#f0fdfe'}}
            />

            <label className="text-sm font-medium block mb-1.5" style={{color:'#164e63'}}>
              Pertanyaan Spesifik <span style={{color:'#9ca3af'}}>(opsional)</span>
            </label>
            <input
              type="text"
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              placeholder="contoh: apakah ada ukuran XXL?"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none mb-4"
              style={{border:'1px solid #a5f3fc', background:'#f0fdfe'}}
            />

            {/* Contoh pertanyaan */}
            <div className="rounded-xl p-3 mb-4" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
              <p className="text-xs font-medium mb-2" style={{color:'#0e7490'}}>💡 Contoh pertanyaan spesifik:</p>
              <div className="flex flex-wrap gap-2">
                {['Ada diskon?', 'Bisa custom?', 'Garansi berapa lama?', 'Min order berapa?', 'Bisa retur?', 'Ada ukuran XXL?', 'Bisa COD?'].map((q) => (
                  <button key={q} onClick={() => setPertanyaan(q)}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{background:'#cffafe', color:'#0e7490'}}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !katalog.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{background:'#0e7490'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  AI sedang membuat template...
                </span>
              ) : '✨ Generate Template WA'}
            </button>
          </div>

          {/* Result Panel */}
          <div className="rounded-2xl p-6" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
            <h2 className="font-bold text-sm mb-4" style={{color:'#164e63'}}>Template Siap Pakai</h2>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <i className="ti ti-brand-whatsapp text-5xl mb-3" style={{color:'#a5f3fc'}} />
                <p className="text-sm" style={{color:'#0891b2'}}>Template akan muncul di sini</p>
                <p className="text-xs mt-1" style={{color:'#6b7280'}}>Isi info toko lalu klik Generate</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3" style={{borderColor:'#0e7490', borderTopColor:'transparent'}} />
                <p className="text-sm" style={{color:'#0e7490'}}>AI sedang bekerja...</p>
              </div>
            )}

            {result && (
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {templateItems.map((item) => (
                  <div key={item.key} className="rounded-xl p-4" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{color:'#0e7490'}}>{item.label}</span>
                      <button
                        onClick={() => handleCopy(item.text, item.key)}
                        className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                        style={{
                          background: copied === item.key ? '#d1fae5' : '#cffafe',
                          color: copied === item.key ? '#065f46' : '#0e7490'
                        }}
                      >
                        {copied === item.key ? '✓ Tersalin!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line" style={{color:'#374151'}}>{item.text}</p>
                  </div>
                ))}

                {/* Copy Semua */}
                <button
                  onClick={() => {
                    const all = templateItems.map(i => `=== ${i.label} ===\n${i.text}`).join('\n\n')
                    handleCopy(all, 'all')
                  }}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: copied === 'all' ? '#d1fae5' : '#cffafe',
                    color: copied === 'all' ? '#065f46' : '#0e7490',
                    border: '0.5px solid #a5f3fc'
                  }}
                >
                  {copied === 'all' ? '✓ Semua Template Tersalin!' : '📋 Copy Semua Template'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}