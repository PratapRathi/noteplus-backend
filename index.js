const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors');

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Availabe Routes
app.use('/api/auth', require('./routes/Auth'))
app.use('/api/notes', require('./routes/notes'))




app.listen(port, () => {
    console.log(`iNotebook backend is listening on port ${port}`)
})