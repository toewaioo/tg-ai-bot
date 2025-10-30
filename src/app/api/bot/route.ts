export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { NextRequest, NextResponse } from 'next/server';

import { Bot, webhookCallback } from 'grammy'
import { bot } from '@/lib/bot-instance';
import { setupCommands } from '@/lib/bot-commands';
setupCommands(bot);


export const POST = webhookCallback(bot, 'std/http')
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: '✅ Telegram webhook endpoint is live.',
  });
}
