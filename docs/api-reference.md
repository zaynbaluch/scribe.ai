# Scribe.ai — API Reference

> Detailed endpoint specification with request/response schemas. Agents should implement controllers to match these contracts exactly.

---

## Base URL

```
Development: http://localhost:3001/api
AI Service:  http://localhost:8000/ai
```

## Authentication

All endpoints under `/api/*` (except auth) require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

## Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [...]
  }
}
```

## Standard Pagination

For list endpoints, use query params:

```
?page=1&limit=20&sort=createdAt&order=desc
```

Response includes:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

---

## 1. Auth

### `POST /api/auth/login`

Start OAuth flow or exchange OAuth code for session.

**Request:**
```json
{
  "provider": "google" | "linkedin" | "github",
  "code": "oauth_authorization_code",
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "refresh...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "name": "John Doe",
      "avatarUrl": "https://...",
      "plan": "free"
    }
  }
}
```

---

### `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt...",
    "expiresIn": 3600
  }
}
```

---

### `POST /api/auth/logout`

**Response (200):**
```json
{ "success": true, "data": null }
```

---

### `GET /api/auth/me`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@email.com",
    "name": "John Doe",
    "avatarUrl": "https://...",
    "plan": "free",
    "vanitySlug": "johndoe",
    "createdAt": "2026-04-21T10:00:00Z"
  }
}
```

---

## 2. Profile

### `GET /api/profile`

Get the authenticated user's full profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "summary": "Experienced software engineer...",
    "headline": "Software Engineer",
    "location": "Islamabad, Pakistan",
    "phone": "+92...",
    "website": "https://johndoe.dev",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "experiences": [
      {
        "id": "uuid",
        "title": "Backend Engineer",
        "company": "TechCorp",
        "location": "Remote",
        "startDate": "2024-06",
        "endDate": null,
        "current": true,
        "bullets": [
          "Designed REST APIs serving 10K+ requests/min",
          "Led migration from MongoDB to PostgreSQL"
        ]
      }
    ],
    "education": [...],
    "skills": [
      { "name": "Python", "category": "language", "proficiency": "expert" },
      { "name": "React", "category": "framework", "proficiency": "advanced" }
    ],
    "projects": [...],
    "certifications": [...],
    "publications": [...],
    "volunteerWork": [...],
    "completeness": 78
  }
}
```

---

### `PUT /api/profile`

Update profile (partial update — only send changed fields).

**Request:**
```json
{
  "summary": "Updated summary...",
  "skills": [
    { "name": "Python", "category": "language", "proficiency": "expert" },
    { "name": "Docker", "category": "tool", "proficiency": "intermediate" }
  ]
}
```

**Response (200):** Updated full profile (same shape as GET).

---

### `POST /api/profile/import`

Import profile from uploaded file.

**Request:** `multipart/form-data`
- `file`: PDF or DOCX file (max 10MB)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "parsed": {
      "summary": "Extracted summary...",
      "experiences": [...],
      "education": [...],
      "skills": [...],
      "projects": [...],
      "certifications": [...]
    },
    "confidence": 0.87
  }
}
```

The client should show this as a draft for the user to review before saving to their profile.

---

### `POST /api/profile/import/url`

Import profile from a public LinkedIn URL.

**Request:**
```json
{
  "url": "https://linkedin.com/in/johndoe"
}
```

**Response (200):** Same shape as file import response.

---

## 3. Resumes

### `GET /api/resumes`

**Query params:** `?page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Backend Engineer v1",
      "templateId": "modern-01",
      "atsScore": 92,
      "jobId": null,
      "createdAt": "2026-04-20T...",
      "updatedAt": "2026-04-21T..."
    }
  ],
  "pagination": { ... }
}
```

---

### `POST /api/resumes`

**Request:**
```json
{
  "name": "ML Engineer v1",
  "templateId": "modern-01",
  "sectionVisibility": {
    "summary": true,
    "experience": true,
    "education": true,
    "skills": true,
    "projects": true,
    "certifications": false,
    "publications": false,
    "volunteerWork": false
  },
  "sectionOrder": ["summary", "experience", "skills", "projects", "education"],
  "customStyles": {
    "font": "Inter",
    "fontSize": 11,
    "lineSpacing": 1.15,
    "accentColor": "#6C5CE7",
    "marginTop": 0.5,
    "marginBottom": 0.5,
    "marginLeft": 0.6,
    "marginRight": 0.6
  }
}
```

**Response (201):** Full resume object.

