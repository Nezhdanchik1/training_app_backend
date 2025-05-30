const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise'); // путь к модели может отличаться

// Получить все упражнения
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получить упражнение по ID
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Упражнение не найдено' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новое упражнение
router.post('/', async (req, res) => {
  const { name, muscleGroup, description, imageUrl } = req.body;

  const exercise = new Exercise({
    name,
    muscleGroup,
    description,
    imageUrl,
  });

  try {
    const newExercise = await exercise.save();
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Обновить упражнение по ID
router.put('/:id', async (req, res) => {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedExercise) return res.status(404).json({ message: 'Упражнение не найдено' });
    res.json(updatedExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Удалить упражнение по ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!deletedExercise) return res.status(404).json({ message: 'Упражнение не найдено' });
    res.json({ message: 'Упражнение удалено' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
