# Devfolio-Array Backend API Documentation

Welcome to the **Devfolio-Array Backend API Documentation**. This document acts as the reference for front-end integration.

---

## 1. Global Response Structure (The Envelope)

To ensure consistency across the client-side, every JSON response emitted by the backend follows a standard envelope structure.

### Standard Success Format (200 OK / 201 Created)
Returned when an operation executes successfully.
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {} // Can be an object, array, or null
}
```

### Standard Error Format (400 / 401 / 403 / 404 / 422 / 500)
Returned when validation fails, permissions are lacking, or a server issue occurs.
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": { // Present primarily in 422 validation errors
    "email": [
      "The email field is required."
    ]
  }
}
```

---

## 2. Endpoint Registry

All routes are prefixed by `/api`.

### Category A: Authentication & User Details

#### 1. Register User
* **Route:** `POST /api/register`
* **Authentication Required:** No
* **Headers:** 
  * `Content-Type: application/json`
  * `Accept: application/json`
* **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secretpassword",
    "password_confirmation": "secretpassword"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2026-06-24T18:00:00.000000Z",
        "updated_at": "2026-06-24T18:00:00.000000Z"
      }
    }
  }
  ```
* **Error Response Example (422 Unprocessable Entity):**
  ```json
  {
    "success": false,
    "message": "The email has already been taken.",
    "errors": {
      "email": ["The email has already been taken."]
    }
  }
  ```

#### 2. Login User
* **Route:** `POST /api/login`
* **Authentication Required:** No
* **Headers:**
  * `Content-Type: application/json`
  * `Accept: application/json`
* **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "secretpassword"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "1|abcdef1234567890..."
    }
  }
  ```
* **Error Response Example (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```

#### 3. Fetch Logged-in User
* **Route:** `GET /api/user`
* **Authentication Required:** Yes (Sanctum)
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Accept: application/json`
* **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

#### 4. Logout User
* **Route:** `POST /api/logout`
* **Authentication Required:** Yes (Sanctum)
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Accept: application/json`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

---

### Category B: Landing Page & Global Aggregators

#### 1. Retrieve Landing Page (Home) Data
* **Route:** `GET /api/Home`
* **Authentication Required:** No
* **Headers:**
  * `Accept: application/json`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Home page data retrieved successfully.",
    "data": {
      "profile": {
        "name": "Jane Doe",
        "description": "Developer bio summary",
        "image_url": "http://localhost/storage/1/avatar.png"
      },
      "SocialLink": [
        {
          "id": 1,
          "platform": "github",
          "url": "https://github.com/janedoe",
          "platform_name": "Github"
        }
      ],
      "Project": [
        {
          "id": 1,
          "title": "Portfolio App",
          "description": "Project details",
          "github_link": "https://github.com/...",
          "demo_link": "https://demo.com",
          "tags": ["Laravel", "React"],
          "image_url": "http://localhost/storage/2/project.png"
        }
      ],
      "Article": [
        {
          "id": 1,
          "title": "Laravel Guide",
          "excerpt": "Brief excerpt summary",
          "feature_image": "http://localhost/storage/articles/images/...",
          "feature_video": null,
          "tags": ["PHP", "Backend"]
        }
      ]
    }
  }
  ```

#### 2. Retrieve Portfolio Profile Data
* **Route:** `GET /api/portfolio-data`
* **Authentication Required:** No
* **Headers:**
  * `Accept: application/json`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Landing page data retrieved successfully.",
    "data": {
      "about": {
        "id": 1,
        "title": "Software Engineer",
        "description": "Full-stack engineer bio text...",
        "image_url": "http://localhost/storage/media/avatar.png",
        "cv_url": "http://localhost/storage/media/cv.pdf"
      },
      "skills": [
        {
          "id": 1,
          "title": "Backend Development",
          "icon": "fa-code",
          "skills": ["PHP", "Laravel", "MySQL"]
        }
      ],
      "experience": [
        {
          "id": 1,
          "job_title": "Senior Developer",
          "company": "Tech Corp",
          "location": "Remote",
          "duration": "2024 - Present",
          "tasks": ["Developed APIs", "Maintained Servers"]
        }
      ],
      "education": [
        {
          "id": 1,
          "degree": "Computer Science",
          "university": "State University",
          "location": "Cairo, Egypt",
          "duration": "2020 - 2024",
          "grade": "Excellent",
          "description": "Learnt software patterns."
        }
      ]
    }
  }
  ```

---

### Category C: Profile & About Sections (Admin)

#### 1. Retrieve Profile Metadata
* **Route:** `GET /api/profiles`
* **Authentication Required:** No
* **Headers:** `Accept: application/json`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully.",
    "data": {
      "name": "Jane Doe",
      "description": "Sleek frontend dev bio...",
      "image_url": "http://localhost/storage/avatar.png"
    }
  }
  ```

