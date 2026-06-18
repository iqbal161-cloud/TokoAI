'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function KontenPage() {
  const router = useRouter()
  const pathname = usePathname()
  const fileRef = useRef<HTMLInputElement>(null)

  const [deskripsi, setDeskripsi] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    caption_instagram: string
    teks_shopee: string
    iklan_facebook: string
    caption_english: string
  } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [namaToko, setNamaToko] = useState('')

  useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) { router.push('/login'); return }
    supabase.from('profiles').select('nama_toko').eq('id', user.id).single()
      .then(({ data }) => { if (data) setNamaToko(data.nama_toko) })
  })
}, [router])

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleGenerate = async () => {
    if (!deskripsi.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('deskripsi', deskripsi)
      if (image) formData.append('image', image)

      const res = await fetch('/api/generate-konten', { method: 'POST', body: formData })
      const json = await res.json()

      if (json.success) {
        setResult(json.data)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          let fotoUrl = null
          if (image) {
            const { data } = await supabase.storage
              .from('produk-images')
              .upload(`${user.id}/${Date.now()}-${image.name}`, image)
            if (data) fotoUrl = supabase.storage.from('produk-images').getPublicUrl(data.path).data.publicUrl
          }
          await supabase.from('konten_history').insert({
            user_id: user.id,
            foto_url: fotoUrl,
            deskripsi_produk: deskripsi,
            hasil_caption: json.data.caption_instagram,
            hasil_shopee: json.data.teks_shopee,
            hasil_english: json.data.caption_english,
          })
        }
      }
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
          <h1 className="text-2xl font-bold" style={{color:'#164e63'}}>Generator Konten 📸</h1>
          <p className="text-sm mt-1" style={{color:'#0891b2'}}>Upload foto produk & deskripsikan, AI akan buatkan konten pemasaran otomatis</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="rounded-2xl p-6" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
            <h2 className="font-bold text-sm mb-4" style={{color:'#164e63'}}>Input Produk</h2>

            {/* Upload Foto */}
            <div
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer mb-4 transition-all"
              style={{borderColor: imagePreview ? '#0e7490' : '#a5f3fc', background: imagePreview ? 'transparent' : '#f0fdfe', minHeight:'160px'}}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-xl" />
              ) : (
                <div className="text-center p-6">
                  <i className="ti ti-cloud-upload text-3xl mb-2" style={{color:'#0e7490'}} />
                  <p className="text-sm font-medium" style={{color:'#0e7490'}}>Upload foto produk</p>
                  <p className="text-xs mt-1" style={{color:'#6b7280'}}>atau lewati jika tidak ada foto</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

            {imagePreview && (
              <button onClick={() => { setImage(null); setImagePreview(null) }}
                className="text-xs mb-4" style={{color:'#ef4444'}}
              >
                × Hapus foto
              </button>
            )}

            {/* Deskripsi */}
            <label className="text-sm font-medium block mb-1.5" style={{color:'#164e63'}}>Deskripsi Produk</label>

            <div className="rounded-xl p-3 mb-2" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
              <p className="text-xs font-medium mb-1" style={{color:'#0e7490'}}>📝 Sebutkan: jenis produk, target pembeli, ciri khas (warna/bahan/ukuran), dan harga</p>
              <p className="text-xs" style={{color:'#0891b2'}}>Semakin detail, semakin bagus hasil captionnya.</p>
            </div>

            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="contoh: baju batik anak perempuan umur 5-8 tahun, warna merah, bahan katun adem, harga Rp 85.000

            contoh lain: keripik singkong rasa balado, kemasan 250gr, tanpa pengawet, cocok untuk oleh-oleh, harga Rp 20.000"
              rows={6}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none"
              style={{border:'1px solid #a5f3fc', background:'#f0fdfe'}}
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !deskripsi.trim()}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{background: loading ? '#0891b2' : '#0e7490'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  AI sedang membuat konten...
                </span>
              ) : '✨ Generate Konten'}
            </button>
          </div>

          {/* Result Panel */}
          <div className="rounded-2xl p-6" style={{background:'white', border:'0.5px solid #a5f3fc'}}>
            <h2 className="font-bold text-sm mb-4" style={{color:'#164e63'}}>Hasil Konten AI</h2>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <i className="ti ti-sparkles text-4xl mb-3" style={{color:'#a5f3fc'}} />
                <p className="text-sm" style={{color:'#0891b2'}}>Konten akan muncul di sini</p>
                <p className="text-xs mt-1" style={{color:'#6b7280'}}>Isi deskripsi produk lalu klik Generate</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3" style={{borderColor:'#0e7490', borderTopColor:'transparent'}} />
                <p className="text-sm" style={{color:'#0e7490'}}>AI sedang bekerja...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                {[
                  { key: 'instagram', label: '📸 Caption Instagram', text: result.caption_instagram },
                  { key: 'shopee', label: '🛍️ Deskripsi Shopee/Tokopedia', text: result.teks_shopee },
                  { key: 'facebook', label: '📣 Iklan Facebook/WA Story', text: result.iklan_facebook },
                  { key: 'english', label: '🌍 English Caption', text: result.caption_english },
                ].map((item) => (
                  <div key={item.key} className="rounded-xl p-4" style={{background:'#f0fdfe', border:'0.5px solid #a5f3fc'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{color:'#0e7490'}}>{item.label}</span>
                      <button
                        onClick={() => handleCopy(item.text, item.key)}
                        className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                        style={{background: copied === item.key ? '#d1fae5' : '#cffafe', color: copied === item.key ? '#065f46' : '#0e7490'}}
                      >
                        {copied === item.key ? '✓ Tersalin!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed" style={{color:'#374151'}}>{item.text}</p>
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