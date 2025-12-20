# Course Materials Upload Feature

## Overview

Course administrators and faculty can upload various types of course materials including documents, videos, and presentations directly through the Course Management interface.

## Features

### Supported File Types

- **Documents**: PDF, Word (.doc, .docx), Text files, Excel (.xls, .xlsx)
- **Presentations**: PowerPoint (.ppt, .pptx)
- **Videos**: MP4, MOV, AVI, WMV
- **Images**: JPEG, PNG, GIF
- **Archives**: ZIP, RAR

### File Size Limit

- Maximum file size: 100MB per file

## Backend Implementation

### New Files Created

1. **`src/middleware/upload.js`**: Multer configuration for file upload handling
2. **`src/controllers/uploadController.js`**: Controllers for upload and deletion operations
3. **`uploads/`**: Directory structure for storing uploaded files (organized by type)

### API Endpoints

#### Upload Course Material

```
POST /api/courses/:id/upload
Authorization: Required (Admin/Faculty)
Content-Type: multipart/form-data

Body (FormData):
- file: File (required)
- title: String (optional, defaults to filename)
- type: String (optional, auto-detected from mimetype)
- description: String (optional)
- order: Number (optional, defaults to 0)

Response:
{
  "success": true,
  "data": {...courseDetail},
  "file": {
    "filename": "...",
    "originalname": "...",
    "mimetype": "...",
    "size": 1234,
    "path": "/uploads/documents/..."
  }
}
```

#### Delete Course Material

```
DELETE /api/courses/materials/:detailId
Authorization: Required (Admin/Faculty)

Response:
{
  "success": true,
  "message": "Course material deleted successfully"
}
```

### Database Schema

Uses existing `CourseDetail` model:

- `course`: Reference to Course
- `title`: Material title
- `type`: enum ["document", "video", "presentation", "other"]
- `url`: File path (for uploads) or external URL
- `description`: Optional description
- `order`: Display order
- `isActive`: Visibility status

## Frontend Implementation

### New Components

1. **`CourseMaterialsModal.jsx`**: Modal for viewing, uploading, and managing course materials

### Features

- Browse existing materials by course
- Upload new materials with metadata
- Delete uploaded materials
- Download materials via direct links
- Visual type indicators (icons for document/video/presentation)
- Real-time upload progress feedback

### Usage

1. Navigate to Course Management page (`/admin/courses`)
2. Click "Materials" button for any course
3. Click "Upload Material" to add new files
4. Fill in metadata (title, type, description)
5. Click "Upload" to submit

## File Storage

- Files are stored in `/backend/uploads/` directory
- Organized by type: `documents/`, `videos/`, `presentations/`, `other/`
- Filename format: `originalname-timestamp-random.ext`
- Files are served statically at `/uploads/` URL path

## Security

- Only authenticated admin and faculty users can upload/delete
- File type validation using MIME types
- File size limit enforced (100MB)
- Uploaded files are automatically deleted when material is removed
- Files are stored outside the public web root

## Notes

- The `/backend/uploads/` directory is git-ignored to prevent committing large files
- Ensure sufficient disk space for file storage
- Consider implementing cloud storage (S3, etc.) for production use
- Video files may take longer to upload depending on size and connection speed
