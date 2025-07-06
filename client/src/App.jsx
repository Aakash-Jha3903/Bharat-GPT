import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatInterface from "./ChatInterface";
import Signup from "./Signup";
import Login from "./Login";
import { useAuth } from "./AuthContext";

const theme = createTheme({
  palette: {
    primary: { main: "#3f51b5" },
    secondary: { main: "#4caf50" },
  },
});
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0a0a0a", paper: "#121212" },
    primary: { main: "#5c6bc0" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const { token } = useAuth();

  return (
    // <ThemeProvider theme={theme}>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Default route: redirect to /chat if logged in, else to /login */}
          <Route path="/" element={<Navigate to={token ? "/chat" : "/login"} />} />

          {/* Protected Chat Route */}
          {/* <Route path="/chat" element={token ? <ChatInterface /> : <Navigate to="/login" />} /> */}
          <Route path="/chat" element={token ? <ChatInterface /> : <Navigate to="/login" />} />


          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
