# ChatBoard Feature - Discussion Board Implementation

## Overview

The ChatBoard feature is a comprehensive discussion board system that enables real-time collaboration and communication between students, faculty, and administrators within the LearnEase Pro platform.

## Features

### Core Functionality

- **Create Posts**: Users can create discussion posts with title and content
- **Reply to Posts**: Threaded replies with nested conversations
- **Edit Posts**: Authors can edit their own posts and replies
- **Delete Posts**: Authors and admins can delete posts and replies
- **Pin Posts**: Faculty and admins can pin important discussions to the top
- **Search**: Find posts by keywords in title or content
- **Pagination**: Efficient browsing with configurable page size
- **Role-Based Permissions**: Different capabilities based on user role

### User Permissions

#### Students

- Create posts
- Reply to posts
- Edit their own posts and replies
- Delete their own posts and replies
- View all discussions

#### Faculty

- All student permissions
- Pin/unpin posts
- Edit any post in their courses
- Delete any post in their courses
- Moderate discussions

#### Admins

- All faculty permissions
- Delete any post system-wide
- Pin/unpin any post
- Full moderation capabilities

## Technical Implementation

### Frontend Architecture

#### Components

**1. ChatBoard Component** (`src/components/ChatBoard.jsx`)

Main container component that manages the discussion board:

```javascript
Key Features:
- Post list display with pagination
- Create post modal
- Search functionality
- Filter and sort options
- Loading and error states
- Empty state handling
```

**State Management:**

- Uses RTK Query for data fetching and caching
- Manages local state for modals, search, pagination
- Integrates with Redux auth state for permissions

**Key Functions:**

- `handleCreatePost()` - Opens create post modal
- `handleEditPost()` - Opens edit modal for existing post
- `handleDeletePost()` - Confirms and deletes post
- `handlePinToggle()` - Pins/unpins posts
- `handleSearch()` - Filters posts by search term
- `handlePageChange()` - Navigates between pages

**2. PostCard Component** (`src/components/PostCard.jsx`)

Displays individual posts with all interactions:

```javascript
Key Features:
- Post metadata (author, date, pinned status)
- Post content display
- Edit/delete actions (permission-based)
- Pin/unpin toggle (faculty/admin only)
- Reply list display
- Reply creation
- Reply editing and deletion
- Nested threading
```

**State Management:**

- Manages reply visibility (expand/collapse)
- Handles reply creation mode
- Manages edit mode for replies
- Uses RTK Query mutations for CRUD operations

**3. CreatePostModal Component** (`src/components/CreatePostModal.jsx`)

Modal dialog for creating and editing posts:

```javascript
Key Features:
- Form validation (title required, content required)
- Character limits
- Loading states
- Error handling
- Cancel confirmation
```

**4. ConfirmModal Component** (`src/components/ConfirmModal.jsx`)

Reusable confirmation dialog:

```javascript
Variants:
- Danger (delete operations)
- Warning (potentially destructive actions)
- Info (confirmations)
```

### Backend Architecture

#### API Endpoints

**Base URL**: `/api/chat/posts`

**1. Get All Posts**

```
GET /api/chat/posts
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - search: string (optional)
  - sort: string (default: "-createdAt")
Response:
  - posts: Array of post objects
  - pagination: { currentPage, totalPages, totalPosts }
```

**2. Create Post**

```
POST /api/chat/posts
Authorization: Required (JWT)
Body:
  - title: string (required, max 200 chars)
  - content: string (required, max 5000 chars)
Response:
  - Post object with author details
```

**3. Update Post**

```
PUT /api/chat/posts/:id
Authorization: Required (JWT, must be author or admin)
Body:
  - title: string (optional)
  - content: string (optional)
Response:
  - Updated post object
```

**4. Delete Post**

```
DELETE /api/chat/posts/:id
Authorization: Required (JWT, must be author or admin)
Response:
  - Success message
```

**5. Pin/Unpin Post**

