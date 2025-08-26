"use client";

import React, { useState } from "react";
import { Link, useList } from "@refinedev/core";
import { Card, List, Skeleton, Pagination, Select, Button } from "antd";
import { getCategories } from "../database/categoryDatabase";
import LoanModal from "../components/LoanModal";
import { useLoanModal } from "../hooks/useLoanModal";
import styles from "../styles/pages/books/Books.module.css";

export default function Books() {

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("none");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  
  const categories = getCategories();
  const { data, isLoading } = useList({
    resource: "books",
  });

  // Use custom hook for loan modal
  const {
    isLoansModalVisible,
    loanQuantity,
    selectedBook,
    isSubmitting,
    handleOpenLoansModal,
    handleCloseLoansModal,
    handleConfirmLoan,
    setLoanQuantity
  } = useLoanModal();

  // Filter books by category and search query
  const filteredBooks = data?.data?.filter(book => {  
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    
    let matchesSearch = true;
    if (searchQuery !== "" && searchType !== "none") {
      if (searchType === "name") {
        matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (searchType === "author") {
        matchesSearch = book.author.toLowerCase().includes(searchQuery.toLowerCase());
      }
    }
    
    return matchesCategory && matchesSearch;
  }) || [];

  // Sort books by name alphabetically
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  // Calculate pagination data
  const totalBooks = sortedBooks.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBooks = sortedBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalBooks / pageSize);

  // Handle page change
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle search type change
  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    setCurrentPage(1); // Reset to first page when changing search type
    if (type === "none") {
      setSearchQuery("");
    }
  };

  // Handle sort order change
  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when changing sort order
  };
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Skeleton.Input active size="large" className={styles.loadingTitle} />
        <div className={styles.loadingGrid}>
          {[...Array(12)].map((_, index) => (
            <Skeleton key={index} active>
              <div className={styles.loadingCard}>
                <Skeleton.Input active size="large" className={styles.loadingCardTitle} />
                <Skeleton.Image active className={styles.loadingCardImage} />
                <div className={styles.loadingCardContent}>
                  <Skeleton.Input active size="small" className={styles.loadingCardTextSmall} />
                  <Skeleton.Input active size="small" className={styles.loadingCardTextMedium} />
                  <Skeleton.Input active size="small" className={styles.loadingCardTextLarge} />
                  <Skeleton.Input active size="small" className={styles.loadingCardTextXSmall} />
                  <Skeleton.Input active size="small" className={styles.loadingCardTextHalf} />
                  <Skeleton.Input active size="small" className={styles.loadingCardTextHalf2} />
                  <Skeleton.Input active size="small" className={styles.loadingCardTextHalf3} />
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Enhanced Filters and Tools Section */}
      <div className={styles.filtersSection}>
        {/* Header */}
        <div className={styles.filtersHeader}>
          <h2 className={styles.filtersTitle}>
            📚 Book Management Tools
          </h2>
          <p className={styles.filtersSubtitle}>
            Search, filter, and organize your book collection
          </p>
        </div>

        {/* Main Tools Grid */}
        <div className={styles.filtersRow}>
          {/* Search Section */}
          <div className={styles.filtersColumnSearchToolsContainer}>
            <div className={styles.filterColumnHeader}>
              <span className={styles.searchIcon}>🔍</span>
              <h3 className={styles.searchTitle}>
                Search Books
              </h3>
            </div>
            
            <div className={styles.filtesColumnSelectBoxContainer}>
              <Select
                value={searchType}
                onChange={handleSearchTypeChange}
                options={[
                  { value: "none", label: "🚫 No Search" },
                  { value: "name", label: "📖 Search by Name" },
                  { value: "author", label: "✍️ Search by Author" },
                ]}
                className={styles.fullWidthSelect}
                placeholder="Select search type"
                size="large"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={
                  searchType === "none" ? "Search disabled" :
                  searchType === "name" ? "Search by book name..." :
                  searchType === "author" ? "Search by author..." :
                  "Search by book name or author..."
                }
                disabled={searchType === "none"}
                className={styles.searchInput}
                style={{
                  opacity: searchType === "none" ? 0.6 : 1,
                  backgroundColor: searchType === "none" ? '#f5f5f5' : 'white'
                }}
                onFocus={(e) => {
                  if (searchType !== "none") {
                    e.target.style.borderColor = '#52c41a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(82, 196, 26, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d9d9d9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Sort Section */}
          <div className={styles.filtesColumnSortContainer}>
            <div className={styles.filterColumnHeader}>
              <span className={styles.sortIcon}>📊</span>
              <h3 className={styles.sortTitle}>
                Sort by Name
              </h3>
            </div>
            
            <Select
              value={sortOrder}
              onChange={handleSortOrderChange}
              options={[
                { value: "asc", label: "⬆️ A → Z (Ascending)" },
                { value: "desc", label: "⬇️ Z → A (Descending)" }
              ]}
              className={styles.sortSelect}
              placeholder="Select sort order"
              size="large"
            />
          </div>

          {/* Category Filter Section */}
          <div className={styles.filtesColumnCategoryContainer}>
            <div className={styles.filterColumnHeader}>
              <span className={styles.categoryIcon}>🏷️</span>
              <h3 className={styles.categoryTitle}>
                Filter by Category
              </h3>
            </div>
            
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={[
                { value: "all", label: "🌐 All Categories" },
                ...categories.map(cat => ({ 
                  value: cat, 
                  label: `📚 ${cat}` 
                }))
              ]}
              className={styles.categorySelect}
              placeholder="Select category"
              size="large"
            />
          </div>
        </div>

        {/* Page Size and Total Info */}
        <div className={styles.paginationSection}>
          <div className={styles.paginationInfo}>
            <span className={styles.statsNumber}>📈</span>
            Total Books: <span className={styles.totalBooks}>{totalBooks}</span>
            {selectedCategory !== "all" && (
              <span className={styles.availableBooks}>
                in <strong>{selectedCategory}</strong>
              </span>
            )}
            {searchQuery !== "" && searchType !== "none" && (
              <span className={styles.loanedBooks}>
                matching "<strong>{searchQuery}</strong>" {
                  searchType === "name" ? "in name" :
                  searchType === "author" ? "in author" :
                  "in name/author"
                }
              </span>
            )}
          </div>
          
          <div className={styles.pageSizeContainer}>
            <span className={styles.paginationText}>📄 Items per page:</span>
            <Select
              value={pageSize}
              onChange={(value) => handlePageChange(1, value)}
              options={[
                { value: 5, label: '5 items' },
                { value: 10, label: '10 items' },
                { value: 15, label: '15 items' },
                { value: 20, label: '20 items' },
                { value: 25, label: '25 items' },
                { value: 30, label: '30 items' },
              ]}
              className={styles.pageSizeSelect}
              size="small"
            />
          </div>
        </div>
      </div>

      {currentBooks.length > 0 ? (
        <>
          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 4,
              xxl: 5,
            }}
            dataSource={currentBooks}
            renderItem={(book) => (
              <List.Item key={book.id} className={styles.bookItem}>
                <Card 
                  title={
                    <Link to={`/books/${book.id}`} className={styles.bookLink}>
                      <div className={styles.bookTitle}>
                        {book.name}
                      </div>
                    </Link>
                  }
                  className={styles.bookCard}
                  styles={{
                    body: {
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      padding: '16px'
                    },
                    header: {
                      padding: '16px 16px 8px 16px',
                      borderBottom: '1px solid #f0f0f0'
                    }
                  }}                 
                  hoverable
                >
                  <div className={styles.bookImageContainer}>
                    <Link to={`/books/${book.id}`}>
                      <img 
                        src={book.coverImage} 
                        alt={book.name} 
                        className={styles.bookImage}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                      />
                    </Link>
                  </div>
                  <div className={styles.bookContent}>
                    <div className={styles.bookDetails}>
                      <div className={styles.bookInfo}>
                        <div className={styles.bookCategory}>
                          <strong className={styles.bookCategoryLabel}>Category:</strong> {book.category}
                        </div>
                        <div className={styles.bookAuthor}>
                          <strong className={styles.bookAuthorLabel}>Author:</strong> {book.author}
                        </div>
                      </div>
                      <div className={styles.bookStatus}>
                        <strong className={styles.bookQuantity}>
                          Available: {book.status.available} (Total: {book.num})
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className={styles.bookActions}>
                      <Button 
                       type="primary"
                       size="middle"
                       className={`${styles.bookButton} ${book.status.available > 0 ? styles.bookButtonAvailable : styles.bookButtonDisabled}`}
                       onClick={() => book.status.available > 0 && handleOpenLoansModal(book)}
                       disabled={isSubmitting || book.status.available <= 0}
                       onMouseEnter={(e) => {
                         if (book.status.available > 0) {
                           e.currentTarget.style.transform = 'translateY(-2px)';
                           e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.4)';
                         }
                       }}
                       onMouseLeave={(e) => {
                         if (book.status.available > 0) {
                           e.currentTarget.style.transform = 'translateY(0)';
                           e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)';
                         }
                       }}
                      >
                       {book.status.available > 0 ? '📚 Loan' : '📚 No Copies'}
                      </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
          
          {/* Pagination */}
          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              total={totalBooks}
              pageSize={pageSize}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={handlePageChange}
              className={styles.paginationComponent}
            />
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <p>No books available</p>
        </div>
      )}

      {/* Loan Modal Component */}
      <LoanModal
        isVisible={isLoansModalVisible}
        book={selectedBook}
        loanQuantity={loanQuantity}
        isSubmitting={isSubmitting}
        onClose={handleCloseLoansModal}
        onConfirm={handleConfirmLoan}
        onQuantityChange={(value) => setLoanQuantity(value || 1)}
      />
    </div>
  );
}