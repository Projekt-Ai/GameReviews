import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.PUBLIC_COMMENTS_API || 'http://localhost:3000';

export default function LikeButton({ slug }) {
  // one localStorage key per review slug, persisted in the reader's browser
  const storageKey = `liked:${slug}`;
  const [liked, setLiked] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [likes, setLikes] = useState(null);
  const [views, setViews] = useState(null);
  // ref prevents double-counting a view on React re-renders (StrictMode fires effects twice in dev)
  const viewTracked = useRef(false);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareX() {
    const text = encodeURIComponent(document.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://x.com/intent/post?text=${text}&url=${url}`, '_blank', 'noopener');
  }

  function shareBluesky() {
    const text = encodeURIComponent(`${document.title} ${window.location.href}`);
    window.open(`https://bsky.app/intent/compose?text=${text}`, '_blank', 'noopener');
  }

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === '1');

    fetch(`${API_URL}/stats/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setLikes(data.likes ?? 0);
          setViews(data.views ?? 0);
        }
      })
      .catch(() => {});

    if (!viewTracked.current) {
      viewTracked.current = true;
      fetch(`${API_URL}/stats/${slug}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [slug, storageKey]);

  // optimistic UI — count updates instantly in the browser; API call fires and forgets
  function toggle() {
    const next = !liked;
    setLiked(next);

    if (next) {
      localStorage.setItem(storageKey, '1');
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
      setLikes(prev => prev !== null ? prev + 1 : 1);
      fetch(`${API_URL}/stats/${slug}/like`, { method: 'POST' }).catch(() => {});
    } else {
      localStorage.removeItem(storageKey);
      setLikes(prev => prev !== null ? Math.max(0, prev - 1) : 0);
      fetch(`${API_URL}/stats/${slug}/unlike`, { method: 'POST' }).catch(() => {});
    }
  }

  return (
    <div className="like-bar-inner">
      <button
        className={`like-btn${liked ? ' liked' : ''}${animate ? ' like-pop' : ''}`}
        onClick={toggle}
        aria-label={liked ? 'Unlike this review' : 'Like this review'}
        aria-pressed={liked}
        type="button"
      >
        <svg
          className="like-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="like-label">{liked ? 'Liked' : 'Like'}</span>
        {likes !== null && <span className="like-count">{likes}</span>}
      </button>
      {views !== null && (
        <span className="view-count">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {views.toLocaleString()}
        </span>
      )}
      <span className="share-divider" aria-hidden="true" />
      <button className="share-btn" onClick={copyLink} aria-label="Copy link" type="button" title="Copy link">
        {copied ? (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        <span className="share-label">{copied ? 'Copied!' : 'Copy'}</span>
      </button>
      <button className="share-btn" onClick={shareX} aria-label="Share on X" type="button" title="Share on X">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="share-label">X</span>
      </button>
      <button className="share-btn" onClick={shareBluesky} aria-label="Share on Bluesky" type="button" title="Share on Bluesky">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
        </svg>
        <span className="share-label">Bluesky</span>
      </button>
      <button className="share-btn" aria-label="Medium" type="button" title="Medium">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
        <span className="share-label">Medium</span>
      </button>
    </div>
  );
}
