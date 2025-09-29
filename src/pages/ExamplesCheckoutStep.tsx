import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTripContext } from '../context/TripContext';
import { ArrowRight, ArrowLeft, Star, X, ExternalLink } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { svgPlaceholder } from '../utils/placeholder';

const EXAMPLE_IMAGE_MAP: Record<string, string> = {
  "Thailand Adventure": "https://unsplash.com/photos/sydwCr54rf0/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM5NzM2fA&force=true",
  "Spain Discovery": "https://unsplash.com/photos/ChSZETOal-I/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM3NTgxfA&force=true",
  "Japan Introduction": "https://unsplash.com/photos/alY6_OpdwRQ/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM5NzM3fA&force=true",
  "Vietnam Explorer": "https://unsplash.com/photos/3VK6Urf2vE8/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM4MzcyfA&force=true",
  "Greece Ancient Wonders": "https://unsplash.com/photos/vF0l0bqLRKY/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM4NDE1fA&force=true",
  "Japan Deep Dive": "https://unsplash.com/photos/kaoHI0iHJPM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM3MjY5fA&force=true",
  "Tuscany Wine Country": "https://unsplash.com/photos/fJWYwHWYQpY/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM4NTI3fA&force=true",
  "Oaxaca Food Culture": "https://unsplash.com/photos/7l1NpR8FKlU/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MjB8fG9heGFjYSUyMGZvb2R8ZW58MHx8fHwxNzU4NjY4NzAxfDA&force=true",
  "Azores Volcanic Adventure": "https://unsplash.com/photos/kgL3KMjRNnY/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjQwODMzfA&force=true",
  "Morocco Atlas Mountains": "https://unsplash.com/photos/NncAbldgViA/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM4NzMzfA&force=true",
  "Morocco Solo Journey": "https://unsplash.com/photos/zdIF9nWyl1A/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjM4Nzg2fA&force=true",
  "Bali Wellness Retreat": "https://unsplash.com/photos/bnMPFPuSCI0/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjYyODEwfA&force=true",
  "Turkey Cultural Journey": "https://unsplash.com/photos/kNSREmtaGOE/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjYyNTIwfA&force=true",
  "Japan Solo Adventure": "https://unsplash.com/photos/n--CMLApjfI/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1NTI3fA&force=true",
  "Costa Rica Adventure": "https://unsplash.com/photos/XUFMiGkv-60/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1NTU4fA&force=true",
  "Italy Family Adventure": "https://unsplash.com/photos/PamFFHL6fVY/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1NDUxfA&force=true",
  "USA Theme Park Magic": "https://unsplash.com/photos/qju2ef82PPo/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8b3JsYW5kbyUyMGRpc25leXxlbnwwfHx8fDE3NTg2NjU2MTV8MA&force=true",
  "Thailand Family Fun": "https://unsplash.com/photos/gsllxmVO4HQ/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1NzE1fA&force=true",
  "UK Family Heritage": "https://unsplash.com/photos/QPOaQ2Kp80c/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjYzNDM2fA&force=true",
  "Australia Wildlife Adventure": "https://unsplash.com/photos/WEtXkeIlMoM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1NzQwfA&force=true",
  "Peru Extreme Quest": "https://unsplash.com/photos/4hMET7vYTAQ/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjYzOTQ5fA&force=true",
  "Nepal Everest Base Camp": "https://unsplash.com/photos/TiIRgk9-xcs/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1NzY2fA&force=true",
  "Iceland Arctic Adventure": "https://unsplash.com/photos/va_nrBLonf8/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1MzM0fA&force=true",
  "New Zealand Adrenaline": "https://unsplash.com/photos/7XKkJVw1d8c/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjYxNjIyfA&force=true",
  "Patagonia Wilderness": "https://unsplash.com/photos/H3oXiq7_bII/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU4NjY1ODAxfA&force=true"
};

interface ExamplePack {
  id: string;
  persona: string;
  title: string;
  destination: string;
  duration: string;
  thumbnail: string;
  description: string;
  highlights: string[];
  htmlFile: string;
}

