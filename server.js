const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const workoutPlanRoutes = require('./routes/workoutplan');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/plans', workoutPlanRoutes);

mongoose.connect(process.env.MONGODB_CONNECT_URI)
// mongoose.connect('mongodb://localhost:27017/training_app_db')
mongoose.connection.on('connected', () => {
  console.log("DB connected");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
