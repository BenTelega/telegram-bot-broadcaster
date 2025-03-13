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
  const [messageRate, setMessageRate] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [avgMessagesPerSecond, setAvgMessagesPerSecond] = useState<number>(0);

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
    setStartTime(Date.now());
    setSentCount(0);
    setFailedCount(0);
    setQueuedCount(userList.users.length);

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
    const messageTimestamps: number[] = [];

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
                setSentCount(successCount);
            } else {
                delivery.status = 'failed';
                delivery.updatedAt = new Date().toISOString();
                delivery.reason = m.description;
                console.log(`Message failed to send to ${delivery.tgid}: ${m.description}`);
                failureCount++;
                setFailedCount(failureCount);
            }

            // Update message rate calculation
            const now = Date.now();
            messageTimestamps.push(now);
            // Only keep timestamps from the last second
            const recentMessages = messageTimestamps.filter(ts => now - ts < 1000);
            setMessageRate(recentMessages.length);
            
            setQueuedCount(userList.users.length - successCount - failureCount);
            updateCampaignRun(campaignRun.id, campaignRun);
            setCampaignRun(campaignRun);

        } catch (error: any) {
            delivery.status = 'failed';
            delivery.updatedAt = new Date().toISOString();
            delivery.reason = error.message;
            console.log(`Message failed to send to ${delivery.tgid}: ${error.message}`);
            failureCount++;
            setFailedCount(failureCount);
            setQueuedCount(userList.users.length - successCount - failureCount);
            updateCampaignRun(campaignRun.id, campaignRun);
            setCampaignRun(campaignRun);
        }
        // Wait 40 ms to avoid rate limit (~25 messages per second - DOES NOT WORKS IN REAL, REAL mps around 7 without it)
        //await new Promise(resolve => setTimeout(resolve, 40));
    }
     
    // Update run status to completed
    if(failureCount == campaignRun.deliveries.length) {
        campaignRun.status = 'failed';
    } else {
        campaignRun.status = 'completed';
    }
    const endTimeMs = Date.now();
    setEndTime(endTimeMs);
    campaignRun.finishedAt = new Date().toISOString();
    campaignRun.successCount = successCount;
    campaignRun.failureCount = failureCount;
    updateCampaignRun(campaignRun.id, campaignRun);

    // Calculate average messages per second
    if (startTime) {
      const durationSeconds = (endTimeMs - startTime) / 1000;
      const avgMsgPerSec = durationSeconds > 0 ? (successCount + failureCount) / durationSeconds : 0;
      setAvgMessagesPerSecond(parseFloat(avgMsgPerSec.toFixed(2)));
    }

    setIsRunning(false);
    setIsCompleted(true);
    setMessageRate(0);
  }

  const downloadUserIds = (type: 'sent' | 'failed') => {
    if (!campaignRun) return;
    
    const filteredUsers = campaignRun.deliveries
      .filter(delivery => delivery.status === (type === 'sent' ? 'sent' : 'failed'))
      .map(delivery => delivery.tgid)
      .join('\n');
    
    const blob = new Blob([filteredUsers], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${existingCampaign.name}_${type}_users.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTooManyRequestsUsers = () => {
    if (!campaignRun) return;
    
    const tooManyRequestsUsers = campaignRun.deliveries
      .filter(delivery => 
        delivery.status === 'failed' && 
        delivery.reason && 
        delivery.reason.includes('Too many requests')
      )
      .map(delivery => delivery.tgid)
      .join('\n');
    
    const blob = new Blob([tooManyRequestsUsers], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${existingCampaign.name}_too_many_requests_users.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="mb-6">
            <div className="text-sm text-red-500 mb-2">
              Campaign is running. Do not close this page!
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Messages/sec</div>
                <div className="text-xl font-bold">{messageRate}</div>
              </div>
              <div className="bg-green-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Sent</div>
                <div className="text-xl font-bold">{sentCount}</div>
              </div>
              <div className="bg-red-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Failed</div>
                <div className="text-xl font-bold">{failedCount}</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Queued</div>
                <div className="text-xl font-bold">{queuedCount}</div>
              </div>
            </div>
            
            {startTime && (
              <div className="text-xs text-slate-500 mb-2">
                Running for: {Math.floor((Date.now() - startTime) / 1000)} seconds
              </div>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="mb-4">
            <div className="text-sm text-green-500 mb-2">
              Broadcasting completed.
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Sent</div>
                <div className="text-xl font-bold">{sentCount}</div>
              </div>
              <div className="bg-red-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Failed</div>
                <div className="text-xl font-bold">{failedCount}</div>
              </div>
              <div className="bg-slate-100 p-3 rounded-md">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-xl font-bold">{sentCount + failedCount}</div>
              </div>
            </div>
            
            {/* Statistics Block */}
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <h3 className="text-md font-semibold mb-2">Campaign Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500">Avg Messages/sec</div>
                  <div className="text-lg font-bold">{(sentCount + failedCount) / (startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Duration</div>
                  <div className="text-lg font-bold">
                    {startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0} seconds
                  </div>
                </div>
              </div>
            </div>
            
            {/* Download Buttons */}
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => downloadUserIds('sent')} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!campaignRun || sentCount === 0}
              >
                📥 Download Sent Users
              </Button>
              <Button 
                onClick={() => downloadUserIds('failed')} 
                className="bg-red-600 hover:bg-red-700"
                disabled={!campaignRun || failedCount === 0}
              >
                📥 Download Failed Users
              </Button>
              <Button 
                onClick={downloadTooManyRequestsUsers} 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!campaignRun || !campaignRun.deliveries.some(d => 
                  d.status === 'failed' && d.reason && d.reason.includes('Too many requests')
                )}
              >
                📥 Download Rate Limited Users
              </Button>
            </div>
            
            {startTime && (
              <div className="text-xs text-slate-500 mb-2">
                Completed in: {Math.floor((Date.now() - startTime) / 1000)} seconds
              </div>
            )}
          </div>
        )}

        {campaignRun && (
          <div className="text-sm mb-4">

            {campaignRun.deliveries.map((delivery, index) => (
              <p key={index}>
                {delivery.tgid} - {delivery.status} 
                {delivery.reason && (
                  <span className="text-sm text-red-500">
                    - {delivery.reason}
                  </span>
                )}
              </p>
            ))}

          </div>

        )}
    </div>
  );

} 