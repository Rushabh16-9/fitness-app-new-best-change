const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication
    if (username === 'pasa' && password === 'password') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
