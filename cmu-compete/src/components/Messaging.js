// src/components/Messaging.js
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";

const emojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
];

export default function Messaging({ currentUser, otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(null);

  // Create a unique conversation ID based on user IDs
  const getConversationId = (user1, user2) => {
    return [user1, user2].sort().join('_');
  };

  const conversationId = getConversationId(currentUser.andrewID, otherUser.andrewID);

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    
    // Query messages for this conversation
    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      setLoading(false);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: currentUser.andrewID,
        senderName: currentUser.displayName || currentUser.andrewID,
        receiverId: otherUser.andrewID,
        receiverName: otherUser.displayName || otherUser.andrewID,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage("");
      setShowEmojis(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <p style={{ color: "#b91c1c" }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "500px",
        height: "600px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f9fafb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img 
              src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.andrewID}&background=b91c1c&color=fff`}
              alt="profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#1f2937" }}>
                {otherUser.displayName || otherUser.andrewID}
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                @{otherUser.andrewID}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#ef4444",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px"
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesRef}
          style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {messages.length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "#6b7280",
              fontStyle: "italic",
              marginTop: "50px"
            }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId === currentUser.andrewID;
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div style={{
                      textAlign: "center",
                      margin: "16px 0 8px 0",
                      fontSize: "12px",
                      color: "#6b7280",
                      fontWeight: "500"
                    }}>
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  <div style={{
                    display: "flex",
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                    marginBottom: "4px"
                  }}>
                    <div style={{
                      maxWidth: "70%",
                      padding: "8px 12px",
                      borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      backgroundColor: isOwn ? "#b91c1c" : "#f3f4f6",
                      color: isOwn ? "white" : "#1f2937",
                      fontSize: "14px",
                      wordWrap: "break-word"
                    }}>
                      {message.content}
                      <div style={{
                        fontSize: "10px",
                        opacity: 0.7,
                        marginTop: "4px",
                        textAlign: "right"
                      }}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Picker */}
        {showEmojis && (
          <div style={{
            position: "absolute",
            bottom: "80px",
            left: "20px",
            right: "20px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px",
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "4px"
          }}>
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px"
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#f3f4f6";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={sendMessage} style={{
          padding: "16px 20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: "8px",
          alignItems: "flex-end"
        }}>
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px"
            }}
          >
            😊
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "18px",
              fontSize: "14px",
              outline: "none"
            }}
            onFocus={() => setShowEmojis(false)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: newMessage.trim() ? "#b91c1c" : "#d1d5db",
              color: "white",
              cursor: newMessage.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px"
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
