'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [namaToko, setNamaToko] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email atau password salah!')
      } else {
        router.push('/dashboard')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError('Gagal daftar: ' + error.message)
      } else if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          nama_toko: namaToko,
        })
        setSuccess('Akun berhasil dibuat! Silakan masuk.')
        setEmail('')
        setPassword('')
        setNamaToko('')
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Masukkan email kamu dulu!')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError('Gagal kirim email reset!')
    } else {
      setSuccess('Email reset password sudah dikirim, cek inbox kamu!')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold">TokoAI</span>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Kelola bisnis UMKM kamu lebih cerdas dengan AI
          </h2>
          <p className="text-green-100 text-lg">
            Buat konten, catat keuangan, dan balas pelanggan · semua dalam satu platform.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Generator konten pemasaran otomatis',
              'Pencatatan keuangan via chat',
              'Template balasan WhatsApp cerdas',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-50 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-200 text-sm">© 2026 TokoAI · Dibuat untuk UMKM Indonesia 🇮🇩</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-lg">TokoAI</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {isLogin ? 'Selamat datang kembali!' : 'Buat akun baru'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {isLogin ? 'Masuk ke dashboard TokoAI kamu' : 'Daftar gratis, tidak perlu kartu kredit'}
            </p>

            {/* Tab */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLogin ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isLogin ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Daftar
              </button>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nama Toko</label>
                  <input
                    type="text"
                    value={namaToko}
                    onChange={(e) => setNamaToko(e.target.value)}
                    placeholder="contoh: Toko Batik Bu Sari"
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  autoComplete="username"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="minimal 6 karakter"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-600 font-medium text-sm">Gagal</p>
                    <p className="text-red-400 text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium text-sm">Berhasil!</p>
                    <p className="text-green-400 text-xs mt-0.5">{success}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Memproses...
                  </span>
                ) : isLogin ? 'Masuk ke Dashboard' : 'Daftar Sekarang'}
              </button>

              {isLogin && (
                <button
                  onClick={handleForgotPassword}
                  className="w-full text-center text-xs text-gray-400 hover:text-green-500 transition-all mt-1"
                >
                  Lupa password?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}