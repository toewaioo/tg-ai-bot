import { webhookCallback } from "grammy";
import { bot } from '@/lib/bot-instance';

// The 'next-js' string is an alias for the specific framework, which helps grammy optimize for the environment.
const handleUpdate = webhookCallback(bot, 'next-js');

export { handleUpdate as POST };