```
PATCH /api/chat/posts/:id/pin
Authorization: Required (JWT, faculty or admin only)
Response:
  - Updated post with pinned status
```

**6. Create Reply**

```
POST /api/chat/posts/:id/replies
Authorization: Required (JWT)
Body:
  - content: string (required, max 2000 chars)
Response:
  - Reply object with author details
```

**7. Get Replies**

```
GET /api/chat/posts/:id/replies
Response:
  - Array of reply objects
```

**8. Update Reply**

```
PUT /api/chat/replies/:id
Authorization: Required (JWT, must be author or admin)
Body:
  - content: string (required)
Response:
  - Updated reply object
```

**9. Delete Reply**

```
DELETE /api/chat/replies/:id
Authorization: Required (JWT, must be author or admin)
Response:
  - Success message
```

#### Database Models

**CoursePost Model** (`src/models/CoursePost.js`)

```javascript
Schema:
  - title: String (required, maxlength: 200)
  - content: String (required, maxlength: 5000)
  - author: ObjectId (ref: User, required)
  - isPinned: Boolean (default: false)
  - createdAt: Date (auto)
  - updatedAt: Date (auto)

Indexes:
  - author
  - createdAt (for sorting)
  - title, content (text index for search)

Virtuals:
  - replies: Array of CoursePostReply
  - replyCount: Number
```

**CoursePostReply Model** (`src/models/CoursePostReply.js`)

```javascript
Schema:
  - post: ObjectId (ref: CoursePost, required)
  - author: ObjectId (ref: User, required)
  - content: String (required, maxlength: 2000)
  - createdAt: Date (auto)
  - updatedAt: Date (auto)

Indexes:
  - post (for efficient reply lookup)
  - author
  - createdAt
```

#### Repository Layer

**coursePostRepository.js**

Data access methods:

- `findAll(filters, options)` - Get posts with pagination and search
- `findById(id)` - Get single post with author details
- `create(postData)` - Create new post
- `update(id, updates)` - Update existing post
- `delete(id)` - Delete post
- `togglePin(id)` - Toggle pin status

**coursePostReplyRepository.js**

Data access methods:

- `findByPost(postId)` - Get all replies for a post
- `create(replyData)` - Create new reply
- `update(id, updates)` - Update reply
- `delete(id)` - Delete reply

#### Service Layer

**coursePostService.js**

Business logic:

- Permission validation
- Input sanitization
- Cascade operations (delete post → delete replies)
- Author population
- Search and filtering logic

### State Management (Redux)

#### RTK Query API Slice

```javascript
endpoints: {
  getPosts: builder.query({
    query: ({ page, limit, search }) => ({
      url: '/chat/posts',
      params: { page, limit, search }
    }),
    providesTags: ['Posts']
  }),

  createPost: builder.mutation({
    query: (postData) => ({
      url: '/chat/posts',
      method: 'POST',
      body: postData
    }),
    invalidatesTags: ['Posts']
  }),

  updatePost: builder.mutation({
    query: ({ id, ...updates }) => ({
      url: `/chat/posts/${id}`,
      method: 'PUT',
      body: updates
    }),
    invalidatesTags: ['Posts']
  }),

  deletePost: builder.mutation({
    query: (id) => ({
      url: `/chat/posts/${id}`,
      method: 'DELETE'
    }),
    invalidatesTags: ['Posts']
  }),

  togglePinPost: builder.mutation({
    query: (id) => ({
      url: `/chat/posts/${id}/pin`,
      method: 'PATCH'
    }),
    invalidatesTags: ['Posts']
  }),

  // Reply mutations...
}
```

**Benefits of RTK Query:**

- Automatic caching
- Optimistic updates
- Automatic refetching
- Loading and error states
- Normalized data

## User Flows

### Create Post Flow

1. User clicks "Create Post" button
2. CreatePostModal opens
3. User enters title and content
4. Validation runs (required fields, length limits)
5. User clicks "Post"
6. API call to `POST /api/chat/posts`
7. On success:
   - Modal closes
   - Post list refreshes automatically (RTK Query)
   - New post appears at top (or according to sort)
