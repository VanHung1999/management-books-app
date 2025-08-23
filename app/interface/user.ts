// Local users database for authentication
export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
    createdAt: string;
    status: 'active' | 'inactive';
  }
  
  // A single book loan made by a user
  export interface UserBookLoan {
    bookName: string;
    numOfBooks: number;
    borrowedDate: string;
    returnDate: string;
}
  
  // A single book donation made by a user
  export interface UserBookDonation {
    bookName: string;
    numOfBooks: number;
    donationDate: string;
}