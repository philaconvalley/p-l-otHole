# API Reference

This document describes the public REST API for P(l)otHole. The API supports hazard reporting and discovery, community voting, user profile and leaderboard access, and open data exports.

## Start Here (Hackathon Path)

If your team is short on time, implement and test these endpoints first:

1. `POST /hazards`
2. `GET /hazards`
3. `GET /hazards/{id}`
4. `POST /hazards/{id}/vote`
5. `GET /exports/geojson` or `GET /exports/csv`

### Skill-Level Guidance

- **Beginner:** run example cURL requests, verify status codes, and report contract mismatches.
- **Intermediate:** implement request validation and pagination behavior.
- **Advanced:** optimize radius search and add rate-limiting/auth middleware.

## Base URL and Versioning

- **Production base URL:** `https://api.plothole.org/v1`
- **Local development:** `http://localhost:4000/v1`
- **Versioning strategy:** URI-based (`/v1`, `/v2`) with backward-incompatible changes released under a new version path.

## Authentication

Read endpoints are mostly public. Write endpoints require authentication.

- **Auth header:** `Authorization: Bearer <access_token>`
- **Content type:** `Content-Type: application/json`
- **Session cookie option:** deployments using cookie auth may also accept secure HTTP-only sessions.

### Example Authenticated Request

```bash
curl -X POST "http://localhost:4000/v1/hazards" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Abyss on 5th",
    "description": "Deep pothole in the right lane near the bus stop.",
    "type": "pothole",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "images": [
      "https://cdn.plothole.org/hazards/tmp/abyss-1.jpg"
    ]
  }'
```

## Common Conventions

### Pagination

Collection endpoints use cursor pagination.

- `limit` (optional, default `25`, max `100`)
- `cursor` (optional, opaque token from previous response)

Example response fields:

```json
{
  "data": [],
  "nextCursor": "eyJpZCI6IjEyMyJ9",
  "hasMore": true
}
```

