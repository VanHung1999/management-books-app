import { AuthProvider } from "@refinedev/core";
import { dataProvider } from "./data-provider";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const user = await dataProvider.getOne({
        resource: "users",
        id: email,
      });
      
      if (user.data.password !== password) {
        throw new Error("Wrong password");
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("currentUser", JSON.stringify(user.data));
        document.cookie = `auth-token=${user.data.id}; path=/; max-age=86400; SameSite=Lax`;
      }
      
      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        throw new Error("Email has not been registered");
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Authentication failed");
    }
  },

  logout: async () => { 
    if (typeof window !== 'undefined') {
      localStorage.removeItem("currentUser");
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = '/login';
    }
    
    return {
      success: true,
    };
  },

  check: async () => {
    if (typeof window === 'undefined') {
      return { authenticated: false };
    }
    
    const currentUser = localStorage.getItem("currentUser");
    const isAuthenticated = !!currentUser;
    
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const authRoutes = ['/login', '/register', '/forgot-password'];
      if (!authRoutes.some(route => currentPath.startsWith(route))) {
        window.location.href = '/login';
        return { authenticated: false };
      }
    }
    
    return {
      authenticated: isAuthenticated,
    };
  },

  onError: async (error) => {
    return {
      error,
    };
  },
};
