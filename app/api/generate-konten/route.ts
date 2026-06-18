import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const deskripsi = formData.get('deskripsi') as string
    const imageFile = formData.get('image') as File | null

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `Kamu adalah asisten pemasaran untuk UMKM Indonesia. 
Buatkan konten pemasaran untuk produk berikut:

Deskripsi produk: ${deskripsi}

Buatkan dalam format JSON berikut (tanpa markdown, langsung JSON):
{
  "caption_instagram": "caption menarik untuk Instagram dengan emoji dan hashtag relevan, max 150 kata",
  "teks_shopee": "deskripsi produk untuk Shopee/Tokopedia yang informatif dan menarik, max 200 kata",
  "iklan_facebook": "teks iklan singkat untuk Facebook/WhatsApp Story, max 50 kata",
  "caption_english": "English caption for international market, max 100 words with hashtags"
}`

    let result
    if (imageFile) {
      const imageData = await imageFile.arrayBuffer()
      const base64 = Buffer.from(imageData).toString('base64')
      result = await model.generateContent([
        { inlineData: { data: base64, mimeType: imageFile.type } },
        prompt
      ])
    } else {
      result = await model.generateContent(prompt)
    }

    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Gagal generate konten' }, { status: 500 })
  }
}