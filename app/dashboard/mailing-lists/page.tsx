'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCampaignRunStore } from '@/lib/campaignRunStore';
export default function MailingListsPage() {
  const { campaigns } = useStore();
  const { campaignRuns } = useCampaignRunStore();

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
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer" key={campaign.id}>
            <CardHeader>
              <CardTitle>{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="space-y-1">
                  Broadcasted {campaignRuns.filter((run) => run.campaignId === campaign.id).length} times.
                </div>
                <div className="space-y-1">
                  Created {new Date(campaign.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/dashboard/mailing-lists/${campaign.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Link href={`/dashboard/mailing-lists/${campaign.id}/run`}>
                  <Button size="sm">
                    New Run
                  </Button>
                </Link>
                <Link href={`/dashboard/mailing-lists/${campaign.id}/runs`}>
                  <Button size="sm" variant="outline">
                    Runs ({campaignRuns.filter((run) => run.campaignId === campaign.id).length})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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