import React from 'react';
import { Modal, Button, InputNumber } from 'antd';
import { Book } from '../interface/book';

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
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f1f1f'
            }}>
                <span style={{ fontSize: '24px' }}>📚</span>
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
            style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600'
            }}
            >
                {isSubmitting ? 'Processing...' : 'Confirm Borrow'}
            </Button>
        ]}
        width={500}
        centered
        destroyOnClose
    >
        <div style={{ padding: '20px 0' }}>
            {/* Book Information */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                marginBottom: '24px'
            }}>
                <img 
                    src={book.coverImage} 
                    alt={book.name}
                    style={{
                    width: '80px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                />
                <div>
                    <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1f1f1f',
                    marginBottom: '8px'
                    }}>
                        {book.name}
                    </div>
                    <div style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    marginBottom: '4px'
                    }}>
                        Author: {book.author}
                    </div>
                    <div style={{ 
                    fontSize: '14px', 
                    color: '#666'
                    }}>
                        Category: {book.category}
                    </div>
                </div>
            </div>

            {/* Book Statistics */}
            <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
            }}>
                <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#f6ffed',
                    borderRadius: '8px',
                    border: '1px solid #b7eb8f'
                }}>
                    <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#52c41a',
                    marginBottom: '4px'
                    }}>
                    {book.status.available}
                    </div>
                    <div style={{ fontSize: '14px', color: '#52c41a' }}>Available</div>
                </div>
                <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#fff7e6',
                    borderRadius: '8px',
                    border: '1px solid #ffd591'
                }}>
                    <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#fa8c16',
                    marginBottom: '4px'
                    }}>
                    {book.status.loaned}
                    </div>
                    <div style={{ fontSize: '14px', color: '#fa8c16' }}>Loaned</div>
                </div>
            </div>

            {/* Select Loan Quantity */}
            <div style={{ 
            padding: '20px',
            backgroundColor: '#f0f8ff',
            borderRadius: '12px',
            border: '1px solid #d6e4ff'
            }}>
                <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1890ff',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    Select quantity to borrow:
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '16px'
                }}>
                    <InputNumber
                    min={1}
                    max={book.status.available}
                    value={loanQuantity}
                    onChange={onQuantityChange}
                    size="large"
                    style={{
                        width: '120px',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                    addonAfter={
                        <span style={{ fontSize: '14px', color: '#666' }}>
                        copies
                        </span>
                    }
                    />
                </div>
                <div style={{ 
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    Maximum: <strong style={{ color: '#1890ff' }}>{book.status.available}</strong> copies
                </div>
            </div>

            {/* Notification */}
            <div style={{ 
            padding: '16px',
            backgroundColor: '#fff2e8',
            borderRadius: '8px',
            border: '1px solid #ffd591',
            marginTop: '16px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '14px',
                    color: '#d46b08'
                }}>
                <span>ℹ️</span>
                <strong>Note:</strong> Loan quantity cannot exceed the number of available.
                </div>
            </div>
        </div>
    </Modal>
  );
}
