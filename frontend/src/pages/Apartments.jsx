import React, { useState, useEffect } from "react";
import "../App.css";
import defaultPhoto from "../assets/venice-mall.jpg";

export default function Apartments() {
    const [apartments, setApartments] = useState([]);
    const [stage, setStage] = useState("idle");
    const [selectedType, setSelectedType] = useState("huur");
    const [form, setForm] = useState({
        type: "huur",
        medewerker: "",
        nummer: "",
        beschrijving: "",
        status: "empry",
        huishouden: ""
    });
    const [detail, setDetail] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

    // ⬅️ Ophalen van alle appartementen uit database bij het laden
    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const res = await fetch(`${API_URL}/apartments`);
                const data = await res.json();
                if (res.ok) {
                    setApartments(data);
                } else {
                    console.error(data.message || "Fout bij ophalen apartments");
                }
            } catch (err) {
                console.error("Server error:", err);
            }
        };
        fetchApartments();
    }, [API_URL]); // ⬅️ draait maar één keer bij laden

    const startAddFlow = () => {
        setStage("chooseType");
    };

    const confirmType = () => {
        setForm({ ...form, type: selectedType });
        setStage("form");
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, type: selectedType };
        const res = await fetch(`${API_URL}/apartments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
            const newApartment = { id: data.id, ...payload }; // ⬅️ id uit DB gebruiken
            setApartments([newApartment, ...apartments]);
            setForm({ type: "huur", medewerker: "", nummer: "", beschrijving: "", status: "empty", huishouden: "" });
            setSelectedType("huur");
            setStage("idle");
        } else {
            alert(data.message || "Fout bij toevoegen");
        }
    };

    const openDetail = async (apt) => {
        try {
            const res = await fetch(`${API_URL}/apartments/${apt.id}`);
            const data = await res.json();
            if (res.ok) {
                setDetail(data); // altijd de frisse data uit DB tonen
                setEditForm(data);
                setIsEditing(false);
            } else {
                console.error(data.message);
                setDetail(apt); // fallback: toon wat we al hebben
                setEditForm(apt);
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Error fetching apartment detail:", err);
            setDetail(apt);
            setEditForm(apt);
            setIsEditing(false);
        }
    };

    const closeDetail = () => { setDetail(null); setIsEditing(false); };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdits = async () => {
        try {
            const payload = {
                type: editForm.type || "",
                medewerker: editForm.medewerker || "",
                nummer: editForm.nummer || "",
                beschrijving: editForm.beschrijving || "",
                status: editForm.status || "empty",
                huishouden: editForm.huishouden || "",
            };

            console.log("Saving apartment ID:", detail.id, editForm);

            const res = await fetch(`${API_URL}/apartments/${detail.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setDetail(data);
                setApartments((prev) => prev.map((a) => (a.id === data.id ? data : a)));
                setIsEditing(false);
            } else {
                alert(data.message || "Update failed");
            }
        } catch (e) {
            alert("Server error while saving");
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/apartments/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.message || "Delete failed");
                return;
            }
            setApartments(apartments.filter((a) => a.id !== id));
            closeDetail();
        } catch (e) {
            alert("Server error while deleting");
        }
    };

    return (
        <div className="apartment-page">
            <div className="apartments-header">
                <h2>Apartments</h2>
                {stage === "idle" && (
                    <button className="btn-primary add-apartment-btn" onClick={startAddFlow}>Add apartment</button>
                )}
            </div>

            {stage === "chooseType" && (
                <div className="type-selector glass">
                    <h3>Choose a type</h3>
                    <div className="type-options">
                        <button
                            className={`type-card ${selectedType === "huur" ? "active" : ""}`}
                            onClick={() => setSelectedType("huur")}
                            type="button"
                        >
                            <span className="type-emoji">🔑</span>
                            <span>Rent</span>
                        </button>
                        <button
                            className={`type-card ${selectedType === "verkoop" ? "active" : ""}`}
                            onClick={() => setSelectedType("verkoop")}
                            type="button"
                        >
                            <span className="type-emoji">🏷️</span>
                            <span>Sale</span>
                        </button>
                    </div>
                    <div className="type-actions">
                        <button className="btn-secondary" type="button" onClick={() => setStage("idle")}>Cancel</button>
                        <button className="btn-primary" type="button" onClick={confirmType}>Next</button>
                    </div>
                </div>
            )}

            {stage === "form" && (
                <form className="apartment-form glass" onSubmit={handleSubmit}>
                    <div className="form-header">
                        <h3>New apartment ({selectedType === "huur" ? "rent" : "sale"})</h3>
                        <button className="btn-secondary" type="button" onClick={() => setStage("idle")}>Back</button>
                    </div>

                    <label>Agent</label>
                    <input type="text" name="medewerker" value={form.medewerker} onChange={handleChange} />

                    <label>Number</label>
                    <input type="text" name="nummer" value={form.nummer} onChange={handleChange} />

                    <label>Description</label>
                    <textarea name="beschrijving" value={form.beschrijving} onChange={handleChange}></textarea>

                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="empty">Empty</option>
                        <option value="rented">Rented</option>
                    </select>

                    <label>Household</label>
                    <textarea name="huishouden" value={form.huishouden} onChange={handleChange}></textarea>

                    <button className="btn-primary" type="submit">Save</button>
                </form>
            )}

            <div className="apartments-grid">
                {apartments.length === 0 && (
                    <p className="subtle">No apartments yet.</p>
                )}
                {apartments.map((apt) => {
                    const isEmpty = (apt.status || "").toLowerCase() === "empty";
                    return (
                        <button
                            key={apt.id}
                            className="apartment-card icon-card clickable"
                            onClick={() => openDetail(apt)}
                            type="button"
                            title={`Apartment ${apt.nummer || ""}`}
                        >
                            <div className="icon">🏠</div>
                            <div className="apartment-info">
                                <span className="apartment-number">
                                    {apt.nummer || "—"}
                                </span>
                                <span
                                    className={`status-dot ${isEmpty ? "status-green" : "status-red"}`}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>



            {detail && (
                <div className="modal-backdrop" onClick={closeDetail}>
                    <div className="modal glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Apartment details</h3>
                            <button className="icon-btn" onClick={closeDetail} type="button">✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="label">Type</span>
                                {isEditing ? (
                                    <select name="type" value={editForm.type || "huur"} onChange={handleEditChange}>
                                        <option value="huur">rent</option>
                                        <option value="verkoop">sale</option>
                                    </select>
                                ) : (
                                    <span>{detail.type === "huur" ? "rent" : "sale"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Number</span>
                                {isEditing ? (
                                    <input name="nummer" type="text" value={editForm.nummer || ""} onChange={handleEditChange} />
                                ) : (
                                    <span>{detail.nummer || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Agent</span>
                                {isEditing ? (
                                    <input name="medewerker" type="text" value={editForm.medewerker || ""} onChange={handleEditChange} />
                                ) : (
                                    <span>{detail.medewerker || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Status</span>
                                {isEditing ? (
                                    <select name="status" value={editForm.status || "empty"} onChange={handleEditChange}>
                                        <option value="empty">Empty</option>
                                        <option value="rented">Rented</option>
                                    </select>
                                ) : (
                                    <span>{detail.status}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Description</span>
                                {isEditing ? (
                                    <textarea name="beschrijving" value={editForm.beschrijving || ""} onChange={handleEditChange}></textarea>
                                ) : (
                                    <span>{detail.beschrijving || "No description"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Photo URL</span>
                                {isEditing ? (
                                    <input name="foto" type="text" value={editForm.foto || editForm.image || ""} onChange={handleEditChange} />
                                ) : (
                                    <span>{detail.foto || detail.image || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Household</span>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {isEditing ? (
                                        <textarea name="huishouden" value={editForm.huishouden || ""} onChange={handleEditChange}></textarea>
                                    ) : (
                                        <span>{detail.huishouden || "—"}</span>
                                    )}
                                    {!isEditing && (
                                        <button
                                            className="icon-btn"
                                            type="button"
                                            title={String(detail.huishouden || "").trim().startsWith("✅") ? "Mark as not done" : "Mark as done"}
                                            onClick={async () => {
                                                try {
                                                    const wantDone = !String(detail.huishouden || "").trim().startsWith("✅");
                                                    const res = await fetch(`${API_URL}/apartments/${detail.id}/household-done`, {
                                                        method: "PATCH",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ done: wantDone })
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        setDetail(data);
                                                        setApartments((prev) => prev.map((a) => (a.id === data.id ? data : a)));
                                                    }
                                                } catch (e) {
                                                    // ignore
                                                }
                                            }}
                                        >
                                            {String(detail.huishouden || "").trim().startsWith("✅") ? "☑" : "☐"}
                                        </button>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {!isEditing ? (
                                <>
                                    <button className="btn-secondary" type="button" onClick={() => { setIsEditing(true); setEditForm(detail); }}>Edit</button>
                                    <button className="btn-danger" type="button" onClick={() => handleDelete(detail.id)}>Delete apartment</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-secondary" type="button" onClick={() => { setIsEditing(false); setEditForm(detail); }}>Cancel</button>
                                    <button className="btn-primary" type="button" onClick={saveEdits}>Save</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
