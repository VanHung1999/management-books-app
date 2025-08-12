import { User } from "../interface/user";

export const usersInitial: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01',
    booksLoaned: [],
    booksDonated: [],
    status: 'active'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    createdAt: '2024-01-02',
    booksLoaned: [],
    booksDonated: [],
    status: 'active'
  },
  {
    id: '3',
    email: 'hung@example.com',
    password: 'hung123',
    name: 'Nguyen Van Hung',
    role: 'admin',
    createdAt: '2024-01-03',
    booksLoaned: [],
    booksDonated: [],
    status: 'active'
  },
  {
    id: '4',
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-04',
    booksLoaned: [],
    booksDonated: [],
    status: 'active'
  }
];


