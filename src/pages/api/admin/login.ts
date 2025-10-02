import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminPassword, generateAdminToken, setAdminCookie } from '../../../lib/adminAuth.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = generateAdminToken();
  setAdminCookie(res, token);

  res.status(200).json({ success: true, message: 'Login successful' });
}
