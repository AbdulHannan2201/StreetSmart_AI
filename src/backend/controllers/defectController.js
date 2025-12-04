const asyncHandler = require("express-async-handler");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// @desc    Analyze building defect from image
// @route   POST /api/defects/analyze
// @access  Public
const analyzeDefect = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("Please upload an image");
    }

    const imagePath = req.file.path;
    console.log(`Received image for defect analysis: ${imagePath}`);

    const scriptPath = path.join(__dirname, "../../BD3-Dataset/api_predict.py");
    const pythonPath = path.join(__dirname, "../../BD3-Dataset/venv/bin/python3");

    // Execute Python script
    const command = `"${pythonPath}" "${scriptPath}" "${imagePath}"`;

    try {
        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve({ stdout, stderr });
            });
        });

        console.log("Python Output:", stdout);
        if (stderr) console.error("Python Error:", stderr);

        // Parse JSON output from Python
        let result;
        try {
            // Find the last line that looks like JSON in case of other print outputs
            const lines = stdout.trim().split('\n');
            const jsonLine = lines[lines.length - 1];
            result = JSON.parse(jsonLine);
        } catch (e) {
            throw new Error("Failed to parse model output");
        }

        if (result.error) {
            throw new Error(result.error);
        }

        res.json({
            message: "Defect analysis complete",
            result: result,
            image_url: `/uploads/defects/${req.file.filename}`
        });

    } catch (error) {
        console.error("Analysis failed:", error);
        res.status(500);
        throw new Error("Defect analysis failed: " + error.message);
    }
});

module.exports = { analyzeDefect };
