import { DataProvider } from "@refinedev/core";
import { Book } from "@/app/types/book";
import { User } from "@/app/types/user";
import { createUser, getUsers, getUserByEmail, updateUser, deleteUser } from "@/app/lib/database/userService";
import { getBooks, getBookById, createBook, updateBook, deleteBook } from "@/app/lib/database/bookService";
import { createLoanRecord, deleteLoanRecord, getLoanRecordById, getLoanRecords, updateLoanRecord } from "@/app/lib/database/loanRecordService";
import { LoanRecord } from "../types/loanRecord";
import { createDonationRecord, deleteDonationRecord, getDonationRecordById, getDonationRecords, updateDonationRecord } from "@/app/lib/database/donationRecordService";
import { DonationRecord } from "../types/donationRecord";

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
    if (resource === "donationRecords") {
      const donationRecords = getDonationRecords();
      return {
        data: donationRecords as any,
        total: donationRecords.length,
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
    if (resource === "donationRecords") {
      const donationRecord = getDonationRecordById(id as string);
      if (donationRecord) {
        return { data: donationRecord as any };
      }
      throw new Error("Donation record not found");
    }
      throw new Error("Resource not found");
  },

  // POST /:resource - Create
  create: async ({ resource, variables }) => {
    if (resource === "users") {
      const newUser = await createUser(variables as Omit<User, "id" | "createdAt" | "booksLoaned" | "booksDonated" | "role" | "status">);
      return { data: newUser as any };
    }
    if (resource === "books") {
      const newBook = await createBook(variables as Omit<Book, "id" | "createdAt" | "updatedAt">);
      return { data: newBook as any };
    }
    if (resource === "loanRecords") {
      const newLoanRecord = await createLoanRecord(variables as Omit<LoanRecord, "id" | "delivererName" | "returnConfirmerName" | "borrowedAt" | "deliveredAt" | "receivedAt" | "returnedAt" | "returnConfirmedAt" | "status">);
      return { data: newLoanRecord as any };
    }
    if (resource === "donationRecords") {
      const newDonationRecord = await createDonationRecord(variables as Omit<DonationRecord, "id" | "donationDate" | "status">);
      return { data: newDonationRecord as any };
    }
    throw new Error("Invalid resource");
  },

  // PUT /:resource/:id - Update
  update: async ({ resource, id, variables }) => {
    if (resource === "users") {
      const updatedUser = await updateUser(id as string, variables as Partial<Pick<User, 'name' | 'password' | 'status' | 'role'>>);
      return { data: updatedUser as any };
    }
    if (resource === "books") {
      const updatedBook = await updateBook(id as string, variables as Partial<Book>);
      return { data: updatedBook as any };
    }
    if (resource === "loanRecords") {
      const updatedLoanRecord = await updateLoanRecord(id as string, variables as Partial<LoanRecord>);
      return { data: updatedLoanRecord as any };
    }
    if (resource === "donationRecords") {
      const updatedDonationRecord = await updateDonationRecord(id as string, variables as Partial<DonationRecord>);
      return { data: updatedDonationRecord as any };
    }
    throw new Error("Resource not found");
  },

  // DELETE /:resource/:id - Delete
  deleteOne: async ({ resource, id }) => {
    if (resource === "users") {
      const deletedUser = await deleteUser(id as string);
      return { data: deletedUser as any };
    }
    if (resource === "books") {
      const deletedBook = await deleteBook(id as string);
      return { data: deletedBook as any };
    }
    if (resource === "loanRecords") {
      const deletedLoanRecord = await deleteLoanRecord(id as string);
      return { data: deletedLoanRecord as any };
    }
    if (resource === "donationRecords") {
      const deletedDonationRecord = await deleteDonationRecord(id as string);
      return { data: deletedDonationRecord as any };
    }
    throw new Error("Resource not found");
  },

  getApiUrl: () => {
    return "http://localhost:3000/api";
  },
};
