const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  days: [{
    day: {
      type: String,
      enum: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
      required: true
    },
    exercises: [{
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
      sets: { type: Number, required: true, min: 1 },
      reps: { type: Number, required: true, min: 1 },
      rest: { type: Number, required: true, min: 0 } // в секундах
    }]
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);