import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import Reveal from '../components/Reveal';

const blogPosts = [
  {
    id: 1,
    slug: 'solo-female-travel-safety-guide',
    title: 'The Complete Guide to Solo Female Travel Safety',
    excerpt: 'Essential safety tips, trusted accommodation options, and cultural considerations for women traveling alone.',
    author: 'Sarah Johnson',
    date: '2025-01-15',
    image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Safety',
    readTime: '8 min read'
  },
  {
    id: 2,
    slug: 'first-time-international-travel-guide',
    title: 'First-Time International Travel: What You Need to Know',
    excerpt: 'From passport applications to airport navigation, everything new travelers need for their first international adventure.',
    author: 'Michael Chen',
    date: '2025-01-12',
    image: 'https://images.pexels.com/photos/2859169/pexels-photo-2859169.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Beginner Tips',
    readTime: '12 min read'
  },
  {
    id: 3,
    slug: 'smart-packing-travel-light-guide',
    title: 'Smart Packing: The Ultimate Guide to Traveling Light',
    excerpt: 'Expert packing strategies to fit everything you need in a carry-on, plus destination-specific essentials.',
    author: 'Emma Rodriguez',
    date: '2025-01-10',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Packing',
    readTime: '6 min read'
  },
  {
    id: 4,
    slug: 'family-travel-stress-free-vacations',
    title: 'Family Travel Made Easy: Tips for Stress-Free Vacations',
    excerpt: 'Planning strategies, packing lists, and activities to keep the whole family happy on your next adventure.',
    author: 'David Martinez',
    date: '2025-01-08',
    image: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Family Travel',
    readTime: '10 min read'
  },
  {
    id: 5,
    slug: 'digital-nomad-work-travel-essentials',
    title: 'Digital Nomad Essentials: Work and Travel Successfully',
    excerpt: 'Tech gear, internet solutions, and productivity tips for maintaining your career while exploring the world.',
    author: 'Alex Kim',
    date: '2025-01-05',
    image: 'https://images.pexels.com/photos/4050302/pexels-photo-4050302.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Digital Nomad',
    readTime: '9 min read'
  },
  {
    id: 6,
    slug: 'budget-travel-secrets-see-more-less',
    title: 'Budget Travel Secrets: See More for Less',
    excerpt: 'Money-saving strategies, free activities, and budget accommodation options that don\'t compromise on experience.',
    author: 'Lisa Thompson',
    date: '2025-01-03',
    image: 'https://images.pexels.com/photos/164336/pexels-photo-164336.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Budget Travel',
    readTime: '11 min read'
  }
];

// Export blogPosts for use in BlogPost component
export { blogPosts };

export function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead 
        title="Travel Blog – Travel Pack"
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

        {/* Featured Post */}
        <Reveal className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12" variant="fade-up">
          <Link to={`/blog/${blogPosts[0].slug}`} className="block hover:shadow-lg transition-shadow cursor-pointer">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div className="aspect-video md:aspect-square">
              <img
                src={blogPosts[0].image}
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
                <span className="text-gray-500 text-sm">{blogPosts[0].readTime}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{blogPosts[0].author}</span>
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{blogPosts[0].date}</span>
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

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Reveal key={post.id} variant="fade-up" delay={post.id * 60}>
              <Link to={`/blog/${post.slug}`} className="block">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer h-full">
                <div className="aspect-video">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              </article>
              </Link>
            </Reveal>
          ))}
        </div>

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

        {/* CTA to Travel Pack */}
        <Reveal className="text-center mt-12" variant="fade-up">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to put these tips into action?
          </h3>
          <Link
            to="/plan"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
          >
            Create Your Travel Pack
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}