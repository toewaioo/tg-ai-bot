import { webhookCallback } from "grammy";
import { bot } from '@/lib/bot-instance';
import { NextResponse } from "next/server";

// The 'std/http' adapter is a more generic way to handle webhooks.
export const POST = webhookCallback(bot, "std/http");

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: '✅ Telegram webhook endpoint is live.',
  });
}
