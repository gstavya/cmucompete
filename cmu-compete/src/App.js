import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import React from "react";

function AppContent() {
  const [user, setUser] = useState(null);
  const [currentAndrewID, setCurrentAndrewID] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        setCurrentAndrewID(u.email.split("@")[0]);
      } else {
        setUser(null);
        setCurrentAndrewID("");
      }
    });
    return unsubscribe;
  }, []);

  if (!user) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} currentAndrewID={currentAndrewID} />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:andrewID" element={<PublicProfilePage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
