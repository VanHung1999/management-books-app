"use client";

import { useOne } from "@refinedev/core";
import { useParams } from "next/navigation";
import { Card, Row, Col, Tag, Divider, Skeleton, Button, Space, Typography, Badge, Avatar, } from "antd";
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, TagOutlined, BarcodeOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import Link from "next/link";
import LoanModal from "../../components/LoanModal";
import { Book } from "../../interface/book";
import { useLoanModal } from "../../hooks/useLoanModal";

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
      <div style={{ 
        padding: '32px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: '#fafafa',
        minHeight: '100vh'
      }}>
        <Skeleton active>
          <div style={{ height: '700px' }} />
        </Skeleton>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div style={{ 
        padding: '48px', 
        textAlign: 'center',
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: '#fafafa',
        minHeight: '100vh'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={2} style={{ color: '#8c8c8c', margin: '16px 0' }}>Book not found</Title>
          <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>The book you're looking for doesn't exist or has been removed.</Text>
        </div>
        <Link href="/books">
          <Button type="primary" size="large" icon={<HomeOutlined />}>
            Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  const book = data.data as Book;

  return (
    <div style={{ 
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Header Section */}
      <div style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0',
        padding: '24px 0',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
          <Link href="/books">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              style={{ 
                fontSize: '16px',
                height: 'auto',
                padding: '12px 20px',
                color: '#1890ff',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              className="hover-effect"
            >
              Back to Books
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px 32px' }}>
        {/* Main Book Information */}
        <Card 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            marginBottom: '32px',
            border: 'none',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '0' } }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 40px 0 40px',
            color: 'white'
          }}>
            <Row gutter={[40, 24]} align="middle">
              {/* Book Cover */}
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <img 
                      src={book.coverImage} 
                      alt={book.name}
                      style={{
                        width: '100%',
                        maxWidth: '280px',
                        height: 'auto',
                        borderRadius: '16px',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      className="book-cover-hover"
                    />
                    <Badge 
                      count={book.num} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                </div>
              </Col>

              {/* Book Details */}
              <Col xs={24} md={16}>
                <div style={{ marginBottom: '32px' }}>
                  <Title level={1} style={{ 
                    margin: '0 0 20px 0',
                    color: 'white',
                    fontSize: '36px',
                    lineHeight: '1.2',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {book.name}
                  </Title>
                  
                  <Space size="large" wrap style={{ marginBottom: '24px' }}>
                    <Tag 
                      color="white" 
                      icon={<UserOutlined />}
                      style={{ 
                        fontSize: '14px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {book.author}
                    </Tag>
                    <Tag 
                      color="white" 
                      icon={<TagOutlined />}
                      style={{ 
                        fontSize: '14px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {book.category}
                    </Tag>
                    <Tag 
                      color="white" 
                      icon={<CalendarOutlined />}
                      style={{ 
                        fontSize: '14px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {book.publishYear}
                    </Tag>
                  </Space>

                  {book.description && (
                    <Paragraph style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.7',
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: '0',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {book.description}
                    </Paragraph>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Book Status Grid */}
          <div style={{ padding: '40px' }}>
            <Title level={3} style={{ 
              margin: '0 0 24px 0',
              color: '#1f1f1f',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Book Status Overview
            </Title>
            <Row gutter={[20, 20]}>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f6ffed',
                    borderColor: '#b7eb8f',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#52c41a',
                    marginBottom: '8px'
                  }}>
                    {book.status.available}
                  </div>
                  <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: '500' }}>Available</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#fff7e6',
                    borderColor: '#ffd591',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(250, 140, 22, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#fa8c16',
                    marginBottom: '8px'
                  }}>
                    {book.status.loaned}
                  </div>
                  <Text style={{ color: '#fa8c16', fontSize: '14px', fontWeight: '500' }}>Loaned</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#fff2f0',
                    borderColor: '#ffccc7',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#ff4d4f',
                    marginBottom: '8px'
                  }}>
                    {book.status.disabled}
                  </div>
                  <Text style={{ color: '#ff4d4f', fontSize: '14px', fontWeight: '500' }}>Disabled</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f0f8ff',
                    borderColor: '#91d5ff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#1890ff',
                    marginBottom: '8px'
                  }}>
                    {book.status.renovated}
                  </div>
                  <Text style={{ color: '#1890ff', fontSize: '14px', fontWeight: '500' }}>Renovated</Text>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Additional Information */}
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f1f1f'
            }}>
              <Avatar 
                icon={<BookOutlined />} 
                style={{ 
                  backgroundColor: '#1890ff',
                  color: 'white'
                }} 
              />
              Book Information
            </div>
          }
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: 'none',
            marginBottom: '32px'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<BarcodeOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>ISBN</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>{book.ISBN || 'N/A'}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<FileTextOutlined />} 
                  style={{ 
                    backgroundColor: '#52c41a',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>Total Copies</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>{book.num}</Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />

          {/* Timestamps */}
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '12px',
                border: '1px solid #d6e4ff',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<ClockCircleOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>Created</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '12px',
                border: '1px solid #d6e4ff',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<ClockCircleOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>Last Updated</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>
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
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <Title level={3} style={{ 
            margin: '0 0 24px 0',
            color: '#1f1f1f',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Manage This Book
          </Title>
          <Space size="large" wrap>
              <Button 
               type="primary" 
               size="large"
               onClick={() => handleOpenLoansModalForDetail(book)}
               style={{ 
                 height: '52px',
                 padding: '0 36px',
                 fontSize: '16px',
                 borderRadius: '12px',
                 fontWeight: '600',
                 background: book.status.available === 0 ? '#d9d9d9' : 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                 border: 'none',
                 boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                 transition: 'all 0.3s ease'
               }}
               className="action-button-hover"
               disabled={book.status.available === 0}
             >
               📚 Loans
             </Button>
            <Link href={`/books/${book.id}/edit`}>
              <Button 
                type="primary" 
                size="large"
                icon={<EditOutlined />}
                style={{ 
                  height: '52px',
                  padding: '0 36px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                className="action-button-hover"
              >
                Edit Book
              </Button>
            </Link>
            <Link href="/books">
              <Button 
                size="large"
                icon={<HomeOutlined />}
                style={{ 
                  height: '52px',
                  padding: '0 36px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '2px solid #d9d9d9',
                  transition: 'all 0.3s ease'
                }}
                className="action-button-hover"
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

      <style jsx>{`
        .book-cover-hover:hover {
          transform: translateY(-8px);
        }
        
        .status-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
        
        .info-item-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border-color: #1890ff;
        }
        
        .action-button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
        
        .hover-effect:hover {
          background-color: rgba(24, 144, 255, 0.1) !important;
          transform: translateX(-4px);
        }
      `}</style>
    </div>
  );
}