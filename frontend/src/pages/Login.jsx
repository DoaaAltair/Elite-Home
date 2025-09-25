import React, { useState } from "react";
import "../App.css";
import bgImage from "../assets/venice-mall.jpg";
import logo from "../assets/Elit_Home-removebg-preview.png";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !password) {
            setError("Please fill in both fields!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: name, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token) localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({ username: data.username }));
                alert(`Welcome ${data.username}!`);
                navigate("/home");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Try again later.");
        }
    };

    return (
        <div className="background" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="overlay">
                <h1 className="logo">
                    <img src={logo} alt="Logo" className="logo-img" />
                </h1>

                <div className="login-card">
                    <h2 className="card-title">Welcome back</h2>
                    <p className="card-subtitle">Sign in to continue to EliteHome</p>

                    <form onSubmit={handleLogin}>
                        <div className="field floating">
                            <div className="input-wrapper">
                                <input
                                    id="username"
                                    type="text"
                                    placeholder=" "
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="username"
                                />
                                <label htmlFor="username">Username</label>
                                <span className="input-icon">👤</span>
                            </div>
                        </div>

                        <div className="field floating">
                            <div className="input-wrapper">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <label htmlFor="password">Password</label>
                                <span className="input-icon">🔒</span>
                            </div>
                        </div>

                        <div className="actions">
                            <a href="#" className="link-muted">Forgot password?</a>
                        </div>

                        <button className="btn-primary" type="submit">Sign In</button>
                        {error && <p className="error">{error}</p>}
                    </form>

                    <p className="subtle" style={{ marginTop: 12 }}>
                        No account yet? <Link to="/register" className="link-muted">Create an account</Link>
                    </p>
                </div>

                <p className="subtle">© {new Date().getFullYear()} EliteHome. All rights reserved.</p>
            </div>
        </div>
    );
}
