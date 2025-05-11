if (!user) {
  user = await User.findOne({ email: email });
  if (user) {
    // User exists by email, link googleId and update photo
    user.googleId = googleId;
    user.profilePicture = photoUrl || user.profilePicture; // Update if new photo available
    await user.save();
  } else {
    // New user
    // ... (username generation logic) ...
    user = new User({
      googleId,
      email,
      username,
      profilePicture: photoUrl, // <<< SAVE PHOTO URL FOR NEW USER
    });
    await user.save();
  }
} else {
  // User found by googleId, optionally update their photo if it changed or wasn't set
  if (photoUrl && user.profilePicture !== photoUrl) {
    user.profilePicture = photoUrl;
    await user.save();
  }
}
