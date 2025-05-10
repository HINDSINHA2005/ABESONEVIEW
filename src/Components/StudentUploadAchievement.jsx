// src/components/StudentUploadAchievement.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

const StudentUploadAchievement = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    admissionNo: '',
    branch: '',
    year: '',
    title: '',
    description: '',
    driveLink: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const driveLinkPattern = /^https:\/\/drive\.google\.com\/.*$/;
    if (!formData.driveLink.match(driveLinkPattern)) {
      setError('Please enter a valid Google Drive link.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        status: 'pending',
        timestamp: new Date(),
      };

      const docRef = doc(db, 'achievements', formData.rollNo);
      await setDoc(docRef, dataToSubmit);

      setFormData({
        name: '',
        rollNo: '',
        admissionNo: '',
        branch: '',
        year: '',
        title: '',
        description: '',
        driveLink: '',
      });
      alert('Achievement submitted successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="container mt-5 p-4 bg-light rounded shadow"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-center mb-4">🏆 Submit Your Achievement</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Student Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Roll Number</label>
            <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Admission Number</label>
            <input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Branch</label>
            <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Year</label>
            <select name="year" value={formData.year} onChange={handleChange} className="form-select" required>
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Achievement Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="3" required></textarea>
          </div>
          <div className="col-12">
            <label className="form-label">Google Drive Link (Proof)</label>
            <input type="url" name="driveLink" value={formData.driveLink} onChange={handleChange} className="form-control" placeholder="https://drive.google.com/..." required />
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <div className="d-grid mt-4">
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Achievement'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StudentUploadAchievement;
