import { Button, Col } from "react-bootstrap";
import { useEffect } from "react";
import axios from "axios";

const Login = () => {
  const handleYahooLogin = () => {
    window.location.href = "https://nhl-fantasy-helper-server.onrender.com/auth/yahoo";
  };

  // Fetch Fantasy Data after login
  const fetchFantasyData = async () => {
    try {
      const response = await axios.get("https://nhl-fantasy-helper-server.onrender.comfantasy-data", {
        withCredentials: true, // Allow sending cookies
      });
      console.log("Fantasy Data:", response.data);
      // Handle fantasy data as needed (e.g., save to state, render, etc.)
    } catch (error) {
      console.error("Error fetching fantasy data:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in, you may want to implement a better user state check
    const checkUser = async () => {
      const response = await axios.get("https://nhl-fantasy-helper-server.onrender.com/fantasy-data", {
        withCredentials: true, // Include cookies for session
      });
      if (response.status === 200) {
        console.log("User is logged in. Fetching fantasy data...");
        fetchFantasyData();
      }
    };

    checkUser();
  }, []);

  return (
    <Col sm={3} lg="auto" className="mb-3">
      <Button size="sm" onClick={handleYahooLogin}>
        Login
      </Button>
    </Col>
  );
};

export default Login;
