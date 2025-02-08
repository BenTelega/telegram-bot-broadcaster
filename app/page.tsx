import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Users, MessageSquare, Send, Shield, Zap, Clock, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <span className="font-bold text-xl">TG Bot Mailing</span>
          </div>
          <Link href="/dashboard">
            <Button>Open Dashboard</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Manage Your Telegram Bot Communications
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Efficiently manage and broadcast messages to your Telegram bot subscribers with our powerful mailing list manager.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="animate-pulse">
                Get Started
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Bot,
                  title: 'Bot Management',
                  description: 'Easily manage multiple Telegram bots from a single dashboard',
                },
                {
                  icon: Users,
                  title: 'User Lists',
                  description: 'Organize your subscribers into targeted mailing lists',
                },
                {
                  icon: MessageSquare,
                  title: 'Message Templates',
                  description: 'Create and save reusable message templates',
                },
                {
                  icon: Send,
                  title: 'Broadcasting',
                  description: 'Send messages to multiple users with just a few clicks',
                },
                {
                  icon: Shield,
                  title: 'Secure Storage',
                  description: 'Your bot tokens are stored securely in your browser',
                },
                {
                  icon: Zap,
                  title: 'Fast & Responsive',
                  description: 'Lightning-fast performance on all devices',
                },
                {
                  icon: Clock,
                  title: 'Schedule Messages',
                  description: 'Plan your broadcasts for the perfect timing',
                },
                {
                  icon: BarChart3,
                  title: 'Analytics',
                  description: 'Track message delivery and engagement',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-background rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <feature.icon className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: 'Add Your Bot',
                    description: 'Enter your Telegram bot token to connect it to TG Bot Mailing',
                  },
                  {
                    step: 2,
                    title: 'Import Subscribers',
                    description: 'Upload your subscriber list from CSV or JSON files',
                  },
                  {
                    step: 3,
                    title: 'Create Messages',
                    description: 'Design your message using our rich text editor with preview',
                  },
                  {
                    step: 4,
                    title: 'Send or Schedule',
                    description: 'Broadcast immediately or schedule for later delivery',
                  },
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}