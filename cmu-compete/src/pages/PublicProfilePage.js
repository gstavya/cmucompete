// src/pages/PublicProfilePage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

const sports = ["pingpong", "pool", "foosball", "basketball1v1", "tennis", "beerpong"];

export default function PublicProfilePage() {
  const { andrewID } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!andrewID) return;

      try {
        // Get user data from users collection
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("email", "==", `${andrewID}@andrew.cmu.edu`));
        const userSnap = await getDocs(userQuery);
        
        if (userSnap.empty) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userDoc = userSnap.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };
        setUserData(user);

        // Get all completed matches for the user
        const matchesRef = collection(db, "matches_completed");
        const matchesQuery = query(
          matchesRef,
          where("challengerAndrewID", "==", andrewID)
        );
        const opponentMatchesQuery = query(
          matchesRef,
          where("opponentAndrewID", "==", andrewID)
        );

        const [matchesSnap, opponentMatchesSnap] = await Promise.all([
          getDocs(matchesQuery),
          getDocs(opponentMatchesQuery)
        ]);

        const allMatches = [
          ...matchesSnap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            playerType: "challenger",
            player1AndrewID: doc.data().challengerAndrewID,
            player2AndrewID: doc.data().opponentAndrewID,
            player1Score: doc.data().challengerScore,
            player2Score: doc.data().opponentScore
          })),
          ...opponentMatchesSnap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            playerType: "opponent",
            player1AndrewID: doc.data().challengerAndrewID,
            player2AndrewID: doc.data().opponentAndrewID,
            player1Score: doc.data().challengerScore,
            player2Score: doc.data().opponentScore
          }))
        ];

        // Sort by date (most recent first) for display
        allMatches.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setAllMatches(allMatches);
        setRecentMatches(allMatches.slice(0, 10));
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [andrewID]);

  const getELOForSport = (sport) => {
    return userData?.elo?.[sport] || 1000;
  };

  const getBestSport = () => {
    if (!userData?.elo) return "None";
    
    let bestSport = "";
    let highestELO = 1000;
    
    Object.entries(userData.elo).forEach(([sport, elo]) => {
      if (elo > highestELO) {
        highestELO = elo;
        bestSport = sport;
      }
    });
    
    return bestSport || "None";
  };

  const getTotalMatches = () => {
    return allMatches.length;
  };

  const getWinRate = () => {
    if (allMatches.length === 0) return "0%";
    
    const wins = allMatches.filter(match => {
      if (match.playerType === "challenger") {
        return match.player1Score > match.player2Score;
      } else {
        return match.player2Score > match.player1Score;
      }
    }).length;
    
    return `${Math.round((wins / allMatches.length) * 100)}%`;
  };

  const getWins = () => {
    return allMatches.filter(match => {
      if (match.playerType === "challenger") {
        return match.player1Score > match.player2Score;
      } else {
        return match.player2Score > match.player1Score;
      }
    }).length;
  };

  const getLosses = () => {
    return allMatches.length - getWins();
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: "white", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
        borderRadius: "16px", 
        padding: "24px",
        textAlign: "center",
        maxWidth: "800px",
        margin: "30px auto"
      }}>
        <p style={{ color: "#b91c1c" }}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: "white", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
        borderRadius: "16px", 
        padding: "24px",
        textAlign: "center",
        maxWidth: "800px",
        margin: "30px auto"
      }}>
        <h2 style={{ color: "#b91c1c", marginBottom: "16px" }}>Profile Not Found</h2>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>{error}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#b91c1c",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "16px"
          }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "white", 
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
      borderRadius: "16px", 
      padding: "24px",
      maxWidth: "800px",
      margin: "30px auto"
    }}>
      <h2 style={{ 
        fontSize: "24px", 
        fontWeight: "bold", 
        marginBottom: "24px", 
        color: "#b91c1c", 
        textAlign: "center" 
      }}>
        {andrewID}'s Profile
      </h2>
      
      {/* User Info Section */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "16px", 
        marginBottom: "24px",
        padding: "16px",
        backgroundColor: "#fef2f2",
        borderRadius: "12px"
      }}>
        <img 
          src={userData?.photoURL || `https://ui-avatars.com/api/?name=${andrewID}&background=b91c1c&color=fff`} 
          alt="profile" 
          style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            border: "4px solid #fecaca",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            objectFit: "cover"
          }} 
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: "20px", 
            fontWeight: "bold", 
            color: "#1f2937", 
            margin: "0 0 4px 0" 
          }}>
            {userData?.displayName || andrewID}
          </h3>
          <p style={{ 
            color: "#6b7280", 
            fontSize: "14px", 
            margin: "0 0 4px 0" 
          }}>
            {userData?.email}
          </p>
          <p style={{ 
            color: "#b91c1c", 
            fontSize: "14px", 
            fontWeight: "600", 
            margin: 0 
          }}>
            @{andrewID}
          </p>
        </div>
      </div>

      {/* Key Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
        gap: "16px", 
        marginBottom: "24px" 
      }}>
        <div style={{ 
          textAlign: "center", 
          padding: "16px", 
          backgroundColor: "#fef2f2", 
          borderRadius: "12px",
          border: "2px solid #fecaca"
        }}>
          <div style={{ 
            fontSize: "28px", 
            fontWeight: "bold", 
            color: "#b91c1c" 
          }}>
            {getTotalMatches()}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "#6b7280", 
            fontWeight: "600" 
          }}>
            Total Matches
          </div>
        </div>
        
        <div style={{ 
          textAlign: "center", 
          padding: "16px", 
          backgroundColor: "#f0fdf4", 
          borderRadius: "12px",
          border: "2px solid #bbf7d0"
        }}>
          <div style={{ 
            fontSize: "28px", 
            fontWeight: "bold", 
            color: "#16a34a" 
          }}>
            {getWins()}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "#6b7280", 
            fontWeight: "600" 
          }}>
            Wins
          </div>
        </div>
        
        <div style={{ 
          textAlign: "center", 
          padding: "16px", 
          backgroundColor: "#fef2f2", 
          borderRadius: "12px",
          border: "2px solid #fecaca"
        }}>
          <div style={{ 
            fontSize: "28px", 
            fontWeight: "bold", 
            color: "#dc2626" 
          }}>
            {getLosses()}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "#6b7280", 
            fontWeight: "600" 
          }}>
            Losses
          </div>
        </div>
        
        <div style={{ 
          textAlign: "center", 
          padding: "16px", 
          backgroundColor: "#eff6ff", 
          borderRadius: "12px",
          border: "2px solid #bfdbfe"
        }}>
          <div style={{ 
            fontSize: "28px", 
            fontWeight: "bold", 
            color: "#2563eb" 
          }}>
            {getWinRate()}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "#6b7280", 
            fontWeight: "600" 
          }}>
            Win Rate
          </div>
        </div>
      </div>

      {/* ELO Ratings */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          color: "#1f2937", 
          marginBottom: "12px" 
        }}>
          ELO Ratings
        </h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "8px" 
        }}>
          {sports.map(sport => (
            <div key={sport} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "12px", 
              backgroundColor: "#f9fafb", 
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <span style={{ 
                fontWeight: "600", 
                color: "#374151",
                textTransform: "capitalize",
                fontSize: "14px"
              }}>
                {sport.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span style={{ 
                color: "#b91c1c", 
                fontWeight: "bold",
                fontSize: "16px"
              }}>
                {getELOForSport(sport)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sport */}
      <div style={{ 
        marginBottom: "24px", 
        padding: "16px", 
        backgroundColor: "#fef3c7", 
        borderRadius: "12px",
        border: "2px solid #fbbf24"
      }}>
        <h3 style={{ 
          fontSize: "16px", 
          fontWeight: "bold", 
          color: "#92400e", 
          margin: "0 0 8px 0" 
        }}>
          🏆 Best Sport
        </h3>
        <p style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          color: "#b45309", 
          margin: 0,
          textTransform: "capitalize"
        }}>
          {getBestSport().replace(/([A-Z])/g, ' $1').trim()}
        </p>
      </div>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            fontSize: "18px", 
            fontWeight: "bold", 
            color: "#1f2937", 
            marginBottom: "12px" 
          }}>
            Recent Matches
          </h3>
          <div style={{ 
            maxHeight: "200px", 
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: "8px"
          }}>
            {recentMatches.map(match => {
              const isWin = match.playerType === "challenger" 
                ? match.player1Score > match.player2Score 
                : match.player2Score > match.player1Score;
              
              return (
                <div key={match.id} style={{ 
                  padding: "12px", 
                  borderBottom: "1px solid #f3f4f6",
                  backgroundColor: isWin ? "#f0fdf4" : "#fef2f2"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "4px"
                  }}>
                    <span style={{ 
                      fontWeight: "600",
                      fontSize: "14px"
                    }}>
                      {match.player1AndrewID} vs {match.player2AndrewID}
                    </span>
                    <span style={{ 
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: isWin ? "#16a34a" : "#dc2626",
                      backgroundColor: isWin ? "#dcfce7" : "#fecaca",
                      padding: "2px 8px",
                      borderRadius: "12px"
                    }}>
                      {isWin ? 'W' : 'L'}
                    </span>
                  </div>
                  <div style={{ 
                    color: "#6b7280", 
                    fontSize: "12px" 
                  }}>
                    {match.sport} • {match.player1Score}-{match.player2Score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#b91c1c",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "16px",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#991b1b";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#b91c1c";
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
