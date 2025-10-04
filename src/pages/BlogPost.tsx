import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BlogPostData } from './Blog';
import { supabase } from '../lib/supabase';
import Reveal from '../components/Reveal';

// Extended blog post content - in a real app, this would come from a CMS or markdown files
const blogPostContent = {
  'solo-female-travel-safety-guide': {
    content: `
      <p>Traveling solo as a woman can be one of the most empowering and rewarding experiences of your life. However, it's important to prioritize your safety while exploring the world independently. This comprehensive guide will help you travel confidently and securely.</p>

      <h2>Pre-Trip Planning</h2>
      <p>Before you embark on your solo adventure, thorough planning is essential. Research your destination extensively, including local customs, dress codes, and cultural norms. Understanding the social dynamics of your destination will help you blend in and avoid unwanted attention.</p>

      <h3>Accommodation Safety</h3>
      <p>Choose your accommodation wisely. Look for well-reviewed hotels, hostels, or guesthouses in safe neighborhoods. Consider women-only hostels or accommodations that cater specifically to female travelers. Always read recent reviews and check the location on a map before booking.</p>

      <h3>Transportation Tips</h3>
      <p>Research safe transportation options in advance. In many cities, ride-sharing apps are safer than hailing taxis on the street. If using public transport, learn the routes during daylight hours first. Always sit near the driver or in well-lit, populated areas.</p>

      <h2>Safety While Exploring</h2>
      <p>Trust your instincts - they're your best safety tool. If a situation feels uncomfortable, remove yourself immediately. Dress appropriately for the local culture and avoid displaying expensive jewelry or electronics that might attract unwanted attention.</p>

      <h3>Communication and Check-ins</h3>
      <p>Establish a regular check-in schedule with family or friends back home. Share your itinerary and accommodation details with trusted contacts. Consider using location-sharing apps so someone always knows where you are.</p>

      <h2>Emergency Preparedness</h2>
      <p>Always have a backup plan. Keep emergency contacts saved in your phone and written down separately. Know the location of your country's embassy or consulate. Carry copies of important documents stored separately from the originals.</p>

      <p>Remember, millions of women travel solo safely every year. With proper preparation and awareness, you can have an incredible adventure while staying safe and secure.</p>
    `
  },
  'first-time-international-travel-guide': {
    content: `
      <p>Taking your first international trip can feel overwhelming, but with proper preparation, it can be the adventure of a lifetime. This guide covers everything you need to know for a smooth and successful first international journey.</p>

      <h2>Documentation Essentials</h2>
      <p>Your passport is your most important travel document. Ensure it's valid for at least six months beyond your planned return date. Many countries require this buffer period for entry. Check visa requirements for your destination well in advance, as some can take weeks to process.</p>

      <h3>Travel Insurance</h3>
      <p>Never travel internationally without travel insurance. It protects you against medical emergencies, trip cancellations, and lost luggage. Compare policies carefully and choose one that covers your specific activities and destinations.</p>

      <h2>Airport Navigation</h2>
      <p>Arrive at the airport at least 3 hours early for international flights. Familiarize yourself with your departure airport's layout online. Know which terminal your flight departs from and where to find check-in counters, security, and your gate.</p>

      <h3>Security and Customs</h3>
      <p>Pack smart to avoid security delays. Follow the 3-1-1 rule for liquids in carry-on bags. Declare any items required by customs and be honest about what you're bringing into the country. Keep receipts for expensive items to prove ownership.</p>

      <h2>Money Matters</h2>
      <p>Notify your bank of your travel plans to avoid card blocks. Research the local currency and current exchange rates. Carry a mix of payment methods: cash, debit card, and credit card. Avoid exchanging money at airports where rates are typically poor.</p>

      <h3>Communication</h3>
      <p>Check with your phone carrier about international plans or consider purchasing a local SIM card. Download offline maps and translation apps before you travel. Learn a few basic phrases in the local language.</p>

      <p>Most importantly, stay flexible and embrace the unexpected. Your first international trip will be full of learning experiences that will make you a more confident traveler for future adventures.</p>
    `
  },
  'smart-packing-travel-light-guide': {
    content: `
      <p>Mastering the art of packing light is a game-changer for any traveler. Not only does it save you money on baggage fees, but it also makes your journey more comfortable and flexible. Here's how to pack everything you need in just a carry-on.</p>

      <h2>The One-Week Rule</h2>
      <p>Pack for one week maximum, regardless of trip length. You can do laundry anywhere in the world, and this approach forces you to bring only essentials. Choose versatile pieces that can be mixed, matched, and layered.</p>

      <h3>Clothing Strategy</h3>
      <p>Stick to a color palette of 2-3 colors that all coordinate together. This ensures every piece works with every other piece. Choose wrinkle-resistant fabrics and avoid cotton, which is heavy and slow to dry. Merino wool and synthetic blends are your best friends.</p>

      <h2>The Essential Packing List</h2>
      <p>Start with these basics: 3-4 tops, 2 bottoms, 1 dress or extra shirt, 1 warm layer, 1 rain jacket, 7 days of underwear, 4-5 pairs of socks, 1-2 pairs of shoes, sleepwear, and one outfit for special occasions.</p>

      <h3>Packing Techniques</h3>
      <p>Roll, don't fold. Rolling clothes saves 30% more space than folding. Use packing cubes to organize and compress your items. Wear your heaviest shoes and jacket on the plane to save luggage space.</p>

      <h2>Toiletries and Electronics</h2>
      <p>Bring only what you'll actually use. Many accommodations provide basic toiletries. Use solid alternatives when possible - shampoo bars, solid deodorant, and toothpaste tablets save space and avoid liquid restrictions.</p>

      <h3>The 5-4-3-2-1 Rule</h3>
      <p>If you're still struggling, try this: 5 sets of underwear and socks, 4 tops, 3 bottoms, 2 pairs of shoes, 1 jacket. This formula works for most climates and trip lengths.</p>

      <p>Remember, you can buy almost anything you forgot at your destination. It's better to pack light and purchase items as needed than to lug around a heavy suitcase for your entire trip.</p>
    `
  },
  'family-travel-stress-free-vacations': {
    content: `
      <p>Traveling with children doesn't have to be stressful. With proper planning and realistic expectations, family vacations can create lifelong memories for everyone. Here's how to make your next family trip smooth and enjoyable.</p>

      <h2>Pre-Trip Planning with Kids</h2>
      <p>Involve your children in the planning process. Show them photos of your destination, let them help choose activities, and build excitement. This investment in planning pays off with more cooperative and engaged kids during the trip.</p>

      <h3>Packing for Families</h3>
      <p>Pack a separate bag for each child with their essentials. Include comfort items like favorite stuffed animals or blankets. Pack extra clothes in your carry-on - spills and accidents happen. Don't forget medications, snacks, and entertainment for travel days.</p>

      <h2>Transportation Tips</h2>
      <p>For flights, book seats together well in advance. Bring new activities and snacks to keep kids occupied. Consider traveling during nap times for younger children. For road trips, plan stops every 2 hours and pack a cooler with healthy snacks.</p>

      <h3>Accommodation Considerations</h3>
      <p>Choose family-friendly accommodations with amenities like pools, playgrounds, or kids' clubs. Consider vacation rentals for longer stays - having a kitchen and separate bedrooms can make a huge difference with children.</p>

      <h2>Managing Expectations</h2>
      <p>Plan for shorter days and more frequent breaks. Children have different energy levels and attention spans than adults. Build flexibility into your itinerary and don't try to see everything - it's better to enjoy a few activities fully than to rush through many.</p>

      <h3>Safety First</h3>
      <p>Prepare for emergencies by researching local hospitals and pharmacies. Carry a first-aid kit and any necessary medications. Consider GPS watches or ID bracelets for younger children in crowded areas.</p>

      <p>Most importantly, remember that the goal is to spend quality time together as a family. Embrace the chaos, laugh at the mishaps, and focus on creating positive memories that will last a lifetime.</p>
    `
  },
  'digital-nomad-work-travel-essentials': {
    content: `
      <p>The digital nomad lifestyle offers incredible freedom, but success requires careful planning and the right tools. Whether you're a freelancer, remote employee, or entrepreneur, here's everything you need to work effectively while traveling the world.</p>

      <h2>Essential Tech Setup</h2>
      <p>Your laptop is your lifeline - invest in a reliable, lightweight model with good battery life. Consider a 13-14 inch screen for the best balance of portability and productivity. Always travel with a backup power bank and universal adapter.</p>

      <h3>Internet Connectivity</h3>
      <p>Research internet speeds and reliability at your destination before booking accommodation. Have multiple backup options: local SIM cards, portable WiFi hotspots, and coworking spaces. Download offline versions of essential apps and documents.</p>

      <h2>Workspace Optimization</h2>
      <p>Pack a portable laptop stand, external keyboard, and mouse to create an ergonomic workspace anywhere. Noise-canceling headphones are essential for video calls and concentration in busy environments. Consider a portable monitor for increased productivity.</p>

      <h3>Time Zone Management</h3>
      <p>Use tools like World Clock Pro to track multiple time zones. Communicate your availability clearly with clients and colleagues. Consider choosing destinations within a few hours of your primary work time zone to minimize disruption.</p>

      <h2>Financial Management</h2>
      <p>Set up online banking and digital payment systems before you travel. Use expense tracking apps to monitor spending across different currencies. Consider getting a business credit card with no foreign transaction fees.</p>

      <h3>Legal and Tax Considerations</h3>
      <p>Understand visa requirements for working in different countries. Some tourist visas prohibit work activities. Research tax implications of earning income while abroad and consider consulting with a tax professional who understands nomad situations.</p>

      <h2>Maintaining Work-Life Balance</h2>
      <p>Set clear boundaries between work and travel time. Create routines that help you stay productive while still enjoying your destination. Join nomad communities online and in-person for support and networking opportunities.</p>

      <p>Remember, being a successful digital nomad is about finding the right balance between work responsibilities and travel experiences. Start with shorter trips to test your setup before committing to longer nomadic periods.</p>
    `
  },
  'budget-travel-secrets-see-more-less': {
    content: `
      <p>Traveling on a budget doesn't mean sacrificing experiences or comfort. With smart planning and insider knowledge, you can explore the world without breaking the bank. Here are proven strategies to maximize your travel experiences while minimizing costs.</p>

      <h2>Transportation Savings</h2>
      <p>Be flexible with your travel dates and use fare comparison sites like Skyscanner or Google Flights. Tuesday and Wednesday flights are often cheaper. Consider budget airlines for short flights, but factor in baggage fees. For longer distances, overnight buses and trains can save on accommodation costs.</p>

      <h3>Alternative Accommodations</h3>
      <p>Look beyond hotels. Hostels aren't just for young backpackers - many offer private rooms at fraction of hotel costs. Consider house-sitting, home exchanges, or staying with locals through platforms like Couchsurfing. Vacation rentals can be economical for longer stays or groups.</p>

      <h2>Food and Dining</h2>
      <p>Eat where locals eat - street food and local markets offer authentic experiences at low prices. Cook your own meals when possible by staying in accommodations with kitchen access. Take advantage of free hotel breakfasts and happy hour specials.</p>

      <h3>Free and Low-Cost Activities</h3>
      <p>Many cities offer free walking tours, museums with free admission days, and public parks and beaches. Check local event listings for free festivals, concerts, and cultural events. Use apps like Eventbrite to find free activities in your destination.</p>

      <h2>Money-Saving Apps and Tools</h2>
      <p>Download apps like HappyCow for cheap vegetarian meals, Rome2Rio for transportation options, and XE Currency for exchange rates. Use loyalty programs and travel rewards credit cards to earn points for future trips.</p>

      <h3>Timing Your Trip</h3>
      <p>Travel during shoulder seasons for better prices and fewer crowds. Avoid peak holiday periods and school vacation times. Research local events that might drive up prices and plan accordingly.</p>

      <h2>Smart Spending Strategies</h2>
      <p>Set a daily budget and track your spending. Prioritize experiences over things - memories last longer than souvenirs. Look for city tourism cards that offer discounts on attractions and transportation.</p>

      <p>Budget travel is about making smart choices, not cutting corners on safety or missing out on experiences. With these strategies, you can travel more frequently and for longer periods while staying within your financial means.</p>
    `
  },
  'exploring-udaipur-city-of-lakes': {
    content: `
      <p>Udaipur, known as the "City of Lakes" and "Venice of the East," is one of India's most romantic and picturesque destinations. Nestled in the Aravalli Hills of Rajasthan, this royal city offers a perfect blend of history, culture, and natural beauty that captivates every visitor.</p>

      <h2>Must-Visit Lakes</h2>
      <p>Udaipur is famous for its stunning lakes, each with its own charm and character. Lake Pichola, the most famous, offers breathtaking views of the City Palace and Jag Mandir. Take a boat ride during sunset to witness the city's golden hour magic reflected in the water.</p>

      <h3>Fateh Sagar Lake</h3>
      <p>This artificial lake is perfect for a peaceful morning walk or evening stroll. The Nehru Garden in the middle of the lake is accessible by boat and offers a serene escape from the city's hustle and bustle.</p>

      <h2>Royal Heritage</h2>
      <p>The City Palace complex is a magnificent example of Rajput architecture, with its intricate carvings, beautiful courtyards, and stunning views of Lake Pichola. Don't miss the Crystal Gallery, which houses an impressive collection of crystal artifacts.</p>

      <h3>Jag Mandir Palace</h3>
      <p>This island palace in Lake Pichola is a perfect example of Rajput luxury. The palace's beautiful gardens and architecture make it a popular spot for weddings and special events.</p>

      <h2>Cultural Experiences</h2>
      <p>Udaipur's rich cultural heritage comes alive through its traditional music, dance, and crafts. Visit the Bagore Ki Haveli for an evening cultural show featuring folk dances and music. The city is also famous for its miniature paintings and traditional handicrafts.</p>

      <h3>Local Markets</h3>
      <p>Explore the bustling markets of Udaipur, where you can find everything from traditional textiles and jewelry to local spices and handicrafts. The Hathi Pol Bazaar and Bada Bazaar are perfect for souvenir shopping.</p>

      <h2>Best Time to Visit</h2>
      <p>The best time to visit Udaipur is from October to March when the weather is pleasant and perfect for sightseeing. The monsoon season (July to September) brings the lakes to life but can be humid and rainy.</p>

      <p>Udaipur's timeless beauty, rich history, and warm hospitality make it a destination that will stay in your heart forever. Whether you're a history buff, nature lover, or simply seeking a romantic getaway, this city of lakes has something special to offer everyone.</p>
    `
  }
};

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug);
    }
  }, [slug]);

  const fetchBlogPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching blog post with slug:', postSlug);

      if (!supabase) {
        console.warn('Supabase client not initialized');
        setError('Database not available');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error fetching blog post:', error);
        if (error.code === 'PGRST116') {
          // Post not found in database, try to use static content as fallback
          console.log('Post not found in database, checking static content...');
          const staticContent = blogPostContent[postSlug as keyof typeof blogPostContent];
          if (staticContent) {
            console.log('Using static content as fallback');
            const fallbackPost: BlogPostData = {
              id: postSlug,
              title: postSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              slug: postSlug,
              content: staticContent.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published_date: new Date().toISOString(),
              read_time: '5 min read',
              image_url: null
            };
            setPost(fallbackPost);
            setError(null);
          } else {
            setError('Post not found');
          }
        } else {
          setError(`Database error: ${error.message}`);
        }
      } else if (data) {
        console.log('Blog post found:', data);
        setPost(data);
        setError(null);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Exception fetching blog post:', err);
      setError(`Failed to load post: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatContentHtml = (raw: string) => {
    if (!raw) return '';

    // Always log for debugging
    console.log('Original content:', raw);

    const hasHtmlTags = /<[^>]+>/.test(raw);
    console.log('Has HTML tags:', hasHtmlTags);

    if (hasHtmlTags) {
      console.log('Returning HTML as-is');
      return raw;
    }

    // Convert plain text to HTML
    const paragraphs = raw
      .trim()
      .split(/\n\s*\n+/)
      .filter(p => p.trim().length > 0)
      .map(p => p.replace(/\n/g, '<br />'));

    const formatted = paragraphs.map(p => `<p>${p}</p>`).join('');
    console.log('Formatted content:', formatted);

    return formatted;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Slug: {slug}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <Link
                to="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
              <div className="text-sm text-gray-500">
                <p>If you believe this is an error, please try refreshing the page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} – Travel Brief Blog`}
        description={post.content.replace(/<[^>]*>/g, '').substring(0, 160)}
        image={post.image_url}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Blog Link */}
          <Reveal className="mb-8" variant="fade-right">
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Reveal>

          {/* Article */}
          <Reveal as="article" className="bg-white rounded-2xl shadow-sm overflow-hidden" variant="fade-up">
            {/* Hero Image */}
            <div className="aspect-video relative overflow-hidden">
              <img
                src={post.image_url || '/images/placeholder-blog.jpg'}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Travel Tips
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-8 md:p-12">
              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Travel Brief</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(post.published_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{post.read_time || '5 min read'}</span>
                  </div>
                </div>
              </header>

              {/* Article Body */}
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: formatContentHtml(post.content) }}
              />

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Written by <strong className="text-gray-900">Travel Brief Team</strong></p>
                    <p>Published on {formatDate(post.published_date)}</p>
                  </div>
                  <Link
                    to="/blog"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    More Articles
                  </Link>
                </div>
              </footer>
            </div>
          </Reveal>

          {/* Newsletter Signup */}
          <Reveal className="bg-blue-600 rounded-2xl p-8 md:p-12 text-white text-center mt-12" variant="zoom">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Get Travel Tips in Your<br />Inbox
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest travel insights,
              destination guides, and exclusive tips from travel experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-500"
              />
              <button className="bg-white hover:bg-gray-50 text-blue-500 px-8 py-3 rounded-lg font-semibold transition-colors shadow-md whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </Reveal>

          {/* Related Articles - Simplified for now */}
          <Reveal className="mt-12" variant="fade-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More Travel Tips</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Check out more travel articles on our blog!</p>
              <Link
                to="/blog"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
              >
                View All Articles
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Blog Content Styles */}
      <style>{`
        .blog-content {
          font-size: 18px;
          line-height: 1.7;
          color: #374151;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .blog-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 2rem 0 1.5rem 0;
          color: #111827;
          line-height: 1.2;
        }

        .blog-content h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 2rem 0 1.25rem 0;
          color: #111827;
          line-height: 1.3;
        }

        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
          color: #111827;
          line-height: 1.4;
        }

        .blog-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: #111827;
        }

        .blog-content h5 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #111827;
        }

        .blog-content h6 {
          font-size: 1rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #111827;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
          text-align: justify;
        }

        .blog-content ul, .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .blog-content ul li {
          list-style-type: disc;
        }

        .blog-content ol li {
          list-style-type: decimal;
        }

        .blog-content li p {
          margin-bottom: 0.5rem;
        }

        .blog-content li ul, .blog-content li ol {
          margin: 0.5rem 0;
        }

        .blog-content blockquote {
          border-left: 4px solid #3b82f6;
          background: #f8fafc;
          padding: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #475569;
          font-size: 1.125rem;
          line-height: 1.6;
          border-radius: 0 8px 8px 0;
        }

        .blog-content blockquote p {
          margin-bottom: 0;
        }

        .blog-content blockquote p:last-child {
          margin-bottom: 0;
        }

        .blog-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 2rem 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }

        .blog-content code {
          background: #f1f5f9;
          color: #e11d48;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 0.875em;
          font-weight: 500;
        }

        .blog-content pre code {
          background: none;
          color: inherit;
          padding: 0;
          border-radius: 0;
        }

        .blog-content a {
          color: #3b82f6;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 2px;
          transition: color 0.2s ease;
        }

        .blog-content a:hover {
          color: #1d4ed8;
          text-decoration-color: #1d4ed8;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .blog-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 3rem 0;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 16px;
        }

        .blog-content th, .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .blog-content th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .blog-content td {
          background: white;
        }

        .blog-content strong, .blog-content b {
          font-weight: 600;
          color: #111827;
        }

        .blog-content em, .blog-content i {
          font-style: italic;
          color: #4b5563;
        }

        .blog-content u {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 2px;
        }

        .blog-content s, .blog-content strike {
          text-decoration: line-through;
          opacity: 0.7;


        }

        /* Responsive design */
        @media (max-width: 768px) {
          .blog-content {
            font-size: 16px;
          }

          .blog-content h1 {
            font-size: 2rem;
            margin: 1.5rem 0 1rem 0;
          }

          .blog-content h2 {
            font-size: 1.75rem;
            margin: 1.5rem 0 1rem 0;
          }

          .blog-content h3 {
            font-size: 1.375rem;
            margin: 1.25rem 0 0.75rem 0;
          }

          .blog-content ul, .blog-content ol {
            padding-left: 1.5rem;
          }

          .blog-content blockquote {
            padding: 1rem;
            font-size: 16px;
          }

          .blog-content pre {
            padding: 1rem;
            font-size: 13px;
            overflow-x: auto;
          }

          .blog-content table {
            font-size: 14px;
          }

          .blog-content th, .blog-content td {
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
