import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Home() {
    return (
        <div className="home-page">

            <section className="home-hero">
                <div className="home-hero-content glass">
                    <h1>Find Your Next Luxury Home</h1>
                    <p>Premium apartments with modern finishes in prime locations. Rent or buy — with tailor-made service.</p>
                    <div className="home-cta">
                        <Link className="btn-primary" to="/apartments">View Listings</Link>
                        <Link className="btn-secondary" to="/">Contact Us</Link>
                    </div>
                </div>
            </section>

            <section className="home-features">
                <div className="features-grid">
                    <div className="feature-card glass">
                        <div className="feature-icon">🏙️</div>
                        <h3>Prime Locations</h3>
                        <p>Dream spots in the city center, with excellent mobility and facilities.</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon">🛋️</div>
                        <h3>High-End Finishes</h3>
                        <p>Designer interiors with quality materials and smart living solutions.</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon">🤝</div>
                        <h3>Personalized Service</h3>
                        <p>From viewing to key handover: we take care of every detail.</p>
                    </div>
                </div>
            </section>

            <footer className="home-footer">
                <p>© {new Date().getFullYear()} EliteHome — Living at its finest.</p>
            </footer>
        </div>
    );
}
