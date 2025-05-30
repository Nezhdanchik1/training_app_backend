const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');

// ➕ Создать план
router.post('/', async (req, res) => {
  try {
    const plan = new WorkoutPlan(req.body);
    console.log('Получен план:', req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: 'Ошибка создания плана' });
  }
});

router.get('/next', async (req, res) => {
  try {
    // Например, получить первый план из базы (поправьте логику под свои нужды)
    const nextWorkout = await WorkoutPlan.findOne().populate('days.exercises.exerciseId');

    if (!nextWorkout) {
      return res.status(404).json({ error: 'Следующая тренировка не найдена' });
    }

    res.json(nextWorkout);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения следующей тренировки' });
  }
});

// Предполагаем, что WorkoutPlan имеет поле userId, связанное с User
router.get('/public', async (req, res) => {
  try {
    // Найдём пользователей-тренеров
    const coaches = await User.find({ role: 'COACH' }).select('_id');
    const coachIds = coaches.map(c => c._id);

    console.log(coaches)

    const plans = await WorkoutPlan.find({
      userId: { $in: coachIds },
    });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении публичных планов' });
  }
});


// 📄 Получить все планы
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  
  try {
    const plans = await WorkoutPlan.find({ userId }); // если поле userId есть
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении планов' });
  }
});

// 🔍 Получить один план по ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id).populate('days.exercises.exerciseId');
    if (!plan) return res.status(404).json({ error: 'План не найден' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения плана' });
  }
});

// ✏️ Обновить план
router.put('/:id', async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: 'План не найден' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: 'Ошибка обновления плана' });
  }
});

// 🗑️ Удалить план
router.delete('/:id', async (req, res) => {
  try {
    const result = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'План не найден' });
    res.json({ message: 'План удален' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления плана' });
  }
});

module.exports = router;
