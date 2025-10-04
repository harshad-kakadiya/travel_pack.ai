import React, { useState } from 'react';
import { downloadTravelBriefFromData, TravelBriefData } from '../utils/pdf-generator';

const PDFDemo: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState('experienced');

  const sampleData: { [key: string]: TravelBriefData } = {
    experienced: {
      persona: 'experienced',
      destination: 'Oaxaca & Surrounding Regions, Mexico',
      duration: '8 Days',
      destinationIntroduction: `Oaxaca represents Mexico's cultural heart, where experienced travelers can engage with indigenous traditions, complex culinary arts, and artisan crafts that have remained unchanged for centuries. This UNESCO World Heritage city rewards those who approach it with cultural sensitivity and genuine curiosity.

The region's food culture extends far beyond typical Mexican cuisine into the realm of high art. Seven different moles, traditional mezcal production, and indigenous market systems create opportunities for deep cultural engagement that experienced travelers can appreciate and navigate respectfully.

Oaxaca's surrounding villages and archaeological sites offer experienced travelers access to living indigenous cultures and pre-Columbian history. Understanding local customs, market etiquette, and the significance of traditional crafts transforms this from a tourist destination into a profound cultural exchange.`,
      tableOfContents: [
        'Advanced Itinerary',
        'Insider Tips & Hacks',
        'Efficient Packing List',
        'Advanced Spanish Phrases',
        'Emergency ICE Card',
        'Pro Travel Gear'
      ],
      bookingDetails: [
        {
          type: 'flight',
          icon: '✈️',
          title: 'Flight Details',
          details: [
            'Aeromexico Flight AM2',
            'Mexico City (MEX) → Oaxaca (OAX)',
            'Departure: 12 Jan 2025, 07:15',
            'Arrival: 12 Jan 2025, 08:30',
            'Terminal 2, Gate 15'
          ]
        },
        {
          type: 'hotel',
          icon: '🏨',
          title: 'Boutique Hotel',
          details: [
            'Casa Oaxaca',
            'García Vigil 407, Centro Histórico',
            'Check-in: 12 Jan 2025, 15:00',
            'Check-out: 19 Jan 2025, 12:00'
          ],
          confirmation: 'OAX654321'
        },
        {
          type: 'activity',
          icon: '🎨',
          title: 'Cooking Class',
          details: [
            'Mole Workshop Experience',
            'Traditional Zapotec Cooking',
            'Date: 15 Jan 2025, 10:00',
            'Duration: 4 hours'
          ],
          confirmation: 'COOK789456'
        }
      ],
      itinerary: [
        {
          day: 3,
          title: 'Oaxaca Food Culture Deep Dive',
          activities: [
            {
              time: '🌽 Early Morning',
              title: 'Mercado de Abastos (6 AM)',
              why: "Oaxaca's massive wholesale market where locals shop. Experience the real food culture before tourist markets open. Find ingredients you've never seen and interact with vendors who speak no English.",
              tips: 'Bring a local guide or use the "Oaxaca Food Tours" app. Try chapulines (grasshoppers) and tejate (pre-Columbian drink). Vendors appreciate when you know basic Spanish food terms.',
              alternatives: ['Monte Albán - Zapotec ruins, best visited at sunrise to avoid crowds', 'Hierve el Agua - Petrified waterfalls, 2-hour drive but worth it']
            },
            {
              time: '🍫 Lunch',
              title: 'Mole Tasting at Casa Oaxaca',
              why: 'Seven different moles in one tasting menu. Chef Alejandro Ruiz is a James Beard Award winner who elevates traditional Oaxacan cuisine without losing authenticity.',
              alternatives: ['Catedral - Modern interpretation of Zapotec cuisine', 'Las Quince Letras - Hidden gem known only to locals']
            },
            {
              time: '🎨 Afternoon',
              title: 'Teotitlán del Valle Weaving Workshop',
              why: 'Learn traditional Zapotec weaving techniques using natural dyes. Most tourists buy rugs; experienced travelers learn the 500-year-old process from master weavers.',
              tips: 'Use colectivos (shared taxis) instead of tourist shuttles - 1/10th the price and authentic local experience. Learn to negotiate in Spanish for better prices.'
            }
          ]
        }
      ],
      safetyTips: [
        'Understand mezcal regions - each has distinct flavor profiles',
        'Learn the difference between mole negro, coloradito, and amarillo',
        'Use local buses for authentic travel - ADO for long distance, city buses for local',
        'Bargain respectfully at markets - start at 50% of asking price',
        'Eat where locals eat - look for busy places with no English menus',
        'Understand altitude effects - Oaxaca is at 5,000 feet'
      ],
      packingList: [
        'Lightweight layers for mountain climate variations',
        'Comfortable walking shoes for cobblestone streets',
        'Spanish-English dictionary focused on food terms',
        'Portable scale for buying spices and coffee',
        'Vacuum-sealed bags for bringing food home',
        'Cash in small bills - many places don\'t accept cards',
        'Probiotics for adjusting to local cuisine'
      ],
      phrases: {
        'What\'s the local specialty?': '¿Cuál es la especialidad local? (kwal es lah es-peh-see-ah-lee-DAHD loh-KAHL)',
        'How is this prepared?': '¿Cómo se prepara esto? (KOH-moh seh preh-PAH-rah ES-toh)',
        'Is this spicy?': '¿Está picante? (es-TAH pee-KAHN-teh)',
        'Can you recommend?': '¿Puede recomendar? (PWEH-deh reh-koh-men-DAHR)',
        'Where do locals eat?': '¿Dónde comen los locales? (DOHN-deh KOH-men lohs loh-KAH-les)',
        'This is delicious': 'Está delicioso (es-TAH deh-lee-see-OH-soh)'
      },
      emergencyContacts: [
        { name: 'Emergency Services', number: '911' },
        { name: 'Tourist Police', number: '078' },
        { name: 'US Embassy Mexico City', number: '+52-55-5080-2000' },
        { name: 'Your Emergency Contact', number: '________________' },
        { name: 'Travel Insurance', number: '________________' }
      ],
      gearRecommendations: [
        'Mezcal Tasting Journal - Record distilleries and flavor notes',
        'Portable Spice Grinder - For fresh chiles and spices',
        'Food Photography Kit - Document culinary discoveries',
        'Spanish Food Dictionary - Essential for market shopping',
        'Reusable Shopping Bags - For market purchases'
      ]
    },
    family: {
      persona: 'family',
      destination: 'Sydney & Cairns, Australia',
      duration: '10 Days',
      destinationIntroduction: `Australia offers families an incredible wildlife and natural adventure in one of the world's safest and most family-friendly destinations. Sydney and Cairns provide different experiences - urban sophistication versus tropical adventure - both with excellent family services, healthcare, and activities designed to create lifelong memories.

Sydney's iconic landmarks like the Opera House and Harbour Bridge provide spectacular backdrops for family photos, while Taronga Zoo and beautiful beaches offer hands-on experiences with unique Australian wildlife. The city's excellent public transportation and family-friendly culture make exploration with children enjoyable and stress-free.

Cairns serves as the gateway to the Great Barrier Reef and Daintree Rainforest, offering families safe access to World Heritage natural wonders. The region's focus on eco-tourism and family safety ensures that children can experience snorkeling, rainforest exploration, and wildlife encounters with appropriate supervision and education.`,
      tableOfContents: [
        'Family-Friendly Itinerary',
        'Kid-Safe Activities',
        'Family Safety Tips',
        'Child-Friendly Restaurants',
        'Emergency ICE Card',
        'Family Travel Gear'
      ],
      bookingDetails: [
        {
          type: 'flight',
          icon: '✈️',
          title: 'Flight Details',
          details: [
            'Qantas Airways QF12',
            'Los Angeles (LAX) → Sydney (SYD)',
            'Departure: 05 Nov 2025, 22:30',
            'Arrival: 07 Nov 2025, 06:15',
            'Terminal B, Gate 41'
          ]
        },
        {
          type: 'hotel',
          icon: '🏨',
          title: 'Family Resort',
          details: [
            'Shangri-La Sydney',
            '176 Cumberland Street, Sydney',
            'Check-in: 07 Nov 2025, 15:00',
            'Check-out: 16 Nov 2025, 11:00',
            'Harbor View Suite'
          ],
          confirmation: 'SLS456789'
        },
        {
          type: 'activity',
          icon: '🐠',
          title: 'Reef Tour',
          details: [
            'Quicksilver Great Barrier Reef',
            'Family Snorkeling Package',
            'Date: 12 Nov 2025, 08:00',
            'Includes Underwater Observatory'
          ],
          confirmation: 'QS123456'
        }
      ],
      itinerary: [
        {
          day: 6,
          title: 'Great Barrier Reef Family Adventure',
          activities: [
            {
              time: '🐠 Morning',
              title: 'Great Barrier Reef Snorkeling (Family-Friendly)',
              why: 'Quicksilver Cruises offers family-friendly reef tours with shallow snorkeling areas perfect for kids. Underwater observatory for non-swimmers and marine biologist talks.',
              tips: 'Book with Quicksilver (+61 7 4087 2100) - excellent safety record and kids\' programs. Life jackets provided. Stinger suits required Oct-May. Kids must be confident swimmers.',
              alternatives: ['Kuranda Scenic Railway - Historic train through rainforest', 'Cairns Esplanade Lagoon - Safe swimming pool with lifeguards', 'Tjapukai Aboriginal Cultural Park - Interactive cultural experience']
            },
            {
              time: '🍖 Lunch',
              title: 'Aussie BBQ on the Reef',
              why: 'Many reef tours include traditional Australian BBQ lunch. Kids love the casual atmosphere and familiar foods like sausages and burgers.',
              alternatives: ['Doyles on the Beach - Famous fish restaurant, kid-friendly', 'Bills Sydney - Australian breakfast/lunch, accommodates families']
            },
            {
              time: '🦘 Afternoon',
              title: 'Wildlife Habitat Port Douglas',
              why: 'Kids can hand-feed kangaroos, hold koalas, and see crocodiles safely. Educational talks throughout the day and breakfast with birds experience.',
              tips: 'Australian sun is intense. Apply SPF 30+ sunscreen every 2 hours. Seek shade during peak hours (10 AM - 3 PM). Rash guards recommended for water activities.'
            }
          ]
        }
      ],
      safetyTips: [
        'Australia is very safe for families - excellent healthcare system',
        'Sun protection is critical - UV levels are extreme',
        'Swim only at patrolled beaches between red and yellow flags',
        'Be aware of marine stingers (jellyfish) in tropical waters Oct-May',
        'Keep kids hydrated - dehydration happens quickly in heat',
        'Learn about dangerous wildlife but don\'t be overly fearful',
        'Carry first aid kit with burn gel for sun exposure',
        'Know location of nearest hospitals in each city'
      ],
      packingList: [
        'Strong sunscreen (SPF 30+) and zinc for noses',
        'Wide-brimmed hats and UV-protective clothing',
        'Rash guards for water activities',
        'Comfortable walking shoes and sandals',
        'Light layers for air-conditioned spaces',
        'Insect repellent for tropical areas',
        'First aid kit with burn gel',
        'Reusable water bottles (stay hydrated!)',
        'Entertainment for long flights',
        'Snorkeling gear (or rent locally)'
      ],
      emergencyContacts: [
        { name: 'Emergency Services', number: '000' },
        { name: 'Sydney Children\'s Hospital', number: '(02) 9382 1111' },
        { name: 'Cairns Hospital', number: '(07) 4226 0000' },
        { name: 'US Consulate Sydney', number: '(02) 9373 9200' },
        { name: 'Your Emergency Contact', number: '________________' },
        { name: 'Travel Insurance', number: '________________' },
        { name: 'Children\'s Medical Info', number: '________________' },
        { name: 'Hotel', number: '________________' }
      ],
      gearRecommendations: [
        'Sun Shelter - Portable shade for beach days',
        'Cooling Towels - Help manage heat',
        'Waterproof Phone Cases - For water activities',
        'Snorkeling Gear - Better fit than rental equipment',
        'Insulated Water Bottles - Keep drinks cold in heat',
        'Portable Fan - Battery-powered for hot days'
      ]
    },
    adventure: {
      persona: 'adventure',
      destination: 'Ring Road & Highlands, Iceland',
      duration: '7 Days',
      destinationIntroduction: `Iceland challenges adventure travelers with some of Earth's most extreme and dynamic conditions. This volcanic island nation demands respect for rapidly changing weather, geological activity, and Arctic conditions that can shift from benign to life-threatening within hours. Only properly prepared adventure travelers should attempt Iceland's remote highlands and glacial regions.

The Ring Road and F-roads provide access to landscapes that seem otherworldly - active volcanoes, massive glaciers, and geothermal features that demonstrate the planet's raw power. Adventure travelers must understand 4WD techniques, emergency shelter, and weather monitoring to safely explore these remote regions.

Iceland's isolation means self-reliance is critical. Adventure travelers who master cold weather survival, vehicle recovery techniques, and emergency communication discover landscapes and experiences that few humans ever witness. The reward for proper preparation is access to some of the planet's most pristine and powerful natural environments.`,
      tableOfContents: [
        'Extreme Weather Adventure',
        'Golden Circle & Beyond',
        'Arctic Safety Protocols',
        'Cold Weather Gear',
        'Emergency ICE Card',
        'Arctic Adventure Checklist'
      ],
      bookingDetails: [
        {
          type: 'flight',
          icon: '✈️',
          title: 'Flight Details',
          details: [
            'Icelandair FI614',
            'Seattle (SEA) → Reykjavik (KEF)',
            'Departure: 15 Nov 2025, 17:30',
            'Arrival: 16 Nov 2025, 06:50',
            'Terminal A, Gate A7'
          ]
        },
        {
          type: 'hotel',
          icon: '🏨',
          title: 'Adventure Lodge',
          details: [
            'Hotel Rangá',
            'Suðurlandsvegur, Hella',
            'Check-in: 18 Nov 2025, 15:00',
            'Check-out: 21 Nov 2025, 11:00'
          ],
          confirmation: 'HR654321'
        },
        {
          type: 'rental',
          icon: '🚗',
          title: '4WD Rental',
          details: [
            'Hertz 4x4 Super Jeep',
            'Keflavik Airport',
            'Pickup: 16 Nov 2025, 08:00',
            'Dropoff: 22 Nov 2025, 10:00'
          ],
          confirmation: 'H4WD789456'
        }
      ],
      itinerary: [
        {
          day: 4,
          title: 'Golden Circle Extreme',
          activities: [
            {
              time: '🌋 Morning',
              title: 'Geysir Geothermal Area',
              why: 'Witness Strokkur geyser erupting every 5-10 minutes, shooting boiling water 100+ feet into the air. The raw geothermal power demonstrates Iceland\'s volcanic nature.',
              tips: 'Boiling water and steam can cause severe burns. Stay behind barriers. Wind can blow scalding water unpredictably. Ground may be unstable near thermal features. Wear proper footwear with grip.',
              alternatives: ['Thingvellir National Park - Continental drift visible, diving/snorkeling', 'Gullfoss Waterfall - Massive two-tier waterfall, icy conditions', 'Kerið Crater Lake - Volcanic crater with stunning blue water']
            },
            {
              time: '🍲 Lunch',
              title: 'Icelandic Lamb Stew',
              why: 'Traditional hearty meal perfect for cold weather adventures. Icelandic lamb is grass-fed and provides essential protein and warmth for outdoor activities.',
              alternatives: ['Grillmarkadurinn - High-end Icelandic cuisine, perfect for celebration', 'Fish Company - Fresh seafood, essential omega-3s for cold weather']
            },
            {
              time: '🧊 Afternoon',
              title: 'Glacier Hiking on Sólheimajökull',
              why: 'Walk on a 1,000-year-old glacier with crampons and ice axes. Experience crevasses, ice formations, and the effects of climate change firsthand.',
              tips: 'Iceland weather changes in minutes. Pack layers, waterproof everything, and always have emergency shelter. "There\'s no bad weather, only bad clothing."'
            }
          ]
        }
      ],
      safetyTips: [
        'Weather Monitoring: Check road.is and vedur.is constantly',
        'Emergency Shelter: Car can be lifesaving shelter in storms',
        'Communication: ICE-SAR app for emergency rescue',
        'Hypothermia Prevention: Stay dry, eat regularly, layer properly',
        'Glacier Safety: Never walk on glaciers without guide and gear',
        'Geothermal Hazards: Boiling water, unstable ground, toxic gases',
        'Ocean Safety: Sneaker waves, hypothermia in minutes',
        'Highland Access: F-roads closed October-June'
      ],
      packingList: [
        'Base Layers: Merino wool, moisture-wicking',
        'Insulation: Down or synthetic fill jacket',
        'Shell Layer: Waterproof, windproof, breathable',
        'Footwear: Waterproof boots, microspikes for ice',
        'Accessories: Warm hat, waterproof gloves, neck gaiter',
        'Eye Protection: Glacier glasses, goggles for wind',
        'Emergency: Bivy sack, emergency food, headlamp',
        'Navigation: GPS, offline maps, compass'
      ],
      emergencyContacts: [
        { name: 'Emergency Services', number: '112' },
        { name: 'ICE-SAR (Search & Rescue)', number: '112' },
        { name: 'Road Conditions', number: '1777' },
        { name: 'Weather Info', number: '902-0600' },
        { name: 'US Embassy Reykjavik', number: '+354 595 22 00' },
        { name: 'Your Emergency Contact', number: '________________' },
        { name: 'Travel Insurance', number: '________________' },
        { name: 'Rental Car Company', number: '________________' },
        { name: 'Accommodation', number: '________________' }
      ],
      gearRecommendations: [
        'ICE-SAR App - Official rescue app with GPS location',
        'Offline Maps - GPS works without cell service',
        'Emergency Food - High-calorie bars, hot drinks',
        'Portable Charger - Cold drains batteries quickly',
        'Emergency Blanket - Reflective space blanket',
        'Duct Tape - Emergency repairs for gear',
        'Cash (ISK) - Some remote areas don\'t accept cards',
        'Sunscreen - Snow reflection intensifies UV'
      ]
    }
  };

  const handleGeneratePDF = () => {
    const data = sampleData[selectedPersona];
    if (data) {
      downloadTravelBriefFromData(data, `${selectedPersona}-travel-brief.pdf`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">PDF Generation Demo</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Persona:
        </label>
        <select
          value={selectedPersona}
          onChange={(e) => setSelectedPersona(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="experienced">Experienced Traveler</option>
          <option value="family">Family Traveler</option>
          <option value="adventure">Adventure Traveler</option>
          <option value="solo-female">Solo Female Traveler</option>
          <option value="new-traveler">New Traveler</option>
        </select>
      </div>

      <div className="mb-6">
        <button
          onClick={handleGeneratePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate PDF
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Preview Data:</h2>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(sampleData[selectedPersona], null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PDFDemo;