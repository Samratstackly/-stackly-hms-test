// utils/cookies.js

/**
 * Universal cookie getter that works with FastAPI HttpOnly cookies
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export const getCookie = (name) => {
  // Method 1: Direct parsing (most reliable)
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    
    // Check if this cookie starts with the name
    if (cookie.startsWith(name + '=')) {
      const cookieValue = cookie.substring(name.length + 1);
      
      // Debug log
      console.log(`🍪 Cookie "${name}" found:`, {
        length: cookieValue.length,
        startsWith: cookieValue.substring(0, 20) + '...',
        isJWT: cookieValue.includes('.')
      });
      
      return decodeURIComponent(cookieValue);
    }
  }
  
  console.log(`❌ Cookie "${name}" not found in:`, document.cookie);
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const accessToken = getCookie('access_token');
  const refreshToken = getCookie('refresh_token');
  
  console.log("🔐 Authentication check:", {
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length || 0
  });
  
  return !!(accessToken && refreshToken);
};

/**
 * Clear all authentication cookies
 */
export const clearAuthCookies = () => {
  const cookieNames = ['access_token', 'refresh_token', 'user_id', 'role'];
  
  cookieNames.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });
  
  console.log("🧹 Auth cookies cleared");
};