### Standard Error Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "latitude must be between -90 and 90",
    "details": {
      "field": "latitude"
    },
    "requestId": "req_8d6ce4d4d54f"
  }
}
```

### HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Successful read/update |
| `201 Created` | Resource created |
| `204 No Content` | Successful delete with no body |
| `400 Bad Request` | Invalid input |
| `401 Unauthorized` | Missing/invalid auth |
| `403 Forbidden` | Authenticated but insufficient permission |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Duplicate or state conflict |
| `422 Unprocessable Entity` | Semantically invalid request |
| `429 Too Many Requests` | Rate limited |
| `500 Internal Server Error` | Unexpected server error |

### Error Codes

| Code | Description |
|---|---|
| `VALIDATION_ERROR` | Request payload failed validation |
| `UNAUTHORIZED` | User is not authenticated |
| `FORBIDDEN` | User lacks required role or ownership |
| `NOT_FOUND` | Requested entity does not exist |
| `RATE_LIMITED` | Too many requests in a window |
| `DUPLICATE_HAZARD` | Similar hazard already exists nearby |
| `CONFLICTING_VOTE` | User already voted with same value |
| `EXPORT_NOT_READY` | Export job is still processing |

## Hazards

### POST `/hazards`

Create a new hazard report.

- **Auth:** required
- **Body fields:**
  - `name` (string, required)
  - `description` (string, required)
  - `type` (enum: `pothole`, `crack`, `sinkhole`, `drainage`, `debris`, required)
  - `latitude` (number, required)
  - `longitude` (number, required)
  - `images` (array of URL strings, optional)

#### Example Request

```json
{
  "name": "Lake Crater",
  "description": "Water-filled pothole that causes splash hazards during rain.",
  "type": "pothole",
  "latitude": 40.71282,
  "longitude": -74.00604,
  "images": [
    "https://cdn.plothole.org/hazards/lake-crater-1.jpg"
  ]
}
```

#### Example Response (`201 Created`)

```json
{
  "data": {
    "id": "hz_9f7f1c8e",
    "slug": "lake-crater",
    "name": "Lake Crater",
    "description": "Water-filled pothole that causes splash hazards during rain.",
    "type": "pothole",
    "location": {
      "latitude": 40.71282,
      "longitude": -74.00604
    },
    "images": [
      "https://cdn.plothole.org/hazards/lake-crater-1.jpg"
    ],
    "severityScore": 61,
    "votes": {
      "up": 0,
      "down": 0
    },
    "reportsCount": 1,
    "repairStatus": "reported",
    "cityTicketId": null,
    "createdAt": "2026-02-27T17:52:31.114Z",
    "updatedAt": "2026-02-27T17:52:31.114Z"
  }
}
```

### GET `/hazards/{id}`

Get one hazard by ID.

- **Auth:** optional

#### Example Response (`200 OK`)

```json
{
  "data": {
    "id": "hz_9f7f1c8e",
    "slug": "lake-crater",
    "name": "Lake Crater",
    "description": "Water-filled pothole that causes splash hazards during rain.",
    "type": "pothole",
    "location": {
      "latitude": 40.71282,
      "longitude": -74.00604
    },
    "images": [
      "https://cdn.plothole.org/hazards/lake-crater-1.jpg"
    ],
    "severityScore": 63,
    "votes": {
      "up": 42,
      "down": 3
    },
    "reportsCount": 17,
    "repairStatus": "acknowledged",
    "cityTicketId": "NYC-311-2026-88413",
    "daysOpen": 24,
    "voteVelocity": 1.8,
    "createdAt": "2026-01-30T07:12:10.000Z",
    "updatedAt": "2026-02-27T18:01:41.000Z"
  }
}
```

### PATCH `/hazards/{id}`

Update editable hazard fields.

- **Auth:** required (owner, moderator, or admin)
- **Updatable fields:** `name`, `description`, `type`, `repairStatus`, `cityTicketId`

#### Example Request

```json
{
  "repairStatus": "scheduled",
  "cityTicketId": "NYC-311-2026-88413"
}
```

### DELETE `/hazards/{id}`

Soft-delete a hazard (retained in audit logs).

- **Auth:** required (moderator/admin)
- **Response:** `204 No Content`

### GET `/hazards`

List hazards with optional filtering and sorting.

- **Auth:** optional
- **Query params:**
  - `limit`
  - `cursor`
  - `type`
  - `repairStatus`
  - `city`
  - `sort` (`newest`, `oldest`, `severity`, `most_voted`)

#### Example Request

```bash
curl "http://localhost:4000/v1/hazards?type=pothole&repairStatus=reported&sort=severity&limit=2"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "hz_9f7f1c8e",
      "name": "Lake Crater",
      "type": "pothole",
      "severityScore": 63,
      "repairStatus": "acknowledged"
    },
    {
      "id": "hz_5bb3dc9d",
      "name": "The Abyss on 5th",
      "type": "pothole",
      "severityScore": 59,
      "repairStatus": "reported"
    }
  ],
  "nextCursor": "eyJpZCI6Imh6XzViYjNkYzlkIn0=",
  "hasMore": true
}
```

### GET `/hazards/search`

Search hazards by radius around a coordinate.

- **Auth:** optional
- **Required query params:**
  - `lat` (number)
  - `lng` (number)
  - `radiusMeters` (integer, max `10000`)
- **Optional query params:** `type`, `repairStatus`, `limit`, `cursor`

#### Example Request

```bash
curl "http://localhost:4000/v1/hazards/search?lat=40.7128&lng=-74.0060&radiusMeters=500&type=pothole"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "hz_9f7f1c8e",
      "name": "Lake Crater",
      "distanceMeters": 112.4,
      "severityScore": 63,
      "repairStatus": "acknowledged"
    },
    {
      "id": "hz_9af4b882",
      "name": "Sunken Stripe",
      "distanceMeters": 287.9,
      "severityScore": 44,
      "repairStatus": "reported"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

### POST `/hazards/{id}/vote`

Cast or update a severity vote.

- **Auth:** required
- **Body fields:**
  - `value` (integer `1`-`5`, required)
  - `note` (string, optional)

#### Example Request

```json
{
  "value": 5,
  "note": "Caused rim damage this morning."
}
```

#### Example Response (`200 OK`)

```json
{
  "data": {
    "hazardId": "hz_9f7f1c8e",
    "userId": "usr_4ac9cb2d",
    "value": 5,
    "severityScore": 64,
    "votedAt": "2026-02-27T18:14:02.448Z"
  }
}
```

## Users

### GET `/users/me`

Get the authenticated user's profile.

- **Auth:** required

#### Example Response

```json
{
  "data": {
    "id": "usr_4ac9cb2d",
    "username": "asphaltwatch",
    "email": "hidden@example.com",
    "reputationScore": 740,
    "reportsSubmitted": 84,
    "badges": [
      "spotter",
      "surveyor"
    ],
    "createdAt": "2025-11-05T09:21:00.000Z"
  }
}
```

### GET `/users/{id}`

Get a public user profile.

- **Auth:** optional

### GET `/users/{id}/badges`

Get badge progress and earned badges.

- **Auth:** optional

#### Example Response

```json
{
  "data": {
    "userId": "usr_4ac9cb2d",
    "earned": [
      {
        "id": "spotter",
        "earnedAt": "2026-01-03T15:12:10.000Z"
      }
    ],
    "progress": [
      {
        "id": "inspector",
        "current": 740,
        "target": 1000
      }
    ]
  }
}
```

### GET `/users/leaderboard`

Get ranked users by reputation and reporting activity.

- **Auth:** optional
- **Query params:**
  - `period` (`weekly`, `monthly`, `all_time`)
  - `city` (optional)
  - `limit` (default `50`, max `100`)

#### Example Response

```json
{
  "data": [
    {
      "rank": 1,
      "userId": "usr_7ddf61f3",
      "username": "northside_scout",
      "reputationScore": 1430,
      "reportsSubmitted": 221
    },
    {
      "rank": 2,
      "userId": "usr_4ac9cb2d",
      "username": "asphaltwatch",
      "reputationScore": 740,
      "reportsSubmitted": 84
    }
  ]
}
```

## Exports

### GET `/exports/geojson`

Download hazards as GeoJSON.

- **Auth:** optional
- **Query params:** `city`, `updatedSince`, `type`, `repairStatus`
- **Response content type:** `application/geo+json`

#### Example Request

```bash
curl "http://localhost:4000/v1/exports/geojson?city=nyc&updatedSince=2026-01-01T00:00:00Z"
```

#### Example Response (truncated)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-74.00604, 40.71282]
      },
      "properties": {
        "id": "hz_9f7f1c8e",
        "name": "Lake Crater",
        "type": "pothole",
        "severityScore": 63,
        "repairStatus": "acknowledged"
      }
    }
  ]
}
```

### GET `/exports/csv`

Download hazards as CSV.

- **Auth:** optional
- **Query params:** `city`, `updatedSince`, `type`, `repairStatus`
- **Response content type:** `text/csv`

#### Example Request

```bash
curl -L "http://localhost:4000/v1/exports/csv?city=nyc" -o hazards.csv
```

#### Example CSV Header

```csv
id,slug,name,type,latitude,longitude,severity_score,reports_count,repair_status,city_ticket_id,created_at,updated_at
```

## Rate Limits

Rate limits can vary by deployment, but the default policy is:

- Public read endpoints: `120` requests/minute per IP.
- Authenticated write endpoints: `60` requests/minute per user.
- Export endpoints: `20` requests/minute per IP.

When rate limited, the API returns:

- `429 Too Many Requests`
- `Retry-After` header with seconds to wait

## Changelog Policy

- Additive changes (new optional fields/endpoints) can ship within `v1`.
- Breaking changes require a new major API version path.
- Deprecated fields include deprecation notes in release docs before removal.
