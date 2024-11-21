import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "./Header";
import { toast } from "react-toastify";
import { CircleUserRound, LockKeyhole, Mail } from "lucide-react";
import Google from "../assets/goolge.png";

const SignUpSignIn = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const navigate = useNavigate();

  const createUserDocument = async (user) => {
    setLoading(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName ? displayName : name,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
        });
        toast.success("Account Created!");
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
        setLoading(false);
      }
    }
  };

  const signUpWithEmail = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      await createUserDocument(user);
      toast.success("Successfully Signed Up!");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing up with email and password: ",
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithEmail = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      navigate("/dashboard");
      toast.success("Logged In Successfully!");
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing in with email and password: ",
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user);
      toast.success("User Authenticated Successfully!");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
      console.error("Error signing in with Google: ", error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="wrapper">
        {flag ? (
          <div className="signup-signin-container">
            <h2 style={{ textAlign: "center" }}>
              Log <span className="blue-text"> in</span>
            </h2>
            <form onSubmit={signUpWithEmail}>
              <div className="input-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Mail
                    strokeWidth={1}
                    height="16px"
                    width="16px"
                    style={{ marginRight: "0.5rem" }}
                  />
                  <p>Email</p>
                </div>

                <input
                  type="email"
                  placeholder="JohnDoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LockKeyhole
                    strokeWidth={1}
                    height="16px"
                    width="16px"
                    style={{ marginRight: "0.5rem" }}
                  />
                  <p>Password</p>
                </div>
                <input
                  type="password"
                  placeholder="Example123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                disabled={loading}
                className="btn"
                onClick={signInWithEmail}
              >
                {loading ? "Loading..." : " Log In with Email and Password"}
              </button>
            </form>
            <p style={{ textAlign: "center", margin: 0 }}>or</p>
            <button
              disabled={loading}
              className="btn btn-blue"
              onClick={signInWithGoogle}
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Log in with Google
                  <img
                    src={Google}
                    alt="Google"
                    height="20px"
                    width="20px"
                    style={{ marginLeft: "0.6rem" }}
                  />
                </>
              )}
            </button>
            <p
              onClick={() => setFlag(!flag)}
              style={{
                textAlign: "center",
                marginBottom: 0,
                marginTop: "0.5rem",
                fontSize: "0.8rem",
              }}
            >
              Or Don't Have An Account?
              <span style={{ color: "blue", cursor: "pointer" }}> Sign up</span>
            </p>
          </div>
        ) : (
          <div className="signup-signin-container">
            <h2 style={{ textAlign: "center" }}>
              Sign <span className="blue-text"> up</span>
            </h2>
            <form onSubmit={signUpWithEmail}>
              <div className="input-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CircleUserRound
                    strokeWidth={1}
                    height="16px"
                    width="16px"
                    style={{ marginRight: "0.5rem" }}
                  />
                  <p>Full Name</p>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Mail
                    strokeWidth={1}
                    height="16px"
                    width="16px"
                    style={{ marginRight: "0.5rem" }}
                  />
                  <p>Email</p>
                </div>
                <input
                  type="email"
                  placeholder="JohnDoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LockKeyhole
                    strokeWidth={1}
                    height="16px"
                    width="16px"
                    style={{ marginRight: "0.5rem" }}
                  />
                  <p>Password</p>
                </div>
                <input
                  type="password"
                  placeholder="Example123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LockKeyhole
                    strokeWidth={1}
                    height="16px"
                    width="16px"
                    style={{ marginRight: "0.5rem" }}
                  />
                  <p>Confirm Password</p>
                </div>
                <input
                  type="password"
                  placeholder="Example123"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn">
                {loading ? "Loading..." : "Sign Up with Email and Password"}
              </button>
            </form>
            <p style={{ textAlign: "center", margin: 0 }}>or</p>

            <div>
              <button
                disabled={loading}
                className="btn btn-blue flex items-center justify-center gap-2"
                onClick={signInWithGoogle}
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Sign Up with Google
                    <img
                      src={Google}
                      alt="Google"
                      height="20px"
                      width="20px"
                      style={{ marginLeft: "0.6rem" }}
                    />
                  </>
                )}
              </button>
            </div>
            <p
              style={{
                textAlign: "center",
                marginBottom: 0,
                marginTop: "0.5rem",
                fontSize: "0.8rem",
              }}
            >
              Or Have An Account Already?{" "}
              <span
                onClick={() => setFlag(!flag)}
                style={{ color: "blue", cursor: "pointer" }}
              >
                Log in
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SignUpSignIn;
