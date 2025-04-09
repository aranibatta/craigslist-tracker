import React, { useState } from 'react';
import { Listing } from '../types/Listing';

interface ListingsTableProps {
  listings: Listing[];
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onToggleApplied: (listing: Listing) => void;
  onUpdateListing: (updatedListing: Listing) => void;
}

type EditableCellType = {
  listingId: string;
  field: keyof Listing | null;
};

const ListingsTable: React.FC<ListingsTableProps> = ({
  listings,
  onEdit,
  onDelete,
  onToggleApplied,
  onUpdateListing,
}) => {
  const [editingCell, setEditingCell] = useState<EditableCellType>({
    listingId: '',
    field: null,
  });

  const [editValue, setEditValue] = useState<string>('');

  if (listings.length === 0) {
    return <div className="empty-state">No listings yet. Add your first listing!</div>;
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCellClick = (listing: Listing, field: keyof Listing) => {
    // Don't make these fields editable inline
    if (
      field === 'id' ||
      field === 'dateAdded' ||
      field === 'dateUpdated' ||
      field === 'hasApplied' ||
      field === 'allowsPets' ||
      field === 'url'
    ) {
      return;
    }

    setEditingCell({ listingId: listing.id, field });
    // Ensure we're setting a string value (empty string if null/undefined)
    const fieldValue = listing[field];
    setEditValue(fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : '');
  };

  const handleSaveEdit = (listing: Listing) => {
    if (!editingCell.field) return;

    const updatedListing = {
      ...listing,
      [editingCell.field]: editValue || '',
    };

    onUpdateListing(updatedListing);
    setEditingCell({ listingId: '', field: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent, listing: Listing) => {
    if (e.key === 'Enter') {
      handleSaveEdit(listing);
    } else if (e.key === 'Escape') {
      setEditingCell({ listingId: '', field: null });
    }
  };

  const renderEditableCell = (listing: Listing, field: keyof Listing, value: any) => {
    const isEditing = editingCell.listingId === listing.id && editingCell.field === field;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue || ''} // Ensure there's always a defined value (empty string if null/undefined)
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(listing)}
          onKeyDown={(e) => handleKeyDown(e, listing)}
          autoFocus
          className="inline-edit-input"
        />
      );
    }

    // Make address field editable but not a link anymore since we have the link column
    if (field === 'address') {
      return (
        <div className="editable-cell" onClick={() => handleCellClick(listing, field)}>
          {value || ''}
        </div>
      );
    }

    return (
      <div className="editable-cell" onClick={() => handleCellClick(listing, field)}>
        {value || ''}
      </div>
    );
  };

  return (
    <div className="table-container">
      <table className="listings-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Link</th>
            <th>Listing Creator</th>
            <th>Contact Info</th>
            <th>Price</th>
            <th>Pets</th>
            <th>Applied</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className={listing.hasApplied ? 'applied' : ''}>
              <td>
                {renderEditableCell(listing, 'address', listing.address)}
              </td>
              <td className="link-cell">
                <a 
                  href={listing.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="listing-link"
                  title="Open original listing"
                >
                  <span role="img" aria-label="Open link">🔗</span>
                </a>
              </td>
              <td>
                {renderEditableCell(listing, 'listingCreator', listing.listingCreator)}
              </td>
              <td>
                {renderEditableCell(listing, 'contactInfo', listing.contactInfo)}
              </td>
              <td>
                {renderEditableCell(listing, 'price', listing.price || '')}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={listing.allowsPets}
                  onChange={() => {
                    const updatedListing = {
                      ...listing,
                      allowsPets: !listing.allowsPets
                    };
                    onUpdateListing(updatedListing);
                  }}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={listing.hasApplied}
                  onChange={() => onToggleApplied(listing)}
                />
              </td>
              <td>{formatDate(listing.dateUpdated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListingsTable;
