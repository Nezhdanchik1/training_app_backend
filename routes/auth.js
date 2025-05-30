const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = 'qwerty';

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, avatarUrl } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Имя пользователя, email и пароль обязательны' });
    }

    // Проверка на уникальность username и email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем или email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'USER',
      avatarUrl: avatarUrl || ''
    });

    await user.save();

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

module.exports = router;
