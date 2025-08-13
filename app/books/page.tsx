"use client";

import React, { useState } from "react";
import { Link, useList } from "@refinedev/core";
import { Card, List, Skeleton, Pagination, Select, Button } from "antd";
import { getCategories } from "../database/categoryDatabase";

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
      <div style={{ 
        minHeight: "100vh", 
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <Skeleton.Input active size="large" style={{ width: "200px", height: "32px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {[...Array(12)].map((_, index) => (
            <Skeleton key={index} active>
              <div style={{ height: "420px", padding: "16px" }}>
                <Skeleton.Input active size="large" style={{ width: "80%", height: "24px", marginBottom: "16px" }} />
                <Skeleton.Image active style={{ width: "140px", height: "180px", margin: "0 auto 16px" }} />
                <div style={{ padding: '0 8px' }}>
                  <Skeleton.Input active size="small" style={{ width: "70%", height: "12px", marginBottom: "4px" }} />
                  <Skeleton.Input active size="small" style={{ width: "65%", height: "12px", marginBottom: "8px" }} />
                  <Skeleton.Input active size="small" style={{ width: "60%", height: "16px", marginBottom: "8px" }} />
                  <Skeleton.Input active size="small" style={{ width: "40%", height: "12px", marginBottom: "4px" }} />
                  <Skeleton.Input active size="small" style={{ width: "50%", height: "12px", marginBottom: "4px" }} />
                  <Skeleton.Input active size="small" style={{ width: "45%", height: "12px", marginBottom: "4px" }} />
                  <Skeleton.Input active size="small" style={{ width: "55%", height: "12px" }} />
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Enhanced Filters and Tools Section */}
      <div style={{ 
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: '#fafafa',
        borderRadius: '16px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#262626',
            letterSpacing: '0.5px'
          }}>
            📚 Book Management Tools
          </h2>
          <p style={{ 
            margin: '0',
            fontSize: '14px',
            color: '#8c8c8c',
            fontStyle: 'italic'
          }}>
            Search, filter, and organize your book collection
          </p>
        </div>

        {/* Main Tools Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Search Section */}
          <div style={{ 
            padding: '20px',
            backgroundColor: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
            borderRadius: '12px',
            border: '2px solid #b7eb8f',
            boxShadow: '0 4px 16px rgba(82, 196, 26, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🔍</span>
              <h3 style={{ 
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#52c41a'
              }}>
                Search Books
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Select
                value={searchType}
                onChange={handleSearchTypeChange}
                options={[
                  { value: "none", label: "🚫 No Search" },
                  { value: "name", label: "📖 Search by Name" },
                  { value: "author", label: "✍️ Search by Author" },
                ]}
                style={{ width: '100%' }}
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d9d9d9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
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
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
            borderRadius: '12px',
            border: '2px solid #ffd591',
            boxShadow: '0 4px 16px rgba(250, 140, 22, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <h3 style={{ 
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#fa8c16'
              }}>
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
              style={{ width: '100%' }}
              placeholder="Select sort order"
              size="large"
            />
          </div>

          {/* Category Filter Section */}
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, #f0f8ff 0%, #d6e4ff 100%)',
            borderRadius: '12px',
            border: '2px solid #91d5ff',
            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🏷️</span>
              <h3 style={{ 
                margin: '0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1890ff'
              }}>
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
              style={{ width: '100%' }}
              placeholder="Select category"
              size="large"
            />
          </div>
        </div>

        {/* Page Size and Total Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#262626',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📈</span>
            Total Books: <span style={{ color: '#1890ff' }}>{totalBooks}</span>
            {selectedCategory !== "all" && (
              <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                in <strong>{selectedCategory}</strong>
              </span>
            )}
            {searchQuery !== "" && searchType !== "none" && (
              <span style={{ color: '#fa8c16', marginLeft: '8px' }}>
                matching "<strong>{searchQuery}</strong>" {
                  searchType === "name" ? "in name" :
                  searchType === "author" ? "in author" :
                  "in name/author"
                }
              </span>
            )}
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
          }}>
            <span style={{ fontSize: '14px', color: '#595959' }}>📄 Items per page:</span>
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
              style={{ width: '120px' }}
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
              <List.Item key={book.id} style={{ padding: '8px' }}>
                <Card 
                  title={
                    <Link to={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#1f1f1f',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1890ff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1f1f1f'}
                      >
                        {book.name}
                      </div>
                    </Link>
                  }
                  style={{ 
                    width: '100%',
                    height: '420px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
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
                  <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '16px',
                    padding: '8px'
                  }}>
                    <Link to={`/books/${book.id}`}>
                      <img 
                        src={book.coverImage} 
                        alt={book.name} 
                        style={{ 
                          width: '140px', 
                          height: '180px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
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
                  
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    padding: '0 8px'
                  }}>
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '13px', 
                      color: '#666',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px'
                    }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong style={{ color: '#1890ff' }}>Category:</strong> {book.category}
                      </div>
                      <div>
                        <strong style={{ color: '#1890ff' }}>Author:</strong> {book.author}
                      </div>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#e6f7ff',
                      borderRadius: '6px',
                      border: '1px solid #91d5ff'
                    }}>
                      <strong style={{ color: '#1890ff', fontSize: '14px' }}>
                        Available: {book.status.available} (Total: {book.num})
                      </strong>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
          
          {/* Pagination */}
          <div style={{ 
            marginTop: '32px', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '16px'
          }}>
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
              style={{ 
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 50px',
          color: '#666',
          fontSize: '16px'
        }}>
          <p>No books available</p>
        </div>
      )}
    </div>
  );
}