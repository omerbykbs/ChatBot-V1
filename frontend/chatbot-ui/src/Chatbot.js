import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, TextField, Button, Typography, IconButton, AppBar, Toolbar, Box } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) ?? false);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    const toggleChat = () => setIsOpen((prev) => !prev);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", JSON.stringify(newMode));
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
    
        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
    
        // Show "Typing..." before fetching response
        setMessages((prev) => [...prev, { text: "Typing...", sender: "bot", typing: true }]);
    
        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: "user1", query: input })
            });
    
            if (!response.body) {
                throw new Error("No response body received.");
            }
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botResponse = "";
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                botResponse += decoder.decode(value, { stream: true });
    
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { text: botResponse, sender: "bot" };
                    return updated;
                });
            }
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { text: "Error: Unable to fetch response.", sender: "bot" };
                return updated;
            });
        }
    };

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: darkMode ? "#2e4053" : "#d5dbdb", minHeight: "100vh" }}>
            <AppBar position="static" color={darkMode ? "#909497" : "#e5e7e9"}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Chatbot AI
                    </Typography>
                    <IconButton onClick={toggleDarkMode} color="inherit">
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box sx={{ textAlign: "center", padding: "2rem" }}>
                <Typography variant="h3" gutterBottom>
                    Welcome to Chatbot AI
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Your 24/7 virtual assistant
                </Typography>
                <Button variant="contained" color="primary" onClick={toggleChat}>
                    {isOpen ? "Close Chat" : "Start Chatting"}
                </Button>
            </Box>
            {isOpen && (
                <Card sx={{
                    position: "fixed",
                    bottom: isOpen ? 80 : 0, 
                    right: 20,
                    width: 350,
                    height: isOpen ? 650 : 0,
                    boxShadow: isOpen ? 5 : 0,
                    display: "flex",
                    flexDirection: "column",
                    opacity: isOpen ? 1 : 0, 
                    transition: "opacity 0.3s ease-in-out, height 0.3s ease-in-out"
                }}>
                    <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}>
                            <Typography variant="h6" align="center">Chatbot</Typography>
                        <div ref={chatBoxRef} style={{ flex: 1, overflowY: "auto", padding: "10px", scrollBehavior: "smooth"  }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                display: "flex",
                                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                marginBottom: "10px"
                            }}>
                                <Typography sx={{
                                    backgroundColor: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                                    color: msg.sender === "user" ? "white" : "black",
                                    padding: "10px",
                                    borderRadius: "15px",
                                    maxWidth: "75%",
                                    wordWrap: "break-word",
                                    textAlign: "left",
                                    lineHeight: "1.4",
                                    fontStyle: msg.typing ? "italic" : "normal" 
                                }}>
                                    {msg.text}
                                </Typography>
                            </div>
                        ))}
                        </div>
                        <div style={{ padding: "10px" }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                sx={{ mt: 1 }}
                            />
                            <Button fullWidth variant="contained" color="primary" onClick={sendMessage} sx={{ mt: 1 }}>
                                Send
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <IconButton onClick={toggleChat} sx={{
                position: "fixed",
                bottom: 20,
                right: 20,
                backgroundColor: "#1976d2",
                color: "white",
                width: 60,
                height: 60,
                "&:hover": { backgroundColor: "#115293" }
            }}>
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </IconButton>
            
            {/* Dark Mode Toggle Button */}
            <IconButton 
                onClick={toggleDarkMode} 
                sx={{ 
                    position: "fixed", 
                    top: 20, 
                    right: 20, 
                    zIndex: 1000,
                    backgroundColor: darkMode ? "#222" : "#fff",
                    color: darkMode ? "white" : "black",
                    "&:hover": { backgroundColor: darkMode ? "#444" : "#ddd" }
                }}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* Floating Button to Toggle Chat */}
            <IconButton 
                onClick={toggleChat} 
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    backgroundColor: "#007bff",
                    color: "white",
                    width: 60,
                    height: 60,
                    "&:hover": { backgroundColor: "#0056b3" }
                }}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </IconButton>

        </Box>
    );
};


export default Chatbot;
