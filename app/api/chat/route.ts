import { NextResponse } from 'next/server';

const FALLBACK_MESSAGE =
  'mohon maaf ada kendala sistem silahkan hubungi : \nhttps://Wa.me/6281935036470\nuntuk custemer service lebih lanjut';

function fallbackJson(status = 500) {
  return NextResponse.json({ output: FALLBACK_MESSAGE }, { status });
}

function isN8nErrorText(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('not registered') ||
    lower.includes('workflow started') ||
    lower.includes('workflow queued') ||
    lower.includes('internal server error') ||
    (lower.includes('webhook') && lower.includes('error')) ||
    lower.startsWith('error:') ||
    lower.startsWith('{"error"')
  );
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const webhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      'https://husni27k-snayy-spaces.hf.space/webhook/v1/chat-cs';

    console.log('NextJS API: Mengirim permintaan ke n8n:', webhookUrl);

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

    if (!response.ok) {
      console.error(
        'NextJS API: n8n/HF error status',
        response.status,
        text.slice(0, 200)
      );
      return fallbackJson(500);
    }

    if (text.trim().startsWith('<')) {
      return fallbackJson(500);
    }

    let replyText = text.trim();

    if (!replyText || isN8nErrorText(replyText)) {
      return NextResponse.json({ output: FALLBACK_MESSAGE });
    }

    try {
      const parsed = JSON.parse(replyText);
      const targetObj = Array.isArray(parsed) ? parsed[0] : parsed;

      if (targetObj && typeof targetObj === 'object') {
        const possibleReply =
          targetObj.output ??
          targetObj.response ??
          targetObj.text ??
          targetObj.reply ??
          targetObj.content ??
          targetObj.data ??
          targetObj.chat ??
          targetObj.message;

        if (possibleReply !== undefined) {
          replyText =
            typeof possibleReply === 'object'
              ? JSON.stringify(possibleReply)
              : String(possibleReply);
        } else {
          const keys = Object.keys(targetObj);
          if (keys.length === 1) {
            replyText = String(targetObj[keys[0] as keyof typeof targetObj]);
          } else {
            replyText = JSON.stringify(targetObj);
          }
        }
      }
    } catch {
      // Teks mentah non-JSON — sudah di replyText
    }

    if (!replyText || isN8nErrorText(replyText)) {
      replyText = FALLBACK_MESSAGE;
    }

    return NextResponse.json({ output: replyText });
  } catch (error: unknown) {
    console.error(
      'NextJS API Error:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json({ output: FALLBACK_MESSAGE, error: FALLBACK_MESSAGE }, { status: 500 });
  }
}
