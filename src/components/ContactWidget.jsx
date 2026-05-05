import { useState } from "react";

const API_URL = import.meta.env.PUBLIC_COMMENTS_API || 'http://localhost:3000';

export default function ContactWidget() {
    const [fields, setFields] = useState({ firstName: '', lastName: '', email: '', subject: '', customSubject: '', message: '' });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (event.target.website.value) return;
        setStatus('loading');
        setError(null);
        try {
            const subject = fields.subject === 'Other' ? fields.customSubject : fields.subject;
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...fields, subject }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');
            setStatus('success');
        } catch (err) {
            setError(err.message);
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="contact-success">
                <p className="contact-success-eyebrow">Sent</p>
                <p className="contact-success-text">Message received. I'll get back to you when I can.</p>
            </div>
        );
    }

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" name="website" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
            <div className="contact-row">
                <input
                    className="contact-input"
                    type="text"
                    placeholder="First Name"
                    value={fields.firstName}
                    onChange={set('firstName')}
                    required
                />
                <input
                    className="contact-input"
                    type="text"
                    placeholder="Last Name"
                    value={fields.lastName}
                    onChange={set('lastName')}
                    required
                />
            </div>
            <input
                className="contact-input"
                type="email"
                placeholder="Email"
                value={fields.email}
                onChange={set('email')}
                required
            />
            <select
                className="contact-input contact-select"
                value={fields.subject}
                onChange={set('subject')}
                required
            >
                <option value="" disabled>Subject</option>
                <option value="Game Suggestion">Game Suggestion</option>
                <option value="Feedback">Feedback</option>
                <option value="Inquiries">Inquiries</option>
                <option value="Just Saying Hi">Just Saying Hi</option>
                <option value="Other">Other</option>
            </select>
            {fields.subject === 'Other' && (
                <input
                    className="contact-input"
                    type="text"
                    placeholder="Your subject"
                    value={fields.customSubject}
                    onChange={set('customSubject')}
                    required
                />
            )}
            <textarea
                className="contact-textarea"
                placeholder="Message"
                value={fields.message}
                onChange={set('message')}
                required
            />
            {error && <p className="contact-error">{error}</p>}
            <button className="contact-btn" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send Message'}
            </button>
        </form>
    );
}
