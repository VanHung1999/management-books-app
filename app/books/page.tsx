"use client";

import React, { useState } from "react";
import { useList } from "@refinedev/core";
import { Card, List, Skeleton, Pagination, Select, Space } from "antd";
import { categories } from "../dataInitial/category-book"; 

export default function Books() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data, isLoading } = useList({
    resource: "books",
  });

  // Filter books by category
  const filteredBooks = data?.data?.filter(book => 
    selectedCategory === "all" || book.category === selectedCategory
  ) || [];

  // Calculate pagination data
  const totalBooks = filteredBooks.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);
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
      {/* Filters and Page Size Selector */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Category Filter */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          border: '1px solid #d6e4ff'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1890ff' }}>
            Filter by Category
          </div>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map(cat => ({ 
                value: cat, 
                label: cat 
              }))
            ]}
            style={{ width: '200px' }}
            placeholder="Select category"
          />
        </div>

        {/* Page Size and Total */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            Total Books: {totalBooks} {selectedCategory !== "all" && `in ${selectedCategory}`}
          </div>
          <Space>
            <span>Items per page:</span>
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
            />
          </Space>
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
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1f1f1f',
                      textAlign: 'center',
                      lineHeight: '1.4'
                    }}>
                      {book.name}
                    </div>
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
                    <img 
                      src={book.coverImage} 
                      alt={book.name} 
                      style={{ 
                        width: '140px', 
                        height: '180px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
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