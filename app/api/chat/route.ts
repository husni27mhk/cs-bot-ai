import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Utamakan environment variable dari .env.local, jika tidak ada baru gunakan fallback URL
    const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://husni27k-snayy-spaces.hf.space/webhook/v1/chat-cs";

    console.log("NextJS API: Mengirim permintaan ke n8n:", webhookUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (process.env.HF_ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.HF_ACCESS_TOKEN}`;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });

    const text = await response.text();

    // Validasi apakah respon dari n8n berupa halaman error HTML dari server / Hugging Face
    if (text.trim().startsWith('<')) {
      return NextResponse.json(
        { 
          output: "mohon maaf ada kendala sistem silahkan hubungi : \nhttps://Wa.me/6281935036470\nuntuk custemer service lebih lanjut" 
        }, 
        { status: 500 }
      );
    }

    let replyText = text.trim();

    // Coba parsing jika n8n mengembalikan JSON terstruktur (objek atau array)
    try {
      const parsed = JSON.parse(replyText);
      const targetObj = Array.isArray(parsed) ? parsed[0] : parsed;

      if (targetObj && typeof targetObj === 'object') {
        // Cek jika n8n mengembalikan status default mulai alur kerja (tanpa node 'Respond to Webhook')
        if (targetObj.message === "Workflow started" || targetObj.message === "Workflow queued") {
          replyText = "mohon maaf ada kendala sistem silahkan hubungi : \nhttps://Wa.me/6281935036470\nuntuk custemer service lebih lanjut";
        } else {
          // Cari key-key umum responder chatbot n8n
          const possibleReply = 
            targetObj.output || 
            targetObj.response || 
            targetObj.message || 
            targetObj.text || 
            targetObj.reply ||
            targetObj.content ||
            targetObj.data ||
            targetObj.chat;

          if (possibleReply !== undefined) {
            replyText = typeof possibleReply === 'object' ? JSON.stringify(possibleReply) : String(possibleReply);
          } else {
            // Jika tidak ada key standar, melainkan properti lain, gunakan stringify yang rapi atau string mentahnya jika tunggal
            const keys = Object.keys(targetObj);
            if (keys.length === 1) {
              replyText = String(targetObj[keys[0]]);
            } else {
              replyText = JSON.stringify(targetObj);
            }
          }
        }
      }
    } catch {
      // Jika bukan JSON, kita biarkan sebagai string teks mentah (raw text)
    }

    // Jika respon kosong dari server
    if (!replyText) {
      replyText = "mohon maaf ada kendala sistem silahkan hubungi : \nhttps://Wa.me/6281935036470\nuntuk custemer service lebih lanjut";
    }

    // Kembalikan respon dari n8n dalam bentuk JSON berisi output yang sudah di-parse bersih
    return NextResponse.json({ output: replyText });

  } catch (error: unknown) {
    console.error("NextJS API Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: "mohon maaf ada kendala sistem silahkan hubungi : \nhttps://Wa.me/6281935036470\nuntuk custemer service lebih lanjut" 
    }, { status: 500 });
  }
}
