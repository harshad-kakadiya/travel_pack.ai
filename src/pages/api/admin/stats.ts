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
    // Get total travel packs
    const { count: totalPacks } = await supabaseAdmin
      .from('itineraries')
      .select('*', { count: 'exact', head: true });

    // Get packs by persona
    const { data: personaStats } = await supabaseAdmin
      .from('itineraries')
      .select('persona')
      .not('persona', 'is', null);

    const personaBreakdown = personaStats?.reduce((acc: any, item: any) => {
      const persona = item.persona || 'Unknown';
      acc[persona] = (acc[persona] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get top destinations
    const { data: destinationStats } = await supabaseAdmin
      .from('itineraries')
      .select('destinations')
      .not('destinations', 'is', null);

    const destinationCounts: { [key: string]: number } = {};
    destinationStats?.forEach((item: any) => {
      if (item.destinations && Array.isArray(item.destinations)) {
        item.destinations.forEach((dest: string) => {
          destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
        });
      }
    });

    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([destination, count]) => ({ destination, count }));

    // Get recent packs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentPacks } = await supabaseAdmin
      .from('itineraries')
      .select('id, trip_title, persona, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

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
      personaBreakdown,
      topDestinations,
      recentPacks: recentPacks || [],
      topAffiliateClicks,
      affiliateClicksLast7Days: affiliateClicks?.length || 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
