import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY = 'BGjzM7P_sdHVBjEkwo4XKB_rdq9sM_bq9orpj4ZLnfQzXd5g6g6ZCd3bUBiteLKuD62AkYn6IWcZxW20XSqq7e0';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fyuxsyqgpukeqvpmwzxn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

webpush.setVapidDetails(
  'mailto:cic-cloud@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, message, target_audience } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ error: 'title and message are required' });
    }

    if (!VAPID_PRIVATE_KEY) {
      console.error('VAPID_PRIVATE_KEY environment variable is not set');
      return res.status(500).json({ error: 'VAPID not configured' });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch all push subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    if (target_audience && target_audience !== 'all') {
      query = query.or(`department.eq.${target_audience},department.is.null,department.eq.all`);
    }
    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Failed to fetch subscriptions:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title,
      message,
      body: message,
      icon: '/logo.png',
      badge: '/pwa-192x192.png',
      data: { url: '/' },
    });

    let sent = 0;
    let failed = 0;
    const expiredIds = [];

    // Send to all subscriptions
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSub = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(pushSub, payload);
          sent++;
        } catch (err) {
          failed++;
          // If subscription expired (410 Gone or 404), mark for cleanup
          if (err.statusCode === 410 || err.statusCode === 404) {
            expiredIds.push(sub.id);
          }
          console.error(`Push failed for ${sub.endpoint}:`, err.statusCode || err.message);
        }
      })
    );

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', expiredIds);
      console.log(`Cleaned up ${expiredIds.length} expired subscriptions`);
    }

    return res.status(200).json({
      sent,
      failed,
      cleaned: expiredIds.length,
      total: subscriptions.length,
    });
  } catch (err) {
    console.error('Send push error:', err);
    return res.status(500).json({ error: err.message });
  }
}