const examplePacks: ExamplePack[] = [
  // New Traveler Examples
  {
    id: 'new-traveler-thailand',
    persona: 'New Traveler',
    title: 'Thailand Adventure',
    destination: 'Bangkok & Phuket',
    duration: '7 Days',
    thumbnail: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Perfect for first-time travelers: airport navigation, scams to avoid, and a simple day-by-day plan.',
    highlights: ['Airport navigation guide', 'Scam prevention tips', 'Cultural etiquette basics', 'Simple daily itineraries'],
    htmlFile: '/examples/new-traveler-thailand.html'
  },
  {
    id: 'new-traveler-spain',
    persona: 'New Traveler',
    title: 'Spain Discovery',
    destination: 'Barcelona & Madrid',
    duration: '5 Days',
    thumbnail: 'https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Gaudí masterpieces, authentic tapas, and beginner-friendly cultural immersion.',
    highlights: ['Sagrada Familia guide', 'Tapas restaurant picks', 'Metro navigation', 'Cultural basics'],
    htmlFile: '/examples/new-traveler-spain.html'
  },
  {
    id: 'new-traveler-japan',
    persona: 'New Traveler',
    title: 'Japan Introduction',
    destination: 'Tokyo, Kyoto & Osaka',
    duration: '10 Days',
    thumbnail: 'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-161251.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Train system mastery, cultural etiquette, and must-see temples for first-timers.',
    highlights: ['JR Pass guidance', 'Temple etiquette', 'Sushi restaurant tips', 'Cultural basics'],
    htmlFile: '/examples/new-traveler-japan.html'
  },
  {
    id: 'new-traveler-vietnam',
    persona: 'New Traveler',
    title: 'Vietnam Explorer',
    destination: 'Hanoi & Halong Bay',
    duration: '7 Days',
    thumbnail: 'https://images.pexels.com/photos/3209049/pexels-photo-3209049.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Street food safety, Halong Bay cruises, and traffic navigation for beginners.',
    highlights: ['Street food safety', 'Halong Bay tours', 'Traffic tips', 'Cultural respect'],
    htmlFile: '/examples/new-traveler-vietnam.html'
  },
  {
    id: 'new-traveler-greece',
    persona: 'New Traveler',
    title: 'Greece Ancient Wonders',
    destination: 'Athens & Santorini',
    duration: '6 Days',
    thumbnail: 'https://images.pexels.com/photos/164336/pexels-photo-164336.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Ancient history made simple, island hopping basics, and Greek dining etiquette.',
    highlights: ['Acropolis guide', 'Ferry booking', 'Greek dining', 'Island hopping'],
    htmlFile: '/examples/new-traveler-greece.html'
  },

  // Experienced Traveler Examples
  {
    id: 'experienced-japan',
    persona: 'Experienced Traveler',
    title: 'Japan Deep Dive',
    destination: 'Tokyo, Kyoto, Kanazawa & Osaka',
    duration: '10 Days',
    thumbnail: 'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Hidden gems and advanced hacks for seasoned explorers. Includes train routing and time-saving tips.',
    highlights: ['JR Pass optimization', 'Hidden local spots', 'Advanced train routing', 'Insider restaurant picks'],
    htmlFile: '/examples/experienced-japan.html'
  },
  {
    id: 'experienced-italy',
    persona: 'Experienced Traveler',
    title: 'Tuscany Wine Country',
    destination: 'Tuscany Wine Region',
    duration: '7 Days',
    thumbnail: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Private vineyard tours, hidden trattorias, and wine shipping logistics.',
    highlights: ['Private wine tastings', 'Hidden restaurants', 'Wine shipping', 'Local connections'],
    htmlFile: '/examples/experienced-italy.html'
  },
  {
    id: 'experienced-mexico',
    persona: 'Experienced Traveler',
    title: 'Oaxaca Food Culture',
    destination: 'Oaxaca & Surrounding Regions',
    duration: '8 Days',
    thumbnail: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Mezcal distilleries, mole workshops, and indigenous market navigation.',
    highlights: ['Mezcal tastings', 'Mole workshops', 'Market navigation', 'Cultural immersion'],
    htmlFile: '/examples/experienced-mexico.html'
  },
  {
    id: 'experienced-portugal',
    persona: 'Experienced Traveler',
    title: 'Azores Volcanic Adventure',
    destination: 'Azores Islands',
    duration: '6 Days',
    thumbnail: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Volcanic hiking, thermal springs, and off-the-beaten-path island exploration.',
    highlights: ['Volcanic hiking', 'Hot springs', 'Island hopping', 'Local guides'],
    htmlFile: '/examples/experienced-portugal.html'
  },
  {
    id: 'experienced-morocco',
    persona: 'Experienced Traveler',
    title: 'Morocco Atlas Mountains',
    destination: 'Chefchaouen & Atlas Mountains',
    duration: '9 Days',
    thumbnail: 'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Berber village stays, advanced haggling techniques, and mountain trekking.',
    highlights: ['Berber villages', 'Haggling mastery', 'Mountain treks', 'Cultural depth'],
    htmlFile: '/examples/experienced-morocco.html'
  },

  // Solo Female Traveler Examples
  {
    id: 'solo-female-morocco',
    persona: 'Solo Female Traveler',
    title: 'Morocco Solo Journey',
    destination: 'Marrakech & Fez',
    duration: '5 Days',
    thumbnail: 'https://images.pexels.com/photos/3889854/pexels-photo-3889854.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Safety tips, cultural etiquette, and vetted accommodations to make solo travel stress-free.',
    highlights: ['Vetted accommodations', 'Cultural dress codes', 'Safe transport options', 'Female-friendly spaces'],
    htmlFile: '/examples/solo-female-morocco.html'
  },
  {
    id: 'solo-female-bali',
    persona: 'Solo Female Traveler',
    title: 'Bali Wellness Retreat',
    destination: 'Ubud & Canggu',
    duration: '7 Days',
    thumbnail: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Yoga retreats, safe accommodations, and female-friendly wellness experiences.',
    highlights: ['Yoga studios', 'Safe accommodations', 'Wellness spas', 'Solo female community'],
    htmlFile: '/examples/solo-female-bali.html'
  },
  {
    id: 'solo-female-turkey',
    persona: 'Solo Female Traveler',
    title: 'Turkey Cultural Journey',
    destination: 'Cappadocia & Istanbul',
    duration: '6 Days',
    thumbnail: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Hot air balloons, cultural respect guidelines, and safe exploration strategies.',
    highlights: ['Hot air balloon safety', 'Cultural guidelines', 'Safe transport', 'Female-friendly tours'],
    htmlFile: '/examples/solo-female-turkey.html'
  },
  {
    id: 'solo-female-japan',
    persona: 'Solo Female Traveler',
    title: 'Japan Solo Adventure',
    destination: 'Tokyo & Kyoto',
    duration: '8 Days',
    thumbnail: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Cultural immersion, safe accommodations, and solo dining confidence building.',
    highlights: ['Cultural immersion', 'Safe accommodations', 'Solo dining tips', 'Women-only spaces'],
    htmlFile: '/examples/solo-female-japan.html'
  },
  {
    id: 'solo-female-costa-rica',
    persona: 'Solo Female Traveler',
    title: 'Costa Rica Adventure',
    destination: 'Monteverde & Arenal',
    duration: '7 Days',
    thumbnail: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Safe adventure activities, eco-lodge recommendations, and wildlife viewing tips.',
    highlights: ['Safe adventure tours', 'Eco-lodges', 'Wildlife safety', 'Solo female groups'],
    htmlFile: '/examples/solo-female-costa-rica.html'
  },

  // Family Examples
  {
    id: 'family-italy',
    persona: 'Family',
    title: 'Italy Family Adventure',
    destination: 'Rome, Florence & Venice',
    duration: '12 Days',
    thumbnail: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Kid-friendly activities, family logistics, and educational experiences for all ages.',
    highlights: ['Kid-friendly activities', 'Family logistics', 'Educational tours', 'Restaurant recommendations'],
    htmlFile: '/examples/family-italy.html'
  },
  {
    id: 'family-usa',
    persona: 'Family',
    title: 'USA Theme Park Magic',
    destination: 'Orlando & Disney World',
    duration: '7 Days',
    thumbnail: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Disney planning mastery, crowd avoidance, and magical moments for the whole family.',
    highlights: ['Disney planning', 'Crowd strategies', 'FastPass tips', 'Family dining'],
    htmlFile: '/examples/family-usa.html'
  },
  {
    id: 'family-thailand',
    persona: 'Family',
    title: 'Thailand Family Fun',
    destination: 'Bangkok & Phuket',
    duration: '10 Days',
    thumbnail: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Family-friendly temples, safe beaches, and cultural activities for kids.',
    highlights: ['Family temples', 'Safe beaches', 'Cultural activities', 'Kid-friendly food'],
    htmlFile: '/examples/family-thailand.html'
  },
  {
    id: 'family-uk',
    persona: 'Family',
    title: 'UK Family Heritage',
    destination: 'London & Edinburgh',
    duration: '8 Days',
    thumbnail: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Castles, museums, and interactive history experiences for curious kids.',
    highlights: ['Castle tours', 'Interactive museums', 'History activities', 'Family transport'],
    htmlFile: '/examples/family-uk.html'
  },
  {
    id: 'family-australia',
    persona: 'Family',
    title: 'Australia Wildlife Adventure',
    destination: 'Sydney & Cairns',
    duration: '14 Days',
    thumbnail: 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Wildlife encounters, Great Barrier Reef snorkeling, and Outback experiences.',
    highlights: ['Wildlife parks', 'Reef snorkeling', 'Outback tours', 'Family safety'],
    htmlFile: '/examples/family-australia.html'
  },

  // Adventure Examples
  {
    id: 'adventure-peru',
    persona: 'Adventure',
    title: 'Peru Extreme Quest',
    destination: 'Cusco & Machu Picchu',
    duration: '12 Days',
    thumbnail: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Inca Trail trekking, altitude preparation, and extreme adventure protocols.',
    highlights: ['Inca Trail permits', 'Altitude prep', 'Gear lists', 'Safety protocols'],
    htmlFile: '/examples/adventure-peru.html'
  },
  {
    id: 'adventure-nepal',
    persona: 'Adventure',
    title: 'Nepal Everest Base Camp',
    destination: 'Everest Base Camp Trek',
    duration: '16 Days',
    thumbnail: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-altitude trekking, sherpa guides, and extreme weather preparation.',
    highlights: ['Altitude training', 'Sherpa guides', 'Weather prep', 'Emergency protocols'],
    htmlFile: '/examples/adventure-nepal.html'
  },
  {
    id: 'adventure-iceland',
    persona: 'Adventure',
    title: 'Iceland Arctic Adventure',
    destination: 'Reykjavik & Highlands',
    duration: '10 Days',
    thumbnail: 'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Ice climbing, glacier hiking, and extreme weather survival techniques.',
    highlights: ['Ice climbing', 'Glacier safety', 'Weather survival', 'Emergency gear'],
    htmlFile: '/examples/adventure-iceland.html'
  },
  {
    id: 'adventure-new-zealand',
    persona: 'Adventure',
    title: 'New Zealand Adrenaline',
    destination: 'Queenstown & South Island',
    duration: '14 Days',
    thumbnail: 'https://images.pexels.com/photos/1006293/pexels-photo-1006293.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bungee jumping, skydiving, and extreme sports safety protocols.',
    highlights: ['Extreme sports', 'Safety protocols', 'Adventure booking', 'Risk management'],
    htmlFile: '/examples/adventure-new-zealand.html'
  },
  {
    id: 'adventure-patagonia',
    persona: 'Adventure',
    title: 'Patagonia Wilderness',
    destination: 'Torres del Paine & El Calafate',
    duration: '18 Days',
    thumbnail: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Multi-day trekking, wilderness survival, and extreme weather preparation.',
    highlights: ['Wilderness trekking', 'Survival skills', 'Weather prep', 'Emergency planning'],
    htmlFile: '/examples/adventure-patagonia.html'
  }
];

