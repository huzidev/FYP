export function validateChangePassword({ email, oldPassword, newPassword }) {
  if (!email || !oldPassword || !newPassword) {
    return "All fields are required";
  }

  if (newPassword.length < 6) {
    return "New password must be at least 6 characters";
  }

  if (oldPassword === newPassword) {
    return "New password must be different from old password";
  }

  return null;
}
