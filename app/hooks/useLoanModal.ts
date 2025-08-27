import { useState } from 'react';
import { message } from 'antd';
import { Book } from '../types/book';
import { useUpdate, BaseRecord, useCreate } from '@refinedev/core';

export function useLoanModal() {
  const [isLoansModalVisible, setIsLoansModalVisible] = useState(false);
  const [loanQuantity, setLoanQuantity] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {mutate: updateBook} = useUpdate();
  const {mutate: createLoanRecord} = useCreate();

  // Function to open loans popup
  const handleOpenLoansModal = (book: Book | BaseRecord) => {
    setSelectedBook(book as Book);
    setLoanQuantity(1);
    setIsLoansModalVisible(true);
  };

  // Function to open loans popup for detail page (single book)
  const handleOpenLoansModalForDetail = (book: Book) => {
    setSelectedBook(book);
    setLoanQuantity(1);
    setIsLoansModalVisible(true);
  };

  // Function to close popup
  const handleCloseLoansModal = () => {
    setIsLoansModalVisible(false);
    setSelectedBook(null);
    setLoanQuantity(1);
  };

  // Function to confirm book borrowing
  const handleConfirmLoan = async () => {
    if (!selectedBook) return;
    
    if (loanQuantity <= 0) {
      message.error('Loan quantity must be greater than 0!');
      return;
    }
    
    if (loanQuantity > selectedBook.status.available) {
      message.error(`Loan quantity cannot exceed ${selectedBook.status.available} available copies!`);
      return;
    }

    setIsSubmitting(true);
    
    // Safely get current user from localStorage
    let currentUser;
    try {
      if (typeof window !== 'undefined') {
        currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      } else {
        currentUser = {};
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      currentUser = {};
    }
    
    try {
      // TODO: Add book borrowing logic here
      // Example: call API to create loan record
      createLoanRecord({
        resource: "loanRecords",
        values: {
          bookTitle: selectedBook.name,
          borrowerName: currentUser.email,
          quantity: loanQuantity
        }
      });

      updateBook({
        resource: "books",
        id: selectedBook.id,
        values: {
          status: {
            ...selectedBook.status,
            available: selectedBook.status.available - loanQuantity,
            loaned: selectedBook.status.loaned + loanQuantity
          }
        }
      });
      message.success(`Successfully borrowed ${loanQuantity} copies of "${selectedBook.name}"!`);
      handleCloseLoansModal();
      
      // Refresh data if needed
      // window.location.reload();
      
    } catch (error) {
      message.error('An error occurred while borrowing the book. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoansModalVisible,
    loanQuantity,
    selectedBook,
    isSubmitting,
    handleOpenLoansModal,
    handleOpenLoansModalForDetail,
    handleCloseLoansModal,
    handleConfirmLoan,
    setLoanQuantity
  };
}
