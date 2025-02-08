'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Users, MessageSquare, Send } from 'lucide-react';

export default function Dashboard() {
  const { bots, userLists, messageTemplates, campaigns } = useStore();

  const stats = [
    {
      name: 'Active Bots',
      value: bots.filter((bot) => bot.status === 'active').length,
      icon: Bot,
    },
    {
      name: 'Total Subscribers',
      value: userLists.reduce((acc, list) => acc + list.count, 0),
      icon: Users,
    },
    {
      name: 'Message Templates',
      value: messageTemplates.length,
      icon: MessageSquare,
    },
    {
      name: 'Active Campaigns',
      value: campaigns.filter(
        (campaign) => campaign.status === 'running' || campaign.status === 'scheduled'
      ).length,
      icon: Send,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}