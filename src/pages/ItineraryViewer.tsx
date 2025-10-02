import React, { useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { addDaysISO, formatDayLabel } from '../utils/dates';
import Reveal from '../components/Reveal';

type Day = { title?: string; notes?: string; activities?: string[] };
type Itinerary = {
  tripId: string;
  tripTitle?: string;
  startDate: string;
  endDate: string;
  days: Day[];
};

function parseISO(s: string) { return new Date(s + 'T00:00:00'); }
function fmt(date: Date) { return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }

export default function ItineraryViewer() {
  const { id, day } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const dataParam = sp.get('data');
  const activeIndex = Math.max(1, parseInt(day || '1', 10)) - 1;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [fetchedItinerary, setFetchedItinerary] = React.useState<Itinerary | null>(null);

  const itinerary: Itinerary | null = useMemo(() => {
    // If we have fetched data from Supabase, use that
    if (fetchedItinerary) return fetchedItinerary;
    
    // Otherwise, try to parse from URL data parameter (local demo)
    if (!dataParam) return null;
    try { return JSON.parse(atob(dataParam)); } catch { return null; }
  }, [dataParam, fetchedItinerary]);

  // Fetch itinerary from Supabase functions in production
  React.useEffect(() => {
    const functionsBase = import.meta.env.VITE_FUNCTIONS_BASE as string | undefined;
    
    // Only fetch from Supabase if functions base is configured and no local data
    if (!functionsBase || dataParam || !id) return;
    
    const fetchItinerary = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${functionsBase}/get-itinerary?id=${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            const errorData = await response.json();
            if (errorData.error === 'Expired') {
              setError('This itinerary has expired and is no longer available.');
            } else {
              setError('Itinerary not found.');
            }
          } else {
            setError('Failed to load itinerary.');
          }
          return;
        }
        
        const data = await response.json();
        setFetchedItinerary({
          tripId: data.tripId,
          tripTitle: data.tripTitle,
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days
        });
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError('Failed to load itinerary.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItinerary();
  }, [id, dataParam]);

  if (loading) {
    return (
      <main id="main" className="max-w-3xl mx-auto px-6 py-12">
        <SEOHead title="Loading Itinerary — Travel Brief" description="Loading your travel itinerary..." />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your itinerary...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main id="main" className="max-w-3xl mx-auto px-6 py-12">
        <SEOHead title="Itinerary Error — Travel Brief" description="Error loading itinerary." />
        <h1 className="text-2xl font-semibold mb-4">Error Loading Itinerary</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/plan" className="inline-flex items-center rounded-lg bg-black text-white px-5 py-3">Start a new Travel Brief</Link>
      </main>
    );
  }

  if (!itinerary) {
    return (
      <main id="main" className="max-w-3xl mx-auto px-6 py-12">
        <SEOHead title="Itinerary not found — Travel Brief" description="This itinerary may have expired or is unavailable." />
        <h1 className="text-2xl font-semibold mb-4">Itinerary not found</h1>
        <p className="text-gray-600 mb-6">This link may have expired or is unavailable. If your trip ended more than 3 days ago, it was automatically removed.</p>
        <Link to="/plan" className="inline-flex items-center rounded-lg bg-black text-white px-5 py-3">Start a new Travel Brief</Link>
      </main>
    );
  }

  const total = itinerary.days.length;
  const idx = Math.min(Math.max(0, activeIndex), total - 1);
  const start = parseISO(itinerary.startDate);
  const dayDate = new Date(start); dayDate.setDate(start.getDate() + idx);
  const progress = Math.round(((idx + 1) / total) * 100);

  const next = () => { if (idx + 1 < total) navigate(`/itinerary/${itinerary.tripId}/day/${idx + 2}?${sp.toString()}`); };
  const prev = () => { if (idx > 0) navigate(`/itinerary/${itinerary.tripId}/day/${idx}?${sp.toString()}`); };

  return (
    <main id="main" className="max-w-3xl mx-auto px-6 py-10">
      <SEOHead title={`${itinerary.tripTitle || 'Your Trip'} — Day ${idx+1}/${total}`} description="Day-by-day view of your Travel Brief" />
      <Reveal variant="fade" duration={600}>
        <div aria-label="Progress" className="w-full h-2 bg-gray-200 rounded-full mb-6"><div className="h-2 bg-black rounded-full" style={{ width: `${progress}%` }} /></div>
      </Reveal>
      <Reveal className="flex items-center justify-between text-sm text-gray-600 mb-2" variant="fade-up" delay={200}>
        <span>Day {String(idx+1).padStart(2,'0')} of {total}</span><span>{fmt(dayDate)}</span>
      </Reveal>
      <Reveal as="article" className="rounded-2xl border p-6 bg-white shadow-sm" variant="fade-up" delay={400}>
        <h1 className="text-xl font-semibold mb-2">{itinerary.tripTitle || 'Trip'}</h1>
        <h2 className="text-lg font-medium mb-4">Day {idx+1} — {fmt(dayDate)}</h2>
        {itinerary.days[idx]?.notes && <p className="mb-4 whitespace-pre-wrap">{itinerary.days[idx].notes}</p>}
        {itinerary.days[idx]?.activities?.length ? (
          <ul className="list-disc pl-5 space-y-1">{itinerary.days[idx].activities!.map((a, i) => <li key={i}>{a}</li>)}</ul>
        ) : <p className="text-gray-600">No activities listed.</p>}
      </Reveal>
      <Reveal className="mt-6 flex items-center justify-between" variant="fade-up" delay={600}>
        <button onClick={prev} disabled={idx===0} className="px-4 py-2 rounded-lg border disabled:opacity-40">Previous</button>
        <button onClick={next} disabled={idx+1>=total} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-40">
          {idx+1<total ? `Next — Day ${idx+2}` : 'Done'}
        </button>
      </Reveal>
    </main>
  );
}