#### 2. Update About Me Information (Single Row, id: 1)
* **Route:** `POST /api/about/update`
* **Authentication Required:** Yes (Sanctum)
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Content-Type: multipart/form-data` (if uploading files)
  * `Accept: application/json`
* **Request Body (Multipart Form):**
  * `title`: "Lead Architect" (string, required)
  * `description`: "Long bio detail..." (string, required)
  * `image_file`: Binary file (jpeg, png, jpg, webp - max 2MB, optional)
  * `cv_file`: Binary file (pdf - max 5MB, optional)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "About details and files saved successfully.",
    "data": {
      "id": 1,
      "title": "Lead Architect",
      "description": "Long bio detail...",
      "image_url": "http://localhost/storage/media/avatar.png",
      "cv_url": "http://localhost/storage/media/cv.pdf"
    }
  }
  ```

---

### Category D: Portfolio Section CRUD Operations (Admin)

Below are the routes for Managing Skills, Experiences, Educations, and Projects.

| Section | Route | Method | Auth | Multipart Files Specs |
|---|---|---|---|---|
| **Skills** | `/api/skills` | `POST` | Yes | N/A (JSON structure body) |
| **Skills** | `/api/skills/{id}` | `POST` | Yes | N/A |
| **Skills** | `/api/skills/{id}` | `DELETE`| Yes | N/A |
| **Experiences** | `/api/experiences` | `POST` | Yes | N/A |
| **Experiences** | `/api/experiences/{id}` | `POST` | Yes | N/A |
| **Experiences** | `/api/experiences/{id}` | `DELETE`| Yes | N/A |
| **Education** | `/api/education` | `POST` | Yes | N/A |
| **Education** | `/api/education/{id}` | `POST` | Yes | N/A |
| **Education** | `/api/education/{id}` | `DELETE`| Yes | N/A |
| **Projects** | `/api/projects` | `POST` | Yes | `project_image` (jpeg, png, max 2MB) |
| **Projects** | `/api/projects/{id}`| `POST` | Yes | `project_image` (jpeg, png, max 2MB) |
| **Projects** | `/api/projects/{id}`| `DELETE`| Yes | N/A |

#### Request Body Structure for Submitting Skills Group (`POST /api/skills`)
```json
{
  "title": "Backend Engineering",
  "icon": "fa-server",
  "skills": ["PHP", "Laravel", "MySQL", "Redis"]
}
```

#### Request Body Structure for Submitting Experience (`POST /api/experiences`)
```json
{
  "job_title": "Full-stack Developer",
  "company": "Alpha Tech",
  "location": "Remote",
  "duration": "Jan 2025 - Present",
  "tasks": ["Architected MySQL schemas", "Standardized RESTful APIs"]
}
```

---

### Category E: Blog (Articles) Management

#### 1. Retrieve Paginated Articles List
* **Route:** `GET /api/articles`
* **Query Parameters:**
  * `per_page`: Number of articles per page (default: 5, max: 50)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Articles retrieved successfully.",
    "data": [
      {
        "id": 1,
        "title": "Building REST APIs in Laravel",
        "excerpt": "Learn the best practices in REST architecture...",
        "feature_image": "http://localhost/storage/articles/images/...",
        "feature_video": null,
        "tags": ["Laravel", "APIs"],
        "author": {
          "id": 1,
          "name": "Jane Doe"
        },
        "stats": {
          "views": 420,
          "likes": 69,
          "liked": false
        },
        "date": {
          "raw": "2026-06-24T18:00:00.000000Z",
          "diff": "2 hours ago"
        }
      }
    ]
  }
  ```

#### 2. Create English Article with Block Media
* **Route:** `POST /api/articles`
* **Authentication Required:** Yes (Sanctum)
* **Headers:** `Content-Type: multipart/form-data`
* **Request Body (Multipart Form):**
  * `title_en`: "How to code" (string, required)
  * `excerpt_en`: "Short summary..." (string, required)
  * `tags[]`: Array of tag strings (optional)
  * `feature_image`: Binary file (optional)
  * `feature_video`: Binary file (optional)
  * `content_en[0][title]`: "Introduction" (string, optional)
  * `content_en[0][text]`: "Text intro detail..." (string, optional)
  * `content_en[0][code]`: "echo 'Hello';" (string, optional)
  * `content_images[0][]`: Binary file (optional image block attachment)
  * `content_videos[0][]`: Binary file (optional video block attachment)
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "English article with media created successfully.",
    "data": {
      "article_id": 12
    }
  }
  ```

