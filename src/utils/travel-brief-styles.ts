// Travel Brief PDF Styles
// This file contains the CSS styles that match the example HTML files exactly

export const getTravelBriefStyles = (persona: string = 'experienced') => {
  const baseStyles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: #fff;
      }
      
      h1 { 
        color: #2563eb; 
        border-bottom: 3px solid #2563eb; 
        padding-bottom: 10px; 
        margin-bottom: 20px;
      }
      
      h2 { 
        color: #1e40af; 
        margin-top: 30px; 
        padding-left: 10px; 
        border-left: 4px solid #3b82f6; 
        margin-bottom: 15px;
      }
      
      h3 { 
        color: #1e3a8a; 
        margin-top: 25px; 
        margin-bottom: 10px;
      }
      
      h4 {
        color: #1e40af;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
      }
      
      .highlight { 
        background: #fef3c7; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #f59e0b; 
        margin: 20px 0; 
      }
      
      .tip { 
        background: #ecfdf5; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #10b981; 
        margin: 20px 0; 
      }
      
      .family { 
        background: #f0f9ff; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #0ea5e9; 
        margin: 20px 0; 
      }
      
      .adventure { 
        background: #fef2f2; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #ef4444; 
        margin: 20px 0; 
      }
      
      .solo-female { 
        background: #fdf4ff; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #a855f7; 
        margin: 20px 0; 
      }
      
      .new-traveler { 
        background: #f0fdf4; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #22c55e; 
        margin: 20px 0; 
      }
      
      ul, ol { 
        padding-left: 20px; 
        margin-bottom: 15px;
      }
      
      li { 
        margin-bottom: 8px; 
      }
      
      p {
        margin-bottom: 15px;
      }
      
      .booking-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      
      .booking-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .booking-card h4 {
        margin-bottom: 15px;
        color: #1e40af;
        font-size: 16px;
        font-weight: 600;
      }
      
      .booking-card p {
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .booking-card strong {
        font-weight: 600;
        color: #1f2937;
      }
      
      .disclaimer {
        font-style: italic;
        color: #6b7280;
        font-size: 14px;
        margin-top: 15px;
      }
      
      .persona-info {
        background: #f8fafc;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin-bottom: 20px;
      }
      
      .persona-info p {
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .persona-info strong {
        color: #1e40af;
        font-weight: 600;
      }
      
      .section-content {
        margin-bottom: 30px;
      }
      
      .day-schedule {
        margin-bottom: 25px;
      }
      
      .day-schedule h3 {
        background: #f1f5f9;
        padding: 10px 15px;
        border-radius: 6px;
        margin-bottom: 15px;
        border-left: 4px solid #3b82f6;
      }
      
      .activity {
        margin-bottom: 20px;
        padding: 15px;
        background: #fafafa;
        border-radius: 6px;
        border-left: 3px solid #e5e7eb;
      }
      
      .activity h4 {
        margin-bottom: 10px;
        color: #1e40af;
      }
      
      .activity p {
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .activity strong {
        color: #1f2937;
        font-weight: 600;
      }
      
      .alternatives {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
      }
      
      .alternatives p {
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
      }
      
      .alternatives ul {
        margin-bottom: 0;
      }
      
      .alternatives li {
        font-size: 14px;
        margin-bottom: 6px;
      }
      
      .emergency-contacts {
        background: #fef2f2;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #ef4444;
        margin: 20px 0;
      }
      
      .emergency-contacts h2 {
        color: #dc2626;
        margin-bottom: 15px;
      }
      
      .emergency-contacts ul {
        margin-bottom: 0;
      }
      
      .emergency-contacts li {
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .gear-list {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin: 20px 0;
      }
      
      .gear-list h2 {
        color: #1e40af;
        margin-bottom: 15px;
      }
      
      .gear-list ul {
        margin-bottom: 0;
      }
      
      .gear-list li {
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .gear-list strong {
        color: #1f2937;
        font-weight: 600;
      }
      
      @media print {
        body {
          max-width: none;
          margin: 0;
          padding: 15px;
        }
        
        .booking-cards {
          grid-template-columns: 1fr;
          gap: 15px;
        }
        
        .booking-card {
          break-inside: avoid;
        }
        
        h1, h2, h3 {
          break-after: avoid;
        }
        
        .highlight, .tip, .family, .adventure, .solo-female, .new-traveler {
          break-inside: avoid;
        }
      }
    </style>
  `;

  return baseStyles;
};

export const getPersonaSpecificStyles = (persona: string) => {
  const personaStyles: { [key: string]: string } = {
    family: `
      .family-highlight { 
        background: #f0f9ff; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #0ea5e9; 
        margin: 20px 0; 
      }
    `,
    adventure: `
      .adventure-highlight { 
        background: #fef2f2; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #ef4444; 
        margin: 20px 0; 
      }
    `,
    'solo-female': `
      .solo-female-highlight { 
        background: #fdf4ff; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #a855f7; 
        margin: 20px 0; 
      }
    `,
    'new-traveler': `
      .new-traveler-highlight { 
        background: #f0fdf4; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #22c55e; 
        margin: 20px 0; 
      }
    `,
    experienced: `
      .experienced-highlight { 
        background: #fef3c7; 
        padding: 15px; 
        border-radius: 8px; 
        border-left: 4px solid #f59e0b; 
        margin: 20px 0; 
      }
    `
  };

  return personaStyles[persona] || personaStyles.experienced;
};

export const getPersonaIcon = (persona: string): string => {
  const icons: { [key: string]: string } = {
    family: '👨‍👩‍👧',
    adventure: '⛰️',
    'solo-female': '👩',
    'new-traveler': '🆕',
    experienced: '🌍'
  };

  return icons[persona] || '🌍';
};

export const getPersonaTitle = (persona: string): string => {
  const titles: { [key: string]: string } = {
    family: 'Family Pack',
    adventure: 'Adventure Pack',
    'solo-female': 'Solo Female Pack',
    'new-traveler': 'New Traveler Pack',
    experienced: 'Experienced Traveler Pack'
  };

  return titles[persona] || 'Travel Pack';
};