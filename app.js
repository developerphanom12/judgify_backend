const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const admin = require('./routes/adminRoutes')

dotenv.config();

app.use(express.json()); 

app.use(cors({ origin: true })); 

   
const port = process.env.PORT || 6000;


app.use('/api/admin', admin)


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on Port:${port}`);
});