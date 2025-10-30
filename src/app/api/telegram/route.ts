import { bot } from '@/lib/bot-instance';
import { setupCommands } from '@/lib/bot-commands';
import { NextRequest, NextResponse } from 'next/server';

// Setup commands
setupCommands(bot);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Manually handle the update
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: '✅ Telegram webhook endpoint is live.',
  });
}

/*
✅ Run once to set webhook:
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYMENT_URL>/api/telegram"
*/
