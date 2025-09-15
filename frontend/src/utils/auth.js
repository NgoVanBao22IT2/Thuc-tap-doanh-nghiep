// Placeholder for auth utility
export function isAuthenticated() {
  return true;
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("Token from localStorage:", token); // Debug log

  if (!token) {
    console.warn("No token found in localStorage");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};
