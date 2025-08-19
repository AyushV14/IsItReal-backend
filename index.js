require('dotenv').config(); 

const express = require('express');
const multer  = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const cors = require('cors');

const upload = multer({ dest: 'uploads/' }); 
const app = express();

const PORT = process.env.NODE_PORT || 3000;  
const baseURL = process.env.FASTAPI_URL;

app.use(cors());

app.post('/detect', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const imgPath = path.join(__dirname, req.file.path);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(imgPath)); 

        const fastapiResponse = await axios.post(
            `${baseURL}/predict/`,
            formData,
            { headers: formData.getHeaders() }
        );

        fs.unlinkSync(imgPath); 
        return res.json(fastapiResponse.data);

    } catch (err) {
        fs.unlink(req.file.path, () => {});
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Node.js backend running at http://localhost:${PORT}`);
});
