const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  muscleGroup: {
    type: String,
    required: true,
    enum: ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Full Body']
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
