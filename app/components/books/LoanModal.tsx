import React from 'react';
import { Modal, Button, InputNumber } from 'antd';
import { Book } from '../../types/book';
import styles from '../../styles/components/books/LoanModal.module.css';

interface LoanModalProps {
  isVisible: boolean;
  book: Book | null;
  loanQuantity: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onQuantityChange: (value: number | null) => void;
}

export default function LoanModal({
  isVisible,
  book,
  loanQuantity,
  isSubmitting,
  onClose,
  onConfirm,
  onQuantityChange
}: LoanModalProps) {
  if (!book) return null;

  return (
    <Modal
        title={
            <div className={styles.modalTitle}>
                <span className={styles.titleIcon}>📚</span>
                Borrow Book: {book.name}
            </div>
        }
        open={isVisible}
        onCancel={onClose}
        footer={[
            <Button key="cancel" onClick={onClose} size="large">
            Cancel
            </Button>,
            <Button 
            key="confirm" 
            type="primary" 
            onClick={onConfirm}
            loading={isSubmitting}
            size="large"
            className={styles.confirmButton}
            >
                {isSubmitting ? 'Processing...' : 'Confirm Borrow'}
            </Button>
        ]}
        width={500}
        centered
        destroyOnHidden
    >
        <div className={styles.modalContent}>
            {/* Book Information */}
            <div className={styles.bookInfoSection}>
                <img 
                    src={book.coverImage} 
                    alt={book.name}
                    className={styles.bookCoverImage}
                />
                <div className={styles.bookDetails}>
                    <div className={styles.bookName}>
                        {book.name}
                    </div>
                    <div className={styles.bookAuthor}>
                        Author: {book.author}
                    </div>
                    <div className={styles.bookCategory}>
                        Category: {book.category}
                    </div>
                </div>
            </div>

            {/* Book Statistics */}
            <div className={styles.bookStatsGrid}>
                <div className={`${styles.statCard} ${styles.statCardAvailable}`}>
                    <div className={`${styles.statNumber} ${styles.statNumberAvailable}`}>
                    {book.status.available}
                    </div>
                    <div className={`${styles.statLabel} ${styles.statLabelAvailable}`}>Available</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardLoaned}`}>
                    <div className={`${styles.statNumber} ${styles.statNumberLoaned}`}>
                    {book.status.loaned}
                    </div>
                    <div className={`${styles.statLabel} ${styles.statLabelLoaned}`}>Loaned</div>
                </div>
            </div>

            {/* Select Loan Quantity */}
            <div className={styles.quantitySection}>
                <div className={styles.quantityTitle}>
                    Select quantity to borrow:
                </div>
                <div className={styles.quantityInputContainer}>
                    <InputNumber
                    min={1}
                    max={book.status.available}
                    value={loanQuantity}
                    onChange={onQuantityChange}
                    size="large"
                    className={styles.quantityInput}
                    addonAfter={
                        <span className={styles.quantityInputAddon}>
                        copies
                        </span>
                    }
                    />
                </div>
                <div className={styles.quantityMaxInfo}>
                    Maximum: <strong className={styles.quantityMaxNumber}>{book.status.available}</strong> copies
                </div>
            </div>

            {/* Notification */}
            <div className={styles.notificationSection}>
                <div className={styles.notificationContent}>
                <span className={styles.notificationIcon}>ℹ️</span>
                <strong className={styles.notificationText}>Note:</strong> Loan quantity cannot exceed the number of available.
                </div>
            </div>
        </div>
    </Modal>
  );
}
