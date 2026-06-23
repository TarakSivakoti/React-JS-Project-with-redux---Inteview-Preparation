import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  fetchPosts,
  fetchPostById,
  createPost,
  setSearchQuery,
  clearSelectedPost,
  selectFilteredPosts,
  selectPostsStatus,
  selectPostsError,
  selectSelectedPost,
  selectSearchQuery,
} from './postsSlice'

const Posts: React.FC = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectFilteredPosts)
  const status = useAppSelector(selectPostsStatus)
  const error = useAppSelector(selectPostsError)
  const selectedPost = useAppSelector(selectSelectedPost)
  const searchQuery = useAppSelector(selectSearchQuery)

  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')

  const handleFetch = () => dispatch(fetchPosts())

  const handleCreate = () => {
    if (!newTitle.trim()) return
    dispatch(createPost({ userId: 1, title: newTitle, body: newBody }))
    setNewTitle('')
    setNewBody('')
  }

  return (
    <section className="card">
      <h2>Posts <span className="badge">Async Thunk</span></h2>
      <p className="hint">
        <strong>Concept:</strong> createAsyncThunk handles <code>pending</code>,{' '}
        <code>fulfilled</code>, <code>rejected</code> lifecycle actions.
        Uses JSONPlaceholder API via axios.
      </p>

      {/* Actions Row */}
      <div className="btn-row">
        <button onClick={handleFetch} disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Fetch Posts'}
        </button>
        <button onClick={() => dispatch(fetchPostById(1))}>
          Fetch Post #1
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`status-bar status-${status}`}>
        Status: <strong>{status}</strong>
        {error && <span className="error-text"> — {error}</span>}
      </div>

      {/* Search */}
      {posts.length > 0 && (
        <input
          className="search-input"
          type="text"
          placeholder="Search posts…"
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        />
      )}

      {/* Selected Post Detail */}
      {selectedPost && (
        <div className="detail-card">
          <button className="close-btn" onClick={() => dispatch(clearSelectedPost())}>✕</button>
          <h3>{selectedPost.title}</h3>
          <p>{selectedPost.body}</p>
        </div>
      )}

      {/* Posts List */}
      <ul className="posts-list">
        {posts.map((post) => (
          <li key={post.id} onClick={() => dispatch(fetchPostById(post.id))}>
            <strong>#{post.id}</strong> {post.title}
          </li>
        ))}
      </ul>

      {/* Create Post Form */}
      <details className="create-form">
        <summary>+ Create New Post</summary>
        <div className="form-group">
          <input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Body"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={3}
          />
          <button onClick={handleCreate} disabled={status === 'loading'}>
            Create Post
          </button>
        </div>
      </details>
    </section>
  )
}

export default Posts
