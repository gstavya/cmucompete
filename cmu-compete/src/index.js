// src/index.js
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { auth, googleAuthProvider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./index.css";

// Login page
function Login() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;

      if (!user.email.endsWith("@andrew.cmu.edu")) {
        alert("You must sign in with your AndrewID (@andrew.cmu.edu)");
        await auth.signOut();
        return;
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">CMU Compete</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Sign in with AndrewID
      </button>
    </div>
  );
}

// Root wrapper
function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email.endsWith("@andrew.cmu.edu")) {
        // Auto-create Firestore user doc if not exists
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            elo: {
              pingpong: 1200,
              pool: 1200,
              foosball: 1200,
              basketball: 1200,
              tennis: 1200,
              beerpong: 1200,
            },
            bestAt: "",
            secondBestAt: "",
          });
        }

        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login />;

  return <App user={user} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
