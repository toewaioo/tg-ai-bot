import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  List,
  ListChecks,
  BotMessageSquare,
  Terminal,
} from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export default function Home() {
  const heroImage = placeholderImages.placeholderImages.find(
    (p) => p.id === 'hero'
  );

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              {heroImage && (
                <Image
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  data-ai-hint={heroImage.imageHint}
                  src={heroImage.imageUrl}
                  width={600}
                  height={600}
                />
              )}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    CryptoTrendBot
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your AI-powered assistant for tracking cryptocurrency market
                    trends directly in Telegram.
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <a
                    href={`https://t.me/${
                      process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'your_bot_name'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <BotMessageSquare className="mr-2 h-4 w-4" />
                    Open in Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Simple Steps to Get Started
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Start receiving AI-driven crypto trend alerts in just a few
                  clicks.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground w-16 h-16">
                    <BotMessageSquare className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-lg font-bold">1. Start the Bot</h3>
                <p className="text-sm text-muted-foreground">
                  Open Telegram and send the `/start` command to
                  CryptoTrendBot.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground w-16 h-16">
                    <List className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-lg font-bold">2. Subscribe to Coins</h3>
                <p className="text-sm text-muted-foreground">
                  Use `/subscribe &lt;COIN&gt;` (e.g., `/subscribe BTC`) for
                  each crypto you want to follow.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground w-16 h-16">
                    <ListChecks className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-lg font-bold">3. Receive Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes the market and alerts you when a trend
                  changes from bullish to bearish, or vice-versa.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Commands Quick Reference
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                All the commands you need to manage your crypto trend alerts.
              </p>
            </div>
            <div className="w-full max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <ul className="grid gap-4 text-left">
                    <li className="flex items-center">
                      <Terminal className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-mono text-sm bg-muted rounded-md p-1 inline-block">
                          /subscribe &lt;COIN&gt;
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Subscribe to a new cryptocurrency.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <Terminal className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-mono text-sm bg-muted rounded-md p-1 inline-block">
                          /unsubscribe &lt;COIN&gt;
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unsubscribe from a cryptocurrency.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <Terminal className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-mono text-sm bg-muted rounded-md p-1 inline-block">
                          /list
                        </p>
                        <p className="text-sm text-muted-foreground">
                          List all your current subscriptions.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <Terminal className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-mono text-sm bg-muted rounded-md p-1 inline-block">
                          /help
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Show the help message.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CryptoTrendBot. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
