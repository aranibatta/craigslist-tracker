const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const { Anthropic } = require('@anthropic-ai/sdk');

// Load environment variables from root directory
dotenv.config({ path: '../.env' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.includes('craigslist.org')) {
      return res.status(400).json({ error: 'Invalid Craigslist URL' });
    }

    console.log(`Scraping URL: ${url}`);
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = cheerio.load(htmlContent);
    
    // Get key information from the page for Claude
    const title = $('span#titletextonly').text().trim();
    const postingBody = $('#postingbody').text().trim();
    const mapAddress = $('.mapaddress').text().trim();
    const postingInfo = $('.postinginfo').text().trim();
    
    // Also extract any visible contact information or attributes
    const attributes = [];
    $('.attrgroup').each((i, el) => {
      attributes.push($(el).text().trim());
    });

    // Compile all scraped information to send to Claude
    const scrapedData = {
      title,
      body: postingBody,
      mapAddress,
      postingInfo,
      attributes: attributes.join('\n')
    };
    
    console.log('Sending data to Claude for analysis...');
    
    // Construct prompt for Claude
    const prompt = `
    You are an expert at extracting structured information from Craigslist listings.
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
    - allowsPets: Boolean (true or false) indicating if pets are allowed, based on any mentions of pets in the listing
    
    For any fields where information is not available, use an empty string for text fields or false for boolean fields.
    Format your entire response as a valid JSON object with these five fields only.
    `;
    
    // Call Claude API
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      temperature: 0.2,
      system: 'You are an assistant specialized in extracting information from Craigslist listings. Return only valid JSON.',
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    console.log('Received response from Claude');
    
    // Extract the JSON from Claude's response
    const claudeContent = claudeResponse.content[0].text;
    let extractedData;
    
    try {
      // Try to parse the response directly as JSON
      extractedData = JSON.parse(claudeContent);
    } catch (jsonError) {
      console.log('Could not parse Claude response directly, trying to extract JSON portion');
      
      // If direct parsing fails, try to extract JSON from text
      const jsonMatch = claudeContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0]);
        } catch (innerJsonError) {
          console.error('Failed to parse extracted JSON portion:', innerJsonError);
          throw new Error('Could not parse information from AI response');
        }
      } else {
        throw new Error('Could not extract JSON data from AI response');
      }
    }
    
    // Validate the extracted data has the expected structure
    const listingData = {
      address: extractedData.address || '',
      listingCreator: extractedData.listingCreator || '',
      contactInfo: extractedData.contactInfo || '',
      price: extractedData.price || '',
      allowsPets: extractedData.allowsPets || false,
    };
    
    console.log('Successfully extracted data:', listingData);
    return res.json({ success: true, data: listingData });
  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ error: 'Failed to scrape the listing', details: error.message });
  }
});

// No helper functions needed as we're using Claude for extraction

app.listen(port, () => {
  console.log(`Scraper service running on http://localhost:${port}`);
});
