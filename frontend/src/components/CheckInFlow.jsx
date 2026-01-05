import React, { useState, useCallback } from 'react';
import { checkWarden, registerWarden, LOCATIONS } from '../api.js';

const STEP = {
  LOOKUP: 'lookup',
  NEW_USER: 'newUser'
};

export default function CheckInFlow({ onBack, onCheckInSuccess }) {
  const [currentStep, setCurrentStep] = useState(STEP.LOOKUP);
  const [staffId, setStaffId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: LOCATIONS[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = useCallback(async (e) => {
    e.preventDefault();
    const trimmedId = staffId.trim();
    if (!trimmedId) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await checkWarden(trimmedId);
      if (result.found) {
        onCheckInSuccess(result.warden);
      } else {
        setCurrentStep(STEP.NEW_USER);
      }
    } catch (err) {
      setError('Unable to verify staff ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [staffId, onCheckInSuccess]);

  const handleCheckIn = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await registerWarden({
        staffNumber: staffId.trim(),
        firstName: formData.firstName.trim(),
        surname: formData.lastName.trim(),
        location: formData.location
      });

      // Fetch the created warden data and pass to dashboard
      const result = await checkWarden(staffId.trim());
      if (result.found) {
        onCheckInSuccess(result.warden);
      }
    } catch (err) {
      setError(err.message || 'Check-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [staffId, formData, onCheckInSuccess]);

  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetFlow = useCallback(() => {
    setCurrentStep(STEP.LOOKUP);
    setStaffId('');
    setFormData({ firstName: '', lastName: '', location: LOCATIONS[0] });
    setError('');
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <p className="card-label">Fire Warden Check-In</p>
        <h1 className="card-title">
          {currentStep === STEP.LOOKUP ? 'Staff Identification' : 'New Check-In'}
        </h1>
        <p className="card-description">
          {currentStep === STEP.LOOKUP
            ? 'Enter your staff ID to continue'
            : 'Complete the form to check in'}
        </p>
      </div>

      <div className="card-body">
        <div className="back-link">
          <button className="btn btn-ghost" onClick={onBack} type="button">
            ← Back
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {currentStep === STEP.LOOKUP && (
          <form onSubmit={handleLookup}>
            <div className="form-group">
              <label className="form-label" htmlFor="staffId">
                Staff ID
              </label>
              <input
                id="staffId"
                type="text"
                className="form-input"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Enter your staff ID"
                required
                autoFocus
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading || !staffId.trim()}
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        )}

        {currentStep === STEP.NEW_USER && (
          <form onSubmit={handleCheckIn}>
            <p className="card-description" style={{ marginBottom: 'var(--space-5)' }}>
              Staff ID <strong>{staffId}</strong> is not currently on site.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => updateFormField('firstName', e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => updateFormField('lastName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Location
              </label>
              <select
                id="location"
                className="form-select"
                value={formData.location}
                onChange={(e) => updateFormField('location', e.target.value)}
                required
                disabled={isLoading}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="btn-group">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Check In'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetFlow}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
