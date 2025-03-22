
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'uploads')));

// MongoDB connection (from MongoDB Compass instructions)
mongoose.connect('mongodb://127.0.0.1:27017/fileUploadDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Mongoose Schema (from Mongoose intro reference)
const fileSchema = new mongoose.Schema({
    filename: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// Multer setup (refer file upload handling route)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// POST API - file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fileRecord = new File({
            filename: req.file.filename,
            filePath: req.file.path
        });
        await fileRecord.save();
        res.json({ message: 'File uploaded and saved in MongoDB', file: fileRecord });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET API - fetch all uploaded files
app.get('/files', async (req, res) => {
    try {
        const files = await File.find();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Static file serving (refer: adding static page support)
app.use(express.static(path.join(__dirname, 'client')));

// PUT - Update file name by ID
app.put('/files/:id', async (req, res) => {
    const fileId = req.params.id;
    const { filename } = req.body;
    try {
        const updatedFile = await File.findByIdAndUpdate(fileId, { filename: filename }, { new: true });
        if (!updatedFile) {
            return res.status(404).json({ message: "File not found" });
        }
        res.json({ message: "File updated successfully", updatedFile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Delete file record by ID
app.delete('/files/:id', async (req, res) => {
    const fileId = req.params.id;
    try {
        const deletedFile = await File.findByIdAndDelete(fileId);
        if (!deletedFile) {
            return res.status(404).json({ message: "File not found" });
        }
        res.json({ message: "File deleted successfully", deletedFile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
