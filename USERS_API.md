# Users API Documentation

## Base URL

`/api/users`

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Users

**GET** `/api/users`

Get a paginated list of all users.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search in username, email, or fullName
- `active` (boolean, optional): Filter by active status
- `sort` (string, optional): Sort field (default: "createdAt")
- `order` (string, optional): Sort order "asc" or "desc" (default: "desc")

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&search=john&active=true" \
  -H "Authorization: Bearer your-jwt-token"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "64abc123def456...",
        "email": "john@example.com",
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "",
        "isActive": true,
        "createdAt": "2023-07-01T10:00:00.000Z",
        "updatedAt": "2023-07-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "limit": 10
    }
  }
}
```

### 2. Create New User

**POST** `/api/users`

Create a new user account.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "username": "newuser123",
  "password": "securepassword",
  "fullName": "New User",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser123",
    "password": "securepassword",
    "fullName": "New User"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "64abc123def456...",
    "email": "newuser@example.com",
    "username": "newuser123",
    "fullName": "New User",
    "avatar": "",
    "isActive": true,
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

### 3. Get User by ID

**GET** `/api/users/{id}`

Get a specific user by their ID.

**Path Parameters:**

- `id` (string): User ID (MongoDB ObjectId)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/users/64abc123def456..." \
  -H "Authorization: Bearer your-jwt-token"
```

**Example Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "64abc123def456...",
    "email": "john@example.com",
    "username": "john_doe",
    "fullName": "John Doe",
    "avatar": "",
    "isActive": true,
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

### 4. Update User

**PUT** `/api/users/{id}`

Update a specific user. You can update any combination of fields.

**Path Parameters:**

- `id` (string): User ID (MongoDB ObjectId)

**Request Body (partial update):**

```json
{
  "email": "updated@example.com",
  "username": "updated_username",
  "password": "newpassword",
  "fullName": "Updated Full Name",
  "avatar": "https://example.com/new-avatar.jpg",
  "isActive": false
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:3000/api/users/64abc123def456..." \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "fullName": "Updated Full Name",
    "isActive": false
  }'
```

**Example Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "64abc123def456...",
    "email": "john@example.com",
    "username": "john_doe",
    "fullName": "Updated Full Name",
    "avatar": "",
    "isActive": false,
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T12:30:00.000Z"
  }
}
```

### 5. Delete User

**DELETE** `/api/users/{id}`

Delete a specific user and all their related data (coins, portfolio, etc.).

**Path Parameters:**

- `id` (string): User ID (MongoDB ObjectId)

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/users/64abc123def456..." \
  -H "Authorization: Bearer your-jwt-token"
```

**Example Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Email is required, Password must be at least 6 characters long"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Authentication failed"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "error": "Cannot delete own account",
  "message": "You cannot delete your own account"
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "User not found",
  "message": "User with the specified ID does not exist"
}
```

### Conflict (409)

```json
{
  "success": false,
  "error": "User already exists",
  "message": "Email is already registered"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to create user"
}
```

## Validation Rules

### Email

- Required
- Must be valid email format
- Must be unique

### Username

- Required
- 3-30 characters
- Only letters, numbers, and underscores
- Must be unique

### Password

- Required
- 6-100 characters
- Will be hashed before storage

### Full Name

- Optional
- String value

### Avatar

- Optional
- String value (URL)

### isActive

- Optional
- Boolean value (default: true)

## Security Features

1. **Password Protection**: Passwords are hashed using bcrypt with 12 salt rounds
2. **Authentication Required**: All endpoints require valid JWT token
3. **Input Validation**: All inputs are validated before processing
4. **Duplicate Prevention**: Email and username uniqueness is enforced
5. **Self-Protection**: Users cannot delete their own accounts
6. **Data Cleanup**: When a user is deleted, their related data is also removed
