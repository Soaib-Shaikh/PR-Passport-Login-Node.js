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
    if (!req.user) {
      req.flash("error_msg", "Please login first");
      return res.redirect('/login');
    }
    const user = await User.findById(req.user._id).lean();
    return res.render('./pages/user/profile', { user });
  } catch (err) {
    console.error('Profile render error:', err);
    req.flash("error_msg", "Failed to load profile");
    return res.redirect('/');
  }
};

// Edit form render
exports.editProfileForm = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error_msg", "Please login first");
      return res.redirect('/login');
    }
    const user = await User.findById(req.user._id).lean();
    return res.render('./pages/user/editUser', { user });
  } catch (err) {
    console.error('Edit form error:', err);
    req.flash("error_msg", "Failed to load edit form");
    return res.redirect('/profile');
  }
};

// Update profile (name, mobile, address)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error_msg", "Please login first");
      return res.redirect('/login');
    }

    const { fullName, mobile, address, birthdate, gender } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect('/login');
    }

    user.fullName = fullName || user.fullName;
    user.mobile = mobile || user.mobile;
    user.address = address || user.address;
    user.birthdate = birthdate || user.birthdate;
    user.gender = gender || user.gender;

    await user.save();
    req.flash("success_msg", "Profile updated successfully");
    return res.redirect('/profile');
  } catch (err) {
    console.error('Update profile error:', err);
    req.flash("error_msg", "Profile update failed");
    return res.redirect('/profile');
  }
};

// Update Avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      req.flash("error_msg", "No file uploaded!");
      return res.redirect('/profile');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect('/login');
    }

    // Delete old local avatar if exists
    if (user.avatarLocal) {
      deleteLocalFile(user.avatarLocal);
    }

    // Save new avatar filename in DB
    user.avatarLocal = req.file.filename;
    await user.save();

    req.flash("success_msg", "Profile picture updated successfully");
    return res.redirect('/profile');
  } catch (err) {
    console.error('Avatar update error:', err);
    req.flash("error_msg", "Error updating avatar");
    return res.redirect('/profile');
  }
};

// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error_msg", "Please login first");
      return res.redirect('/login');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect('/login');
    }

    // Delete avatar if exists
    if (user.avatarLocal) deleteLocalFile(user.avatarLocal);

    await User.findByIdAndDelete(user._id);

    // Logout and destroy session
    req.logout?.(() => {});
    req.session?.destroy(() => {});

    req.flash("success_msg", "Account deleted successfully");
    return res.redirect('/login');
  } catch (err) {
    console.error('Delete profile error:', err);
    req.flash("error_msg", "Error deleting account");
    return res.redirect('/profile');
  }
};
