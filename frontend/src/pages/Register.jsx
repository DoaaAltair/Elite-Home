import React, { useState } from "react";
import "../App.css";
import bgImage from "../assets/venice-mall.jpg";
import logo from "../assets/Elit_Home-removebg-preview.png";
import { Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");

    const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!username || !password || !confirm) {
            setMessage("Please complete all fields.");
            return;
        }
        if (password !== confirm) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`✅ ${data.message || "Account created"}`);
                setUsername("");
                setPassword("");
                setConfirm("");
            } else {
                setMessage(`❌ ${data.message || "Registration failed"}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("⚠️ Server error, please try again later.");
        }
    };

    return (
        <div className="background" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="overlay">
                <h1 className="logo">
                    <img src={logo} alt="Logo" className="logo-img" />
                </h1>

                <div className="login-card">
                    <h2 className="card-title">Create your account</h2>
                    <p className="card-subtitle">Join EliteHome in a few seconds</p>

                    <form onSubmit={handleRegister}>
                        <div className="field floating">
                            <div className="input-wrapper">
                                <input
                                    id="reg-username"
                                    type="text"
                                    placeholder=" "
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                />
                                <label htmlFor="reg-username">Username</label>
                                <span className="input-icon">👤</span>
                            </div>
                        </div>

                        <div className="field floating">
                            <div className="input-wrapper">
                                <input
                                    id="reg-password"
                                    type="password"
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <label htmlFor="reg-password">Password</label>
                                <span className="input-icon">🔒</span>
                            </div>
                        </div>

                        <div className="field floating">
                            <div className="input-wrapper">
                                <input
                                    id="reg-confirm"
                                    type="password"
                                    placeholder=" "
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <label htmlFor="reg-confirm">Confirm password</label>
                                <span className="input-icon">✅</span>
                            </div>
                        </div>

                        <button className="btn-primary" type="submit">Create account</button>
                        {message && <p className="error" style={{ marginTop: 10 }}>{message}</p>}
                    </form>
                </div>

                <p className="subtle">Already have an account? <Link to="/login" className="link-muted">Go to Login</Link>.</p>
            </div>
        </div>
    );
}
