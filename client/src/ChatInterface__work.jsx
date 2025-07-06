import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send as SendIcon } from "@mui/icons-material";
import MarkdownRenderer from "./MarkdownRenderer";
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
} from "@mui/material";

const ChatInterface = () => {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const userMessage = { text: prompt, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setPrompt("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/process-prompt/",
                {
                    prompt: prompt,
                }
            );

            const aiMessage = { text: response.data.response, sender: "ai" };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                text: "Error processing your request",
                sender: "ai",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                maxWidth: "900px",
                margin: "0 auto",
                padding: "20px",
                backgroundColor: "#f5f5f5",
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    mb: 1,
                    color: "#3f51b5",
                    textAlign: "center",
                    fontWeight: "bold",
                }}
            >
                Grok.Ai
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    flexGrow: 1,
                    overflow: "auto",
                    mb: 2,
                    p: 2,
                    backgroundColor: "white",
                }}
            >
                <List>
                    {messages.map((message, index) => (
                        <React.Fragment key={index}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: message.sender === "user" ? "flex-end" : "flex-start",
                                    mb: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: message.sender === "user" ? "70%" : "100%",
                                        bgcolor: message.sender === "user" ? "#e3f2fd" : "#f0fdf4",
                                        color: "#000",
                                        borderRadius: 2,
                                        p: 2,
                                        // wordWrap: "break-word",
                                        whiteSpace: "collapse",
                                        // whiteSpace: "wrap",
                                        // fontSize: "0.95rem",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    <MarkdownRenderer>
                                        {/* {message.text} */}
                                        {message.text.replace(/(\[.*?\])/g, "$1\n")}
                                    </MarkdownRenderer>
                                </Box>
                            </Box>
                        </React.Fragment>
                    ))}
                    {isLoading && (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </List>
            </Paper>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex" }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    sx={{
                        mr: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "24px",
                            backgroundColor: "white",
                        },
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    sx={{
                        borderRadius: "24px",
                        minWidth: "56px",
                        height: "56px",
                    }}
                >
                    <SendIcon />
                </Button>
            </Box>
        </Box >
    );
};

export default ChatInterface;
