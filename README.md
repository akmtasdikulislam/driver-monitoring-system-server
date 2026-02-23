# Driver Monitoring System – Server

A Node.js/Express REST API server for the **Driver Monitoring System** application. It manages driver records, user accounts, and drowsiness/sleep-count data, using MongoDB Atlas for persistence, Firebase Admin SDK for authentication, and Cloudinary for profile-photo storage.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Configure environment variables](#3-configure-environment-variables)
  - [4. Add Firebase service account key](#4-add-firebase-service-account-key)
  - [5. Run the server](#5-run-the-server)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Driver Management](#driver-management)
  - [Sleep / Drowsiness Records](#sleep--drowsiness-records)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

- User sign-in verification via Firebase Authentication
- New user account creation with profile photo upload (stored on Cloudinary)
- Driver record management (create & retrieve)
- Sleep/drowsiness event recording and retrieval per driver e-mail
- Cross-Origin Resource Sharing (CORS) enabled for front-end integration

---

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js                             |
| Framework        | Express.js v4                       |
| Database         | MongoDB Atlas (via official driver) |
| Authentication   | Firebase Admin SDK                  |
| File upload      | Multer (disk storage)               |
| Cloud storage    | Cloudinary                          |
| Dev server       | Nodemon                             |
| Config           | dotenv                              |

---

## Prerequisites

- **Node.js** ≥ 16 and **npm**
- A **MongoDB Atlas** cluster with a database and collection created
- A **Firebase** project with the Admin SDK enabled and a service account key downloaded
- A **Cloudinary** account

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/akmtasdikulislam/driver-monitoring-system-server.git
cd driver-monitoring-system-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DB_USERNAME=<your-mongodb-atlas-username>
DB_PASSWORD=<your-mongodb-atlas-password>
DB_NAME=<your-database-name>
DB_COLLECTION=<your-sleep-count-collection-name>
```

### 4. Add Firebase service account key

Download your Firebase service account JSON file from the Firebase Console and save it as `serviceAccountKey.json` in the project root. This file is excluded from version control via `.gitignore`.

### 5. Run the server

```bash
npm start
```

The server starts with **nodemon** and listens on **port 3000**:

```
Driver Monitoring Server is listening on port 3000
```

---

## API Endpoints

### Authentication

#### Check if a user exists

```
GET /sign-in/:email
```

Checks Firebase Authentication for a user with the given email.

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `email`   | string | The user's e-mail    |

**Response:** `true` if the user exists, `false` otherwise.

---

#### Create a new user account

```
POST /create-new-account
```

Creates a Firebase user and uploads the profile photo to Cloudinary.

**Content-Type:** `multipart/form-data`

| Field          | Type   | Description                    |
| -------------- | ------ | ------------------------------ |
| `fullName`     | string | User's full name               |
| `email`        | string | User's e-mail address          |
| `password`     | string | Account password               |
| `profilePhoto` | file   | Profile photo (max 5 MB)       |

**Response:** JSON object with the Cloudinary upload result and Firebase `userRecord`.

---

### Driver Management

#### Add a new driver

```
POST /add-new-driver
```

**Content-Type:** `application/json`

Inserts a new driver document into the `driverList` collection.

**Body:** Any valid driver object (fields are flexible).

**Response:** MongoDB insert result object.

---

#### Get all drivers

```
GET /driver-list
```

Returns an array of all driver documents in the `driverList` collection.

---

#### Get a driver by ID

```
GET /driver-list/:id
```

Returns a single driver document matching the provided MongoDB ObjectId.

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| `id`      | string | MongoDB ObjectId string  |

**Response:** Driver document or error object.

---

### Sleep / Drowsiness Records

#### Get sleep records for a driver

```
GET /sleep-count/:email
```

Returns all sleep/drowsiness event records associated with the given driver e-mail.

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `email`   | string | The driver's e-mail  |

**Response:** Array of sleep-count documents.

---

#### Add a sleep record

```
POST /sleep-count/add
```

**Content-Type:** `application/json`

Inserts a new sleep/drowsiness event record into the configured collection.

**Body:** JSON object representing the event (should include `email` and relevant event data).

**Response:** Success message with the new record's `_id`.

---

## Project Structure

```
driver-monitoring-system-server/
├── index.js              # Express application and all route handlers
├── package.json          # Project metadata and dependencies
├── .env                  # Environment variables (not committed)
├── serviceAccountKey.json # Firebase service account credentials (not committed)
└── uploads/              # Temporary local storage for uploaded files
```

---

## License

This project is licensed under the **ISC License**.
