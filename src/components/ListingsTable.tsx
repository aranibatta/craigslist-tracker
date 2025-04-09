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
      field === 'url'
    ) {
      return;
    }

    setEditingCell({ listingId: listing.id, field });
    setEditValue(listing[field] as string);
  };

  const handleSaveEdit = (listing: Listing) => {
    if (!editingCell.field) return;

    const updatedListing = {
      ...listing,
      [editingCell.field]: editValue,
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
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(listing)}
          onKeyDown={(e) => handleKeyDown(e, listing)}
          autoFocus
          className="inline-edit-input"
        />
      );
    }

    // Special handling for URL field - display as link with address text
    if (field === 'address') {
      return (
        <div className="editable-cell" onClick={() => handleCellClick(listing, field)}>
          <a href={listing.url} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        </div>
      );
    }

    return (
      <div className="editable-cell" onClick={() => handleCellClick(listing, field)}>
        {value}
      </div>
    );
  };

  return (
    <div className="table-container">
      <table className="listings-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Listing Creator</th>
            <th>Contact Info</th>
            <th>Applied</th>
            <th>Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className={listing.hasApplied ? 'applied' : ''}>
              <td>
                {renderEditableCell(listing, 'address', listing.address)}
              </td>
              <td>
                {renderEditableCell(listing, 'listingCreator', listing.listingCreator)}
              </td>
              <td>
                {renderEditableCell(listing, 'contactInfo', listing.contactInfo)}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={listing.hasApplied}
                  onChange={() => onToggleApplied(listing)}
                />
              </td>
              <td>{formatDate(listing.dateAdded)}</td>
              <td className="actions">
                <button 
                  onClick={() => onEdit(listing)} 
                  className="edit-btn"
                  aria-label="Edit listing"
                  title="Edit all fields at once"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(listing.id)}
                  className="delete-btn"
                  aria-label="Delete listing"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListingsTable;
