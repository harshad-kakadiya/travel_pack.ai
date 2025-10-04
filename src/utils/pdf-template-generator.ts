// PDF Template Generator
// This file generates HTML templates that match the example files exactly

import { getTravelBriefStyles, getPersonaSpecificStyles, getPersonaIcon, getPersonaTitle } from './travel-brief-styles';

export interface TravelBriefData {
  persona: string;
  destination: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  tripTitle?: string;
  bookingDetails?: BookingDetail[];
  itinerary?: DaySchedule[];
  safetyTips?: string[];
  packingList?: string[];
  phrases?: { [key: string]: string };
  emergencyContacts?: EmergencyContact[];
  gearRecommendations?: string[];
  destinationIntroduction?: string;
  tableOfContents?: string[];
  specialSections?: { [key: string]: any };
}

export interface BookingDetail {
  type: 'flight' | 'hotel' | 'activity' | 'rental';
  title: string;
  details: string[];
  confirmation?: string;
  icon: string;
}

export interface DaySchedule {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  why: string;
  alternatives?: string[];
  tips?: string;
  type?: 'highlight' | 'tip' | 'family' | 'adventure' | 'solo-female' | 'new-traveler';
}

export interface EmergencyContact {
  name: string;
  number: string;
  description?: string;
}

export class PDFTemplateGenerator {
  private static instance: PDFTemplateGenerator;
  
  static getInstance(): PDFTemplateGenerator {
    if (!PDFTemplateGenerator.instance) {
      PDFTemplateGenerator.instance = new PDFTemplateGenerator();
    }
    return PDFTemplateGenerator.instance;
  }

  generateTravelBriefHTML(data: TravelBriefData): string {
    const persona = data.persona || 'experienced';
    const icon = getPersonaIcon(persona);
    const title = getPersonaTitle(persona);
    const baseStyles = getTravelBriefStyles(persona);
    const personaStyles = getPersonaSpecificStyles(persona);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} – ${data.destination} ${data.duration}</title>
    ${baseStyles}
    ${personaStyles}
</head>
<body>
    <h1>${icon} ${title} – ${data.destination} ${data.duration}</h1>
    
    <div class="persona-info">
        <p><strong>Persona:</strong> ${this.formatPersonaName(persona)}</p>
        <p><strong>Destination:</strong> ${data.destination}</p>
        <p><strong>Duration:</strong> ${data.duration}</p>
    </div>

    ${this.generateDestinationIntroduction(data.destinationIntroduction, persona)}
    
    ${this.generateTableOfContents(data.tableOfContents)}
    
    ${this.generateBookingDetails(data.bookingDetails)}
    
    ${this.generateItinerary(data.itinerary, persona)}
    
    ${this.generateSafetyTips(data.safetyTips, persona)}
    
    ${this.generatePackingList(data.packingList, persona)}
    
    ${this.generatePhrases(data.phrases, persona)}
    
    ${this.generateEmergencyContacts(data.emergencyContacts, persona)}
    
    ${this.generateGearRecommendations(data.gearRecommendations, persona)}
    
