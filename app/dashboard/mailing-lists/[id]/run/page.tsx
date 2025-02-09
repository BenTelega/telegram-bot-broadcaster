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
  const { addCampaignRun, updateCampaignRun, removeCampaignRun } = useCampaignRunStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [campaignRun, setCampaignRun] = useState<CampaignRun | null>(null);

  const existingCampaign = campaigns.find((c) => c.id === params.id);

  if(!existingCampaign) {
    return <div>Campaign not found</div>;
  }

  const selectedBot = bots.find((b) => b.id === existingCampaign.botId)!;
  const selectedTemplate = messageTemplates.find((t) => t.id === existingCampaign.messageId)!;
  const userList = userLists.find((l) => l.id === existingCampaign.userListId)!;

  const handleRunCampaign = async () => {
    setIsRunning(true);

    // Create a new campaign run in store with all users in userList as pending deliveries
    const campaignRun: CampaignRun = {
        id: crypto.randomUUID(),
        campaignId: existingCampaign.id,
        status: 'running',
        deliveries: userList.users.map((user) => ({
            tgid: user,
            status: 'pending',
            updatedAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        successCount: 0,
        failureCount: 0,
    }
    addCampaignRun(campaignRun);

    let successCount = 0;
    let failureCount = 0;

    // Send messages to all users in userList
    // Bots has hard limit of 30 messages per second.
    for (const delivery of campaignRun.deliveries) {
        try{
            const m = await sendMessageFromTemplate(selectedBot, delivery.tgid, selectedTemplate);
            if(m.ok) {
                delivery.status = 'sent';
                delivery.updatedAt = new Date().toISOString();
                console.log(`Message sent to ${delivery.tgid}`,m);
                successCount++;
            } else {
                delivery.status = 'failed';
                delivery.updatedAt = new Date().toISOString();
                delivery.reason = m.description;
                console.log(`Message failed to send to ${delivery.tgid}: ${m.description}`);
                failureCount++;
            }

            updateCampaignRun(campaignRun.id, campaignRun);
            setCampaignRun(campaignRun);

        } catch (error: any) {
            delivery.status = 'failed';
            delivery.updatedAt = new Date().toISOString();
            delivery.reason = error.message;
            console.log(`Message failed to send to ${delivery.tgid}: ${error.message}`);
            updateCampaignRun(campaignRun.id, campaignRun);
            setCampaignRun(campaignRun);
        }
        // Wait 40 ms to avoid rate limit (~25 messages per second)
        await new Promise(resolve => setTimeout(resolve, 40));
    }
     
    // Update run status to completed
    if(failureCount == campaignRun.deliveries.length) {
        campaignRun.status = 'failed';
    } else {
        campaignRun.status = 'completed';
    }
    campaignRun.finishedAt = new Date().toISOString();
    campaignRun.successCount = successCount;
    campaignRun.failureCount = failureCount;
    updateCampaignRun(campaignRun.id, campaignRun);

    setIsRunning(false);
    setIsCompleted(true);
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Run Campaign "{existingCampaign.name}"</h1>
        <p className="text-sm text-muted-foreground mb-4">
          This will start broadcasting this campaign to {userList.count} users after you click the button below.
        </p>
        <Button className="w-full" onClick={handleRunCampaign} disabled={isRunning}>
          🚀 Run Campaign
        </Button>

        <hr className="my-4" />

        {isRunning && (
          <div className="text-sm text-red-500 mb-4">
            Campaign is running. Do not close this page!
          </div>
        )}

        {isCompleted && (
          <div className="text-sm text-green-500 mb-4">
            Broadcasting completed.
          </div>
        )}

        {campaignRun && (
          <div className="text-sm mb-4">

            {campaignRun.deliveries.map((delivery, index) => (
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