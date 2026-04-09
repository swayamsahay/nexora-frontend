# Nexora Phase 5 Deployment Contract

This workspace is frontend-only, so this file documents the backend contract and deployment flow the UI now expects.

## User Flow

1. User clicks Publish in Studio.
2. Frontend runs local preflight checks.
3. Frontend calls `POST /api/projects/:id/publish`.
4. Backend validates the project, builds the generated frontend, and dispatches deployment to Vercel.
5. Frontend polls `GET /api/projects/:id/deployment/:deploymentId` until the deployment is ready or failed.
6. User gets a live URL, copy button, and open-in-new-tab action.
7. Deployment history shows prior publishes and rollback actions.

## Endpoints

### Publish project

`POST /api/projects/:id/publish`

Request body:

```json
{
  "mode": "vercel"
}
```

Response example:

```json
{
  "status": "deploying",
  "deploymentId": "dep_123456",
  "url": "https://nexora-project.vercel.app",
  "projectId": "proj_123",
  "message": "Deployment queued"
}
```

### Poll deployment status

`GET /api/projects/:id/deployment/:deploymentId`

Response example:

```json
{
  "id": "dep_123456",
  "status": "building",
  "url": "https://nexora-project.vercel.app",
  "progress": 58,
  "createdAt": "2026-04-09T12:34:56.000Z"
}
```

Allowed statuses:

- `queued`
- `building`
- `deploying`
- `ready`
- `failed`

### Roll back deployment

`POST /api/projects/:id/deployments/:deploymentId/rollback`

Response example:

```json
{
  "status": "ready",
  "deploymentId": "dep_123455",
  "url": "https://nexora-project-old.vercel.app",
  "message": "Rollback completed"
}
```

## Database Shape

Project document should include:

```json
{
  "deployments": [
    {
      "id": "dep_123456",
      "url": "https://nexora-project.vercel.app",
      "status": "ready",
      "createdAt": "2026-04-09T12:34:56.000Z"
    }
  ]
}
```

## Vercel Integration Notes

- Keep Vercel secrets on the backend only.
- Generate a temporary build folder from the project frontend files.
- Run a Vite build or emit static HTML for simple generated projects.
- Upload the build output using the Vercel deployment API.
- Store the resulting deployment metadata in the project document.

## Frontend Behavior

- Show a modal while the deployment is active.
- Keep the Studio usable while deployment runs.
- Retry publish on failure.
- Show deployment history and rollback actions.
- Never expose tokens or deployment credentials in the browser.
