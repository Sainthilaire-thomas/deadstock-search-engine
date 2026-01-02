// src/features/admin/components/SiteActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, Play } from 'lucide-react';
import { triggerDiscovery, triggerFullScraping } from '@/features/admin/application/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SiteActionsProps {
  siteId: string;
  siteUrl: string;
  hasProfile: boolean;
}

export function SiteActions({ siteId, siteUrl, hasProfile }: SiteActionsProps) {
  const router = useRouter();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const handleDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const result = await triggerDiscovery(siteUrl);
      
      if (result.success) {
        toast.success(result.message || 'Discovery completed!');
        router.refresh();
      } else {
        toast.error(result.error || 'Discovery failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleScraping = async () => {
    if (!hasProfile) {
      toast.error('Please run discovery first');
      return;
    }

    setIsScraping(true);
    try {
      const result = await triggerFullScraping(siteId);
      
      if (result.success) {
        toast.success(result.message || 'Scraping completed!');
        router.refresh();
      } else {
        toast.error(result.error || 'Scraping failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={handleDiscovery}
        disabled={isDiscovering}
      >
        {isDiscovering ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Globe className="mr-2 h-4 w-4" />
        )}
        {isDiscovering ? 'Discovering...' : 'Run Discovery'}
      </Button>
      
      <Button 
        variant="secondary"
        onClick={handleScraping}
        disabled={isScraping || !hasProfile}
      >
        {isScraping ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isScraping ? 'Scraping...' : 'Run Scraping'}
      </Button>
      
      <Button variant="outline" disabled>
        Edit Configuration
      </Button>
    </div>
  );
}
