import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Hide header on auth pages just in case
    if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }

    return (
        <nav className="home-navbar">
            <div className="home-brand">
                {/* <div className="home-logo-mark">EH</div> */}
                <div className="home-logo-text">EliteHome</div>
            </div>
            <ul>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/apartments">Apartments</Link></li>
            </ul>
            <button className="btn-secondary" type="button" onClick={handleLogout}>Logout</button>
        </nav>
    );
}


