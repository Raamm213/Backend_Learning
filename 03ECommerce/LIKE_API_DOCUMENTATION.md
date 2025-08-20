# Like API Documentation

## Overview
The Like API provides endpoints for managing likes on various content types (videos, comments, tweets) in your e-commerce application.

## Base URL
```
http://localhost:8000/api/v1/likes
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Like
**POST** `/api/v1/likes`

Creates a new like for a video, comment, or tweet.

**Request Body:**
```json
{
  "video": "video_id_here",     // Optional - ID of the video to like
  "comment": "comment_id_here",  // Optional - ID of the comment to like  
  "tweet": "tweet_id_here"      // Optional - ID of the tweet to like
}
```
**Note:** At least one content type must be provided.

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "like_id",
    "video": "video_id",
    "comment": null,
    "tweet": null,
    "likedBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Like created successfully"
}
```

### 2. Remove Like
**DELETE** `/api/v1/likes/:id`

Removes a like by its ID.

**Parameters:**
- `id` (path): The ID of the like to remove

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "like_id",
    "video": "video_id",
    "comment": null,
    "tweet": null,
    "likedBy": "user_id"
  },
  "message": "Like removed successfully"
}
```

### 3. Get Likes by User
**GET** `/api/v1/likes/user/:id`

Retrieves all likes made by a specific user.

**Parameters:**
- `id` (path): The ID of the user

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "like_id_1",
      "video": "video_id_1",
      "comment": null,
      "tweet": null,
      "likedBy": "user_id"
    },
    {
      "_id": "like_id_2", 
      "video": null,
      "comment": "comment_id_1",
      "tweet": null,
      "likedBy": "user_id"
    }
  ],
  "message": "Successfully retrieved likes by user"
}
```

### 4. Get Likes by Video
**GET** `/api/v1/likes/video/:id`

Retrieves all likes for a specific video.

**Parameters:**
- `id` (path): The ID of the video

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "like_id_1",
      "video": "video_id",
      "comment": null,
      "tweet": null,
      "likedBy": "user_id_1"
    },
    {
      "_id": "like_id_2",
      "video": "video_id", 
      "comment": null,
      "tweet": null,
      "likedBy": "user_id_2"
    }
  ],
  "message": "Successfully retrieved likes for video"
}
```

### 5. Get Likes by Comment
**GET** `/api/v1/likes/comment/:id`

Retrieves all likes for a specific comment.

**Parameters:**
- `id` (path): The ID of the comment

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "like_id_1",
      "video": null,
      "comment": "comment_id",
      "tweet": null,
      "likedBy": "user_id_1"
    }
  ],
  "message": "Successfully retrieved likes for comment"
}
```

### 6. Get Likes by Tweet
**GET** `/api/v1/likes/tweet/:id`

Retrieves all likes for a specific tweet.

**Parameters:**
- `id` (path): The ID of the tweet

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "like_id_1",
      "video": null,
      "comment": null,
      "tweet": "tweet_id",
      "likedBy": "user_id_1"
    }
  ],
  "message": "Successfully retrieved likes for tweet"
}
```

### 7. Check Like Status
**GET** `/api/v1/likes/check/:id?type=<content_type>`

Checks if the authenticated user has liked a specific piece of content.

**Parameters:**
- `id` (path): The ID of the content to check
- `type` (query): The type of content - must be one of: `video`, `comment`, or `tweet`

**Example Request:**
```
GET /api/v1/likes/check/64f1a2b3c4d5e6f7g8h9i0j1?type=video
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "isLiked": true,
    "contentId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "contentType": "video"
  },
  "message": "Like status checked successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "At least one content type (comment, video, or tweet) is required"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "User not authenticated"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Like not found"
}
```

## Usage Examples

### Frontend JavaScript Examples

#### Create a Like
```javascript
const createLike = async (contentType, contentId) => {
  try {
    const response = await fetch('/api/v1/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        [contentType]: contentId
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating like:', error);
  }
};

// Usage
createLike('video', '64f1a2b3c4d5e6f7g8h9i0j1');
```

#### Check Like Status
```javascript
const checkLikeStatus = async (contentId, contentType) => {
  try {
    const response = await fetch(`/api/v1/likes/check/${contentId}?type=${contentType}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.data.isLiked;
  } catch (error) {
    console.error('Error checking like status:', error);
  }
};

// Usage
const isLiked = await checkLikeStatus('64f1a2b3c4d5e6f7g8h9i0j1', 'video');
```

#### Remove a Like
```javascript
const removeLike = async (likeId) => {
  try {
    const response = await fetch(`/api/v1/likes/${likeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing like:', error);
  }
};
```

## Testing with Postman

1. **Set up environment variables:**
   - `base_url`: `http://localhost:8000/api/v1/likes`
   - `auth_token`: Your JWT token

2. **Test endpoints:**
   - Use the Authorization tab to set Bearer token
   - Test each endpoint with appropriate parameters

## Notes

- The Like model supports liking multiple content types (videos, comments, tweets)
- Each like is associated with a user through the `likedBy` field
- The system prevents duplicate likes through the unique combination of content and user
- All timestamps are automatically managed by Mongoose
- The API follows RESTful conventions for consistency
