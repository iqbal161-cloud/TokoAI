import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { katalog, pertanyaan } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `Kamu adalah asisten untuk UMKM Indonesia yang membantu membuat template balasan WhatsApp yang ramah dan profesional.

Informasi toko/produk:
${katalog}

Buatkan template balasan WhatsApp untuk pertanyaan-pertanyaan umum pelanggan dalam format JSON (tanpa markdown, langsung JSON):
{
  "tanya_harga": "template balasan ketika pelanggan tanya harga",
  "tanya_stok": "template balasan ketika pelanggan tanya stok/ketersediaan",
  "tanya_ongkir": "template balasan ketika pelanggan tanya ongkos kirim",
  "cara_order": "template balasan cara pemesanan step by step",
  "tanya_spesifik": "template balasan untuk pertanyaan: ${pertanyaan || 'info produk lengkap'}",
  "follow_up": "template follow up untuk pelanggan yang belum membalas"
}

Gunakan bahasa Indonesia yang ramah, tambahkan emoji yang sesuai, dan sesuaikan dengan info toko yang diberikan.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Gagal generate template' }, { status: 500 })
  }
}