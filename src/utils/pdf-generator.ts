// PDF Generation Utility for Travel Brief
// This utility handles converting HTML content to PDF format

import { generateTravelBriefHTML, TravelBriefData } from './pdf-template-generator';

export interface PDFGenerationOptions {
  filename?: string;
  format?: 'A4' | 'Letter';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export class PDFGenerator {
  private static instance: PDFGenerator;
  
  static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  /**
   * Generate PDF from Travel Brief data using the template system
   * This creates a properly formatted HTML that matches the example files
   */
  generatePDFFromTravelBriefData(data: TravelBriefData, options: PDFGenerationOptions = {}): void {
    const htmlContent = generateTravelBriefHTML(data);
    this.generatePDFFromHTML(htmlContent, options);
  }

  /**
   * Generate PDF from HTML content using browser's print functionality
   * This is a client-side PDF generation method
   */
  generatePDFFromHTML(htmlContent: string, options: PDFGenerationOptions = {}): void {
    const {
      filename = 'travel-brief.pdf',
      format = 'A4',
      margin = { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    } = options;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check your browser settings.');
    }

    // Write the HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        
        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }

  /**
   * Download HTML content as a file
   * This can be used as a fallback if PDF generation is not available
   */
  downloadHTML(htmlContent: string, filename: string = 'travel-brief.html'): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Generate PDF using a server-side service
   * This would typically call a backend service that handles PDF generation
   */
  async generatePDFViaService(htmlContent: string, options: PDFGenerationOptions = {}): Promise<Blob> {
    const {
      format = 'A4',
      margin = { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    } = options;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }

      // Call the Supabase Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          format,
          margin
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `PDF generation failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF generation service error:', error);
      throw new Error('Failed to generate PDF via service');
    }
  }

  /**
   * Download PDF blob as a file
   */
  downloadPDFBlob(blob: Blob, filename: string = 'travel-brief.pdf'): void {
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const pdfGenerator = PDFGenerator.getInstance();

// Utility functions for common PDF operations
export const downloadTravelBrief = (htmlContent: string, filename?: string) => {
  try {
    pdfGenerator.generatePDFFromHTML(htmlContent, { filename });
  } catch (error) {
    console.warn('PDF generation failed, downloading HTML instead:', error);
    pdfGenerator.downloadHTML(htmlContent, filename?.replace('.pdf', '.html'));
  }
};

export const downloadTravelBriefFromData = (data: TravelBriefData, filename?: string) => {
  try {
    pdfGenerator.generatePDFFromTravelBriefData(data, { filename });
  } catch (error) {
    console.warn('PDF generation failed, downloading HTML instead:', error);
    const htmlContent = generateTravelBriefHTML(data);
    pdfGenerator.downloadHTML(htmlContent, filename?.replace('.pdf', '.html'));
  }
};

export const downloadHTMLFallback = (htmlContent: string, filename?: string) => {
  pdfGenerator.downloadHTML(htmlContent, filename);
};

export default pdfGenerator;