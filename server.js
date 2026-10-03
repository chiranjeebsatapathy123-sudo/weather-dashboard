const express = require("express");
const path = require("path");
const apiApp = require("./api/index");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// Mount the API router
app.use("/", apiApp);

// Catch-all route to serve the main HTML file (SPA support if needed)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
