// controllers/settingsController.js
const User = require('../models/User');

// ── PATCH /api/settings/name ─────────────────────────────────────────
exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(422).json({ message: 'Name cannot be empty' });
    }

    req.user.name = name.trim();
    await req.user.save();

    res.json({ message: 'Name updated', name: req.user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/settings/password ────────────────────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Re-fetch with password since it's select:false on the model
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(422).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
