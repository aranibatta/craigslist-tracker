interface ScrapeResponse {
  success: boolean;
  data?: {
    address: string;
    listingCreator: string;
    contactInfo: string;
  };
  error?: string;
}

export const ScraperService = {
  scrapeListing: async (url: string): Promise<ScrapeResponse> => {
    try {
      const response = await fetch('http://localhost:3001/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'Failed to scrape listing' 
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scraping listing:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
