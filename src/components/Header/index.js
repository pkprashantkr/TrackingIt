import React, { useEffect, useState } from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import userSvg from "../../assets/user.svg";
import whiteLogo from "../../assets/whiteLogo.png";

function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1); // State to track opacity

  function logout() {
    auth.signOut();
    navigate("/");
  }

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle scroll event to change opacity
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Adjust opacity based on scroll position
      const newOpacity = 1 - scrollPosition / 300; // Change 300 to control the fade rate
      setOpacity(newOpacity < 0.5 ? 0.5 : newOpacity); // Ensure opacity doesn't go below 0.5
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="navbar" style={{ opacity }}>
      <a className="navbar-heading" href="/">
        <img src={whiteLogo} height="25px" width="140px" />
      </a>
      {user ? (
        <p className="navbar-link" onClick={logout}>
          <span style={{ marginRight: "1rem" }}>
            <img
              src={user.photoURL ? user.photoURL : userSvg}
              width={user.photoURL ? "32" : "24"}
              style={{ borderRadius: "50%" }}
              className="dp"
            />
          </span>
          Logout
        </p>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Header;
