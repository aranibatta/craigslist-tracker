import React, { useState, useEffect } from 'react';
import { Listing } from '../types/Listing';
import { ListingService } from '../services/ListingService';
import ListingForm from './ListingForm';
import ListingsTable from './ListingsTable';

const ListingsManager: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentListing, setCurrentListing] = useState<Listing | undefined>(undefined);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = () => {
    const loadedListings = ListingService.getListings();
    setListings(loadedListings);
  };

  const handleAddListing = (listingData: Omit<Listing, 'id' | 'dateAdded' | 'dateUpdated'>) => {
    ListingService.addListing(listingData);
    loadListings();
    setIsFormVisible(false);
  };

  const handleUpdateListing = (listingData: Omit<Listing, 'id' | 'dateAdded' | 'dateUpdated'>) => {
    if (currentListing) {
      const updatedListing = {
        ...currentListing,
        ...listingData,
      };
      ListingService.updateListing(updatedListing);
      loadListings();
      setIsFormVisible(false);
      setCurrentListing(undefined);
    }
  };

  const handleEditListing = (listing: Listing) => {
    setCurrentListing(listing);
    setIsFormVisible(true);
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      ListingService.deleteListing(id);
      loadListings();
    }
  };

  const handleToggleApplied = (listing: Listing) => {
    const updatedListing = {
      ...listing,
      hasApplied: !listing.hasApplied
    };
    ListingService.updateListing(updatedListing);
    loadListings();
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setCurrentListing(undefined);
  };

  const handleFormSubmit = (listingData: Omit<Listing, 'id' | 'dateAdded' | 'dateUpdated'>) => {
    if (currentListing) {
      handleUpdateListing(listingData);
    } else {
      handleAddListing(listingData);
    }
  };

  return (
    <div className="listings-manager">
      <div className="control-panel">
        <div className="header-container">
          <img 
            src="/images/star-logo.svg" 
            alt="Star Logo" 
            className="header-logo" 
          />
          <h1 
            onClick={() => {
              setIsFormVisible(false);
              setCurrentListing(undefined);
            }}
            className="clickable-header"
            title="Return to main page"
          >
            Listings
          </h1>
        </div>
        {!isFormVisible && (
          <button 
            onClick={() => setIsFormVisible(true)}
            className="add-btn"
          >
            Add New Listing
          </button>
        )}
      </div>

      {isFormVisible ? (
        <ListingForm
          onSubmit={handleFormSubmit}
          initialData={currentListing}
          onCancel={handleCancelForm}
        />
      ) : (
        <ListingsTable
          listings={listings}
          onEdit={handleEditListing}
          onDelete={handleDeleteListing}
          onToggleApplied={handleToggleApplied}
          onUpdateListing={(updatedListing) => {
            ListingService.updateListing(updatedListing);
            loadListings();
          }}
        />
      )}
    </div>
  );
};

export default ListingsManager;