8. On error:
   - Error message displayed
   - User can retry or cancel

### Reply to Post Flow

1. User clicks on a post or "Reply" button
2. Reply form appears below the post
3. User enters reply content
4. User clicks "Post Reply"
5. API call to `POST /api/chat/posts/:id/replies`
6. On success:
   - Reply appears in the reply list
   - Reply count updates
   - Form clears
7. On error:
   - Error message displayed
   - User can retry

### Edit Post/Reply Flow

1. Author clicks "Edit" (three-dot menu or edit icon)
2. Edit mode activates (inline or modal)
3. User modifies content
4. User clicks "Save"
5. API call to `PUT /api/chat/posts/:id` or `PUT /api/chat/replies/:id`
6. On success:
   - Content updates in UI
   - "Edited" indicator appears
   - Edit mode closes
7. On error:
   - Error message displayed
   - Changes not saved

### Delete Post/Reply Flow

1. User clicks "Delete" (three-dot menu or trash icon)
2. ConfirmModal appears with warning
3. User confirms deletion
4. API call to `DELETE /api/chat/posts/:id` or `DELETE /api/chat/replies/:id`
5. On success:
   - Item removed from UI
   - If post deleted, all replies also removed
   - Success message shown
6. On error:
   - Error message displayed
   - Item remains in UI

### Pin Post Flow (Faculty/Admin)

1. Faculty/Admin clicks pin icon on post
2. API call to `PATCH /api/chat/posts/:id/pin`
3. On success:
   - Post moves to top of list
   - Pin icon updates to "pinned" state
   - Post marked with pin indicator
4. To unpin:
   - Click pin icon again
   - Post returns to normal position

### Search Flow

1. User types in search box
2. Debounced search trigger (300ms delay)
3. API call to `GET /api/chat/posts?search=...`
4. Results filtered by title and content
5. Post list updates with filtered results
6. If no results:
   - "No posts found" message displayed
7. Clear search:
   - User clears search box
   - Full post list returns

## Testing

### Frontend Tests (30 tests)

**ChatBoard.test.jsx**

- Component rendering
- Post creation
- Post editing
- Post deletion
- Pin/unpin functionality
- Search functionality
- Pagination
- Error handling
- Empty states
- Loading states
- Role-based permissions

**PostCard.test.jsx** (53 tests)

- Post display
- Reply creation
- Reply editing
- Reply deletion
- Reply display and threading
- Pin/unpin UI
- Edit/delete permissions
- Loading and error states

**E2E Tests (Cypress)**

- Complete post creation flow
- Reply conversations
- Edit/delete operations
- Permission validation
- Search functionality
- Pagination navigation

### Backend Tests

**Integration Tests**

- API endpoint testing
- Authentication validation
- Permission enforcement
- Data validation
- Error handling

**Coverage:**

- Backend unit tests: ~10% (intentionally lower, validated via E2E)
- Frontend unit tests: 53-73%
- E2E tests: Comprehensive coverage of all user flows

## Security Considerations

### Authentication

- JWT token required for all write operations
- Token validated on every request
- User identity extracted from token

### Authorization

- Role-based permissions enforced
- Owner validation (can only edit/delete own content)
- Faculty/Admin validation for pin operations
- Cascade permissions (delete post → can delete all replies)

### Input Validation

- Server-side validation for all inputs
- XSS prevention (content sanitization)
- SQL injection prevention (Mongoose parameterization)
- Length limits enforced
- Required fields validated

### Data Protection

- User IDs never exposed in URLs (use post/reply IDs)
- Sensitive user data not included in responses
- Author information limited to necessary fields

## Performance Optimization

### Frontend

- **Pagination**: Load only 10-20 posts at a time
- **Lazy Loading**: Replies loaded on demand
- **Debouncing**: Search triggered after 300ms pause
- **Caching**: RTK Query caches API responses
- **Optimistic Updates**: UI updates immediately, rollback on error

