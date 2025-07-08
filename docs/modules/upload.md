# Upload Module

The Upload module provides secure image upload functionality using Cloudinary as the storage service. It supports both single and batch image uploads through multiple endpoints with different security levels.

## Features

- **Single Image Upload**: Upload one image at a time
- **Batch Image Upload**: Upload multiple images in a single request  
- **Cloudinary Integration**: Uses Cloudinary for optimized cloud storage
- **Image Validation**: Validates file types, sizes, and image format
- **Error Handling**: Robust error handling with partial success for batch uploads
- **Custom Folders**: Organize uploads in different Cloudinary folders
- **JWT Authentication**: Auth0 JWT token validation for secure endpoints
- **Permission-Based Access**: Granular permissions control (`upload:images`)
- **Rate Limiting**: Different limits for public and authenticated endpoints
- **Dual Security Levels**: Public and authenticated endpoints for different use cases

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret

# Auth0 Configuration (for authenticated endpoints)
ISSUER_BASE_URL=https://your-auth0-domain.auth0.com/
AUDIENCE=https://your-api-audience.com
AUTH_SECRET=your-auth-secret
TOKEN_SIGNING_ALG=RS256
```

### File Limits

- **Max file size**: 10MB per file
- **Max files per batch**: 10 files (authenticated), 5 files (public)
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP

### Rate Limits

- **Public endpoint**: 20 uploads per minute
- **Authenticated endpoint**: 5 uploads per minute (more secure, fewer limits needed)
- **Global API limit**: 100 requests per minute

## API Endpoints

### POST `/upload/images/public` (Public)

Upload single or multiple images without authentication. Has stricter rate limits.

### POST `/upload/images` (Authenticated)

Upload single or multiple images with JWT authentication and permission validation.

#### Parameters

- `file` (optional): Single file for upload
- `files` (optional): Multiple files for batch upload
- `folder` (query, optional): Cloudinary folder name (default: "tenat-uploads")

#### Public Upload Examples

```bash
# Single file upload (public)
curl -X POST \
  http://localhost:3005/upload/images/public \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@image.jpg'

# Batch upload (public)
curl -X POST \
  http://localhost:3005/upload/images/public \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@image1.jpg' \
  -F 'files=@image2.png'

# With custom folder (public)
curl -X POST \
  'http://localhost:3005/upload/images/public?folder=public-gallery' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@gallery.jpg'
```

#### Authenticated Upload Examples

```bash
# Single file upload (authenticated)
curl -X POST \
  http://localhost:3005/upload/images \
  -H 'Content-Type: multipart/form-data' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@image.jpg'

# Batch upload (authenticated)
curl -X POST \
  http://localhost:3005/upload/images \
  -H 'Content-Type: multipart/form-data' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'files=@image1.jpg' \
  -F 'files=@image2.png' \
  -F 'files=@image3.gif'

# With custom folder (authenticated)
curl -X POST \
  'http://localhost:3005/upload/images?folder=products' \
  -H 'Content-Type: multipart/form-data' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@product.jpg'
```

## Response Formats

### Single Upload Response

```json
{
  "originalName": "image.jpg",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tenat-uploads/unique-id.jpg",
  "size": 245760,
  "mimeType": "image/jpeg"
}
```

### Batch Upload Response

```json
{
  "successful": [
    {
      "originalName": "image1.jpg",
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tenat-uploads/unique-id-1.jpg",
      "size": 245760,
      "mimeType": "image/jpeg"
    }
  ],
  "failed": [
    {
      "originalName": "invalid.txt", 
      "error": "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed"
    }
  ],
  "total": 2,
  "successCount": 1,
  "failureCount": 1
}
```

## Frontend Integration Examples

### JavaScript/TypeScript

```typescript
// Single file upload
const uploadSingle = async (file: File, folder?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = folder ? `/upload/images?folder=${folder}` : '/upload/images';
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};

// Batch upload
const uploadBatch = async (files: File[], folder?: string) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const url = folder ? `/upload/images?folder=${folder}` : '/upload/images';
  
  const response = await fetch(url, {
    method: 'POST', 
    body: formData,
  });
  
  return response.json();
};
```

### React Hook Example

```tsx
import { useState } from 'react';

const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[], folder?: string) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const url = folder ? `/upload/images?folder=${folder}` : '/upload/images';
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImages, uploading, error };
};
```

## Error Handling

The module provides comprehensive error handling:

- **File validation errors**: Invalid file types, sizes, or formats
- **Upload failures**: Network issues or Cloudinary errors  
- **Batch processing**: Partial failures are handled gracefully
- **Missing files**: Clear error messages for missing uploads

## Security Features

### Authentication & Authorization

1. **JWT Token Validation**: Auth0 JWT tokens are validated using JWKS
2. **Permission-Based Access**: Users need `upload:images` permission
3. **User Context**: All uploads are tracked with user ID for audit trails
4. **Dual Access Levels**: Public and authenticated endpoints for different security needs

### Rate Limiting

1. **Endpoint-Specific Limits**: Different limits for public vs authenticated endpoints
2. **Global Protection**: Overall API rate limiting to prevent abuse
3. **Configurable Throttling**: Easy to adjust limits based on usage patterns

### File Security

1. **File type validation**: Only allows image file types
2. **Size limits**: Prevents large file uploads that could impact performance
3. **Magic byte validation**: Validates actual file content, not just extensions
4. **Batch size limits**: Different limits for public vs authenticated users

### Additional Security Considerations

1. **CORS Configuration**: Configure CORS for frontend integration
2. **Input Sanitization**: All file inputs are validated and sanitized
3. **Error Handling**: Security-aware error messages that don't leak sensitive information
4. **Audit Logging**: User actions are logged for security monitoring

## Performance Optimizations

- **Parallel processing**: Batch uploads are processed in parallel
- **Image optimization**: Cloudinary automatically optimizes images
- **Memory storage**: Uses memory storage for temporary file handling
- **Size constraints**: Prevents memory exhaustion with size limits

## Troubleshooting

### Common Issues

1. **Cloudinary configuration**: Ensure environment variables are set correctly
2. **File size limits**: Check if files exceed the 10MB limit
3. **Network timeouts**: Large batch uploads may need increased timeout settings
4. **CORS issues**: Configure CORS for frontend integration

### Authentication Setup

For the authenticated endpoints, users need:
1. Valid Auth0 JWT token in Authorization header
2. `upload:images` permission in their token
3. Email verification (recommended)

#### JWT Token Requirements

The JWT token must include:
- `sub`: User ID
- `iss`: Must match ISSUER_BASE_URL
- `aud`: Must match AUDIENCE
- `permissions`: Array including 'upload:images'

#### Permission Configuration

In Auth0, create a permission called `upload:images` and assign it to users or roles that should have upload access.

### Debugging

Enable detailed logging by setting `NODE_ENV=development` in your environment.

#### Common Authentication Issues

1. **Invalid token**: Check token format and expiration
2. **Missing permissions**: Verify user has `upload:images` permission
3. **JWKS errors**: Ensure ISSUER_BASE_URL is correctly configured
4. **Rate limiting**: Check if hitting endpoint-specific limits 