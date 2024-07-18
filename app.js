const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

const directoryPath = path.join(__dirname, 'wh40k-10e');
const publicPath = path.join(__dirname, 'src');

// Serve static files from the 'public' directory
app.use(express.static(publicPath));

// Route to fetch file names from 'wh40k-10e' directory
app.get('/wh40k-10e', async (req, res) => {
    try {
        const files = await fs.readdir(directoryPath);
        const catFiles = files.filter(file => file.endsWith('.cat'));
        res.json(catFiles);
    } catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Route to serve 'dice.html'
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'dice.html')




    
);
});

// Route to fetch file content
app.get('/wh40k-10e/:filename', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);  // Decode the filename
        const filePath = path.join(directoryPath, filename);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        res.send(fileContent);
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
