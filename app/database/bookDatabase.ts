import { Book } from "../interface/book";
import {fetchRealBooks} from "../dataInitial/books";

const BOOKS_STORAGE_KEY = 'management-books-data';

// Generate a valid ISBN-13 (simple generator with checksum)
const generateIsbn13 = (): string => {
  const prefix = '978';
  let body = '';
  for (let i = 0; i < 9; i += 1) {
    body += Math.floor(Math.random() * 10);
  }
  const base = prefix + body; // 12 digits
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = parseInt(base[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + String(checkDigit);
};

export const initializeBookDatabase = async () => {
  if (typeof window !== 'undefined') {
    const existingBooks = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!existingBooks) {
      const realBooks = await fetchRealBooks();
      if (realBooks.length > 0) {
        localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(realBooks));
        console.log('Book database initialized with real books:', realBooks.length);
      }
    }
  }
};

// Get all books
export const getBooks = (): Book[] => {
  if (typeof window !== 'undefined') {
    try {
      const books = localStorage.getItem(BOOKS_STORAGE_KEY);
      return books ? JSON.parse(books) : [];
    } catch (error) {
      throw new Error('Error getting books: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return [];
};

// Get book by ID
export const getBookById = (id: string): Book | null => {
  const books = getBooks();
  return books.find((b) => b.id === id) || null;
};

// Create a new book
export const createBook = (
  bookData: Omit<Book, 'id' | 'ISBN' | 'createdAt' | 'updatedAt' | 'status'>
): Book | null => {
  if (typeof window !== 'undefined') {
    try {
      const books = getBooks();
      const newBook: Book = {
        ...bookData,
        id: String(books.length + 1),
        ISBN: generateIsbn13(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: { available: bookData.num, loaned: 0, disabled: 0, renovated: 0 },
      };

      const updatedBooks = [...books, newBook];
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
      return newBook;
    } catch (error) {
      throw new Error('Error creating book: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return null;
};

// Update existing book
export const updateBook = (
  id: string,
  updates: Partial<Book>
): Book | null => {
  if (typeof window !== 'undefined') {
    try {
      const books = getBooks();
      const index = books.findIndex((b) => b.id === id);
      if (index === -1) {
        throw new Error(`Book not found with id: ${id}`);
      }
      const updatedBook: Book = {
        ...books[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      const updatedBooks = [...books];
      updatedBooks[index] = updatedBook;
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
      return updatedBook;
    } catch (error) {
      throw new Error('Error updating book: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return null;
};

// Delete book by ID
export const deleteBook = (id: string): Book | null => {
  if (typeof window !== 'undefined') {
    try {
      const books = getBooks();
      const index = books.findIndex((b) => b.id === id);
      if (index === -1) {
        throw new Error(`Book not found with id: ${id}`);
      }
      const deletedBook = books[index];
      const updatedBooks = books.filter((b) => b.id !== id);
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
      return deletedBook;
    } catch (error) {
      throw new Error('Error deleting book: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  return null;
};

