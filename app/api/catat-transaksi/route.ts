import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { teks } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `Kamu adalah asisten keuangan untuk UMKM Indonesia.
Ekstrak informasi transaksi dari teks berikut dan kembalikan dalam format JSON (tanpa markdown, langsung JSON):

Teks: "${teks}"

Format JSON:
{
  "deskripsi": "deskripsi singkat transaksi",
  "qty": angka jumlah barang (default 1 jika tidak disebutkan),
  "harga_jual": angka harga jual per unit dalam rupiah (tanpa titik/koma),
  "modal": angka modal/harga beli per unit dalam rupiah (0 jika tidak disebutkan),
  "profit": angka keuntungan total dalam rupiah,
  "tanggal": "YYYY-MM-DD format tanggal hari ini jika tidak disebutkan",
  "tipe": "pemasukan" atau "pengeluaran"
}

Contoh:
- "jual 3 baju @85rb modal 60rb" → qty:3, harga_jual:85000, modal:60000, profit:75000
- "beli stok kain 500rb" → qty:1, harga_jual:0, modal:500000, profit:-500000, tipe:pengeluaran`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Gagal parsing transaksi' }, { status: 500 })
  }
}