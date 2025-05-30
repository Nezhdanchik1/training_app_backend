const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    avatarUrl: String,
    role: String
});

module.exports = mongoose.model('User', UserSchema);
