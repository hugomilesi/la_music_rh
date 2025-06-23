
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

  const cleanup = useCallback(() => {
    const existingChannel = activeSubscriptions.get(channelName);
    if (existingChannel) {
      console.log(`Cleaning up subscription for ${channelName}`);
      supabase.removeChannel(existingChannel);
      activeSubscriptions.delete(channelName);
    }
  }, [channelName]);

  const subscribe = useCallback(() => {
    if (!enabled || isInitializedRef.current) {
      return;
    }

    // Check if subscription already exists
    if (activeSubscriptions.has(channelName)) {
      console.log(`Subscription for ${channelName} already exists, skipping`);
      isInitializedRef.current = true;
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
          activeSubscriptions.set(channelName, channel);
          isInitializedRef.current = true;
        }
      });
  }, [channelName, table, onDataChange, enabled]);

  useEffect(() => {
    if (enabled) {
      subscribe();
    }

    return () => {
      // Only cleanup when component unmounts, not on every re-render
      if (!enabled) {
        cleanup();
      }
    };
  }, [enabled, subscribe]); // Removed cleanup from dependencies to prevent re-subscriptions

  return { cleanup };
};
