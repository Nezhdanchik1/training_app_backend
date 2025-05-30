const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/auth_middleware');

// Получение профиля текущего пользователя
router.get('/profile', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
        id: user._id,
        username: user.username,
        email: user.email,       
        avatarUrl: user.avatarUrl, 
        role: user.role
    });
});

// Получение списка всех пользователей (тоже защищено)
router.get('/', authMiddleware, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Создание пользователя (регистрация)
router.post('/', async (req, res) => {
    // хэшируем пароль при регистрации
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = new User(req.body);
    await user.save();
    res.json(user);
});

// Обновление пользователя — только сам пользователь может обновлять свой профиль
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        const { oldPassword, password, ...otherData } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Если хотят сменить пароль — проверяем старый
        if (password) {
            if (!oldPassword) {
                return res.status(400).json({ message: 'Нужно указать старый пароль для смены' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Старый пароль неверен' });
            }

            // Хешируем новый пароль
            otherData.password = await bcrypt.hash(password, 10);
        }

        // Обновляем остальные данные
        const updatedUser = await User.findByIdAndUpdate(req.params.id, otherData, { new: true });

        res.json({
            message: 'Профиль успешно обновлен',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatarUrl: updatedUser.avatarUrl,
                role: updatedUser.role,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении профиля' });
    }
});

// Обновление роли пользователя (только для админа)
router.put('/:id/role', authMiddleware, async (req, res) => {
  try {
    // Проверяем, что текущий пользователь — админ
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Доступ запрещён. Только для администраторов.' });
    }

    const { role } = req.body;
    const allowedRoles = ['USER', 'COACH'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Недопустимая роль' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Роль пользователя обновлена',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении роли' });
  }
});

// Удаление пользователя (также можно ограничить)
// Удаление пользователя (только админ может удалять)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Проверяем роль текущего пользователя
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Доступ запрещён. Только администраторы могут удалять пользователей.' });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Можно дополнительно запретить удалять самого себя (по желанию)
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Вы не можете удалить самого себя' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
  }
});


module.exports = router;
