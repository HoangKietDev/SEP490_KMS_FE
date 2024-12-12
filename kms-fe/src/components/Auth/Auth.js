export const setSession = (name, value) => {
  sessionStorage.setItem(name, JSON.stringify(value)); // Lưu giá trị dưới dạng chuỗi JSON
};

// Get a session item by name
export const getSession = (name) => {
  const sessionValue = sessionStorage.getItem(name);
  return sessionValue ? JSON.parse(sessionValue) : null; // Parse giá trị nếu tồn tại, trả về null nếu không
};

// Clear a session item by name
export const clearSession = (name) => {
  sessionStorage.removeItem(name);
};

// Set a cookie with a specific name and value
export const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Set expiration date
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/`;
};

// Get a cookie value by name
export const getCookie = (name) => {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    let cookie = cookieArr[i].trim();
    if (cookie.startsWith(name + '=')) {
      return JSON.parse(cookie.substring(name.length + 1)); // Parse the value if it exists
    }
  }
  return null; // Return null if the cookie doesn't exist
};

// Clear a cookie by name
export const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`; // Set the expiration date in the past
};
