# Chatboard Feature Documentation

## Overview

The Chatboard feature provides a discussion board for each course where all users (students and faculty) can create posts, reply to posts, and manage their content. Faculty members have additional moderation capabilities.

## Features

### For All Users (Students & Faculty)

- **Create Posts**: Start new discussion topics with a title and content
- **Reply to Posts**: Add replies to existing posts
- **Edit Content**: Edit your own posts and replies
- **Delete Content**: Delete your own posts and replies
- **View Discussions**: Browse all posts and replies in a course

### For Faculty Only

- **Pin/Unpin Posts**: Highlight important posts at the top of the discussion board
- **Moderate Content**: Edit or delete any post or reply (not just their own)

## Architecture

### Backend Structure

#### Models

- **CoursePost** (`backend/src/models/CoursePost.js`)

  - Fields: course, user, title, content, isPinned, isDeleted, timestamps
  - Supports soft deletion

- **CoursePostReply** (`backend/src/models/CoursePostReply.js`)
  - Fields: post, user, content, isDeleted, timestamps
  - Supports soft deletion

#### Repository Layer

- **coursePostRepository.js**: Database operations for posts
  - create, findById, findByCourse, update, delete, togglePin
- **coursePostReplyRepository.js**: Database operations for replies
  - create, findById, findByPost, update, delete, countByPost

#### Service Layer

- **coursePostService.js**: Business logic with authorization checks
  - Validates permissions before allowing edits/deletes
  - Ensures only faculty can pin/unpin posts

#### Controller Layer

- **coursePostController.js**: HTTP request handlers
  - Handles all API endpoints for posts and replies

#### Routes

- **coursePostRoutes.js**: API endpoint definitions
  ```
  POST   /api/courses/:courseId/posts       - Create post
  GET    /api/courses/:courseId/posts       - Get all posts for course
  GET    /api/posts/:id                     - Get single post
  PUT    /api/posts/:id                     - Update post
  DELETE /api/posts/:id                     - Delete post
  PATCH  /api/posts/:id/pin                 - Toggle pin (faculty only)
  POST   /api/posts/:postId/replies         - Create reply
  GET    /api/posts/:postId/replies         - Get all replies
  PUT    /api/replies/:id                   - Update reply
  DELETE /api/replies/:id                   - Delete reply
  ```

### Frontend Structure

#### Services

- **coursePostService.js** (`frontend/src/services/coursePostService.js`)
  - API communication layer for all chatboard operations

#### Components

- **ChatBoard.jsx**: Main component showing all posts with pagination
- **PostCard.jsx**: Individual post display with replies functionality
- **ReplyCard.jsx**: Individual reply display
- **CreatePostModal.jsx**: Modal for creating new posts

#### Views

- **CourseDetail.jsx**: Course detail page with tabs
  - Overview tab: Course information
  - Materials tab: Course materials
  - Discussion Board tab: Chatboard feature

## User Flow

1. **Accessing the Chatboard**

   - From Student Dashboard: Click "View Course" on enrolled courses
   - From Explore Courses: Click "View" on any course
   - Navigate to the "Discussion Board" tab

2. **Creating a Post**

   - Click "+ New Post" button
   - Fill in title and content (max 200/5000 characters)
   - Submit to create

3. **Managing Posts**

   - View all posts (pinned posts appear first)
   - Click "Edit" to modify your post
   - Click "Delete" to remove your post
   - Faculty can pin important posts

4. **Working with Replies**
   - Click "Show Replies" to view/hide replies
   - Type in the reply box and submit
   - Edit or delete your own replies

## Permissions

| Action           | Student | Faculty |
| ---------------- | ------- | ------- |
| Create Post      | ✅      | ✅      |
| Edit Own Post    | ✅      | ✅      |
| Delete Own Post  | ✅      | ✅      |
| Edit Any Post    | ❌      | ✅      |
| Delete Any Post  | ❌      | ✅      |
| Pin/Unpin Post   | ❌      | ✅      |
| Create Reply     | ✅      | ✅      |
| Edit Own Reply   | ✅      | ✅      |
| Delete Own Reply | ✅      | ✅      |
| Edit Any Reply   | ❌      | ✅      |
| Delete Any Reply | ❌      | ✅      |

## Technical Notes

- All deletions are soft deletes (isDeleted flag)
- Posts and replies are populated with user information
- Pagination is supported (20 posts per page, 50 replies per page)
- Real-time updates when content is created/edited/deleted
- Responsive design for mobile and desktop
- Error handling with user-friendly messages

## Future Enhancements

Potential improvements:

- Search and filter posts
- Markdown support for rich text formatting
- File attachments in posts/replies
- Notifications for new replies
- Thread/conversation view
- Upvote/downvote functionality
- Report inappropriate content
- Email notifications for new posts
