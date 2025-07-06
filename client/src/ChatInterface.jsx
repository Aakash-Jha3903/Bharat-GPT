import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box, TextField, Button, Typography, Paper, CircularProgress, List,
  ListItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from "@mui/material";
import { Send as SendIcon, Menu as MenuIcon } from "@mui/icons-material";
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "./AuthContext";

const ChatInterface = () => {
  const { token, logout } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef();

  const headers = { Authorization: `Bearer ${token}` };

  const fetchRooms = async () => {
    const res = await axios.get("http://localhost:8000/api/chatrooms/", { headers });
    setChatRooms(res.data);
  };

  const fetchRoomMessages = async (roomId) => {
    const res = await axios.get(`http://localhost:8000/api/chatrooms/${roomId}/`, { headers });
    setMessages(res.data.messages);
    setSelectedRoom(res.data);
  };

  const sendPrompt = async () => {
    if (!prompt.trim() || !selectedRoom) return;

    const userMsg = { sender: "user", message: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:8000/api/chatrooms/${selectedRoom.id}/prompt/`,
        { prompt },
        { headers }
      );
      const aiMsg = { sender: "ai", message: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", message: "Error from AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const res = await axios.post("http://localhost:8000/api/chatrooms/", { name: newRoomName }, { headers });
    setNewRoomName("");
    setRoomDialogOpen(false);
    fetchRooms();
    fetchRoomMessages(res.data.id);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box sx={{ display: "flex", height: "100vh", p: 2 }}>
      {/* Sidebar */}
      {showSidebar && (
        <Box sx={{ width: 250, borderRight: "1px solid #ccc", pr: 2 }}>
          <Typography variant="h6">Bharat-GPT 🤖 </Typography>
          <Button variant="outlined" fullWidth sx={{ my: 1 }} onClick={() => setRoomDialogOpen(true)}>+ New Room</Button>
          <Button variant="text" fullWidth color="error" onClick={logout}>Logout</Button>
          <Divider sx={{ my: 2 }} />
          {chatRooms.map((room) => (
            <ListItem
              key={room.id}
              button
              selected={selectedRoom?.id === room.id}
              onClick={() => fetchRoomMessages(room.id)}
              style={{
                backgroundColor: selectedRoom?.id === room.id ? "#2c2c2e" : "transparent",
                color: "#fff",
                borderRadius: 8
              }}
            >
              {room.name}
            </ListItem>
          ))}
        </Box>
      )}

      {/* Chat Window */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", px: 2 }}>
        {/* Top bar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0 }}>
          <Typography variant="h6">{selectedRoom ? selectedRoom.name : "Select a chat room"}</Typography>
          <IconButton onClick={() => setShowSidebar((prev) => !prev)} sx={{ color: "#fff" }}> 
            <MenuIcon />
          </IconButton>
        </Box>

        <Paper
          sx={{
            flex: 1,
            overflowY: "auto",
            mb: 2,
            p: 2,
            bgcolor: "#0d0d0d",
            borderRadius: 3,
            border: "1px solid #2c2c2e",
          }}
        >
          <List>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    width: msg.sender === "user" ? "60%" : "100%",
                    bgcolor: msg.sender === "user" ? "#1e1e2f" : "#121212",
                    color: "#fff",
                    boxShadow: "0px 2px 12px rgba(0,0,0,0.3)",
                    overflowWrap: "break-word",
                  }}
                >
                  <MarkdownRenderer>{msg.message}</MarkdownRenderer>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ textAlign: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        {/* Prompt input */}
        {selectedRoom && (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt();
            }}
            sx={{
              display: "flex",
              gap: 0,
              bgcolor: "#1a1a1a",
              p: 1,
              borderRadius: 3,
              border: "1px solid #2c2c2e",
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              variant="filled"
              InputProps={{
                style: {
                  backgroundColor: "#262626",
                  color: "#fff",
                  borderRadius: 8,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#5c6bc0",
                marginLeft: 1,
                color: "#fff",
                borderRadius: 2,
                "&:hover": { bgcolor: "#3f51b5" },
              }}
              disabled={isLoading}
            >
              <SendIcon />
            </Button>
          </Box>
        )}
      </Box>

      {/* Create Room Dialog */}
      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)}>
        <DialogTitle>Create Chat Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatInterface;
