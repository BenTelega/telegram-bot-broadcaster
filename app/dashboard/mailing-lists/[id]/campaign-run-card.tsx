"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignRun } from "@/lib/campaignRunStore"
import { Download, Eye } from "lucide-react"
import Link from "next/link"

export default function CampaignRunCard({ campaignRun }: { campaignRun: CampaignRun }) {
    const handleDownloadFailed = () => {
        const failedTgids = campaignRun.deliveries
            .filter(d => d.status === 'failed')
            .map(d => d.tgid)
            .join('\n');
        
        const blob = new Blob([failedTgids], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `failed-tgids-${campaignRun.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadSent = () => {
        const sentTgids = campaignRun.deliveries
            .filter(d => d.status === 'sent')
            .map(d => d.tgid)
            .join('\n');
        
        const blob = new Blob([sentTgids], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sent-tgids-${campaignRun.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-muted-foreground">{new Date(campaignRun.createdAt).toLocaleString()}</span>
                        <Badge variant="outline" className={campaignRun.status === 'completed' ? 'bg-green-500' : campaignRun.status === 'failed' ? 'bg-red-500' : ''}>{campaignRun.status}</Badge>
                    </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                <b>{campaignRun.successCount}</b> sent / <b>{campaignRun.failureCount}</b> failed
                            </span>
                            {campaignRun.finishedAt && <span className="text-sm text-muted-foreground">
                                Finished: {campaignRun.finishedAt ? new Date(campaignRun.finishedAt).toLocaleString() : ''}
                            </span>}
                        </div>
                        {(campaignRun.status === 'completed' || campaignRun.status === 'failed') && (
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleDownloadFailed}
                                    disabled={campaignRun.failureCount === 0}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download failed
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleDownloadSent}
                                    disabled={campaignRun.successCount === 0}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download sent
                                </Button>
                                <Link href={`/dashboard/mailing-lists/${campaignRun.campaignId}/runs/${campaignRun.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View results
                                    </Button>
                                </Link>
                            </div>
                        )}
                </div>
            </CardContent>
        </Card>
    )
}