#### 3. Link Arabic Translation (Texts-only)
* **Route:** `POST /api/articles/{id}/translate`
* **Authentication Required:** Yes (Sanctum)
* **Request Body (JSON):**
  ```json
  {
    "title_ar": "كيفية البرمجة",
    "excerpt_ar": "ملخص قصير...",
    "content_ar": [
      {
        "title": "مقدمة",
        "text": "تفاصيل المقدمة هنا..."
      }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Arabic translation linked successfully."
  }
  ```

#### 4. Toggle Article Like
* **Route:** `POST /api/articles/{id}/like`
* **Authentication Required:** No (Uses client IP address)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Article liked successfully.", // or "Like removed successfully."
    "data": {
      "liked": true,
      "likes_count": 70
    }
  }
  ```

---

### Category F: Contact Form Messages

#### 1. Public Submission
* **Route:** `POST /api/contact`
* **Authentication Required:** No
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "Visitor Name",
    "email": "visitor@example.com",
    "message": "Hi, I am looking to hire you for a custom Laravel backend refactoring project."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Your message has been sent successfully!"
  }
  ```
* **Error Response Example (422 Unprocessable Entity):**
  ```json
  {
    "success": false,
    "message": "Validation failed.",
    "errors": {
      "message": [
        "The message field must be at least 10 characters."
      ]
    }
  }
  ```

#### 2. Retrieve All Contact Messages (Admin Dashboard)
* **Route:** `GET /api/contacts`
* **Authentication Required:** Yes (Sanctum)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Contact messages retrieved successfully.",
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "name": "Visitor Name",
          "email": "visitor@example.com",
          "message": "Hi, I am looking to hire you...",
          "ip_address": "127.0.0.1",
          "created_at": "2026-06-24 18:30:00"
        }
      ],
      "first_page_url": "http://localhost/api/contacts?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost/api/contacts?page=1",
      "next_page_url": null,
      "path": "http://localhost/api/contacts",
      "per_page": 10,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    }
  }
  ```

#### 3. Retrieve Single Contact Message Detail (Admin Dashboard)
* **Route:** `GET /api/contacts/{id}`
* **Authentication Required:** Yes (Sanctum)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Contact message retrieved successfully.",
    "data": {
      "id": 1,
      "name": "Visitor Name",
      "email": "visitor@example.com",
      "message": "Hi, I am looking to hire you...",
      "ip_address": "127.0.0.1",
      "created_at": "2026-06-24 18:30:00"
    }
  }
  ```

#### 4. Delete Contact Message (Admin Dashboard)
* **Route:** `DELETE /api/contacts/{id}`
* **Authentication Required:** Yes (Sanctum)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Contact message deleted successfully."
  }
  ```

---

## 3. File Upload Specs

For any endpoint that accepts file uploads, you **must** use the `multipart/form-data` request encoding payload structure. Laravel does not natively parse multipart payloads inside standard `PUT` or `PATCH` requests; therefore, **all creation and update endpoints for files use the `POST` HTTP Verb**.

| Endpoint Route | Form Parameter Key | Accepted Mime Types | File Size Limit |
|---|---|---|---|
| `POST /api/about/update` | `image_file` | `jpeg, png, jpg, webp` | 2 MB |
| `POST /api/about/update` | `cv_file` | `pdf` | 5 MB |
| `POST /api/projects` | `project_image` | `jpeg, png, jpg, gif` | 2 MB |
| `POST /api/projects/{id}` | `project_image` | `jpeg, png, jpg, gif` | 2 MB |
| `POST /api/profiles` | `image` | `jpeg, png, jpg, gif` | 2 MB |
| `POST /api/profiles/{id}` | `image` | `jpeg, png, jpg, gif` | 2 MB |
| `POST /api/articles` | `feature_image` | `jpeg, png, jpg, gif, webp` | 2 MB |
| `POST /api/articles` | `feature_video` | `mp4, mov, avi, wmv` | 10 MB |
| `POST /api/articles` | `content_images[index][]` | `jpeg, png, jpg, gif` | 2 MB |
| `POST /api/articles` | `content_videos[index][]` | `mp4, mov, avi, wmv` | 10 MB |
