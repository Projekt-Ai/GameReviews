import { useState, useEffect } from 'react';

const API_URL = import.meta.env.PUBLIC_COMMENTS_API || 'http://localhost:3000';

export default function CommentsWidget({ thread }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyName, setReplyName] = useState('');
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/comments/${thread}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(() => setStatus('Failed to load comments.'));
  }, [thread]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setStatus('Name and comment are required.');
      return;
    }
    setStatus('Posting...');
    try {
      const res = await fetch(`${API_URL}/comments/${thread}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      setBody('');
      setStatus('Comment submitted — awaiting approval.');
    } catch {
      setStatus('Failed to post comment.');
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyName.trim() || !replyBody.trim()) return;
    try {
      const res = await fetch(`${API_URL}/comments/${thread}/reply/${parentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: replyName.trim(), body: replyBody.trim() }),
      });
      if (!res.ok) throw new Error();
      setReplyTo(null);
      setReplyName('');
      setReplyBody('');
    } catch {
      setStatus('Failed to post reply.');
    }
  };

  const topLevel = comments.filter(c => !c.parent_id);
  const getReplies = (id) => comments.filter(c => c.parent_id === id);

  return (
    <section className="review-comments" data-comment-thread={thread}>
      <div className="comments-header">
        <span className="comments-header-pip"></span>
        <h2 className="comments-title">Discussion</h2>
        <span className="comments-count">
          {comments.length > 0 ? `${comments.length}` : '0'}
        </span>
      </div>

      <form className="comment-form-wrap" onSubmit={handleSubmit}>
        <div className="comment-avatar"></div>
        <div className="comment-form">
          <input
            className="comment-name-input"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          <textarea
            className="comment-textarea"
            placeholder="Write a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
          />
          <button className="comment-submit" type="submit">
            Post Comment
          </button>
          {status && <p className="comment-form-status" data-state={status.includes('Failed') ? 'error' : undefined}>{status}</p>}
        </div>
      </form>

      <div className="comments-list">
        {topLevel.map((comment) => (
          <div className="comment" key={comment.id}>
            <div className="comment-inner">
              <div className={`comment-avatar${comment.is_author ? ' comment-avatar-author' : ''}`}></div>
              <div>
                <div className="comment-head">
                  <span className="comment-author">{comment.name}</span>
                  {comment.is_author && <span className="comment-author-badge">Author</span>}
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-body">{comment.body}</p>
                <div className="comment-actions">
                  <button
                    className="comment-reply-btn"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {getReplies(comment.id).length > 0 && (
              <div className="comment-replies">
                {getReplies(comment.id).map((reply) => (
                  <div className="comment comment-nested" key={reply.id}>
                    <div className="comment-inner">
                      <div className={`comment-avatar${reply.is_author ? ' comment-avatar-author' : ''}`}></div>
                      <div>
                        <div className="comment-head">
                          <span className="comment-author">{reply.name}</span>
                          {reply.is_author && <span className="comment-author-badge">Author</span>}
                          <span className="comment-date">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-body">{reply.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {replyTo === comment.id && (
              <div className="comment-replies">
                <form className="comment comment-nested" onSubmit={(e) => handleReply(e, comment.id)}>
                  <div className="comment-inner">
                    <div className="comment-avatar"></div>
                    <div className="comment-form">
                      <input
                        className="comment-name-input"
                        type="text"
                        placeholder="Name"
                        value={replyName}
                        onChange={(e) => setReplyName(e.target.value)}
                        maxLength={50}
                      />
                      <textarea
                        className="comment-textarea"
                        placeholder="Write a reply..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        maxLength={2000}
                      />
                      <button className="comment-submit" type="submit" disabled={!replyName.trim() || !replyBody.trim()}>
                        Post Reply
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
