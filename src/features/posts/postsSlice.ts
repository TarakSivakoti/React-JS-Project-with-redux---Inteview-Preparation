// ─────────────────────────────────────────────────────────────────────────────
// FEATURE SLICE 2: Posts (Async Thunks — redux-thunk via RTK)
//
// INTERVIEW CONCEPT:
//   createAsyncThunk() handles the three lifecycle actions automatically:
//     - posts/fetchAll/pending   → loading starts
//     - posts/fetchAll/fulfilled → data received
//     - posts/fetchAll/rejected  → error occurred
//
//   extraReducers + builder.addCase() handles async action results.
//   redux-thunk is included by default in configureStore().
//
//   API: https://jsonplaceholder.typicode.com/posts
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { RootState } from '../../store'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface PostsState {
  items: Post[]
  selectedPost: Post | null
  status: LoadingStatus
  error: string | null
  searchQuery: string
}

const initialState: PostsState = {
  items: [],
  selectedPost: null,
  status: 'idle',
  error: null,
  searchQuery: '',
}

// ── Async Thunk: Fetch All Posts ──────────────────────────────────────────────
// createAsyncThunk<ReturnType, ArgType>
export const fetchPosts = createAsyncThunk<Post[], void, { rejectValue: string }>(
  'posts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<Post[]>(
        'https://jsonplaceholder.typicode.com/posts?_limit=10'
      )
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.message)
      }
      return rejectWithValue('Unknown error occurred')
    }
  }
)

// ── Async Thunk: Fetch Post By ID ─────────────────────────────────────────────
export const fetchPostById = createAsyncThunk<Post, number, { rejectValue: string }>(
  'posts/fetchById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get<Post>(
        `https://jsonplaceholder.typicode.com/posts/${postId}`
      )
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.message)
      }
      return rejectWithValue('Unknown error occurred')
    }
  }
)

// ── Async Thunk: Create Post ──────────────────────────────────────────────────
export const createPost = createAsyncThunk<Post, Omit<Post, 'id'>, { rejectValue: string }>(
  'posts/create',
  async (newPost, { rejectWithValue }) => {
    try {
      const response = await axios.post<Post>(
        'https://jsonplaceholder.typicode.com/posts',
        newPost
      )
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.message)
      }
      return rejectWithValue('Unknown error occurred')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
    clearSelectedPost(state) {
      state.selectedPost = null
    },
    clearError(state) {
      state.error = null
    },
  },

  // ── extraReducers handles async thunk lifecycle actions ────────────────────
  extraReducers: (builder) => {
    builder
      // ── fetchPosts ─────────────────────────────────────────────────────────
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to fetch posts'
      })

      // ── fetchPostById ──────────────────────────────────────────────────────
      .addCase(fetchPostById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedPost = action.payload
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to fetch post'
      })

      // ── createPost ────────────────────────────────────────────────────────
      .addCase(createPost.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload) // add to top of list
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to create post'
      })
  },
})

// ── Action Creators ───────────────────────────────────────────────────────────
export const { setSearchQuery, clearSelectedPost, clearError } = postsSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllPosts = (state: RootState) => state.posts.items
export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error
export const selectSelectedPost = (state: RootState) => state.posts.selectedPost
export const selectSearchQuery = (state: RootState) => state.posts.searchQuery

// Derived / memoized selector (inline - for simple cases)
export const selectFilteredPosts = (state: RootState) => {
  const query = state.posts.searchQuery.toLowerCase()
  if (!query) return state.posts.items
  return state.posts.items.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.body.toLowerCase().includes(query)
  )
}

export default postsSlice.reducer
