export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
  return passwordRegex.test(password);
};

export const validateName = (name) => {
  return name.length >= 2 && name.length <= 50;
};

export const getValidationError = (field, value) => {
  switch (field) {
    case 'email':
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Invalid email format';
      return '';

    case 'password':
      if (!value) return 'Password is required';
      if (!validatePassword(value)) {
        return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return '';

    case 'firstName':
    case 'lastName':
      if (!value) return `${field === 'firstName' ? 'First' : 'Last'} name is required`;
      if (!validateName(value)) return 'Name must be between 2 and 50 characters';
      return '';

    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== arguments[1]) return 'Passwords do not match';
      return '';

    default:
      return '';
  }
}; 