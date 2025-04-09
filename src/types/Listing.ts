export interface Listing {
  id: string;
  url: string;
  address: string;
  listingCreator: string;
  contactInfo: string;
  hasApplied: boolean;
  price?: string;
  allowsPets?: boolean;
  notes?: string;
  dateAdded: string;
  dateUpdated: string;
}