---

### `GET /api/resumes/:id`

**Response (200):** Full resume object including `baseProfileSnapshot` and `tailoredContent`.

---

### `PUT /api/resumes/:id`

Partial update (same fields as POST).

---

### `DELETE /api/resumes/:id`

**Response (200):** `{ "success": true, "data": null }`

---

### `POST /api/resumes/:id/tailor`

Tailor this resume for a specific job.

**Request:**
```json
{
  "jobId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumeId": "uuid",
    "jobId": "uuid",
    "matchScore": 78,
    "tailoredContent": {
      "summary": "Tailored summary text...",
      "experience": [
        {
          "id": "exp-uuid",
          "bullets": [
            { "original": "Built APIs", "tailored": "Built REST APIs handling 10K+ RPM using FastAPI", "changed": true },
            { "original": "Managed team", "tailored": "Managed team", "changed": false }
          ]
        }
      ],
      "sectionOrder": ["summary", "skills", "experience", "projects", "education"]
    },
    "suggestions": [
      {
        "id": "sug-1",
        "type": "rewrite",
        "section": "experience",
        "original": "Built APIs",
        "suggested": "Built REST APIs handling 10K+ RPM using FastAPI",
        "reason": "Added quantification and matched JD keyword 'FastAPI'"
      }
    ]
  }
}
```

---

### `GET /api/resumes/:id/ats-score`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 92,
    "checks": [
      { "name": "No tables detected", "passed": true, "category": "formatting" },
      { "name": "Standard section headings", "passed": true, "category": "structure" },
      { "name": "Contact info complete", "passed": false, "message": "Missing phone number", "category": "content" },
      { "name": "Keyword density", "passed": true, "score": 85, "category": "keywords" }
    ],
    "passedCount": 21,
    "totalChecks": 23,
    "suggestions": [
      "Add phone number to contact information",
      "Consider adding 2 more industry keywords"
    ]
  }
}
```

---

### `GET /api/resumes/:id/export/:format`

**Params:** `format` = `pdf` | `docx` | `txt` | `latex` | `json`

**Response:** Binary file download with appropriate Content-Type header.

---

## 4. Cover Letters

### `POST /api/cover-letters/generate`

**Request:**
```json
{
  "jobId": "uuid",
  "resumeId": "uuid",
  "tone": "formal" | "conversational" | "storytelling"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "jobId": "uuid",
    "resumeId": "uuid",
    "content": "Dear Hiring Manager,\n\n...",
    "tone": "formal",
    "createdAt": "..."
  }
}
```

---

### `PUT /api/cover-letters/:id`

**Request:**
```json
{
  "content": "Updated letter text..."
}
```

---

### `GET /api/cover-letters/:id/export/:format`

**Params:** `format` = `pdf` | `docx`

---

## 5. Jobs

### `POST /api/jobs`

**Request (raw text):**
```json
{
  "rawDescription": "We are looking for a Senior Backend Engineer...",
  "title": "Senior Backend Engineer",
  "company": "TechCorp",
  "url": null,
  "source": "manual"
}
```

**Request (URL):**
```json
{
  "url": "https://linkedin.com/jobs/view/12345",
  "source": "linkedin"
}
```

**Response (201):** Full job object with `parsedKeywords`, `companyTone`, `matchScore`, `matchBreakdown`.

---

### `GET /api/jobs/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Senior Backend Engineer",
    "company": "TechCorp",
    "location": "Remote",
    "url": "https://...",
    "source": "linkedin",
    "rawDescription": "We are looking for...",
    "parsedKeywords": {
      "required": ["Python", "FastAPI", "PostgreSQL"],
      "preferred": ["Docker", "Kubernetes", "AWS"],
      "tools": ["Git", "Jira"],
      "softSkills": ["leadership", "communication"]
    },
    "companyTone": "startup",
    "matchScore": 78,
    "matchBreakdown": {
      "strong": ["Python", "FastAPI", "PostgreSQL", "Git"],
      "partial": ["Docker", "leadership"],
      "gaps": ["Kubernetes", "AWS"]
    },
    "createdAt": "..."
  }
}
```

---

### `POST /api/jobs/:id/analyze`

Re-run analysis (e.g., after profile update).

**Response (200):** Updated job object with fresh `matchScore` and `matchBreakdown`.

---

## 6. Applications

### `GET /api/applications`

**Query params:** `?status=applied&page=1&limit=50`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "jobId": "uuid",
      "job": { "title": "...", "company": "..." },
      "resumeId": "uuid",
      "resumeName": "Backend Engineer v1",
      "status": "applied",
      "appliedAt": "2026-04-18T...",
      "nextDeadline": "2026-04-25T...",
      "notes": "Referred by Ali"
    }
  ],
  "pagination": { ... }
}
```

