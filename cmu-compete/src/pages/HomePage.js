// src/pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import MatchForm from "../components/MatchForm";
import PendingMatches from "../components/PendingMatches";
import Leaderboard from "../components/Leaderboard";
import Challenges from "../components/Challenges";

export default function HomePage({ user, currentAndrewID }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("Logged out successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
      alert("Error logging out");
    }
  };

  return (
    <>
      <header>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <div style={{width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{color: '#b91c1c', fontWeight: 'bold', fontSize: '24px'}}>C</span>
          </div>
          <h1 style={{margin: 0, fontSize: '28px', fontWeight: 'bold'}}>CMU Compete</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <span style={{color: '#ffcccc', fontSize: '14px'}}>Welcome, {currentAndrewID}</span>
          
          {/* Profile Picture Navigation */}
          <button
            onClick={() => navigate("/profile")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid white",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease-in-out",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f3f4f6"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            }}
            title="View Profile"
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="profile" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover" 
                }} 
              />
            ) : (
              <span style={{color: '#b91c1c', fontWeight: 'bold', fontSize: '16px'}}>
                {currentAndrewID?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'white',
              color: '#b91c1c',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ffcccc';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px'}}>
          <div className="cmu-card">
            <MatchForm currentAndrewID={currentAndrewID} />
          </div>

          <div className="cmu-card">
            <PendingMatches currentAndrewID={currentAndrewID} />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px'}}>
          <div className="cmu-card">
            <Challenges currentAndrewID={currentAndrewID} />
          </div>

          <div className="cmu-card">
            <Leaderboard currentAndrewID={currentAndrewID} />
          </div>
        </div>
      </main>
    </>
  );
}