### Backend

- **Database Indexes**:
  - Compound index on `(isPinned, createdAt)` for sorting
  - Text index on `title` and `content` for search
  - Index on `author` for user queries
- **Query Optimization**:
  - Populate author details in single query
  - Select only needed fields
  - Limit results with pagination
- **Caching** (if implemented):
  - Cache frequently accessed posts
  - Invalidate cache on updates

### Database

- **Lean Queries**: Use `.lean()` for read-only operations
- **Projection**: Select only required fields
- **Pagination**: Limit and skip for large datasets
- **Indexes**: Compound indexes for common queries

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and roles
- **Focus Management**: Proper focus handling in modals
- **Color Contrast**: WCAG 2.1 AA compliant
- **Alt Text**: Descriptive text for icons
- **Form Labels**: All inputs properly labeled

## Future Enhancements

### Potential Features

- **Notifications**: Real-time notifications for replies
- **Mentions**: @mention users in posts/replies
- **Rich Text**: Markdown or WYSIWYG editor
- **Attachments**: Upload images or files
- **Reactions**: Like, upvote posts
- **Categories**: Organize posts by topic/course
- **Bookmarks**: Save favorite posts
- **Reporting**: Report inappropriate content
- **Moderation Queue**: Review flagged content
- **Analytics**: Track engagement metrics

### Technical Improvements

- **WebSockets**: Real-time updates
- **Infinite Scroll**: Replace pagination
- **Virtual Scrolling**: Handle large post lists
- **Progressive Loading**: Load more as you scroll
- **Offline Support**: Cache for offline viewing
- **Push Notifications**: Mobile notifications

## Deployment Notes

### Environment Variables

```env
# No specific ChatBoard env vars required
# Uses existing auth and database configuration
```

### Database Migration

```bash
# Ensure indexes are created
db.courseposts.createIndex({ isPinned: -1, createdAt: -1 })
db.courseposts.createIndex({ title: "text", content: "text" })
db.courseposts.createIndex({ author: 1 })
db.coursepostreplies.createIndex({ post: 1, createdAt: 1 })
```

### Monitoring

- Monitor API response times
- Track post creation rate
- Monitor database query performance
- Alert on high error rates

## Troubleshooting

### Common Issues

**Posts not loading**

- Check backend API is running
- Verify MongoDB connection
- Check browser console for errors
- Verify JWT token is valid

**Can't create post**

- Ensure user is authenticated
- Check form validation
- Verify API endpoint is accessible
- Check network tab for request errors

**Pin not working**

- Verify user has faculty or admin role
- Check permission validation in backend
- Verify API route is correct

**Replies not showing**

- Check if replies are being fetched
- Verify post ID is correct
- Check reply repository query
- Verify author population

## API Response Examples

### Get Posts Response

```json
{
  "posts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Welcome to the course!",
      "content": "Hello everyone, welcome to CS101...",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "role": "faculty"
      },
      "isPinned": true,
      "replyCount": 5,
      "createdAt": "2025-12-20T10:30:00.000Z",
      "updatedAt": "2025-12-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 47,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Create Post Response

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Question about assignment 3",
  "content": "Can someone clarify the requirements?",
  "author": {
    "_id": "507f1f77bcf86cd799439014",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "student"
  },
  "isPinned": false,
  "createdAt": "2025-12-22T14:25:00.000Z",
  "updatedAt": "2025-12-22T14:25:00.000Z"
}
```

### Get Replies Response

```json
{
  "replies": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "post": "507f1f77bcf86cd799439013",
      "content": "I think you need to...",
      "author": {
        "_id": "507f1f77bcf86cd799439016",
        "firstName": "Bob",
        "lastName": "Johnson",
        "role": "student"
      },
      "createdAt": "2025-12-22T14:30:00.000Z",
      "updatedAt": "2025-12-22T14:30:00.000Z"
    }
  ]
}
```

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: ✅ Production Ready
