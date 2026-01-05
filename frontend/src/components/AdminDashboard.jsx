import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { fetchWardens, LOCATIONS } from '../api.js';

const ADMIN_PASSWORD = 'Winchester2026';
const PAGE_SIZE = 10;

export default function AdminDashboard({ isAuthenticated, onAuthenticate, onLogout, onBack }) {
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [wardens, setWardens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadWardens = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchWardens();
      setWardens(data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load warden data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWardens();
    }
  }, [isAuthenticated, loadWardens]);

  const handleLogin = useCallback((e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthError('');
      onAuthenticate();
    } else {
      setAuthError('Invalid password. Please try again.');
    }
  }, [password, onAuthenticate]);

  const locationSummary = useMemo(() => {
    return LOCATIONS
      .map((location) => ({
        location,
        count: wardens.filter((w) => w.location === location).length
      }))
      .filter((item) => item.count > 0);
  }, [wardens]);

  const totalPages = Math.ceil(wardens.length / PAGE_SIZE);
  const paginatedWardens = wardens.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="card">
        <div className="card-header">
          <p className="card-label">Restricted Access</p>
          <h1 className="card-title">Administrator Login</h1>
          <p className="card-description">
            Enter the administrator password to continue
          </p>
        </div>
        <div className="card-body">
          <div className="back-link">
            <button className="btn btn-ghost" onClick={onBack} type="button">
              ← Back
            </button>
          </div>

          {authError && (
            <div className="alert alert-error" role="alert">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="adminPassword">
                Password
              </label>
              <input
                id="adminPassword"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <h1 className="admin-title">Active Wardens</h1>
        <div className="admin-actions">
          <button
            className="btn btn-secondary"
            onClick={loadWardens}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn btn-ghost" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {locationSummary.length > 0 && (
        <div className="summary-grid">
          {locationSummary.map((item) => (
            <div className="summary-item" key={item.location}>
              <p className="summary-location">{item.location}</p>
              <p className="summary-count">{item.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Warden Records</h2>
          <span className="data-table-count">{wardens.length} total</span>
        </div>

        <div className="data-table-wrap">
          <table className="data-table" role="table">
            <thead>
              <tr>
                <th scope="col">Staff ID</th>
                <th scope="col">Name</th>
                <th scope="col">Building</th>
                <th scope="col">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWardens.map((warden) => (
                <tr key={warden.staffNumber}>
                  <td>{warden.staffNumber}</td>
                  <td>{warden.firstName} {warden.surname}</td>
                  <td>{warden.location}</td>
                  <td>{formatDateTime(warden.lastUpdated)}</td>
                </tr>
              ))}
              {wardens.length === 0 && (
                <tr>
                  <td colSpan="4" className="data-table-empty">
                    No active wardens on record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
