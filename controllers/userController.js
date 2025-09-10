const User = require('../models/userSchema');
const path = require('path');
const fs = require('fs');

// Helper → Delete old local file
const deleteLocalFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, '..', 'public', 'uploads', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Local file delete error:', err);
    }
  }
};

// Profile page render
exports.profilePage = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');
    const user = await User.findById(req.user._id).lean();
    return res.render('./pages/user/profile', { user });
  } catch (err) {
    console.error('Profile render error:', err);
    return res.status(500).send('Server error');
  }
};

// Edit form render
exports.editProfileForm = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');
    const user = await User.findById(req.user._id).lean();
    return res.render('./pages/user/editUser', { user });
  } catch (err) {
    console.error('Edit form error:', err);
    return res.status(500).send('Server error');
  }
};

// Update profile (name, mobile, address)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');
    const { fullName, mobile, address, birthdate, gender } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.redirect('/login');

    user.fullName = fullName || user.fullName;
    user.mobile = mobile || user.mobile;
    user.address = address || user.address;
    user.birthdate = birthdate || user.birthdate;
    user.gender = gender || user.gender;

    await user.save();
    console.log('Profile updated successfully.');
    return res.redirect('/profile');
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).send('Update failed');
  }
};

// Update Avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded!');
    }

    const user = await User.findById(req.user._id);

    // Delete old local avatar if exists
    if (user.avatarLocal) {
      deleteLocalFile(user.avatarLocal);
    }

    // Save new avatar filename in DB
    user.avatarLocal = req.file.filename;

    await user.save();
    console.log('Profile Picture updated.');
    
    return res.redirect('/profile');
  } catch (err) {
    console.error('Avatar update error:', err);
    return res.status(500).send('Error updating avatar');
  }
};

// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');
    const user = await User.findById(req.user._id);

    // Delete avatar if exists
    if (user.avatarLocal) deleteLocalFile(user.avatarLocal);

    await User.findByIdAndDelete(user._id);

    // Logout and destroy session
    req.logout?.(() => {});
    req.session?.destroy(() => {});

    console.log('User Deleted.');
    return res.redirect('/login');
  } catch (err) {
    console.error('Delete profile error:', err);
    return res.status(500).send('Delete failed');
  }
};
