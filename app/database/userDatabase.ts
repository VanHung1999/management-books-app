import { User } from "../interface/user";
import { usersInitial } from "../dataInitial/users";

const USERS_STORAGE_KEY = 'management-users-data';

// Initialize users in localStorage if empty
export const initializeUserDatabase = () => {
  if (typeof window !== 'undefined') {
    try{
        const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (!existingUsers) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersInitial));
            console.log('User database initialized with default data');
        }
    } catch (error) {
        throw new Error('Error initializing user database: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
};

// Helpers
const readUsers = (): User[] => {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};
const writeUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Create a new user
export const createUser = (
  userData: Omit<User, 'id' | 'createdAt' | 'booksLoaned' | 'booksDonated' | 'role' | 'status'>
): User | null => {
  if (typeof window !== 'undefined') {
    try{
        const users: User[] = readUsers();
        const newUser: User = {
            ...userData,
            id: String(users.length + 1),
            createdAt: new Date().toISOString().split('T')[0],
            booksLoaned: [],
            booksDonated: [],
            role: "user",
            status: "active"
        };
        users.push(newUser);
        writeUsers(users);
        return newUser;
    } catch (error) {
        throw new Error('Error creating user: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return null;
};

// Get all users from localStorage
export const getUsers = (): User[] => {
  if (typeof window !== 'undefined') {
    try{
        return readUsers();
    } catch (error) {
        throw new Error('Error getting users: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return [];
};

// Get user by ID
export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

// Get user by email (compat for auth lookup)
export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

// Update user (by id): name, password, status supported
export const updateUser = (
  id: string,
  updates: Partial<Pick<User, 'name' | 'password' | 'status' | 'role'>>
): User | null => {
  if (typeof window !== 'undefined') {
    try{
        const users: User[] = readUsers();
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
          throw new Error(`User not found with id: ${id}`);
        }
        const updatedUser: User = {
          ...users[userIndex],
          ...updates,
        };
        users[userIndex] = updatedUser;
        writeUsers(users);
        return updatedUser;

    } catch (error) {
        throw new Error('Error updating user: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return null;
};

// Delete user by id
export const deleteUser = (id: string): User | null => {
  if (typeof window !== 'undefined') {
    try{
        const users: User[] = readUsers();
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
          throw new Error(`User not found with id: ${id}`);
        }
        const deletedUser = users[userIndex];
        const remaining = users.filter((u) => u.id !== id);
        writeUsers(remaining);
        return deletedUser;
    } catch (error) {
        throw new Error('Error deleting user: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return null;
};