import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";

const sports = ["pingpong", "pool", "foosball", "basketball1v1", "tennis", "beerpong"];

export default function Leaderboard({ currentAndrewID }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [challenging, setChallenging] = useState(null);
  const [showChallengeForm, setShowChallengeForm] = useState(null);
  const [challengeForm, setChallengeForm] = useState({
    date: '',
    time: '',
    place: '',
    dare: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChallenge = async (opponent, sport) => {
    if (!currentAndrewID) {
      alert("Please log in to challenge someone!");
      return;
    }

    if (opponent.email?.split('@')[0] === currentAndrewID) {
      alert("You cannot challenge yourself!");
      return;
    }

    setChallenging(`${opponent.id}-${sport}`);

    try {
      // Create challenge request with enhanced details
      const challengeData = {
        challengerUID: auth.currentUser.uid,
        challengerAndrewID: currentAndrewID,
        opponentUID: opponent.id,
        opponentAndrewID: opponent.email?.split('@')[0],
        sport: sport,
        status: "pending",
        createdAt: serverTimestamp(),
        scheduledDate: challengeForm.date ? new Date(challengeForm.date) : null,
        scheduledTime: challengeForm.time || null,
        place: challengeForm.place || null,
        dare: challengeForm.dare || null,
        message: `${currentAndrewID} has challenged you to a ${sport} match!${challengeForm.dare ? ` Loser has to: ${challengeForm.dare}` : ''}`
      };

      await addDoc(collection(db, "challenges"), challengeData);

      alert(`Challenge sent to ${opponent.displayName || opponent.email?.split('@')[0]} for ${sport}!`);
      
      // Reset form and close
      setChallengeForm({ date: '', time: '', place: '', dare: '' });
      setShowChallengeForm(null);
    } catch (err) {
      console.error("Error sending challenge:", err);
      alert("Failed to send challenge. Please try again.");
    } finally {
      setChallenging(null);
    }
  };

  const openChallengeForm = (opponent, sport) => {
    setShowChallengeForm(`${opponent.id}-${sport}`);
    setChallengeForm({ date: '', time: '', place: '', dare: '' });
  };

  const closeChallengeForm = () => {
    setShowChallengeForm(null);
    setChallengeForm({ date: '', time: '', place: '', dare: '' });
  };

  if (loading) return <p style={{ color: "#b91c1c", textAlign: "center", marginTop: "30px" }}>Loading leaderboard...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#b91c1c", marginBottom: "30px", textAlign: "center" }}>
        Leaderboards
      </h2>

      {sports.map((sport) => {
        const sorted = [...users].sort(
          (a, b) => (b.elo?.[sport] || 1000) - (a.elo?.[sport] || 1000)
        );

        return (
          <div key={sport} style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "bold", color: "#ef4444", marginBottom: "15px" }}>
              {sport.toUpperCase()}
            </h3>
            {sorted.map((user, i) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  backgroundColor: "#ffe5e5",
                  borderRadius: "12px",
                  marginBottom: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  border: i === 0 ? "2px solid #b91c1c" : "1px solid #ef4444",
                  fontWeight: i === 0 ? "bold" : "normal",
                  fontSize: "16px",
                }}
              >
                <span>{i + 1}. {user.displayName || user.andrewID || user.email?.split('@')[0] || "(Unknown)"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>{user.elo?.[sport] || 1000}</span>
                  {currentAndrewID && user.email?.split('@')[0] !== currentAndrewID && (
                    <button
                      onClick={() => openChallengeForm(user, sport)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}
                    >
                      Challenge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Challenge Form Modal */}
      {showChallengeForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ color: '#b91c1c', marginBottom: '20px', textAlign: 'center' }}>
              Send Challenge
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#660000' }}>
                Date (Optional)
              </label>
              <input
                type="date"
                value={challengeForm.date}
                onChange={(e) => setChallengeForm({...challengeForm, date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#660000' }}>
                Time (Optional)
              </label>
              <input
                type="time"
                value={challengeForm.time}
                onChange={(e) => setChallengeForm({...challengeForm, time: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#660000' }}>
                Place (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Skibo Gym, UC Table Tennis Room"
                value={challengeForm.place}
                onChange={(e) => setChallengeForm({...challengeForm, place: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#660000' }}>
                Dare for Loser (Optional)
              </label>
              <textarea
                placeholder="e.g., Buy the winner lunch, Do 20 push-ups, Wear a funny hat for a day"
                value={challengeForm.dare}
                onChange={(e) => setChallengeForm({...challengeForm, dare: e.target.value})}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeChallengeForm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const [opponentId, sport] = showChallengeForm.split('-');
                  const opponent = users.find(u => u.id === opponentId);
                  if (opponent) {
                    handleChallenge(opponent, sport);
                  }
                }}
                disabled={challenging}
                className="cmu-button"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                {challenging ? 'Sending...' : 'Send Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
