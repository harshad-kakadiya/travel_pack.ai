import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getAdminTokenFromRequest, isAdminTokenValid } from '../../../lib/adminAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getAdminTokenFromRequest(req);
  if (!token || !isAdminTokenValid(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get last 30 days revenue
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    
    const { data: last30DaysPayments } = await stripe.paymentIntents.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });

    const last30DaysRevenue = last30DaysPayments
      .filter(payment => payment.status === 'succeeded')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100; // Convert from cents

    // Get lifetime revenue
    const { data: allPayments } = await stripe.paymentIntents.list({
      limit: 100,
    });

    const lifetimeRevenue = allPayments
      .filter(payment => payment.status === 'succeeded')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100; // Convert from cents

    // Get payment count for last 30 days
    const last30DaysCount = last30DaysPayments.filter(payment => payment.status === 'succeeded').length;

    // Get lifetime payment count
    const lifetimeCount = allPayments.filter(payment => payment.status === 'succeeded').length;

    res.status(200).json({
      last30DaysRevenue,
      lifetimeRevenue,
      last30DaysCount,
      lifetimeCount,
      currency: 'usd'
    });
  } catch (error) {
    console.error('Error fetching Stripe data:', error);
    res.status(500).json({ error: 'Failed to fetch Stripe data' });
  }
}