export interface Listing {
  id: string;
  url: string;
  address: string;
  listingCreator: string;
  contactInfo: string;
  hasApplied: boolean;
  notes?: string;
  dateAdded: string;
  dateUpdated: string;
}