    ${this.generateSpecialSections(data.specialSections, persona)}
</body>
</html>`;

    return html;
  }

  private formatPersonaName(persona: string): string {
    const names: { [key: string]: string } = {
      family: 'Family Traveler',
      adventure: 'Adventure Traveler',
      'solo-female': 'Solo Female Traveler',
      'new-traveler': 'New Traveler',
      experienced: 'Experienced Traveler'
    };
    return names[persona] || 'Traveler';
  }

  private generateDestinationIntroduction(intro: string | undefined, persona: string): string {
    if (!intro) return '';

    const highlightClass = this.getHighlightClass(persona);
    
    return `
    <h2>🌍 Destination Introduction</h2>
    <div class="${highlightClass}">
        <p>${intro}</p>
    </div>`;
  }

  private generateTableOfContents(toc: string[] | undefined): string {
    if (!toc || toc.length === 0) return '';

    const tocItems = toc.map(item => `<li>${item}</li>`).join('\n        ');

    return `
    <h2>📋 Table of Contents</h2>
    <ul>
        ${tocItems}
    </ul>`;
  }

  private generateBookingDetails(bookings: BookingDetail[] | undefined): string {
    if (!bookings || bookings.length === 0) {
      return `
      <h2>🎯 Your Trip Essentials</h2>
      <div class="highlight">
          <p><strong>Parsed from your uploaded booking confirmations:</strong></p>
          <p class="disclaimer">
              <em>Example only. In your paid Travel Brief, this section will be generated from your actual uploaded booking documents (flights, hotels, rentals, tours).</em>
          </p>
      </div>`;
    }

    const bookingCards = bookings.map(booking => `
      <div class="booking-card">
          <h4>${booking.icon} ${booking.title}</h4>
          ${booking.details.map(detail => `<p>${detail}</p>`).join('')}
          ${booking.confirmation ? `<p><strong>Confirmation:</strong> ${booking.confirmation}</p>` : ''}
      </div>`).join('');

    return `
    <h2>🎯 Your Trip Essentials</h2>
    <div class="highlight">
        <p><strong>Parsed from your uploaded booking confirmations:</strong></p>
        
        <div class="booking-cards">
            ${bookingCards}
        </div>
        
        <p class="disclaimer">
            <em>Example only. In your paid Travel Brief, this section will be generated from your actual uploaded booking documents (flights, hotels, rentals, tours).</em>
        </p>
    </div>`;
  }

  private generateItinerary(itinerary: DaySchedule[] | undefined, persona: string): string {
    if (!itinerary || itinerary.length === 0) return '';

    const sampleDay = itinerary[0]; // Use first day as sample
    if (!sampleDay) return '';

    const activities = sampleDay.activities.map(activity => `
      <h3>${activity.time}: ${activity.title}</h3>
      <p><strong>Why?</strong> ${activity.why}</p>
      
      ${activity.tips ? `<div class="${this.getTipClass(persona)}">
          <strong>${this.getTipPrefix(persona)}:</strong> ${activity.tips}
      </div>` : ''}
      
