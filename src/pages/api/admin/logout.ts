import { NextApiRequest, NextApiResponse } from 'next';
import { clearAdminCookie } from '../../../lib/adminAuth.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearAdminCookie(res);
  res.status(200).json({ success: true, message: 'Logout successful' });
}
