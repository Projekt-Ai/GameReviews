import { useState } from "react";

const API_URL = import.meta.env.PUBLIC_COMMENTS_API || 'http://localhost:3000';

export default function SubscribeWidget() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (event.target.website.value) return;
        setStatus("loading");
        setError(null);
        setSuccess(false);
        try {
            const response = await fetch(`${API_URL}/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to subscribe");
            }
            setSuccess(true);
            setEmail("");
        } catch (err) {
            setError(err.message);
        } finally {
            setStatus("idle");
        }
    };

    return (
        <div className="subscribe-widget">
            <h2 className="subscribe-title">Stay in the Loop</h2>
            <p className="subscribe-subtitle">New reviews and boss features, straight to your inbox.</p>
            <form className="subscribe-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="website"
                    style={{ display: "none" }}
                    tabIndex="-1"
                    autoComplete="off"
                />
                <input
                    className="subscribe-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button className="subscribe-btn" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Sending…" : "Subscribe"}
                </button>
            </form>
            {error && <p className="subscribe-feedback subscribe-feedback--error">{error}</p>}
            {success && <p className="subscribe-feedback subscribe-feedback--success">Check your email to confirm your subscription.</p>}
        </div>
    );
}