      ${activity.alternatives && activity.alternatives.length > 0 ? `
      <p><strong>Alternatives:</strong></p>
      <ul>
          ${activity.alternatives.map(alt => `<li><strong>${alt}</strong></li>`).join('')}
      </ul>` : ''}
    `).join('');

    return `
    <h2>📅 Sample Day: Day ${sampleDay.day} – ${sampleDay.title}</h2>
    ${activities}`;
  }

  private generateSafetyTips(tips: string[] | undefined, persona: string): string {
    if (!tips || tips.length === 0) return '';

    const tipItems = tips.map(tip => `<li>${tip}</li>`).join('\n        ');
    const title = this.getSafetyTipsTitle(persona);

    return `
    <h2>🛡️ ${title}</h2>
    <ul>
        ${tipItems}
    </ul>`;
  }

  private generatePackingList(items: string[] | undefined, persona: string): string {
    if (!items || items.length === 0) return '';

    const listItems = items.map(item => `<li>${item}</li>`).join('\n        ');
    const title = this.getPackingListTitle(persona);

    return `
    <h2>🎒 ${title}</h2>
    <ul>
        ${listItems}
    </ul>`;
  }

  private generatePhrases(phrases: { [key: string]: string } | undefined, persona: string): string {
    if (!phrases || Object.keys(phrases).length === 0) return '';

    const phraseItems = Object.entries(phrases).map(([phrase, pronunciation]) => 
      `<li><strong>${phrase}:</strong> ${pronunciation}</li>`
    ).join('\n        ');

    const language = this.getLanguageForPersona(persona);

    return `
    <h2>🗣️ ${language} Phrases</h2>
    <ul>
        ${phraseItems}
    </ul>`;
  }

  private generateEmergencyContacts(contacts: EmergencyContact[] | undefined, persona: string): string {
    if (!contacts || contacts.length === 0) return '';

    const contactItems = contacts.map(contact => 
      `<li>${contact.name}: ${contact.number}${contact.description ? ` - ${contact.description}` : ''}</li>`
    ).join('\n        ');

    return `
    <h2>🆘 Emergency ICE Card</h2>
    <div class="emergency-contacts">
        <p><strong>Emergency Contacts:</strong></p>
        <ul>
            ${contactItems}
        </ul>
    </div>`;
  }

  private generateGearRecommendations(gear: string[] | undefined, persona: string): string {
    if (!gear || gear.length === 0) return '';

    const gearItems = gear.map(item => `<li><strong>${item}</strong></li>`).join('\n        ');

    return `
    <h2>🛒 ${this.getGearTitle(persona)}</h2>
    <ul>
        ${gearItems}
    </ul>`;
  }

  private generateSpecialSections(sections: { [key: string]: any } | undefined, persona: string): string {
    if (!sections) return '';

    return Object.entries(sections).map(([title, content]) => {
      if (typeof content === 'string') {
        return `<h2>${title}</h2><p>${content}</p>`;
      } else if (Array.isArray(content)) {
        const items = content.map(item => `<li>${item}</li>`).join('\n        ');
        return `<h2>${title}</h2><ul>${items}</ul>`;
      }
      return '';
    }).join('\n    ');
  }

  private getHighlightClass(persona: string): string {
    const classes: { [key: string]: string } = {
      family: 'family',
      adventure: 'adventure',
      'solo-female': 'solo-female',
      'new-traveler': 'new-traveler',
      experienced: 'highlight'
    };
    return classes[persona] || 'highlight';
  }

  private getTipClass(persona: string): string {
    const classes: { [key: string]: string } = {
      family: 'family',
      adventure: 'adventure',
      'solo-female': 'solo-female',
      'new-traveler': 'new-traveler',
      experienced: 'tip'
    };
    return classes[persona] || 'tip';
  }

  private getTipPrefix(persona: string): string {
    const prefixes: { [key: string]: string } = {
      family: 'Family Safety',
      adventure: 'Extreme Conditions',
      'solo-female': 'Safety Tip',
      'new-traveler': 'Pro Tip',
      experienced: 'Pro Tip'
    };
    return prefixes[persona] || 'Pro Tip';
  }

  private getSafetyTipsTitle(persona: string): string {
    const titles: { [key: string]: string } = {
      family: 'Family Safety Tips',
      adventure: 'Arctic Adventure Safety',
      'solo-female': 'Safety Tips',
      'new-traveler': 'Travel Safety Tips',
      experienced: 'Advanced Travel Tips'
    };
    return titles[persona] || 'Travel Tips';
  }

  private getPackingListTitle(persona: string): string {
    const titles: { [key: string]: string } = {
      family: 'Family Packing List',
      adventure: 'Cold Weather Adventure Gear',
      'solo-female': 'Solo Female Packing List',
      'new-traveler': 'New Traveler Packing List',
      experienced: 'Experienced Traveler Packing List'
    };
    return titles[persona] || 'Packing List';
  }

  private getLanguageForPersona(persona: string): string {
    const languages: { [key: string]: string } = {
      family: 'Essential',
      adventure: 'Essential Icelandic',
      'solo-female': 'Essential',
      'new-traveler': 'Essential',
      experienced: 'Advanced Spanish'
    };
    return languages[persona] || 'Essential';
  }

  private getGearTitle(persona: string): string {
    const titles: { [key: string]: string } = {
      family: 'Family Travel Gear',
      adventure: 'Arctic Adventure Checklist',
      'solo-female': 'Solo Female Travel Gear',
      'new-traveler': 'New Traveler Gear',
      experienced: 'Pro Travel Gear'
    };
    return titles[persona] || 'Travel Gear';
  }
}

// Export singleton instance
export const pdfTemplateGenerator = PDFTemplateGenerator.getInstance();

// Utility function for easy use
export const generateTravelBriefHTML = (data: TravelBriefData): string => {
  return pdfTemplateGenerator.generateTravelBriefHTML(data);
};

export default pdfTemplateGenerator;