---

### `POST /api/applications`

**Request:**
```json
{
  "jobId": "uuid",
  "resumeId": "uuid",
  "coverLetterId": "uuid",
  "status": "applied",
  "appliedAt": "2026-04-21T10:00:00Z",
  "notes": "Applied via company website",
  "contactName": "Sarah HR",
  "contactEmail": "sarah@techcorp.com",
  "salaryRange": "$120K–$150K"
}
```

---

### `PUT /api/applications/:id`

Partial update. Most common: status change.

```json
{
  "status": "interview",
  "nextDeadline": "2026-04-28T14:00:00Z",
  "notes": "Technical interview scheduled"
}
```

---

### `GET /api/applications/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "byStatus": {
      "saved": 5,
      "applied": 20,
      "screening": 7,
      "interview": 5,
      "offer": 2,
      "rejected": 3
    },
    "responseRate": 0.35,
    "interviewRate": 0.17,
    "offerRate": 0.05,
    "thisWeek": {
      "applied": 8,
      "responses": 3
    }
  }
}
```

---

## 7. Templates

### `GET /api/templates`

**Query params:** `?type=resume&category=modern`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "modern-01",
      "name": "Modern Clean",
      "category": "modern",
      "type": "resume",
      "thumbnailUrl": "https://cdn.scribe.ai/templates/modern-01.png",
      "isPremium": false
    }
  ]
}
```

---

## 8. Portfolio

### `GET /api/portfolio/config`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "templateId": "developer",
    "accentColor": "#6C5CE7",
    "sectionVisibility": {
      "summary": true,
      "experience": true,
      "skills": true,
      "projects": true,
      "education": true,
      "certifications": false
    },
    "sectionOrder": ["summary", "skills", "experience", "projects", "education"],
    "slug": "johndoe",
    "isPasswordProtected": false,
    "totalViews": 234
  }
}
```

---

### `PUT /api/portfolio/config`

```json
{
  "templateId": "professional",
  "accentColor": "#00B894",
  "sectionVisibility": { ... },
  "slug": "john-doe",
  "isPasswordProtected": true,
  "password": "secret123"
}
```

---

## 9. AI Service (Internal)

These endpoints are called server-to-server from the Node API to the Python AI service. Not exposed to the client.

### `POST /ai/parse-resume`

**Request:** `multipart/form-data` with `file` field.

**Response:**
```json
{
  "summary": "...",
  "experiences": [...],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "certifications": [...],
  "confidence": 0.87
}
```

---

### `POST /ai/parse-jd`

**Request:**
```json
{
  "text": "Full job description text...",
  "url": null
}
```

**Response:**
```json
{
  "title": "Senior Backend Engineer",
  "company": "TechCorp",
  "location": "Remote",
  "keywords": {
    "required": [...],
    "preferred": [...],
    "tools": [...],
    "softSkills": [...]
  },
  "tone": "startup",
  "experience_level": "senior"
}
```

---

### `POST /ai/match-score`

**Request:**
```json
{
  "profile": { ... },
  "jobKeywords": { ... }
}
```

**Response:**
```json
{
  "score": 78,
  "strong": ["Python", "FastAPI"],
  "partial": ["Docker"],
  "gaps": ["Kubernetes", "AWS"]
}
```

---

### `POST /ai/tailor`

**Request:**
```json
{
  "profile": { ... },
  "jobKeywords": { ... },
  "currentResume": { ... },
  "tone": "startup"
}
```

**Response:**
```json
{
  "tailoredContent": { ... },
  "suggestions": [...]
}
```

---

### `POST /ai/cover-letter`

**Request:**
```json
{
  "profile": { ... },
  "job": { ... },
  "tone": "formal",
  "resumeContent": { ... }
}
```

**Response:**
```json
{
  "content": "Dear Hiring Manager,\n\n..."
}
```

---

### `POST /ai/ats-check`

**Request:**
```json
{
  "resumeContent": { ... },
  "templateId": "modern-01",
  "exportFormat": "pdf"
}
```

**Response:**
```json
{
  "score": 92,
  "checks": [...],
  "suggestions": [...]
}
```

---

*Last Updated: April 21, 2026*
