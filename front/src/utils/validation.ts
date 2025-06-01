export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return 'Email обязателен для заполнения';
  }
  
  if (!emailRegex.test(email)) {
    return 'Введите корректный email адрес';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Пароль обязателен для заполнения';
  }
  
  if (password.length < 6) {
    return 'Пароль должен содержать минимум 6 символов';
  }
  
  return null;
};

export const validateLoginForm = (email: string, password: string) => {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  
  return {
    email: emailError,
    password: passwordError,
    isValid: !emailError && !passwordError,
  };
};
