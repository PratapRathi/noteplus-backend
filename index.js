const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const mongoURI = process.env.DB_PASSWORD;
connectToMongo(mongoURI);
const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Availabe Routes
app.use('/api/auth', require('./routes/Auth'))
app.use('/api/notes', require('./routes/notes'))




app.listen(port, () => {
    console.log(`iNotebook backend is listening on port ${port}`)
})