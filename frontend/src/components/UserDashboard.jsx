import React, { useState, useCallback } from 'react';
import { updateWardenLocation, checkoutWarden, amendWardenDetails, LOCATIONS } from '../api.js';

export default function UserDashboard({ session, onClockOff, onUpdateSession, onBack }) {
  const [newLocation, setNewLocation] = useState(session.location);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(session.firstName);
  const [editSurname, setEditSurname] = useState(session.surname);
  const [editLocation, setEditLocation] = useState(session.location);

  const handleLocationUpdate = useCallback(async () => {
    if (newLocation === session.location) return;

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await updateWardenLocation(session.staffNumber, newLocation);
      onUpdateSession({
        ...session,
        location: newLocation,
        lastUpdated: new Date().toISOString()
      });
      setSuccessMessage('Location updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update location.');
    } finally {
      setIsLoading(false);
    }
  }, [session, newLocation, onUpdateSession]);

  const handleAmendDetails = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const updates = {};
    if (editFirstName.trim() !== session.firstName) {
      updates.firstName = editFirstName.trim();
    }
    if (editSurname.trim() !== session.surname) {
      updates.surname = editSurname.trim();
    }
    if (editLocation !== session.location) {
      updates.location = editLocation;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    try {
      await amendWardenDetails(session.staffNumber, updates);
      onUpdateSession({
        ...session,
        firstName: editFirstName.trim(),
        surname: editSurname.trim(),
        location: editLocation,
        lastUpdated: new Date().toISOString()
      });
      setNewLocation(editLocation);
      setIsEditing(false);
      setSuccessMessage('Details amended successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to amend details.');
    } finally {
      setIsLoading(false);
    }
  }, [session, editFirstName, editSurname, editLocation, onUpdateSession]);

  const handleCancelEdit = useCallback(() => {
    setEditFirstName(session.firstName);
    setEditSurname(session.surname);
    setEditLocation(session.location);
    setIsEditing(false);
    setError('');
  }, [session]);

  const handleClockOff = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clock off? This will remove you from the active warden list.'
    );
    if (!confirmed) return;

    setError('');
    setIsLoading(true);

    try {
      await checkoutWarden(session.staffNumber);
      onClockOff();
    } catch (err) {
      setError(err.message || 'Failed to clock off.');
      setIsLoading(false);
    }
  }, [session.staffNumber, onClockOff]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <p className="card-label">Active Session</p>
        <h1 className="card-title">Warden Dashboard</h1>
        <p className="card-description">
          You are currently checked in as an active fire warden
        </p>
      </div>

      <div className="card-body">
        <div className="back-link">
          <button className="btn btn-ghost" onClick={onBack} type="button">
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="status">
            {successMessage}
          </div>
        )}

        <div className="status-panel">
          <div className="status-header">
            <span className="status-badge">
              <span className="status-indicator"></span>
              Checked In
            </span>
            {!isEditing && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                Amend Details
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleAmendDetails} className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="editFirstName">
                  First Name
                </label>
                <input
                  id="editFirstName"
                  type="text"
                  className="form-input"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editSurname">
                  Surname
                </label>
                <input
                  id="editSurname"
                  type="text"
                  className="form-input"
                  value={editSurname}
                  onChange={(e) => setEditSurname(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editLocation">
                  Location
                </label>
                <select
                  id="editLocation"
                  className="form-select"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  disabled={isLoading}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="status-grid">
              <div className="status-row">
                <span className="status-label">Name</span>
                <span className="status-value">
                  {session.firstName} {session.surname}
                </span>
              </div>
              <div className="status-row">
                <span className="status-label">Staff ID</span>
                <span className="status-value">{session.staffNumber}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Current Location</span>
                <span className="status-value">{session.location}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Checked In</span>
                <span className="status-value">
                  {formatDateTime(session.createdAt)}
                </span>
              </div>
              {session.lastUpdated && session.lastUpdated !== session.createdAt && (
                <div className="status-row">
                  <span className="status-label">Last Updated</span>
                  <span className="status-value">
                    {formatDateTime(session.lastUpdated)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="action-group">
          <p className="action-label">Change Location</p>
          <div className="action-row">
            <select
              className="form-select"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              disabled={isLoading}
              aria-label="Select new location"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleLocationUpdate}
              disabled={isLoading || newLocation === session.location}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        <div className="action-group">
          <p className="action-label">End Session</p>
          <button
            className="btn btn-danger btn-full"
            onClick={handleClockOff}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Clock Off'}
          </button>
        </div>
      </div>
    </div>
  );
}
