import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';

export default function HomeAchievements() {
  const [approvedAchievements, setApprovedAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchYear, setSearchYear] = useState('');

  const fetchApprovedAchievements = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'achievements'));
      const approved = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => a.status === 'approved');
      setApprovedAchievements(approved);
      setFilteredAchievements(approved);
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedAchievements();
  }, []);

  useEffect(() => {
    const filtered = approvedAchievements.filter(a =>
      a.year?.toString().toLowerCase().includes(searchYear.toLowerCase())
    );
    setFilteredAchievements(filtered);
  }, [searchYear, approvedAchievements]);

  if (loading) return <div className="text-center my-5">Loading achievements...</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center fw-bold mb-4">🏅 Approved Student Achievements</h2>

      <div className="row justify-content-center mb-4">
        <div className="col-md-6 col-lg-4">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by year (e.g. 1st, 2024, Final)..."
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
          />
        </div>
      </div>

      {filteredAchievements.length === 0 ? (
        <p className="text-center">No achievements found for this year.</p>
      ) : (
        <div className="row">
          {filteredAchievements.map((a, index) => (
            <motion.div
              key={a.id}
              className="col-sm-12 col-md-6 col-lg-4 mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="card h-100 shadow-lg rounded-4 border-0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">{a.title || 'Untitled Achievement'}</h5>
                  <p className="card-text mb-2">{a.description || a.achievement}</p>

                  <ul className="list-unstyled small mt-3">
                    <li><strong>👤 Name:</strong> {a.name}</li>
                    <li><strong>🆔 Roll No:</strong> {a.rollNo}</li>
                    <li><strong>🎓 Branch:</strong> {a.branch}</li>
                    <li><strong>📅 Year:</strong> {a.year}</li>
                  </ul>

                  
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
