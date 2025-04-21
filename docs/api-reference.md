# API Reference

This document provides a comprehensive overview of the CodeWithShahan API structure, endpoints, and usage guidelines.

## Core Architecture

The API follows a domain-driven design with a centralized client, smart caching, and consistent error handling patterns.

### Key Components

- **ApiClient**: Central entry point for all API operations
- **Caching System**: Intelligent TTL-based caching for performance
- **Error Handling**: Standardized error responses
- **Response Format**: Consistent JSON structure

## API Client Services

The main `ApiClient` object provides access to various domain services:

```typescript
import { ApiClient } from "@/services/apiClient";

// Example usage
const articles = await ApiClient.articles.getArticles();
const category = await ApiClient.categories.getCategoryBySlug("javascript");
```

### Available Services

- **articles**: Article-related operations
- **categories**: Category management
- **tags**: Tag-related utilities (deprecated, use categories instead)

## REST API Endpoints

### Articles

#### Get All Articles

```
GET /api/articles
```

Query parameters:

- `limit` (optional): Number of articles to return (default: 10)
- `page` (optional): Page number for pagination (default: 1)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "article-id",
      "title": "Article Title",
      "slug": "article-slug",
      "brief": "Short description",
      "coverImage": "https://example.com/image.jpg",
      "publishedAt": "2023-06-15T12:00:00Z",
      "tags": [
        {
          "name": "JavaScript",
          "slug": "javascript",
          "color": "#f7df1e"
        }
      ],
      "author": {
        "name": "Author Name",
        "image": "https://example.com/author.jpg"
      },
      "readingTime": "5 min"
    }
  ]
}
```

#### Get Article by Slug

```
GET /api/articles/:slug
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "article-id",
    "title": "Article Title",
    "slug": "article-slug",
    "brief": "Short description",
    "content": "Full markdown content",
    "coverImage": "https://example.com/image.jpg",
    "publishedAt": "2023-06-15T12:00:00Z",
    "tags": [...],
    "author": {...},
    "readingTime": "5 min"
  }
}
```

### Categories

#### Get All Categories

```
GET /api/categories
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "name": "JavaScript",
      "slug": "javascript",
      "description": "Modern JavaScript tutorials",
      "color": "#f7df1e",
      "articleCount": 15
    }
  ]
}
```

#### Get Category by Slug

```
GET /api/categories/:slug
```

Response:

```json
{
  "success": true,
  "data": {
    "name": "JavaScript",
    "slug": "javascript",
    "description": "Modern JavaScript tutorials",
    "color": "#f7df1e",
    "articleCount": 15,
    "featuredArticles": [...]
  }
}
```

#### Get Articles by Category

```
GET /api/categories/:slug/articles
```

Query parameters:

- `limit` (optional): Number of articles to return (default: 10)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "article-id",
      "title": "Article Title",
      "slug": "article-slug"
      // ... other article properties
    }
  ]
}
```

#### Get All Tags

```
GET /api/categories/tags
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "javascript",
      "name": "JavaScript",
      "slug": "javascript",
      "articleCount": 15,
      "color": "#f7df1e"
    }
  ]
}
```

## Error Handling

All API endpoints follow a consistent error response pattern:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

HTTP status codes:

- `400`: Bad Request - Invalid parameters
- `404`: Not Found - Resource doesn't exist
- `500`: Server Error - Something went wrong on the server

## Middleware

### API Handler

The `apiHandler` middleware provides consistent error handling and response formatting:

```typescript
import { apiHandler, ApiErrors } from "@/lib/api-middleware";

export const GET = (request: NextRequest) =>
  apiHandler(
    request,
    async () => {
      // Your handler logic here
      if (!someCondition) {
        throw ApiErrors.badRequest("Invalid parameter");
      }

      return { yourData: "here" };
    },
    { cacheTtl: 3600 } // Cache for 1 hour
  );
```

## Caching Strategy

- Most endpoints utilize smart caching with varying TTLs
- Categories and tags use in-memory caching with a 30-minute TTL
- Article content is cached with a 1-hour TTL
- API responses include cache control headers for CDN/browser caching
