const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path'); // Import the path module
const cors = require('cors')

app.use(express.json());
app.use(cors());

app.delete('/deleteFile', (req, res) => {
    const { filePath } = req.body;
    if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
    }
    fs.unlink(filePath, (error) => {
        if (error) {
            console.error('Error deleting file:', error);
            return res.status(500).json({ error: 'Error deleting file' });
        }
        res.status(200).json({ message: 'File deleted successfully' });
    });
});

app.delete('/deleteFolder', (req, res) => {
    const { folderPath } = req.body;
    if (!folderPath) {
        return res.status(400).json({ error: 'Folder path is required' });
    }
    fs.rmdir(folderPath, { recursive: true }, (error) => {
        if (error) {
            console.error('Error deleting folder:', error);
            return res.status(500).json({ error: error });
        }
        res.status(200).json({ message: 'Folder deleted successfully' });
    });
});

// Route to get all folders in a particular drive
app.get('/foldersInDrive/:drive', (req, res) => {
    const { drive } = req.params;
    const drivePath = drive + ':\\'; // Add the colon and backslash to form the drive path
    const foldersInDrive = getAllFoldersInDrive(drivePath);
    if (foldersInDrive !== null) {
        res.status(200).json({ folders: foldersInDrive });
    } else {
        res.status(500).json({ error: 'Error reading drive' });
    }
});

function getAllFoldersInDrive(drivePath) {
    const folders = [];
    try {
        const filesAndFolders = fs.readdirSync(drivePath);
        for (const item of filesAndFolders) {
            const itemPath = path.join(drivePath, item);
            let stats;
            try {
                stats = fs.statSync(itemPath);
            } catch (error) {
                console.error('Error accessing file/directory:', itemPath, error.message);
                continue; // Skip this item and proceed to the next one
            }
            if (stats.isDirectory()) {
                folders.push(item);
            }
        }
        return folders;
    } catch (error) {
        console.error('Error reading drive:', error);
        return null;
    }
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
