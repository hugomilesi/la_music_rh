
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  onDataChange: () => void;
  enabled?: boolean;
}

export const useSupabaseSubscription = ({ 
  channelName, 
  table, 
  onDataChange, 
  enabled = true 
}: SubscriptionConfig) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (channelRef.current && isSubscribedRef.current) {
      console.log(`Cleaning up subscription for ${channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, [channelName]);

  const subscribe = useCallback(() => {
    if (!enabled || isSubscribedRef.current) {
      return;
    }

    console.log(`Setting up subscription for ${channelName}`);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log(`Real-time update for ${table}:`, payload);
          onDataChange();
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelName}:`, status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;
  }, [channelName, table, onDataChange, enabled]);

  useEffect(() => {
    if (enabled) {
      subscribe();
    }

    return cleanup;
  }, [enabled, subscribe, cleanup]);

  return { cleanup };
};
