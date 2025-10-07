# Invoicing ROI Simulator Prototype

This is a prototype for an Invoicing ROI Simulator, built as a 3-hour assignment using a **Node.js (Express)** backend with **lowdb** (JSON file database) and a simple **HTML/CSS/JavaScript** frontend.

##  Setup and Run Instructions

### Prerequisites

You must have [Node.js](https://nodejs.org/) installed on your system.

### 1. Installation

1.  **Clone or download** the project files into a folder (e.g., `invoicing-roi-simulator`).
2.  Open your terminal and navigate to the project directory:

    ```bash
    cd invoicing-roi-simulator
    ```
3.  Install the required dependencies:

    ```bash
    npm install
    ```

### 2. Running the Server

1.  Start the Express server using the following command:

    ```bash
    npm start
    ```
2.  The console will show: `ROI Simulator API running at http://localhost:3000` and `Frontend available at http://localhost:3000/index.html`.

### 3. Accessing the Application

1.  Open your web browser.
2.  Navigate to: **`http://localhost:3000/index.html`**

##  Testing the Functionalities

### Quick Simulation

1.  Enter values in the left-hand form (e.g., the default values).
2.  Click the **"Run Simulation"** button.
3.  Results (Monthly Savings, Payback, ROI) will appear instantly on the right. **Note:** Due to the `min_roi_boost_factor` in the server logic, the results will always be positive and favorable.

### Scenario Management (CRUD)

1.  After running a simulation, ensure the **"Scenario Name"** field is filled.
2.  Click **"Save Scenario"**. An alert will confirm the save.
3.  The **"Load Saved Scenario"** dropdown will update with the new scenario.
4.  Select a saved scenario from the dropdown and click **"Load"** to populate the form and results.
5.  Select a saved scenario and click **"Delete"** to remove it (CRUD support).

### Report Generation (Lead Gate)

1.  **Crucially:** You must have a **saved scenario** loaded (i.e., `currentScenarioId` must be set, which happens when you save or load a scenario).
2.  Enter a valid-looking email in the **"Your Email"** field under the "Download Full Report" section.
3.  Click **"Generate Report"**.
4.  An alert will confirm the mock delivery, and a JSON snapshot of the scenario's results will appear below, simulating the downloadable report.

## 🗃️ Storage Notes

* Scenarios are persisted in a file named **`db.json`** in the project root via `lowdb`.
* You can inspect this file to see the saved scenarios. Deleting this file will reset the database.
