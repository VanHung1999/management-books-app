import { DataProvider } from "@refinedev/core";
import { Book } from "@/app/interface/book";
import { User } from "@/app/interface/user";
import { createUser, getUsers, getUserByEmail, updateUser, deleteUser } from "@/app/database/userDatabase";
import { getBooks, getBookById, createBook, updateBook, deleteBook } from "@/app/database/bookDatabase";
import { createLoanRecord, deleteLoanRecord, getLoanRecordById, getLoanRecords, updateLoanRecord } from "@/app/database/loanRecorDatabase";
import { LoanRecord } from "../interface/loanrecord";

export const dataProvider: DataProvider = {
  
  getList: async ({ resource }) => {
    if (resource === "users") {
      const users = getUsers();
      return {
        data: users as any,
        total: users.length,
      };
    }
    if (resource === "books") {
      const books = getBooks();
      return {
        data: books as any,
        total: books.length,
      };
    }
    if (resource === "loanRecords") {
      const loanRecords = getLoanRecords();
      return {
        data: loanRecords as any,
        total: loanRecords.length,
      };
    }
    return { data: [], total: 0 };
  },

  // GET /:resource/:id - Get single record
  getOne: async ({ resource, id }) => {
    if (resource === "users") {
      const user = getUserByEmail(id as string);
      if (user) {
        return { data: user as any };
      }
      throw new Error("User not found");
    }
    if (resource === "books") {
      const book = getBookById(id as string);
      if (book) {
        return { data: book as any };
      }
      throw new Error("Book not found");
    }
    if (resource === "loanRecords") {
      const loanRecord = getLoanRecordById(id as string);
      if (loanRecord) {
        return { data: loanRecord as any };
      }
      throw new Error("Loan record not found");
    }
      throw new Error("Resource not found");
  },

  // POST /:resource - Create
  create: async ({ resource, variables }) => {
    if (resource === "users") {
      const newUser = createUser(variables as Omit<User, "id" | "createdAt" | "booksLoaned" | "booksDonated" | "role" | "status">);
      return { data: newUser as any };
    }
    if (resource === "books") {
      const newBook = createBook(variables as Omit<Book, "id" | "createdAt" | "updatedAt">);
      return { data: newBook as any };
    }
    if (resource === "loanRecords") {
      const newLoanRecord = createLoanRecord(variables as Omit<LoanRecord, "id" | "delivererName" | "returnConfirmerName" | "borrowedAt" | "deliveredAt" | "receivedAt" | "returnedAt" | "returnConfirmedAt" | "status">);
      return { data: newLoanRecord as any };
    }
    throw new Error("Invalid resource");
  },

  // PUT /:resource/:id - Update
  update: async ({ resource, id, variables }) => {
    if (resource === "users") {
      const updatedUser = updateUser(id as string, variables as Partial<Pick<User, 'name' | 'password' | 'status' | 'role'>>);
      return { data: updatedUser as any };
    }
    if (resource === "books") {
      const updatedBook = updateBook(id as string, variables as Partial<Book>);
      return { data: updatedBook as any };
    }
    if (resource === "loanRecords") {
      const updatedLoanRecord = updateLoanRecord(id as string, variables as Partial<LoanRecord>);
      return { data: updatedLoanRecord as any };
    }
    throw new Error("Resource not found");
  },

  // DELETE /:resource/:id - Delete
  deleteOne: async ({ resource, id }) => {
    if (resource === "users") {
      const deletedUser = deleteUser(id as string);
      return { data: deletedUser as any };
    }
    if (resource === "books") {
      const deletedBook = deleteBook(id as string);
      return { data: deletedBook as any };
    }
    if (resource === "loanRecords") {
      const deletedLoanRecord = deleteLoanRecord(id as string);
      return { data: deletedLoanRecord as any };
    }
    throw new Error("Resource not found");
  },

  getApiUrl: () => {
    return "http://localhost:3000/api";
  },
};
