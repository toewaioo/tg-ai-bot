import type { Bot, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';

export const setupForwardVideosCommands = (bot: Bot) => {
    bot.command('start', (ctx: Context) => {
        ctx.reply('Welcome! Send me a video and I will forward it to the specified chat.');
        if(ctx.match){
            ctx.reply(`Videos will be forwarded to chat ID: ${ctx.match}`);
        }
    });
}