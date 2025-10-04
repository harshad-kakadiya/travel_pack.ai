import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getAdminTokenFromRequest, isAdminTokenValid } from '../../../lib/adminAuth.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getAdminTokenFromRequest(req);
  if (!token || !isAdminTokenValid(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get total travel briefs
    const { count: totalPacks } = await supabaseAdmin
      .from('travel_briefs')
      .select('*', { count: 'exact', head: true });

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('user_emails')
      .select('*', { count: 'exact', head: true });

    // Get total pending sessions
    const { count: totalSessions } = await supabaseAdmin
      .from('pending_sessions')
      .select('*', { count: 'exact', head: true });

    // Get packs by persona from travel_briefs
    const { data: personaStats } = await supabaseAdmin
      .from('travel_briefs')
      .select('persona')
      .not('persona', 'is', null);

    // Also get persona data from pending_sessions if no travel_briefs
    const { data: sessionPersonaStats } = await supabaseAdmin
      .from('pending_sessions')
      .select('persona')
      .not('persona', 'is', null);

    const personaBreakdown = personaStats?.reduce((acc: any, item: any) => {
      const persona = item.persona || 'Unknown';
      acc[persona] = (acc[persona] || 0) + 1;
      return acc;
    }, {}) || {};

    // If no travel briefs, use pending sessions data
    if (totalPacks === 0 && sessionPersonaStats) {
      sessionPersonaStats.forEach((item: any) => {
        const persona = item.persona || 'Unknown';
        personaBreakdown[persona] = (personaBreakdown[persona] || 0) + 1;
      });
    }

    // Get top destinations from travel_briefs
    const { data: destinationStats } = await supabaseAdmin
      .from('travel_briefs')
      .select('destinations')
      .not('destinations', 'is', null);

    // Also get destinations from pending_sessions if no travel_briefs
    const { data: sessionDestinationStats } = await supabaseAdmin
      .from('pending_sessions')
      .select('destinations')
      .not('destinations', 'is', null);

    const destinationCounts: { [key: string]: number } = {};
    
    // Process travel_briefs destinations
    destinationStats?.forEach((item: any) => {
      if (item.destinations && Array.isArray(item.destinations)) {
        item.destinations.forEach((dest: any) => {
          const destName = typeof dest === 'string' ? dest : dest.cityName || dest.name || dest;
          if (destName) {
            destinationCounts[destName] = (destinationCounts[destName] || 0) + 1;
          }
        });
      }
    });

    // If no travel briefs, use pending sessions data
    if (totalPacks === 0 && sessionDestinationStats) {
      sessionDestinationStats.forEach((item: any) => {
        if (item.destinations && Array.isArray(item.destinations)) {
          item.destinations.forEach((dest: any) => {
            // Handle both string and object destinations
            let destName = '';
            if (typeof dest === 'string') {
              destName = dest;
            } else if (dest && typeof dest === 'object') {
              // Prefer cityName, fallback to country, then any other property
              destName = dest.cityName || dest.country || dest.name || dest.city || dest.destination || '';
            }
            if (destName && destName.trim()) {
              destinationCounts[destName] = (destinationCounts[destName] || 0) + 1;
            }
          });
        }
      });
    }

    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([destination, count]) => ({ destination, count }));

    // Get recent packs (last 7 days) from travel_briefs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentPacks } = await supabaseAdmin
      .from('travel_briefs')
      .select('id, customer_email, persona, created_at, destinations')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // If no recent travel briefs, get recent pending sessions
    let recentData = recentPacks || [];
    if (recentData.length === 0) {
      const { data: recentSessions } = await supabaseAdmin
        .from('pending_sessions')
        .select('id, customer_email, persona, created_at, destinations')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      recentData = recentSessions || [];
    }

    // Get affiliate clicks (last 7 days)
    const { data: affiliateClicks } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('slug, ts')
      .gte('ts', sevenDaysAgo.toISOString());

    const affiliateClickCounts: { [key: string]: number } = {};
    affiliateClicks?.forEach((click: any) => {
      affiliateClickCounts[click.slug] = (affiliateClickCounts[click.slug] || 0) + 1;
    });

    const topAffiliateClicks = Object.entries(affiliateClickCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([slug, count]) => ({ slug, count }));

    res.status(200).json({
      totalPacks: totalPacks || 0,
      totalUsers: totalUsers || 0,
      totalSessions: totalSessions || 0,
      personaBreakdown,
      topDestinations,
      recentPacks: recentData || [],
      topAffiliateClicks,
      affiliateClicksLast7Days: affiliateClicks?.length || 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