const testimonialsByPersona = {
  'New Traveler': [
    {
      name: 'Sarah M.',
      text: 'As a first-time international traveler, this guide gave me the confidence I needed. The airport navigation section was a lifesaver!',
      rating: 5
    },
    {
      name: 'James K.',
      text: 'The cultural etiquette tips helped me avoid embarrassing mistakes. Perfect for nervous first-time travelers.',
      rating: 5
    }
  ],
  'Experienced Traveler': [
    {
      name: 'Michael R.',
      text: 'Finally, a travel guide that doesn\'t waste time on basics. The efficiency tips saved me hours at every city.',
      rating: 5
    },
    {
      name: 'Lisa Chen',
      text: 'The hidden gems and local connections were incredible. Felt like having a local friend in every city.',
      rating: 5
    }
  ],
  'Solo Female Traveler': [
    {
      name: 'Emma L.',
      text: 'The safety tips and vetted accommodation recommendations gave me peace of mind throughout my solo journey.',
      rating: 5
    },
    {
      name: 'Priya S.',
      text: 'Cultural dress codes and female-friendly services made me feel confident exploring on my own.',
      rating: 5
    }
  ],
  'Family': [
    {
      name: 'The Johnson Family',
      text: 'Our Disney trip was stress-free thanks to the detailed planning. The kids had a blast and we stayed organized!',
      rating: 5
    },
    {
      name: 'Maria & Carlos',
      text: 'The kid-friendly restaurant recommendations were perfect. No more hangry children during sightseeing!',
      rating: 5
    }
  ],
  'Adventure': [
    {
      name: 'Jake T.',
      text: 'The altitude preparation guide was spot-on. Made it to Machu Picchu without any issues thanks to this pack!',
      rating: 5
    },
    {
      name: 'Alex M.',
      text: 'Gear lists and safety protocols were comprehensive. Felt prepared for anything Patagonia could throw at me.',
      rating: 5
    }
  ]
};

