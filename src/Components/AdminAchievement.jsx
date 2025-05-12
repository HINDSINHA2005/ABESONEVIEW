import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';

const AdminAchievement = () => {
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'achievements'));
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        setAchievements(data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    fetchAchievements();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const achievementRef = doc(db, 'achievements', id);
      await updateDoc(achievementRef, { status: newStatus });
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const filteredAchievements = achievements.filter(a => a.status === activeTab);

  return (
    <div className="py-5 px-3" style={{ minHeight: '100vh', background: 'linear-gradient(to right, #e0eafc, #cfdef3)' }}>
      <div className="container">
        <h2 className="text-center fw-bold mb-4">🎓 Admin Panel - Achievement Management</h2>

        {/* Tabs */}
        <ul className="nav nav-pills justify-content-center mb-4">
          {['pending', 'approved', 'rejected'].map(tab => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <div className="row">
          {filteredAchievements.length === 0 ? (
            <p className="text-center">No {activeTab} achievements to display.</p>
          ) : (
            filteredAchievements.map((a, index) => (
              <motion.div
                key={a.id}
                className="col-md-6 col-lg-4 mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="card shadow-sm h-100 border-0 rounded-4">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary">{a.title || 'Untitled Achievement'}</h5>
                    <p className="card-text">{a.description || a.achievement}</p>

                    <ul className="list-unstyled small mt-2">
                      <li><strong>👤 Name:</strong> {a.name}</li>
                      <li><strong>🆔 Roll No:</strong> {a.rollNo}</li>
                      <li><strong>🏫 Branch:</strong> {a.branch}</li>
                      <li><strong>📅 Year:</strong> {a.year}</li>
                      <li><strong>📅 Semester:</strong> {a.semester}</li>

                      <li>
                        <strong>Status:</strong>{' '}
                        <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                      </li>
                    </ul>

                    <a
                      href={a.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-info btn-sm mt-2"
                    >
                      🔗 View Proof
                    </a>

                    {activeTab === 'pending' && (
                      <div className="mt-auto d-flex gap-2 mt-3">
                        <button className="btn btn-success w-50" onClick={() => handleStatusChange(a.id, 'approved')}>✅ Approve</button>
                        <button className="btn btn-danger w-50" onClick={() => handleStatusChange(a.id, 'rejected')}>❌ Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAchievement;
