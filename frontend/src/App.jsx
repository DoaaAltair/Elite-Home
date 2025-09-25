import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Apartments from "./pages/Apartments";
import Header from "./components/Header";

export default function App() {
    return (
        <Router>
            {localStorage.getItem("user") && <Header />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/apartments" element={<Apartments />} />
            </Routes>
        </Router>
    );
}