export function ExamplesCheckoutStep() {
  const navigate = useNavigate();
  const { tripData, isValid } = useTripContext();
  const [selectedPreview, setSelectedPreview] = useState<ExamplePack | null>(null);
  const [expandedPersonas, setExpandedPersonas] = useState<Set<string>>(new Set());
  const [testimonialsExpanded, setTestimonialsExpanded] = useState(false);

  // Guard: Check if required trip data is present
  useEffect(() => {
    if (!tripData.persona || !tripData.passportCountry || !tripData.startDate || !tripData.endDate || tripData.destinations.length === 0) {
      // Redirect to plan page if essential data is missing
      navigate('/plan');
    }
  }, [tripData, navigate]);

  const handleContinue = () => {
    navigate('/preview');
  };

  const handleSkip = () => {
    navigate('/preview');
  };

  const openPreview = (pack: ExamplePack) => {
    setSelectedPreview(pack);
  };

  const closePreview = () => {
    setSelectedPreview(null);
  };

  const togglePersonaExpansion = (persona: string) => {
    const newExpanded = new Set(expandedPersonas);
    if (newExpanded.has(persona)) {
      newExpanded.delete(persona);
    } else {
      newExpanded.add(persona);
    }
    setExpandedPersonas(newExpanded);
  };

  const toggleTestimonials = () => {
    setTestimonialsExpanded(!testimonialsExpanded);
  };

  // Normalize cards with slug-based image mapping
  const normalizedPacks = examplePacks.map((pack) => {
    const imageUrl = EXAMPLE_IMAGE_MAP[pack.title];
    
    // Log missing mappings in admin mode  
    if (!imageUrl && import.meta.env.VITE_IS_ADMIN === 'true') {
      console.warn('[Images] No image mapping for title:', pack.title);
    }
    
    return {
      ...pack,
      cover: imageUrl ?? pack.thumbnail ?? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      coverAlt: `${pack.title} destination photo`,
    };
  });

  // Group examples by persona
  const examplesByPersona = normalizedPacks.reduce((acc, pack) => {
    if (!acc[pack.persona]) {
      acc[pack.persona] = [];
    }
    acc[pack.persona].push(pack);
    return acc;
  }, {} as Record<string, ExamplePack[]>);

  const personaOrder = ['New Traveler', 'Experienced Traveler', 'Solo Female Traveler', 'Family', 'Adventure'];

  return (
    <>
      <SEOHead 
        title="TravelPack.ai Examples – See Sample Travel Briefs"
        description="Browse example travel packs for different traveler types. See how our AI creates personalized itineraries, safety tips, and packing lists."
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link 
                to="/plan" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Planning
              </Link>
              <div className="text-sm text-gray-500">
                Step 2 of 3
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-2/3"></div>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Travel Pack Examples
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              See how TravelPack.ai creates personalized, comprehensive travel briefs for different types of travelers. Each example shows real content you'll receive.
            </p>
          </div>

          {/* Example Packs by Persona */}
          {personaOrder.map((persona) => (
            <section key={persona} className="mb-16">
              <div className="flex items-center mb-8">
                <div className="text-3xl mr-4">
                  {persona === 'New Traveler' && '🧳'}
                  {persona === 'Experienced Traveler' && '🌍'}
                  {persona === 'Solo Female Traveler' && '👩‍🦰'}
                  {persona === 'Family' && '👨‍👩‍👧'}
                  {persona === 'Adventure' && '⛰️'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {persona} Examples
                  </h2>
                  <p className="text-gray-600">
                    {persona === 'New Traveler' && 'Perfect for first-time international travelers'}
                    {persona === 'Experienced Traveler' && 'Advanced tips and hidden gems for seasoned explorers'}
                    {persona === 'Solo Female Traveler' && 'Safety-focused recommendations and cultural guidance'}
                    {persona === 'Family' && 'Kid-friendly activities and family logistics'}
                    {persona === 'Adventure' && 'Extreme activities and technical safety protocols'}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {examplesByPersona[persona]
                  ?.slice(0, expandedPersonas.has(persona) ? undefined : window.innerWidth < 640 ? 2 : undefined)
                  .map((pack) => (
                  <div key={pack.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 transform cursor-pointer">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={pack.cover} 
                        alt={pack.coverAlt}
                        referrerPolicy="no-referrer"
                        width={1600}
                        height={900}
                        loading="lazy"
                        className="w-full h-48 object-cover rounded-xl"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          t.onerror = null;
                          const label = (pack.title || 'Travel Pack').replace(/&/g, 'and');
                          t.src = svgPlaceholder(label);
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {pack.persona}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {pack.title}
                      </h3>
                      <p className="text-sm text-blue-600 mb-1">{pack.destination}</p>
                      <p className="text-sm text-gray-500 mb-3">{pack.duration}</p>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">{pack.description}</p>
                      <button
                        onClick={() => openPreview(pack)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        Preview Pack
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show More/Less Button for Mobile */}
              {examplesByPersona[persona] && examplesByPersona[persona].length > 2 && (
                <div className="sm:hidden mt-6 text-center">
                  <button
                    onClick={() => togglePersonaExpansion(persona)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {expandedPersonas.has(persona) ? 'Show Less' : `Show All Examples (${examplesByPersona[persona].length})`}
                  </button>
                </div>
              )}
            </section>
          ))}

          {/* Testimonials Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              What Travelers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(testimonialsByPersona).map(([persona, testimonials]) => 
                testimonials
                  .slice(0, testimonialsExpanded ? undefined : window.innerWidth < 640 ? 1 : undefined)
                  .map((testimonial, index) => (
                  <div key={`${persona}-${index}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 flex-grow">"{testimonial.text}"</p>
                    <div className="mt-auto">
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{persona}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Show More/Less Button for Mobile Testimonials */}
            <div className="sm:hidden mt-8 text-center">
              <button
                onClick={toggleTestimonials}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {testimonialsExpanded ? 'Show Less' : 'Show All Testimonials'}
              </button>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Ready to Create Your Travel Pack?
              </h3>
              <p className="text-gray-600">
                Get a personalized travel brief just like these examples, tailored to your specific trip.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Continue to Preview
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {selectedPreview && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed inset-0 bg-white w-screen h-screen overflow-y-auto">
              {/* Sticky Close Button */}
              <button
                onClick={closePreview}
                className="fixed top-4 right-4 z-10 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-6 pr-16">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPreview.title}</h2>
                <p className="text-blue-600">{selectedPreview.destination} • {selectedPreview.duration}</p>
              </div>
              
              {/* Scrollable Content */}
              <div className="p-6">
                <iframe
                  src={selectedPreview.htmlFile}
                  className="w-full min-h-screen border-0 bg-white rounded-lg shadow-sm"
                  title={`Preview: ${selectedPreview.title}`}
                  style={{ height: 'calc(100vh - 200px)' }}
                />
              </div>

              {/* Bottom CTA */}
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                <div className="text-center max-w-md mx-auto">
                  <p className="text-gray-600 mb-4">
                    Want a personalized pack like this for your trip?
                  </p>
                  <button
                    onClick={() => {
                      closePreview();
                      handleContinue();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    Create My Travel Pack
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}