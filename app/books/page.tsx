"use client";

import React from "react";
import { useList } from "@refinedev/core";
import { Card, List, Skeleton } from "antd";

export default function Books() {
  const { data, isLoading } = useList({
    resource: "books",
    pagination: { current: 1, pageSize: 12 },
    sorters: [{ field: "name", order: "asc" }],
    filters: [{ field: "name", operator: "eq", value: "The Great Gatsby" }],
  });
  
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
                     {[...Array(200)].map((_, index) => (
             <Skeleton key={index} active>
               <div style={{ height: "420px", padding: "16px" }}>
                 <Skeleton.Input active size="large" style={{ width: "80%", height: "24px", marginBottom: "16px" }} />
                 <Skeleton.Image active style={{ width: "140px", height: "180px", margin: "0 auto 16px" }} />
                  <div style={{ 
                    padding: '0 8px'
                  }}>
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
      {data?.data && data.data.length > 0 ? (
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
          dataSource={data.data}
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
                      Available: {book.status.available}(Total: {book.num})
                    </strong>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
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