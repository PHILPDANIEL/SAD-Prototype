require('dotenv').config();
console.log('Mongo URI:', process.env.DATABASE_URI);
const express = require('express');
const connectDb = require('./config/connectDatabase');
const testDbConnection = require('./test/dbTest');

const app = express();
const PORT = 3000;




app.use(express.json());

const startServer = async () => {
    await connectDb(); 
    await testDbConnection();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();