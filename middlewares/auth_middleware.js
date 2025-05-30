const jwt = require('jsonwebtoken');
const SECRET_KEY = 'qwerty';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Нет токена' });

    try {
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user;
        next();
    } catch {
        res.status(403).json({ message: 'Неверный токен' });
    }
}

module.exports = authMiddleware;