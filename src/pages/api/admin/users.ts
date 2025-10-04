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
    // Get all users from user_emails table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('user_emails')
      .select('*')
      .order('first_seen', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Get all travel briefs with user details
    const { data: travelBriefs, error: briefsError } = await supabaseAdmin
      .from('travel_briefs')
      .select('*')
      .order('created_at', { ascending: false });

    if (briefsError) {
      console.error('Error fetching travel briefs:', briefsError);
      return res.status(500).json({ error: 'Failed to fetch travel briefs' });
    }

    // Get all pending sessions
    const { data: pendingSessions, error: sessionsError } = await supabaseAdmin
      .from('pending_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching pending sessions:', sessionsError);
      return res.status(500).json({ error: 'Failed to fetch pending sessions' });
    }

    // Combine user data with their travel briefs and sessions
    const usersWithData = users?.map(user => {
      const userBriefs = travelBriefs?.filter(brief => brief.customer_email === user.email) || [];
      const userSessions = pendingSessions?.filter(session => session.customer_email === user.email) || [];
      
      return {
        ...user,
        travelBriefs: userBriefs,
        pendingSessions: userSessions,
        totalBriefs: userBriefs.length,
        totalSessions: userSessions.length,
        lastActivity: userBriefs.length > 0 ? userBriefs[0].created_at : user.last_seen
      };
    }) || [];

    res.status(200).json({
      users: usersWithData,
      totalUsers: users?.length || 0,
      totalTravelBriefs: travelBriefs?.length || 0,
      totalPendingSessions: pendingSessions?.length || 0
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}