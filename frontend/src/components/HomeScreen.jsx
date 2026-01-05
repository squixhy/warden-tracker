import React from 'react';

export default function HomeScreen({ onCheckIn, onAdmin }) {
  return (
    <div className="card">
      <div className="card-header">
        <p className="card-label">Fire Warden Portal</p>
        <h1 className="card-title">Welcome</h1>
        <p className="card-description">
          Select an option below to continue
        </p>
      </div>
      <div className="card-body">
        <div className="nav-options">
          <button
            className="nav-btn primary"
            onClick={onCheckIn}
            aria-label="Check in or update your location"
          >
            <span className="nav-btn-content">
              <span className="nav-btn-title">Check In / Update Location</span>
              <span className="nav-btn-desc">Record your presence or change site</span>
            </span>
            <span className="nav-btn-arrow" aria-hidden="true">→</span>
          </button>

          <button
            className="nav-btn"
            onClick={onAdmin}
            aria-label="Access administrator dashboard"
          >
            <span className="nav-btn-content">
              <span className="nav-btn-title">Administrator Access</span>
              <span className="nav-btn-desc">View active wardens and reports</span>
            </span>
            <span className="nav-btn-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
