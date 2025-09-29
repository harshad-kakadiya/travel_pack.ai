import { renderPdfHeaderLink, renderDayTitle } from '../utils/pdf';

export function buildPdfHeaderLine(tripId: string) { 
  return renderPdfHeaderLink(tripId); 
}

export function buildPdfDayTitle(startISO: string, index0: number) { 
  return renderDayTitle(startISO, index0); 
}