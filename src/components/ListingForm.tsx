import React, { useState, useEffect } from 'react';
import { Listing } from '../types/Listing';
import { ScraperService } from '../services/ScraperService';

interface ListingFormProps {
  onSubmit: (listing: Omit<Listing, 'id' | 'dateAdded' | 'dateUpdated'>) => void;
  initialData?: Listing;
  onCancel: () => void;
}

const ListingForm: React.FC<ListingFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    url: '',
    address: '',
    listingCreator: '',
    contactInfo: '',
    price: '',
    allowsPets: false,
    hasApplied: false,
    notes: ''
  });
  
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        url: initialData.url,
        address: initialData.address,
        listingCreator: initialData.listingCreator,
        contactInfo: initialData.contactInfo,
        price: initialData.price || '',
        allowsPets: initialData.allowsPets || false,
        hasApplied: initialData.hasApplied,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Reset scraping statuses when URL changes
    if (name === 'url') {
      setScrapeSuccess(false);
      setScrapeError(null);
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleScrape = async () => {
    if (!formData.url) {
      setScrapeError('Please enter a URL to scrape');
      return;
    }
    
    setScraping(true);
    setScrapeError(null);
    setScrapeSuccess(false);
    
    try {
      const response = await ScraperService.scrapeListing(formData.url);
      
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          address: response.data?.address || prev.address,
          listingCreator: response.data?.listingCreator || prev.listingCreator,
          contactInfo: response.data?.contactInfo || prev.contactInfo,
          price: response.data?.price || prev.price,
          allowsPets: response.data?.allowsPets || prev.allowsPets
        }));
        setScrapeSuccess(true);
      } else {
        setScrapeError(response.error || 'Failed to scrape listing details');
      }
    } catch (error) {
      setScrapeError('An error occurred while scraping');
      console.error(error);
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <h2>{initialData ? 'Edit Listing' : 'Add New Listing'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group url-group">
          <label htmlFor="url">Listing URL *</label>
          <div className="url-input-container">
            <input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://craigslist.org/..."
              className={scrapeSuccess ? 'scrape-success' : ''}
            />
            <button 
              type="button" 
              onClick={handleScrape}
              disabled={scraping || !formData.url}
              className="scrape-btn"
            >
              {scraping ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
          {scrapeError && <div className="scrape-error">{scrapeError}</div>}
          {scrapeSuccess && <div className="scrape-success-msg">✓ Data scraped successfully</div>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="123 Main St, City, State"
          />
        </div>

        <div className="form-group">
          <label htmlFor="listingCreator">Listing Creator</label>
          <input
            id="listingCreator"
            name="listingCreator"
            type="text"
            value={formData.listingCreator}
            onChange={handleChange}
            placeholder="Name of person who created the listing"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactInfo">Contact Information</label>
          <input
            id="contactInfo"
            name="contactInfo"
            type="text"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="Email, phone, etc."
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            name="price"
            type="text"
            value={formData.price}
            onChange={handleChange}
            placeholder="$1000/month"
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="allowsPets">
            <input
              id="allowsPets"
              name="allowsPets"
              type="checkbox"
              checked={formData.allowsPets}
              onChange={handleChange}
            />
            Allows Pets
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="hasApplied">
            <input
              id="hasApplied"
              name="hasApplied"
              type="checkbox"
              checked={formData.hasApplied}
              onChange={handleChange}
            />
            Applied
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes about this listing"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {initialData ? 'Update' : 'Add'} Listing
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
