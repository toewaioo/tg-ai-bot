# **App Name**: CryptoTrendBot

## Core Features:

- Telegram Bot Integration: Integrate Grammy Telegram Bot using webhook mode for receiving commands and sending updates.
- Gemini API Data Fetch: Fetch real-time crypto market data from the Gemini API.
- AI Trend Analysis: Utilize the Gemini API to analyze market data and classify trends as bullish or bearish.
- Subscription Management: Allow users to subscribe to specific cryptocurrencies for trend updates. The tool stores user preferences.
- Automated Trend Monitoring: Implement a background process that periodically (every 1-5 minutes) monitors crypto trends.
- Automated Alerting: Send Telegram alerts to subscribed users when significant trend changes are detected by the AI analysis. This will be performed using a Vercel Cron Job.
- Vercel Deployment: Deploy the Next.js application to Vercel, configuring Vercel Cron Jobs for scheduled tasks via `vercel.json`.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to evoke a sense of trust and stability in financial tracking.
- Background color: Light gray (#F5F5F5), offering a clean, neutral backdrop that ensures readability.
- Accent color: Electric lime (#AEEA00) to highlight important trend changes and updates.
- Body and headline font: 'Inter', a sans-serif for clarity and modern appeal in both headlines and body text.
- Use minimalist, crisp icons for crypto symbols and trend indicators (arrows, charts).
- Subtle transition animations for trend updates and interface interactions.