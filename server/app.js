const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./configs/database');
const mongoose = require('mongoose');
const path = require('path');

// CONFIG .env
require('dotenv').config();

// Import Routers
const authRouter = require('./routers/auth.router');



// Connect to mongo DB
connectDB();

//Middleware
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Repo for Caro Online Web App");
});

// Route Middleware
app.use('/api/user', authRouter);
// app.use("/api/admin", adminRoute);


//Page not found
app.use((req, res) => {
    res.status(404).json({ message: 'Page Not Found' })
})

// Run app
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
    console.log("Server is running!");
});

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
