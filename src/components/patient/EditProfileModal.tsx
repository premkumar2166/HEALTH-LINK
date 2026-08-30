'use client';

import React, { useState } from 'react';
import { Patient } from '@/types/healthlink';
import { User, Phone, Mail, Globe, Calendar, Heart, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onProfileUpdated: (updated: Patient) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(patient.name || '');
  const [email, setEmail] = useState(patient.email || '');
  const [phoneNumber, setPhoneNumber] = useState(patient.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(patient.dateOfBirth || '');
  const [gender, setGender] = useState(patient.gender || 'Male');
  const [preferredLanguage, setPreferredLanguage] = useState(patient.preferredLanguage || 'English (US)');
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContact?.name || '');
  const [emergencyRel, setEmergencyRel] = useState(patient.emergencyContact?.relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter a valid full name (at least 2 characters).');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          dateOfBirth,
          gender,
          preferredLanguage,
          emergencyContact: {
            name: emergencyName.trim(),
            relationship: emergencyRel.trim(),
            phone: emergencyPhone.trim(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Unable to update your profile right now. Please try again.');
      } else {
        // Update local session storage if name changed
        const sessionStr = localStorage.getItem('healthlink_session');
        if (sessionStr) {
          const sess = JSON.parse(sessionStr);
          sess.name = data.patient.name;
          localStorage.setItem('healthlink_session', JSON.stringify(sess));
        }

        onProfileUpdated(data.patient);
        onClose();
      }
    } catch (err) {
      setErrorMessage('Network failure. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 space-y-6 my-8 animate-scale-up relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <User size={14} />
            <span>Personal Information</span>
          </div>
          <h2 id="edit-profile-title" className="text-xl font-extrabold text-gray-900">
            Edit Patient Profile Details
          </h2>
          <p className="text-xs text-gray-500">
            Update your legal demographics and emergency contact information securely.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
                <User size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
                <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
                <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
                <Calendar size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Preferred Language
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
                <Globe size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Emergency Contact Sub-section */}
          <div className="pt-3 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Heart size={14} className="text-red-600" />
              <span>Emergency Contact</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse, Parent"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
