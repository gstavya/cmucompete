// src/components/Profile.js
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Profile({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      // Optionally, redirect to login page
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
      alert("Error logging out");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-red-700">Profile</h2>
      <div className="flex items-center space-x-4 mb-4">
        <img src={user.photoURL} alt="profile" className="w-20 h-20 rounded-full border-4 border-red-200 shadow-md" />
        <div>
          <p className="font-semibold text-gray-800">{user.displayName}</p>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors duration-200 font-medium"
      >
        Logout
      </button>
    </div>
  );
}
