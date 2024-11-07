// // src/auth.js

// // Set a cookie with a specified name, value, and expiration in seconds
// export const setCookie = (name, value, maxAge = 3600) => {
//   document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
// };

// // Get a cookie by name
// export const getCookie = (name) => {
//   const cookies = document.cookie.split("; ");
//   for (let cookie of cookies) {
//     const [cookieName, cookieValue] = cookie.split("=");
//     if (cookieName === name) {
//       return decodeURIComponent(cookieValue);
//     }
//   }
//   return null;
// };

// // Clear a cookie by setting its expiration to the past
// export const clearCookie = (name) => {
//   document.cookie = `${name}=; path=/; max-age=0`;
// };
// Set a session item with a specified name and value

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
