
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  onDataChange: () => void;
  enabled?: boolean;
}

// Global registry to track active subscriptions
const activeSubscriptions = new Map<string, RealtimeChannel>();

export const useSupabaseSubscription = ({ 
  channelName, 
  table, 
  onDataChange, 
  enabled = true 
}: SubscriptionConfig) => {
  const isInitializedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const cleanup = useCallback(() => {
    const existingChannel = activeSubscriptions.get(channelName);
    if (existingChannel) {
      try {
        supabase.removeChannel(existingChannel);
        activeSubscriptions.delete(channelName);
        isInitializedRef.current = false;
        retryCountRef.current = 0;
      } catch (error) {
      }
    }
  }, [channelName]);

  const subscribe = useCallback(() => {
    if (!enabled || isInitializedRef.current) {
      return;
    }

    // Check if subscription already exists
    if (activeSubscriptions.has(channelName)) {
      isInitializedRef.current = true;
      return;
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          (payload) => {
            onDataChange();
            retryCountRef.current = 0; // Reset retry count on successful message
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            activeSubscriptions.set(channelName, channel);
            isInitializedRef.current = true;
            retryCountRef.current = 0;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            
            // Retry logic
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              setTimeout(() => {
                cleanup();
                subscribe();
              }, Math.min(retryCountRef.current * 2000, 10000)); // Exponential backoff
            } else {
            }
          } else if (status === 'CLOSED') {
            cleanup();
          }
        });
    } catch (error) {
    }
  }, [channelName, table, onDataChange, enabled, cleanup]);

  useEffect(() => {
    if (enabled) {
      subscribe();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [enabled, subscribe, cleanup]);

  return { cleanup };
};
