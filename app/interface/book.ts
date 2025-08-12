// Book interface and related types
export interface Book {
  id: string;
  name: string;
  num: number;          // Number of copies
  category: string;     // Category
  description: string;  // Description
  author: string;       // Author
  ISBN: string;        // ISBN code
  coverImage?: string;  // Cover image URL
  publishYear?: number; // Publication year
  createdAt: string;   // Added to system date
  updatedAt: string;   // Last updated date
  status: BookStatus;
}

// Book status interface
export interface BookStatus {
  available: number;  // Available copies
  loaned: number;    // Currently loaned
  disabled: number;  // Damaged copies
  renovated: number; // Under repair
}

// Book status types for filtering
export type BookStatusType = 'available' | 'loaned' | 'disabled' | 'renovated' | 'all';

// Sort options for books
export type BookSortOption = 
  | 'name_asc' 
  | 'name_desc'
  | 'author_asc'
  | 'author_desc'
  | 'year_asc'
  | 'year_desc'
  | 'available_asc'
  | 'available_desc';