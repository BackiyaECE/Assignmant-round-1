Here is the comprehensive `README.md` file, updated to reflect the new **MongoDB/Mongoose** integration for persistent scenario storage and the Vercel deployment instructions.

-----

# 💰 Invoicing ROI Simulator

This project is a lightweight, full-stack ROI calculator prototype designed to help businesses visualize the cost savings and payback period when transitioning from manual to automated invoicing.

The prototype was completed as a 3-hour assignment, featuring a REST API, data persistence, and a lead-gated report snapshot.

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML, CSS, Vanilla JavaScript | Interactive single-page UI for inputs and results. |
| **Backend/API** | Node.js (Express.js) | Handles calculation logic and serves as the REST API layer. |
| **Database** | **MongoDB (via Mongoose)** | Persistent storage for saving, loading, and managing named ROI scenarios. |
| **Hosting** | Vercel | Serverless deployment for the Express API and static frontend. |

-----

## ✨ Features

  * **Quick Simulation:** Instantaneous calculation of monthly savings, payback, and ROI based on user inputs.
  * **Persistent Scenario Management:** Full **CRUD** support (Create, Read, Update, Delete) for saving and retrieving simulations by name using MongoDB.
  * **Favorable Output Logic:** Built-in bias factor (`min_roi_boost_factor = 1.1`) to ensure results always favor automation.
  * **Lead-Gated Report:** Simulation of an email-gated report download for lead capture.

-----

## 🚀 Local Setup and Run Instructions

### Prerequisites

1.  **Node.js:** Installed on your system.
2.  **MongoDB Atlas:** A free tier cluster configured, with a Database User and Network Access set up.
3.  **Connection URI:** Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster0.abc.mongodb.net/db_name`).

### 1\. Installation

1.  Clone the repository:
    ```bash
    git clone [YOUR_REPO_URL]
    cd invoicing-roi-simulator
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### 2\. Configure MongoDB URI

1.  Open **`server.js`**.

2.  Replace the placeholder string for `DB_URI` with your actual MongoDB connection string:

    ```javascript
    // server.js
    const DB_URI = 'mongodb+srv://<YOUR_USER>:<YOUR_PASSWORD>@cluster0.abcde.mongodb.net/roi_calculator_db?retryWrites=true&w=majority'; 
    ```

### 3\. Run the Server

1.  Start the Express server:
    ```bash
    npm start
    ```
2.  The application will be available at: **`http://localhost:3000/index.html`**

-----

## ☁️ Vercel Deployment Instructions

This project is ready for serverless deployment on Vercel.

### 1\. Vercel Configuration (`vercel.json`)

The configuration file is essential for Vercel to recognize the Express server as a Serverless Function and the `public` folder as static assets.

*(The `vercel.json` file should be present in the root directory)*

### 2\. Environment Variables

Since the MongoDB URI contains sensitive credentials, it should be deployed as an **Environment Variable** on Vercel (instead of being hardcoded in `server.js`).

1.  Go to your Vercel Project Settings.
2.  Navigate to **Environment Variables**.
3.  Add a new variable:
      * **Name:** `DB_URI`
      * **Value:** `mongodb+srv://<YOUR_USER>:<YOUR_PASSWORD>@...` (Your full connection string)

### 3\. Deploy

1.  Push all your code (including `vercel.json`) to your GitHub/GitLab/Bitbucket repository.
2.  Import the repository into Vercel via the dashboard.
3.  Vercel will automatically build and deploy the application, connecting to your MongoDB Atlas instance using the `DB_URI` environment variable.

-----

## 🗄️ API Endpoints

The following REST endpoints are defined in `server.js`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/simulate` | Runs the ROI calculation and returns results. |
| `POST` | `/scenarios` | Saves a new scenario to MongoDB. |
| `GET` | `/scenarios` | Lists all saved scenarios. |
| `GET` | `/scenarios/:id` | Retrieves a specific scenario's details. |
| `DELETE` | `/scenarios/:id` | Deletes a scenario from MongoDB. |
| `POST` | `/report/generate` | Simulates report generation, requiring a valid email and scenario ID. |
