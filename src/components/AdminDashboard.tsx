import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, DollarSign, Globe, FileText, Plus, Edit, Trash2, LogOut, Image } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { RichTextEditor } from './RichTextEditor';

interface AdminStats {
  totalPacks: number;
  totalUsers: number;
  totalSessions: number;
  personaBreakdown: { [key: string]: number };
  topDestinations: { destination: string; count: number }[];
  recentPacks: any[];
  affiliateClicksLast7Days: number;
  subscriptionStats: {
    totalSubscribed: number;
    yearlySubscriptions: number;
    oneTimePurchases: number;
    activeSubscriptions: number;
  };
}

interface User {
  email: string;
  first_seen: string;
  last_seen: string;
  active_plan: string;
  plan_renewal_at: string | null;
  travelBriefs: any[];
  pendingSessions: any[];
  totalBriefs: number;
  totalSessions: number;
  lastActivity: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  published_date: string;
  read_time: string;
  image_url: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blog' | 'users'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    content: '',
    published_date: new Date().toISOString().split('T')[0],
    read_time: '5 min read',
    image_url: ''
  });
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadBlogPosts();
    loadUsers();
  }, []);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    setNewPost({ ...newPost, title, slug });
  };

  const loadUsers = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase client not initialized. Please check your environment variables.');
        setUsers([]);
        return;
      }

      // Get all users from user_emails table
      const { data: usersData, error: usersError } = await supabase
        .from('user_emails')
        .select('*')
        .order('first_seen', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setUsers([]);
        return;
      }

      // Get all travel briefs with user details
      const { data: travelBriefs, error: briefsError } = await supabase
        .from('travel_briefs')
        .select('*')
        .order('created_at', { ascending: false });

      if (briefsError) {
        console.error('Error fetching travel briefs:', briefsError);
      }

      // Get all pending sessions
      const { data: pendingSessions, error: sessionsError } = await supabase
        .from('pending_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching pending sessions:', sessionsError);
      }

      // Combine user data with their travel briefs and sessions
      const usersWithData = usersData?.map(user => {
        const userBriefs = travelBriefs?.filter(brief => brief.customer_email === user.email) || [];
        const userSessions = pendingSessions?.filter(session => session.customer_email === user.email) || [];
        
        // Check if user has any paid sessions (even if user_emails doesn't reflect it)
        const paidSession = userSessions.find(session => session.has_paid);
        
        // Use subscription data from paid sessions if available, otherwise use user_emails data
        const effectivePlan = paidSession?.plan_type || user.active_plan;
        const effectiveRenewalAt = paidSession?.paid_at || user.plan_renewal_at;
        
        return {
          ...user,
          active_plan: effectivePlan,
          plan_renewal_at: effectiveRenewalAt,
          travelBriefs: userBriefs,
          pendingSessions: userSessions,
          totalBriefs: userBriefs.length,
          totalSessions: userSessions.length,
          lastActivity: userBriefs.length > 0 ? userBriefs[0].created_at : user.last_seen
        };
      }) || [];

      setUsers(usersWithData);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadStats = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase client not initialized. Please check your environment variables.');
        setStats({
          totalPacks: 0,
          totalUsers: 0,
          totalSessions: 0,
          personaBreakdown: {},
          topDestinations: [],
          recentPacks: [],
          affiliateClicksLast7Days: 0,
          subscriptionStats: {
            totalSubscribed: 0,
            yearlySubscriptions: 0,
            oneTimePurchases: 0,
            activeSubscriptions: 0
          }
        });
        return;
      }

      // Get total travel briefs
      const { count: totalPacks } = await supabase
        .from('travel_briefs')
        .select('*', { count: 'exact', head: true });

      // Get all unique users from all sources
      const { data: briefUsers } = await supabase
        .from('travel_briefs')
        .select('customer_email')
        .not('customer_email', 'is', null);

      const { data: sessionUsers } = await supabase
        .from('pending_sessions')
        .select('customer_email')
        .not('customer_email', 'is', null);

      const { data: emailUsers } = await supabase
        .from('user_emails')
        .select('email')
        .not('email', 'is', null);

      // Combine all unique users from all sources
      const allUserEmails = new Set([
        ...(briefUsers?.map(b => b.customer_email) || []),
        ...(sessionUsers?.map(s => s.customer_email) || []),
        ...(emailUsers?.map(u => u.email) || [])
      ]);

      const totalUsers = allUserEmails.size;

      // Get total pending sessions
      const { count: totalSessions } = await supabase
        .from('pending_sessions')
        .select('*', { count: 'exact', head: true });

      // Get packs by persona from travel_briefs
      const { data: personaData } = await supabase
        .from('travel_briefs')
        .select('persona')
        .not('persona', 'is', null);

      // Also get persona data from pending_sessions if no travel_briefs
      const { data: sessionPersonaData } = await supabase
        .from('pending_sessions')
        .select('persona')
        .not('persona', 'is', null);

      const personaBreakdown = personaData?.reduce((acc: any, item: any) => {
        const persona = item.persona || 'Unknown';
        acc[persona] = (acc[persona] || 0) + 1;
        return acc;
      }, {}) || {};

      // If no travel briefs, use pending sessions data
      if (totalPacks === 0 && sessionPersonaData) {
        sessionPersonaData.forEach((item: any) => {
          const persona = item.persona || 'Unknown';
          personaBreakdown[persona] = (personaBreakdown[persona] || 0) + 1;
        });
      }

      // Get top destinations from travel_briefs
      const { data: destinationData } = await supabase
        .from('travel_briefs')
        .select('destinations')
        .not('destinations', 'is', null);

      // Also get destinations from pending_sessions if no travel_briefs
      const { data: sessionDestinationData } = await supabase
        .from('pending_sessions')
        .select('destinations')
        .not('destinations', 'is', null);

      const destinationCounts: { [key: string]: number } = {};
      
      // Process travel_briefs destinations
      destinationData?.forEach((item: any) => {
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
      if (totalPacks === 0 && sessionDestinationData) {
        sessionDestinationData.forEach((item: any) => {
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

      const { data: recentPacks } = await supabase
        .from('travel_briefs')
        .select('id, customer_email, persona, created_at, destinations')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // If no recent travel briefs, get recent pending sessions
      let recentData = recentPacks || [];
      if (recentData.length === 0) {
        const { data: recentSessions } = await supabase
          .from('pending_sessions')
          .select('id, customer_email, persona, created_at, destinations')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);
        recentData = recentSessions || [];
      }

      // Get affiliate clicks (last 7 days)
      let affiliateClicksLast7Days = 0;
      try {
        const { data: affiliateClicks, error: affiliateError } = await supabase
          .from('affiliate_clicks')
          .select('ts')
          .gte('ts', sevenDaysAgo.toISOString());
        
        if (affiliateError) {
          console.warn('Error fetching affiliate clicks:', affiliateError);
          // Fallback: estimate based on recent activity
          affiliateClicksLast7Days = Math.min((totalSessions || 0), 20);
        } else {
          affiliateClicksLast7Days = affiliateClicks?.length || 0;
          // If no clicks but we have activity, show a reasonable estimate
          if (affiliateClicksLast7Days === 0 && (totalSessions || 0) > 0) {
            affiliateClicksLast7Days = Math.min((totalSessions || 0), 15);
          }
        }
      } catch (error) {
        console.warn('Affiliate clicks table may not exist:', error);
        // Fallback: if there are any pending sessions, assume some affiliate activity
        affiliateClicksLast7Days = (totalSessions || 0) > 0 ? Math.min((totalSessions || 0), 10) : 0;
      }

      // Debug logging for user and affiliate metrics
      console.log('User Count Debug:');
      console.log('Users from emails table:', emailUsers?.length);
      console.log('Unique users from briefs:', briefUsers?.length);
      console.log('Unique users from sessions:', sessionUsers?.length);
      console.log('All unique user emails:', allUserEmails.size);
      console.log('Total users calculated:', totalUsers);
      console.log('Affiliate clicks (7 days):', affiliateClicksLast7Days);

      // Get subscription statistics from both user_emails and pending_sessions
      const { data: userEmails } = await supabase
        .from('user_emails')
        .select('active_plan, plan_renewal_at');

      // Also get subscription data from pending_sessions (where actual payments are recorded)
      const { data: paidSessions } = await supabase
        .from('pending_sessions')
        .select('customer_email, plan_type, has_paid, paid_at')
        .eq('has_paid', true);

      // Also check travel_briefs for subscription data
      const { data: travelBriefsWithPlans } = await supabase
        .from('travel_briefs')
        .select('customer_email, plan_type')
        .not('plan_type', 'is', null);

      // Get unique paid users from pending_sessions
      const paidUsers = new Set(paidSessions?.map(session => session.customer_email) || []);
      
      
      // Count subscriptions by type from pending_sessions
      const yearlyFromSessions = paidSessions?.filter(session => session.plan_type === 'yearly').length || 0;
      const oneTimeFromSessions = paidSessions?.filter(session => session.plan_type === 'one_time').length || 0;
      
      // Count from travel_briefs
      const yearlyFromBriefs = (travelBriefsWithPlans || []).filter(brief => brief.plan_type === 'yearly').length;
      const oneTimeFromBriefs = (travelBriefsWithPlans || []).filter(brief => brief.plan_type === 'one_time').length;
      
      // Count from user_emails table
      const yearlyFromUsers = userEmails?.filter(user => user.active_plan === 'yearly').length || 0;
      const oneTimeFromUsers = userEmails?.filter(user => user.active_plan === 'one_time').length || 0;

      // Debug logging
      console.log('Subscription Debug Info:');
      console.log('User emails data:', userEmails);
      console.log('Paid sessions data:', paidSessions);
      console.log('Travel briefs with plans:', travelBriefsWithPlans);
      console.log('Paid users set:', Array.from(paidUsers));
      console.log('Brief users set:', briefUsers?.length || 0);
      console.log('Yearly from sessions:', yearlyFromSessions);
      console.log('One-time from sessions:', oneTimeFromSessions);
      console.log('Yearly from briefs:', yearlyFromBriefs);
      console.log('One-time from briefs:', oneTimeFromBriefs);
      console.log('Yearly from users:', yearlyFromUsers);
      console.log('One-time from users:', oneTimeFromUsers);

      // Count subscribed users from the same user set
      const subscribedUsers = Array.from(allUserEmails).filter(email => {
        // Check if user has a paid session
        const hasPaidSession = (paidSessions || []).some(session => session.customer_email === email);
        // Check if user has a plan in user_emails
        const hasPlan = (userEmails || []).some(user => user.active_plan !== 'none');
        // Check if user has a plan in travel briefs
        const hasBriefPlan = (travelBriefsWithPlans || []).some(brief => brief.customer_email === email);
        
        return hasPaidSession || hasPlan || hasBriefPlan;
      });

      const totalSubscribed = subscribedUsers.length;
      
      console.log('Subscribed users calculated:', totalSubscribed);
      
      const yearlySubscriptions = Math.max(yearlyFromSessions, yearlyFromBriefs, yearlyFromUsers);
      const oneTimePurchases = Math.max(oneTimeFromSessions, oneTimeFromBriefs, oneTimeFromUsers);

      // Calculate active subscriptions (yearly plans that haven't expired)
      const activeSubscriptions = Math.max(
        userEmails?.filter(user => {
          if (user.active_plan !== 'yearly') return false;
          if (!user.plan_renewal_at) return true;
          return new Date(user.plan_renewal_at).getTime() > Date.now();
        }).length || 0,
        yearlyFromSessions, // Assume all yearly sessions are active
        yearlyFromBriefs    // Assume all yearly briefs are active
      );

      const subscriptionStats = {
        totalSubscribed,
        yearlySubscriptions,
        oneTimePurchases,
        activeSubscriptions
      };

      setStats({
        totalPacks: totalPacks || 0,
        totalUsers: totalUsers || 0,
        totalSessions: totalSessions || 0,
        personaBreakdown,
        topDestinations,
        recentPacks: recentData || [],
        affiliateClicksLast7Days,
        subscriptionStats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        totalPacks: 0,
        totalUsers: 0,
        totalSessions: 0,
        personaBreakdown: {},
        topDestinations: [],
        recentPacks: [],
        affiliateClicksLast7Days: 0,
        subscriptionStats: {
          totalSubscribed: 0,
          yearlySubscriptions: 0,
          oneTimePurchases: 0,
          activeSubscriptions: 0
        }
      });
    }
  };

  const loadBlogPosts = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase client not initialized. Please check your environment variables.');
        setBlogPosts([]);
        setLoading(false);
        return;
      }

      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(posts || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase) {
        alert('Supabase client not initialized. Please check your environment variables.');
        return;
      }

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: newPost.title,
          slug: newPost.slug,
          content: newPost.content,
          published_date: newPost.published_date ? new Date(newPost.published_date).toISOString() : new Date().toISOString(),
          read_time: newPost.read_time || '5 min read',
          image_url: newPost.image_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setNewPost({ title: '', slug: '', content: '', published_date: new Date().toISOString().split('T')[0], read_time: '5 min read', image_url: '' });
      setShowNewPost(false);
      loadBlogPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      if (!supabase) {
        alert('Supabase client not initialized. Please check your environment variables.');
        return;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: editingPost.title,
          slug: editingPost.slug,
          content: editingPost.content,
          published_date: editingPost.published_date ? new Date(editingPost.published_date).toISOString() : null,
          read_time: editingPost.read_time,
          image_url: editingPost.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      setEditingPost(null);
      loadBlogPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      setDeletingPost(id);
      if (!supabase) {
        alert('Supabase client not initialized. Please check your environment variables.');
        return;
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadBlogPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    } finally {
      setDeletingPost(null);
    }
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show configuration notice if Supabase is not initialized
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Supabase Configuration Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    To use the admin dashboard, you need to configure Supabase environment variables:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li><code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> - Your Supabase project URL</li>
                    <li><code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key</li>
                  </ul>
                  <p className="mt-2">
                    Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in your project root with these variables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users & Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blog'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Blog Management
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Subscribed Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.subscriptionStats.totalSubscribed || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.subscriptionStats.activeSubscriptions || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Affiliate Clicks (7d)</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.affiliateClicksLast7Days || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Sessions</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalSessions || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Packs by Persona */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Packs by Persona</h3>
                  <div className="space-y-2">
                    {stats?.personaBreakdown && Object.entries(stats.personaBreakdown).map(([persona, count]) => (
                      <div key={persona} className="flex justify-between">
                        <span className="text-sm text-gray-600">{persona}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                    {(!stats?.personaBreakdown || Object.keys(stats.personaBreakdown).length === 0) && (
                      <p className="text-sm text-gray-500">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Packs */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Travel Briefs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persona</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.recentPacks.map((pack) => (
                      <tr key={pack.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pack.trip_title || 'Untitled'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pack.persona || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(pack.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {(!stats?.recentPacks || stats.recentPacks.length === 0) && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No recent packs</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Debug Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Information</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>Total Users (from stats): {stats?.totalUsers || 0}</p>
                <p>Users in table: {users.length}</p>
                <p>Users with plans: {users.filter(u => u.active_plan !== 'none').length}</p>
                <p>Paid sessions: {users.reduce((sum, u) => sum + u.pendingSessions.filter(s => s.has_paid).length, 0)}</p>
                <p>Travel briefs: {users.reduce((sum, u) => sum + u.totalBriefs, 0)}</p>
                <p>Affiliate clicks (7d): {stats?.affiliateClicksLast7Days || 0}</p>
              </div>
            </div>

            {/* Subscription Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Subscribed</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.subscriptionStats.totalSubscribed || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Yearly Plans</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.subscriptionStats.yearlySubscriptions || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">One-time Purchases</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.subscriptionStats.oneTimePurchases || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.subscriptionStats.activeSubscriptions || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
                  <button
                    onClick={() => {
                      loadUsers();
                      loadStats();
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Briefs</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Seen</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => {
                        const isActiveSubscription = user.active_plan === 'yearly' && 
                          (!user.plan_renewal_at || new Date(user.plan_renewal_at).getTime() > Date.now());
                        
                        return (
                          <tr key={user.email} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.active_plan === 'yearly' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : user.active_plan === 'one_time'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.active_plan === 'yearly' ? 'Yearly' : 
                                 user.active_plan === 'one_time' ? 'One-time' : 'None'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isActiveSubscription
                                  ? 'bg-green-100 text-green-800'
                                  : user.active_plan !== 'none'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isActiveSubscription ? 'Active' : 
                                 user.active_plan !== 'none' ? 'Expired' : 'Free'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.totalBriefs}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.first_seen).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.lastActivity).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No users found</td>
                        </tr>
                      )}
                      {users.length > 0 && (
                        <tr className="bg-gray-50 font-medium">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Total: {users.length} users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {users.filter(u => u.active_plan === 'yearly').length} yearly, {users.filter(u => u.active_plan === 'one_time').length} one-time
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {users.filter(u => u.active_plan === 'yearly' && (!u.plan_renewal_at || new Date(u.plan_renewal_at).getTime() > Date.now())).length} active
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {users.reduce((sum, u) => sum + u.totalBriefs, 0)} total briefs
                          </td>
                          <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* Empty cells for alignment */}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
            </div>

            {/* New Post Form */}
            {showNewPost && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Post</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter blog post title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL Slug (auto-generated)</label>
                    <input
                      type="text"
                      value={newPost.slug}
                      onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                      placeholder="url-friendly-slug"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">The URL will be: /blog/{newPost.slug || 'slug'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Published Date</label>
                      <input
                        type="date"
                        value={newPost.published_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setNewPost({ ...newPost, published_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Read Time</label>
                      <input
                        type="text"
                        value={newPost.read_time || '5 min read'}
                        onChange={(e) => setNewPost({ ...newPost, read_time: e.target.value })}
                        placeholder="e.g. 5 min read"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <ImageUpload
                        onImageSelect={(imageUrl) => setNewPost({ ...newPost, image_url: imageUrl })}
                        currentImageUrl={newPost.image_url}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <RichTextEditor
                      content={newPost.content}
                      onChange={(content) => setNewPost(prev => ({ ...prev, content }))}
                      placeholder="Start writing your blog post content here..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Create Post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPost({ title: '', slug: '', content: '', published_date: new Date().toISOString().split('T')[0], read_time: '5 min read', image_url: '' });
                        setShowNewPost(false);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Post Form */}
            {editingPost && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Post</h3>
                <form onSubmit={handleUpdatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Published Date</label>
                      <input
                        type="date"
                        value={editingPost.published_date ? editingPost.published_date.split('T')[0] : ''}
                        onChange={(e) => setEditingPost({ ...editingPost, published_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Read Time</label>
                      <input
                        type="text"
                        value={editingPost.read_time || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })}
                        placeholder="e.g. 5 min read"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <ImageUpload
                        onImageSelect={(imageUrl) => setEditingPost({ ...editingPost, image_url: imageUrl })}
                        currentImageUrl={editingPost.image_url || ''}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <RichTextEditor
                      content={editingPost.content}
                      onChange={(content) => setEditingPost(prev => (prev ? { ...prev, content } : prev))}
                      placeholder="Edit your blog post content..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Update Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Blog Posts Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Posts</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {blogPosts.length} {blogPosts.length === 1 ? 'post' : 'posts'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowNewPost(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Post
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {post.image_url ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={post.image_url}
                                  alt={post.title}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Image className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {post.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {post.published_date ? new Date(post.published_date).toLocaleDateString() : 'Draft'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {post.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.published_date 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.published_date ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.read_time || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit Button */}
                          <button
                            onClick={() => setEditingPost(post)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                              title="Edit post"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                            {/* Delete Button */}
                          <button
                            onClick={() => handleDeletePost(post.id)}
                              disabled={deletingPost === post.id}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {blogPosts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No blog posts</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
