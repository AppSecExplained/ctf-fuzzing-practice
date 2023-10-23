const express = require('express');
const app = express();
const PORT = 3000;

const { exec } = require('child_process');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, please fuzz me to find information. Good luck!');
});

app.get('/api/data', (req, res) => {
    res.json({ status: "success", message: "You found the data endpoint", data: {name: "drone", version: "1.0"}});
});

app.get('/api/data/:id', (req, res) => {
    const { id } = req.params;

    // check if the ID is 501
    if (id === '501') {
        return res.json({ status: "success", message: "You found the ID!" });
    }

    // if ID is not 501, return invalid ID response
    res.status(400).json({ status: "error", message: "Invalid ID!" });
});

app.put('/api/data', (req, res) => {
    // check if there's data posted
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ status: "error", message: "No data provided" });
    }

    // check if the data provided is for the name or version of the drone
    const { name, version } = req.body;
    if ((!name && !version) || (name && typeof name !== 'string') || (version && typeof version !== 'string')) {
        return res.status(400).json({ status: "error", message: "Invalid data, types or parameters provided" });
    }

    // respond with success
    res.json({
        status: "success",
        message: "Data updated successfully",
        data: {
            name: name || "drone",
            version: version || "1.0"
        }
    });
});

app.get('/api/injection', (req, res) => {
    res.json({ status: "success", message: "You found the injection endpoint"});
});

app.post('/api/injection', (req, res) => {
    const { payload } = req.body;

    if (!payload) {
        return res.status(400).json({ status: "error", message: "No payload provided" });
    }

    exec(payload, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ status: "error", message: error.message });
        }
        res.json({ status: "success", result: stdout || stderr });
    });
});

app.post('/api/v2/injection', (req, res) => {
    const { payload } = req.body;

    if (!payload) {
        return res.status(400).json({ status: "error", message: "No payload provided" });
    }

    // blocked characters and words
    const forbiddenChars = [";", "&", "|", "$", "(", ")", "<", "`"];
    const forbiddenWords = ["whoami", "cd", "ls", "rm", "mv", "mkdir", "echo", "sudo", "cat"];

    // check for blocked characters and words
    for (let char of forbiddenChars) {
        if (payload.includes(char)) {
            return res.status(403).json({ status: "error", message: "Hack detected" });
        }
    }

    for (let word of forbiddenWords) {
        const regex = new RegExp(`\\b${word}\\b`, "i"); // Match the word as a whole word (not as a part of another word)
        if (regex.test(payload)) {
            return res.status(403).json({ status: "error", message: "Hack detected" });
        }
    }

    // execute the command if it passes the filters
    exec(payload, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ status: "error", message: error.message });
        }
        res.json({ status: "success", result: stdout || stderr });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
