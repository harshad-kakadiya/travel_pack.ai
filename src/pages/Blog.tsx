import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import Reveal from '../components/Reveal';
import { supabase } from '../lib/supabase';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  published_date: string | null;
  read_time: string | null;
  image_url: string | null;
}

// Fallback static posts for when database is not available
const fallbackPosts: BlogPostData[] = [
  {
    id: '1',
    slug: 'solo-female-travel-safety-guide',
    title: 'The Complete Guide to Solo Female Travel Safety',
    content: 'Essential safety tips, trusted accommodation options, and cultural considerations for women traveling alone.',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    published_date: '2025-01-15T00:00:00Z',
    read_time: '8 min read',
    image_url: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    slug: 'first-time-international-travel-guide',
    title: 'First-Time International Travel: What You Need to Know',
    content: 'From passport applications to airport navigation, everything new travelers need for their first international adventure.',
    created_at: '2025-01-12T00:00:00Z',
    updated_at: '2025-01-12T00:00:00Z',
    published_date: '2025-01-12T00:00:00Z',
    read_time: '12 min read',
    image_url: 'https://images.pexels.com/photos/2859169/pexels-photo-2859169.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    slug: 'exploring-udaipur-city-of-lakes',
    title: 'Exploring Udaipur: City of Lakes',
    content: 'Discover the romantic charm of Udaipur, Rajasthan\'s most picturesque destination with its stunning lakes, royal palaces, and rich cultural heritage.',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    published_date: '2025-01-10T00:00:00Z',
    read_time: '10 min read',
    image_url: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

// Export for use in BlogPost component
export { BlogPostData };

export function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPostData[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        console.warn('Supabase client not initialized, using fallback posts');
        setBlogPosts(fallbackPosts);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .not('published_date', 'is', null)
        .order('published_date', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        setError('Failed to load blog posts');
        setBlogPosts(fallbackPosts);
      } else {
        setBlogPosts(data || fallbackPosts);
        setError(null);
      }
    } catch (err) {
      console.error('Exception fetching blog posts:', err);
      setError('Failed to load blog posts');
      setBlogPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <SEOHead 
          title="Travel Blog – Travel Pack"
          description="Expert travel advice, tips, and destination guides to help you plan better trips and travel with confidence."
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead 
        title="Travel Blog – Travel Brief"
        description="Expert travel advice, tips, and destination guides to help you plan better trips and travel with confidence."
      />
      <SEOHead 
        title="Travel Blog – Travel Brief"
        description="Expert travel advice, tips, and destination guides to help you plan better trips and travel with confidence."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12" variant="fade" duration={800}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Travel Insights & Tips
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert advice, travel tips, and destination guides to help you 
            plan better trips and travel with confidence.
          </p>
        </Reveal>

        {/* Error Message */}
        {error && (
          <Reveal className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8" variant="fade">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          </Reveal>
        )}

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <Reveal className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12" variant="fade-up">
            <Link to={`/blog/${blogPosts[0].slug}`} className="block hover:shadow-lg transition-shadow cursor-pointer">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="aspect-video md:aspect-square">
                <img
                  src={blogPosts[0].image_url || '/images/placeholder-blog.jpg'}
                  alt={blogPosts[0].title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:flex md:flex-col md:justify-center">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                  <span className="text-gray-500 text-sm">{blogPosts[0].read_time || '5 min read'}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {getExcerpt(blogPosts[0].content)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Travel Brief</span>
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatDate(blogPosts[0].published_date)}</span>
                  </div>
                  <div className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            </Link>
          </Reveal>
        )}

        {/* Blog Posts Grid */}
        {blogPosts.length > 1 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, index) => (
              <Reveal key={post.id} variant="fade-up" delay={index * 60}>
                <Link to={`/blog/${post.slug}`} className="block">
                  <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer h-full">
                  <div className="aspect-video">
                    <img
                      src={post.image_url || '/images/placeholder-blog.jpg'}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        Travel Tips
                      </span>
                      <span className="text-gray-500 text-sm">{post.read_time || '5 min read'}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                      {getExcerpt(post.content, 120)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <User className="h-4 w-4" />
                        <span>Travel Brief</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.published_date)}</span>
                      </div>
                    </div>
                  </div>
                </article>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for travel tips and insights!</p>
          </div>
        )}

        {/* Newsletter Signup */}
        <Reveal className="bg-blue-600 rounded-2xl p-8 md:p-12 text-white text-center mt-12" variant="zoom">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Get Travel Tips in Your Inbox
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest travel insights, 
            destination guides, and exclusive tips from travel experts.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </Reveal>

        {/* CTA to Travel Brief */}
        <Reveal className="text-center mt-12" variant="fade-up">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to put these tips into action?
          </h3>
          <Link
            to="/plan"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
          >
            Create Your Travel Brief
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}