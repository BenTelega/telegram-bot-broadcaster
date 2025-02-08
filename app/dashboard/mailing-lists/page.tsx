'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function MailingListsPage() {
  const { campaigns } = useStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mailing Lists</h1>
        <Link href="/dashboard/mailing-lists/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((campaign) => (
          <Link href={`/dashboard/mailing-lists/${campaign.id}`} key={campaign.id}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium capitalize">
                      Status: {campaign.status}
                    </p>
                    {campaign.scheduledFor && (
                      <p className="text-sm text-muted-foreground">
                        Scheduled for: {new Date(campaign.scheduledFor).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="w-24">
                    <div className="h-2 bg-secondary rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {campaign.progress}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No campaigns yet</p>
            <Link href="/dashboard/mailing-lists/new">
              <Button>Create your first campaign</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}