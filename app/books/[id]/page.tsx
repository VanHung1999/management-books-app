"use client";

import { useOne } from "@refinedev/core";
import { useParams } from "next/navigation";
import { Card, Row, Col, Tag, Divider, Skeleton, Button, Space, Typography, Badge, Avatar, } from "antd";
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, TagOutlined, BarcodeOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import Link from "next/link";
import LoanModal from "../../components/books/LoanModal";
import { Book } from "../../types/book";
import { useLoanModal } from "../../hooks/useLoanModal";
import styles from "../../styles/pages/books/detail/DetailBook.module.css";

const { Title, Text, Paragraph } = Typography;

export default function BookDetail() {
  const { id } = useParams();
  const { data, isLoading } = useOne({
    resource: "books",
    id: id as string,
  });

  // Use custom hook for loan modal
  const {
    isLoansModalVisible,
    loanQuantity,
    isSubmitting,
    handleOpenLoansModalForDetail,
    handleCloseLoansModal,
    handleConfirmLoan,
    setLoanQuantity
  } = useLoanModal();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Skeleton active>
          <div className={styles.loadingSkeleton} />
        </Skeleton>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className={styles.errorContainer}>
        <div style={{ marginBottom: '32px' }}>
          <BookOutlined className={styles.errorIcon} />
          <Title level={2} className={styles.errorTitle}>Book not found</Title>
          <Text className={styles.errorText}>The book you're looking for doesn't exist or has been removed.</Text>
        </div>
        <Link href="/books">
          <Button type="primary" size="large" icon={<HomeOutlined />} className={styles.errorButton}>
            Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  const book = data.data as Book;

  return (
    <div className={styles.mainContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <Link href="/books">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              className={styles.backButton}
            >
              Back to Books
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Main Book Information */}
        <Card 
          className={styles.mainBookCard}
          styles={{ body: { padding: '0' } }}
        >
          <div className={styles.bookHeader}>
            <Row gutter={[40, 24]} align="middle">
              {/* Book Cover */}
              <Col xs={24} md={8}>
                <div className={styles.bookCoverContainer}>
                  <div className={styles.bookCoverWrapper}>
                    <img 
                      src={book.coverImage} 
                      alt={book.name}
                      className={styles.bookCover}
                    />
                    <Badge 
                      count={book.num} 
                      className={styles.bookBadge}
                    />
                  </div>
                </div>
              </Col>

              {/* Book Details */}
              <Col xs={24} md={16}>
                <div className={styles.bookDetails}>
                  <Title level={1} className={styles.bookTitle}>
                    {book.name}
                  </Title>
                  
                  <Space size="large" wrap className={styles.bookTags}>
                    <Tag 
                      color="white" 
                      icon={<UserOutlined />}
                      className={styles.bookTag}
                    >
                      {book.author}
                    </Tag>
                    <Tag 
                      color="white" 
                      icon={<TagOutlined />}
                      className={styles.bookTag}
                    >
                      {book.category}
                    </Tag>
                    <Tag 
                      color="white" 
                      icon={<CalendarOutlined />}
                      className={styles.bookTag}
                    >
                      {book.publishYear}
                    </Tag>
                  </Space>

                  {book.description && (
                    <Paragraph className={styles.bookDescription}>
                      {book.description}
                    </Paragraph>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Book Status Grid */}
          <div className={styles.bookStatusSection}>
            <Title level={3} className={styles.statusTitle}>
              Book Status Overview
            </Title>
            <Row gutter={[20, 20]}>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  className={`${styles.statusCard} ${styles.statusCardAvailable}`}
                >
                  <div className={`${styles.statusNumber} ${styles.statusNumberAvailable}`}>
                    {book.status.available}
                  </div>
                  <Text className={`${styles.statusLabel} ${styles.statusLabelAvailable}`}>Available</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  className={`${styles.statusCard} ${styles.statusCardLoaned}`}
                >
                  <div className={`${styles.statusNumber} ${styles.statusNumberLoaned}`}>
                    {book.status.loaned}
                  </div>
                  <Text className={`${styles.statusLabel} ${styles.statusLabelLoaned}`}>Loaned</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  className={`${styles.statusCard} ${styles.statusCardDisabled}`}
                >
                  <div className={`${styles.statusNumber} ${styles.statusNumberDisabled}`}>
                    {book.status.disabled}
                  </div>
                  <Text className={`${styles.statusLabel} ${styles.statusLabelDisabled}`}>Disabled</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  className={`${styles.statusCard} ${styles.statusCardRenovated}`}
                >
                  <div className={`${styles.statusNumber} ${styles.statusNumberRenovated}`}>
                    {book.status.renovated}
                  </div>
                  <Text className={`${styles.statusLabel} ${styles.statusLabelRenovated}`}>Renovated</Text>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Additional Information */}
        <Card 
          title={
            <div className={styles.cardTitle}>
              <Avatar 
                icon={<BookOutlined />} 
                className={styles.cardTitleIcon}
              />
              Book Information
            </div>
          }
          className={styles.additionalInfoCard}
          styles={{ body: { padding: '32px' } }}
        >
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12}>
              <div className={styles.infoItem}>
                <Avatar 
                  icon={<BarcodeOutlined />} 
                  className={`${styles.infoItemIcon} ${styles.infoItemIconPrimary}`}
                />
                <div>
                  <Text strong className={styles.infoItemLabel}>ISBN</Text>
                  <br />
                  <Text className={styles.infoItemValue}>{book.ISBN || 'N/A'}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className={styles.infoItem}>
                <Avatar 
                  icon={<FileTextOutlined />} 
                  className={`${styles.infoItemIcon} ${styles.infoItemIconSuccess}`}
                />
                <div>
                  <Text strong className={styles.infoItemLabel}>Total Copies</Text>
                  <br />
                  <Text className={styles.infoItemValue}>{book.num}</Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider className={styles.divider} />

          {/* Timestamps */}
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12}>
              <div className={styles.infoItem}>
                <Avatar 
                  icon={<ClockCircleOutlined />} 
                  className={`${styles.infoItemIcon} ${styles.infoItemIconPrimary}`}
                />
                <div>
                  <Text strong className={styles.infoItemLabel}>Created</Text>
                  <br />
                  <Text className={styles.infoItemValue}>
                    {new Date(book.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className={styles.infoItem}>
                <Avatar 
                  icon={<ClockCircleOutlined />} 
                  className={`${styles.infoItemIcon} ${styles.infoItemIconPrimary}`}
                />
                <div>
                  <Text strong className={styles.infoItemLabel}>Last Updated</Text>
                  <br />
                  <Text className={styles.infoItemValue}>
                    {new Date(book.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <div className={styles.actionSection}>
          <Title level={3} className={styles.actionTitle}>
            Manage This Book
          </Title>
          <Space size="large" wrap>
              <Button 
               type="primary" 
               size="large"
               onClick={() => handleOpenLoansModalForDetail(book)}
               className={`${styles.actionButton} ${book.status.available === 0 ? styles.loanButtonDisabled : styles.loanButton}`}
               disabled={book.status.available === 0}
             >
               📚 Loans
             </Button>
            <Link href={`/books/${book.id}/edit`}>
              <Button 
                type="primary" 
                size="large"
                icon={<EditOutlined />}
                className={`${styles.actionButton} ${styles.editButton}`}
              >
                Edit Book
              </Button>
            </Link>
            <Link href="/books">
              <Button 
                size="large"
                icon={<HomeOutlined />}
                className={`${styles.actionButton} ${styles.backToListButton}`}
              >
                Back to List
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      {/* Loan Modal Component */}
      <LoanModal
        isVisible={isLoansModalVisible}
        book={book}
        loanQuantity={loanQuantity}
        isSubmitting={isSubmitting}
        onClose={handleCloseLoansModal}
        onConfirm={handleConfirmLoan}
        onQuantityChange={(value) => setLoanQuantity(value || 1)}
      />


    </div>
  );
}