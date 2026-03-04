export default function CommentsWidget({ thread }) {
  return (
    <section className="review-comments" data-comment-thread={thread}>
      <div className="comments-header">
        <span className="comments-header-pip"></span>
        <h2 className="comments-title">Discussion</h2>
        <span className="comments-count">Unavailable</span>
      </div>

      <div className="comment-form-wrap">
        <div className="comment-avatar"></div>
        <div className="comment-form">
          <p className="comment-body">
            Comments are offline while the site runs as a fully static build.
          </p>
          <p className="comment-form-status">Frontend is still intact, but there is no backend comment service.</p>
        </div>
      </div>

      <div className="comments-list">
        <div className="comment">
          <div className="comment-inner">
            <div className="comment-avatar"></div>
            <div>
              <div className="comment-head">
                <span className="comment-author">Comments disabled</span>
              </div>
              <p className="comment-body">This page no longer loads or submits comments.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
