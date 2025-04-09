const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const { Anthropic } = require('@anthropic-ai/sdk');

// Load environment variables from root directory
dotenv.config({ path: '../.env' });

// Debugging environment variables
console.log('Environment variables loaded:', {
  hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  apiKeyLength: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0
});

// Make sure we're using the API key correctly
let apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey) {
  // Trim any whitespace that might have been added accidentally
  apiKey = apiKey.trim();
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: apiKey,
});

console.log('Anthropic client initialized');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes('craigslist.org')) {
      return res.status(400).json({ error: 'Invalid URL. Please provide a valid Craigslist URL.' });
    }

    console.log('Scraping URL:', url);

    // Fetch the web page
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract data from the page
    const title = $('.postingtitle').text().trim();
    const body = $('#postingbody').text().trim();
    const mapAddress = $('.showaddress').text().trim();
    const postingInfo = $('.postinginfos').text().trim();
    
    const attributeGroups = $('.attrgroup');
    let attributes = '';
    attributeGroups.each((i, el) => {
      attributes += $(el).text().trim() + '\n';
    });

    // Compile the scraped data
    const scrapedData = {
      title,
      body,
      mapAddress,
      postingInfo,
      attributes
    };

    // Check if we have meaningful content
    if (!body && !attributes) {
      return res.status(400).json({ error: 'Could not extract content from this URL.' });
    }

    console.log('Sending data to Claude for analysis...');

    try {
      // Construct prompt for Claude
      const systemPrompt = "You are an expert at extracting structured information from Craigslist listings.";
      
      const userPrompt = `
      I have a Craigslist listing with the following content. Please extract all the requested information.
      
      Title: ${scrapedData.title}
      
      Body: ${scrapedData.body}
      
      Address from map (if available): ${scrapedData.mapAddress}
      
      Posting info: ${scrapedData.postingInfo}
      
      Attributes: ${scrapedData.attributes}
      
      Please extract the following information in JSON format:
      - address: The physical address of the listing or location information
      - listingCreator: The name of the person who created the listing
      - contactInfo: Any contact information like phone, email (if present)
      - price: The price of the listing (if available)
      - bedrooms: The number of bedrooms in the listing (just the number, like "2" or "3")
      - bathrooms: The number of bathrooms in the listing (like "1", "2", or "1.5")
      - allowsPets: Boolean (true or false) indicating if pets are allowed, based on any mentions of pets in the listing
      
      For any fields where information is not available, use an empty string for text fields or false for boolean fields.
      Format your entire response as a valid JSON object with these fields only.
      `;
      
      // Call Claude API with separate system and user messages
      const claudeResponse = await anthropic.messages.create({
        max_tokens: 1000,
        model: 'claude-3-haiku-20240307',
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt,
        }],
      });

      const assistantResponse = claudeResponse.content[0].text;
      console.log('Claude response received, length:', assistantResponse.length);

      // Try to parse the JSON from the response
      let extractedData;
      try {
        // Find JSON in the response - it might be wrapped in markdown code blocks
        const jsonMatch = assistantResponse.match(/```(?:json)?(\s*\{[\s\S]*?\}\s*)```/) || 
                          assistantResponse.match(/\{[\s\S]*\}/); 
        
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : assistantResponse;
        extractedData = JSON.parse(jsonString.trim());
      } catch (error) {
        console.error('Error parsing Claude response:', error);
        return res.status(500).json({ error: 'Failed to parse listing information. Please try again.' });
      }

      // Validate the extracted data has the expected structure
      const listingData = {
        address: extractedData.address || '',
        listingCreator: extractedData.listingCreator || '',
        contactInfo: extractedData.contactInfo || '',
        price: extractedData.price || '',
        bedrooms: extractedData.bedrooms || '',
        bathrooms: extractedData.bathrooms || '',
        allowsPets: extractedData.allowsPets || false,
      };
      
      console.log('Successfully extracted data:', listingData);
      res.json({ success: true, data: listingData });
      
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      
      // Try to extract manual fallback data
      const fallbackData = {
        address: mapAddress || '',
        listingCreator: '',
        contactInfo: '',
        price: $('.price').text().trim() || '',
        bedrooms: '',
        bathrooms: '',
        allowsPets: false
      };
      
      // Try to extract bedroom/bathroom from the attributes
      const bedBathMatch = attributes.match(/(\d+)\s*BR\s*\/\s*(\d+(?:\.\d+)?)\s*Ba/);
      if (bedBathMatch) {
        fallbackData.bedrooms = bedBathMatch[1] || '';
        fallbackData.bathrooms = bedBathMatch[2] || '';
      }
      
      console.log('Using fallback data extraction:', fallbackData);
      res.json({ success: true, data: fallbackData, fallback: true });
    }

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'An error occurred while scraping the listing.' });
  }
});

// No helper functions needed as we're using Claude for extraction

app.listen(port, () => {
  console.log(`Scraper service running on http://localhost:${port}`);
});
