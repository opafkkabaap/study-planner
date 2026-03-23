const User = require('../models/User');

// PATCH /api/settings/name
exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(422).json({ message: 'Name cannot be empty' });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Name updated', name: updated.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/settings/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(422).json({ message: 'New password must be at least 6 characters' });
    }
    // hash manually — avoids pre-save hook entirely
    const bcrypt = require('bcryptjs');
    user.password = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user._id, { password: user.password });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};