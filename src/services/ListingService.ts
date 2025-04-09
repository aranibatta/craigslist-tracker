import { Listing } from '../types/Listing';

const STORAGE_KEY = 'craigslist-listings';

export const ListingService = {
  getListings: (): Listing[] => {
    const storedListings = localStorage.getItem(STORAGE_KEY);
    return storedListings ? JSON.parse(storedListings) : [];
  },

  addListing: (listing: Omit<Listing, 'id' | 'dateAdded' | 'dateUpdated'>): Listing => {
    const listings = ListingService.getListings();
    const newListing: Listing = {
      ...listing,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...listings, newListing]));
    return newListing;
  },

  updateListing: (updatedListing: Listing): Listing => {
    const listings = ListingService.getListings();
    const updatedListingWithDate = {
      ...updatedListing,
      dateUpdated: new Date().toISOString()
    };
    
    const updatedListings = listings.map(listing => 
      listing.id === updatedListing.id ? updatedListingWithDate : listing
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings));
    return updatedListingWithDate;
  },

  deleteListing: (id: string): void => {
    const listings = ListingService.getListings();
    const filteredListings = listings.filter(listing => listing.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredListings));
  }
};
