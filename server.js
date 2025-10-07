// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// --- MongoDB Configuration ---

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR ACTUAL MONGODB ATLAS CONNECTION STRING
const DB_URI = 'mongodb+srv://<YOUR_USER>:<YOUR_PASSWORD>@cluster0.abcde.mongodb.net/roi_calculator_db?retryWrites=true&w=majority'; 

mongoose.connect(DB_URI)
    .then(() => console.log('✅ MongoDB connection successful.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// --- Define Mongoose Schema and Model ---

const scenarioSchema = new mongoose.Schema({
    scenario_name: { type: String, required: true },
    inputs: Object, // Stores all user inputs
    results: Object, // Stores calculated results
    created_at: { type: Date, default: Date.now },
});

const Scenario = mongoose.model('Scenario', scenarioSchema);


// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); // Serves the frontend

// --- Internal Constants (Server-Side Only) ---
const CONSTANTS = {
    automated_cost_per_invoice: 0.20,
    error_rate_auto: 0.001, // 0.1%
    time_saved_per_invoice: 8, // minutes
    min_roi_boost_factor: 1.1,
};

// ... (Calculation Logic remains the same) ...
function calculateROI(inputs) {
    const {
        monthly_invoice_volume, num_ap_staff, avg_hours_per_invoice,
        hourly_wage, error_rate_manual, error_cost,
        time_horizon_months, one_time_implementation_cost
    } = inputs;

    const error_rate_manual_decimal = error_rate_manual / 100;

    // 1. Manual labor cost per month
    const labor_cost_manual = monthly_invoice_volume * avg_hours_per_invoice * hourly_wage;

    // 2. Automation cost per month
    const auto_cost = monthly_invoice_volume * CONSTANTS.automated_cost_per_invoice;

    // 3. Error savings
    const error_savings = (error_rate_manual_decimal - CONSTANTS.error_rate_auto) * monthly_invoice_volume * error_cost;

    // 4. Monthly savings (pre-bias)
    let monthly_savings = (labor_cost_manual + error_savings) - auto_cost;

    // 5. Apply bias factor
    monthly_savings = monthly_savings * CONSTANTS.min_roi_boost_factor;

    // 6. Cumulative & ROI
    const cumulative_savings = monthly_savings * time_horizon_months;
    const net_savings = cumulative_savings - one_time_implementation_cost;

    const payback_months = monthly_savings > 0 
        ? one_time_implementation_cost / monthly_savings 
        : time_horizon_months;

    const roi_percentage = one_time_implementation_cost > 0 
        ? (net_savings / one_time_implementation_cost) * 100 
        : (net_savings > 0 ? 9999 : 0);

    // --- Format Results ---
    return {
        monthly_savings: monthly_savings.toFixed(2),
        cumulative_savings: cumulative_savings.toFixed(2),
        net_savings: net_savings.toFixed(2),
        payback_months: Math.max(0, payback_months).toFixed(1),
        roi_percentage: roi_percentage.toFixed(1),
        cost_manual: labor_cost_manual.toFixed(2),
        cost_auto: auto_cost.toFixed(2),
        error_savings: error_savings.toFixed(2),
        time_horizon_months // Include for context in display
    };
}


// --- API Endpoints ---

/**
 * POST /simulate - Run simulation (No DB interaction)
 */
app.post('/simulate', (req, res) => {
    try {
        const inputs = req.body;
        if (!inputs.monthly_invoice_volume || inputs.monthly_invoice_volume <= 0) {
            return res.status(400).json({ error: 'Invalid invoice volume' });
        }
        
        const results = calculateROI(inputs);
        res.json({
            inputs,
            results,
            message: 'Simulation successful. Results favor automation due to inherent bias factor.'
        });
    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({ error: 'Internal server error during simulation.' });
    }
});

/**
 * POST /scenarios - Save a scenario (MongoDB Write)
 */
app.post('/scenarios', async (req, res) => {
    const { scenario_name, ...inputs } = req.body;
    
    if (!scenario_name) {
        return res.status(400).json({ error: 'Scenario name is required.' });
    }
    
    let results;
    try {
        // Run calculation before saving
        results = calculateROI(inputs);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid inputs provided for saving.' });
    }
    
    try {
        const newScenario = await Scenario.create({
            scenario_name,
            inputs,
            results,
        });

        // Map Mongoose _id to 'id' for the frontend
        res.status(201).json({ 
            id: newScenario._id, // Use Mongoose _id
            scenario_name: newScenario.scenario_name, 
            inputs: newScenario.inputs,
            results: newScenario.results,
            created_at: newScenario.created_at
        });
    } catch (error) {
        console.error('MongoDB save error:', error);
        res.status(500).json({ error: 'Failed to save scenario to MongoDB.' });
    }
});

/**
 * GET /scenarios - List all scenarios (MongoDB Read)
 */
app.get('/scenarios', async (req, res) => {
    try {
        // Only fetch necessary fields: _id, scenario_name, results.monthly_savings
        const scenarios = await Scenario.find({}, '_id scenario_name results.monthly_savings created_at'); 
        
        const mappedScenarios = scenarios.map(s => ({
            id: s._id, // Map MongoDB's _id to 'id'
            scenario_name: s.scenario_name,
            created_at: s.created_at,
            monthly_savings: s.results.monthly_savings
        }));

        res.json(mappedScenarios);
    } catch (error) {
        console.error('MongoDB fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch scenarios from MongoDB.' });
    }
});

/**
 * GET /scenarios/:id - Retrieve scenario details (MongoDB Read)
 */
app.get('/scenarios/:id', async (req, res) => {
    try {
        const scenario = await Scenario.findById(req.params.id);
        
        if (scenario) {
            // Convert Mongoose document to plain object and map _id
            const scenarioData = { ...scenario.toObject(), id: scenario._id };
            res.json(scenarioData);
        } else {
            res.status(404).json({ error: 'Scenario not found.' });
        }
    } catch (error) {
        // Catches errors for invalid ID format (e.g., too short)
        res.status(400).json({ error: 'Invalid scenario ID format.' });
    }
});

/**
 * DELETE /scenarios/:id - Delete scenario (MongoDB Delete)
 */
app.delete('/scenarios/:id', async (req, res) => {
    try {
        const result = await Scenario.findByIdAndDelete(req.params.id);
        
        if (result) {
            res.json({ message: `Scenario ${req.params.id} deleted.`, deleted_count: 1 });
        } else {
            res.status(404).json({ error: 'Scenario not found.' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Invalid scenario ID format.' });
    }
});

/**
 * POST /report/generate - Generate a report (Uses saved scenario)
 */
app.post('/report/generate', async (req, res) => {
    const { email, scenarioId } = req.body;

    if (!email || !scenarioId || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email and scenario ID are required for report generation.' });
    }

    try {
        const scenario = await Scenario.findById(scenarioId);

        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found for reporting.' });
        }

        const reportLink = `/report.html?id=${scenarioId}`; // Mock link

        res.json({ 
            message: `Report generation for scenario "${scenario.scenario_name}" successful. A link has been 'sent' to ${email}.`, 
            report_url: reportLink,
            scenario_data: { ...scenario.toObject(), id: scenario._id } // Send data back to frontend
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal error during report generation.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`ROI Simulator API running at http://localhost:${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}/index.html`);
});