'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { sendMessageFromTemplate } from '@/lib/messaging';
import { useCampaignRunStore } from '@/lib/campaignRunStore';
import { CampaignRun } from '@/lib/campaignRunStore';

export default function MailingListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { bots, userLists, messageTemplates, campaigns, addCampaign, updateCampaign, testTelegramId, setTestTelegramId } = useStore();
  const { addCampaignRun, updateCampaignRun, removeCampaignRun, campaignRuns } = useCampaignRunStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [campaignRun, setCampaignRun] = useState<CampaignRun | null>(null);

  const existingCampaign = campaigns.find((c) => c.id === params.id);

  if(!existingCampaign) {
    return <div>Campaign not found</div>;
  }

  const thisCampaignRun = campaignRuns.find((c) => c.id === params.runId);

  if(!thisCampaignRun) {
    return <div>Run not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Run results for "{existingCampaign.name}"</h1>
      

        {thisCampaignRun && (
          <div className="text-sm mb-4">

            {thisCampaignRun.deliveries.map((delivery, index) => (
              <p key={index}>
                {delivery.tgid} - {delivery.status} 
                {delivery.reason && (
                  <span className="text-sm text-red-500">
                    {delivery.reason}
                  </span>
                )}
              </p>
            ))}

          </div>

        )}
    </div>
  );

} 