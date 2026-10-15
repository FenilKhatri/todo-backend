# Taskora — Backend API

The REST API behind **Taskora**, a task manager with boards, view-only board sharing, profile photo uploads, and OTP-verified account changes.

Built with **Express 5**, **MongoDB (Mongoose 9)**, and **Zod**, Taskora stores profile photos on **Cloudinary**. The web application is available in the [Taskora frontend](https://github.com/FenilKhatri/todo-frontend) repository.

## Features

- **Authentication:** Register, log in, and log out using a JWT stored in an HTTP-only cookie. "Remember me" keeps users logged in for 30 days; otherwise, the session uses a session cookie and a 1-day token.
- **Tasks:** Create, list, update, and delete tasks with priority, status, due date, and an optional board.
- **Boards:**
  - Create, rename, and delete boards.
  - Deleting a board preserves its tasks by moving them to General.
  - Share boards with view-only access, remove viewers, or leave a board shared with you.
- **User search:** Search people by name or email. Empty searches return five suggestions, prioritising people you've interacted with before.
- **Profile:**
  - Update your name.
  - Upload or remove a profile photo.
  - Change your email or password after OTP verification.
- **Forgot password:** Verify an OTP, receive a short-lived reset token, and set a new password.
- **Cloudinary avatars:**
  - Stored in the `todo` folder using the `todo/<name-slug>_<userId>` naming convention.
  - Avatar filenames are updated when a user's name changes.
  - Supports JPG, PNG, WEBP, and GIF images under 5 MB, cropped to 400 × 400 pixels.
- **Validation:** Every request body is validated with Zod, with field-level error messages for invalid input.

> **Note:** Email and SMS delivery are not configured yet. OTP endpoints return the code in the response for the application to display. Remove the OTP from responses when real email delivery is implemented.

## Tech Stack

| Purpose | Technology |
|---|---|
| Server | Express 5 |
| Database | MongoDB with Mongoose 9 |
| Validation | Zod 4 |
| Authentication | jsonwebtoken, bcryptjs, cookie-parser |
| File uploads | multer (memory storage) and Cloudinary |
| Protection | express-rate-limit and cors |

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB database (MongoDB Atlas or a local instance)
- A Cloudinary account for profile photos

### Installation

```bash
git clone https://github.com/FenilKhatri/todo-backend.git
cd todo-backend
npm install
```

Create a `.env` file from `.env.example` and configure the environment variables listed below.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the development server:

```bash
npm run dev
```

The API starts at `http://localhost:<PORT>`. Check that the server is running using `GET /api/health`.

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port used by the server. Defaults to `5000`; use `3000` to match the frontend's default API URL. |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long, random secret used to sign authentication tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NODE_ENV` | Set to `development` or `production`. Production cookies require HTTPS when marked secure. |
| `FRONTEND_URL` | Additional frontend origin allowed by CORS. `http://localhost:5173` and `http://localhost:5174` are always allowed. |

**Security:** Never commit your `.env` file. It should remain excluded through `.gitignore`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the server with nodemon and automatically restart on file changes |
| `npm start` | Start the server using the configured start script |

## API Reference

All routes are prefixed with `/api`. Routes marked 🔒 require authentication through the HTTP-only cookie set during registration or login.

Clients must send cookies with requests. With Axios, configure `withCredentials: true`.

### Authentication — `/api/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/register` | `userName, email, password` | Create an account and log in |
| POST | `/login` | `email, password, rememberMe?` | Log in; `rememberMe` enables a 30-day cookie |
| GET 🔒 | `/me` | — | Get the current user |
| POST 🔒 | `/logout` | — | Clear the authentication cookie |
| POST | `/forgot-password` | `email` | Start password reset; returns `requestId`, `otp`, `expiresAt`, and `email`, or 404 if no account exists |
| POST | `/forgot-password/:requestId/resend` | — | Issue a new OTP |
| POST | `/forgot-password/:requestId/verify` | `otp` | Verify the OTP and return a reset token valid for 15 minutes |
| POST | `/forgot-password/:requestId/reset` | `resetToken, password, confirmPassword` | Set a new password |

Forgot-password routes are rate-limited to **30 requests per 15 minutes per IP**.

### Tasks — `/api/tasks` 🔒

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/` | — | List your tasks, newest first, with board names |
| POST | `/` | `title, description?, priority?, dueDate?, boardId?` | Create a task; status starts as `todo` |
| PATCH | `/:taskId` | Task fields and optional `status` | Update a task |
| DELETE | `/:taskId` | — | Delete a task |

Supported values:

- `priority`: `low`, `medium`, or `high`
- `status`: `todo`, `in-progress`, or `completed`
- `dueDate`: `YYYY-MM-DD`, or `null` for no date

### Boards — `/api/boards` 🔒

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/` | — | List owned or shared boards with `taskCount` and `canEdit` |
| POST | `/` | `name, description?` | Create a board |
| GET | `/:boardId` | — | Get board details and tasks; available to owners and viewers |
| PATCH | `/:boardId` | `name?, description?` | Update a board; owner only |
| DELETE | `/:boardId` | — | Delete a board; owner only. Tasks move to General. |
| POST | `/:boardId/members` | `email` | Share a board as view-only |
| DELETE | `/:boardId/members/:memberId` | — | Remove a viewer |
| DELETE | `/:boardId/leave` | — | Leave a shared board |

### Users — `/api/users` 🔒

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/search` | `q?, boardId?` | Search users by name or email. Empty queries return up to five suggestions, excluding existing members of the specified board. Queries of at least two characters return up to five matches. |

### Profile — `/api/profile` 🔒

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/` | — | Get your profile |
| PATCH | `/` | `userName` | Update your name and rename your Cloudinary avatar |
| PUT | `/avatar` | `multipart/form-data` with an `avatar` field | Upload a profile photo under 5 MB |
| DELETE | `/avatar` | — | Remove your profile photo |
| POST | `/change-requests` | Email or password change details | Start an email or password change and receive an OTP challenge |
| POST | `/change-requests/:requestId/resend` | — | Issue a new OTP |
| POST | `/change-requests/:requestId/verify` | `otp` | Verify the OTP and apply the requested change |

Email change body:

```json
{
  "type": "email",
  "email": "new@example.com"
}
```

Password change body:

```json
{
  "type": "password",
  "currentPassword": "current-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

### Dashboard — `/api/dashboard` 🔒

| Method | Path | Description |
|---|---|---|
| GET | `/` | Return task counts: `total`, `completed`, and `overdue` |

### Error Responses

Validation errors return HTTP 400 with field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid."
    }
  ]
}
```

Other errors follow this format:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Board not found"
}
```

## How OTP Verification Works

The shared OTP module lives in `src/shared/otp/`. Email changes, password changes, and password resets use this module.

- **Code length:** Six digits, stored as a SHA-256 hash and valid for 10 minutes.
- **Attempt limit:** Five incorrect attempts require a new OTP.
- **Resend cooldown:** One OTP every five seconds, tracked using `sentAt`.
- **Pending requests:** A new request for the same action replaces the previous one.
- **Automatic cleanup:** MongoDB removes expired requests using a TTL index on `expiresAt`.
- **Pending changes:** A new email or password hash is held until OTP verification succeeds.
- **Password reset:** Successful OTP verification issues a one-time reset token, stored as a hash. The token is required to set the new password, which must differ from the existing password.
- **Email normalisation:** Changing to the current email is rejected, including equivalent forms covered by the application's canonical-email rules.

## Project Structure

```text
server.js                     # Starts the server and connects to MongoDB
src/
├── app.js                    # Express app, CORS, cookies, routes, error handling
├── routes/
│   └── route.js               # Mounts feature routers
├── config/
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.js          # Cloudinary configuration
├── features/
│   ├── auth/                  # Registration, login, password reset
│   ├── tasks/                 # Task operations
│   ├── boards/                # Boards, sharing, members
│   ├── users/                  # User search and suggestions
│   ├── profile/                # Profile, avatars, email/password changes
│   └── dashboard/             # Dashboard summary counts
└── shared/
    ├── otp/                   # OTP model, service, and validation
    ├── middleware/            # Authentication, validation, uploads, rate limits
    ├── utils/                 # Token generation, async handler, canonical email
    └── errors/                # Error helpers
```

Each feature follows a layered architecture:

`*.routes.js` → `*.validation.js` → `*.controller.js` → `*.service.js` → model

## Related

- [Taskora Frontend](https://github.com/FenilKhatri/todo-frontend)
