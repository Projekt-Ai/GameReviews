import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.PUBLIC_COMMENTS_API || 'http://localhost:3000';

export default function LikeButton({ slug }) {
  const storageKey = `liked:${slug}`;
  const [liked, setLiked] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [likes, setLikes] = useState(null);
  const [views, setViews] = useState(null);
  const viewTracked = useRef(false);

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
    </div>
  );
}
