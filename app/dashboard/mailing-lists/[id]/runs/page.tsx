'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sendMessage } from '@/lib/telegram';
import { sendMessageFromTemplate } from '@/lib/messaging';
import { useCampaignRunStore } from '@/lib/campaignRunStore';
import { Badge } from '@/components/ui/badge';
import CampaignRunCard from '../campaign-run-card';
import { ArrowLeft } from 'lucide-react';

export default function MailingListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { bots, userLists, messageTemplates, campaigns, addCampaign, updateCampaign, testTelegramId, setTestTelegramId } = useStore();
  const { campaignRuns } = useCampaignRunStore();
  

  const thisCampaign = campaigns.find((c) => c.id === params.id);

  if (!thisCampaign) {
    return <div>Campaign not found</div>;
  }

  const thisCampaignRuns = campaignRuns.filter((c) => c.campaignId === params.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Runs for {thisCampaign?.name}</h1>
        <Link href={`/dashboard/mailing-lists/${params.id}`}>
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-4">
          To create a new broadcast, click the button below.
        </p>
        <Link href={`/dashboard/mailing-lists/${params.id}/run`} >
          <Button className="w-full" variant="outline">
            🚀 New run
          </Button>
        </Link>

        <div className="mt-4">
          {thisCampaignRuns.map((run) => (
            <CampaignRunCard key={run.id} campaignRun={run} />
          ))}
        </div>


      </div>


    </div>

  );
} 