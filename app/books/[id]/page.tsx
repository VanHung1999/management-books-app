"use client";

import { useOne } from "@refinedev/core";
import { useParams } from "next/navigation";
import { Card, Row, Col, Tag, Divider, Skeleton, Button, Space, Typography } from "antd";
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, TagOutlined, BarcodeOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

export default function BookDetail() {
  const { id } = useParams();
  const { data, isLoading } = useOne({
    resource: "books",
    id: id as string,
  });

  if (isLoading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton active>
          <div style={{ height: '600px' }} />
        </Skeleton>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center',
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <Title level={2}>Book not found</Title>
        <Link href="/books">
          <Button type="primary">
            Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  const book = data.data;

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/books">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            style={{ 
              fontSize: '16px',
              height: 'auto',
              padding: '8px 16px',
              color: '#1890ff'
            }}
          >
            ← Back to Books
          </Button>
        </Link>
      </div>

      {/* Main Book Information */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row gutter={[32, 24]}>
          {/* Book Cover */}
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={book.coverImage} 
                alt={book.name}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  objectFit: 'cover'
                }}
              />
            </div>
          </Col>

          {/* Book Details */}
          <Col xs={24} md={16}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={1} style={{ 
                margin: '0 0 16px 0',
                color: '#1f1f1f',
                fontSize: '32px',
                lineHeight: '1.3'
              }}>
                {book.name}
              </Title>
              
              <Space size="large" wrap style={{ marginBottom: '20px' }}>
                <Tag 
                  color="blue" 
                  icon={<UserOutlined />}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  {book.author}
                </Tag>
                <Tag 
                  color="green" 
                  icon={<TagOutlined />}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  {book.category}
                </Tag>
                <Tag 
                  color="orange" 
                  icon={<CalendarOutlined />}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  {book.publishYear}
                </Tag>
              </Space>

              {book.description && (
                <Paragraph style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  color: '#595959',
                  marginBottom: '20px'
                }}>
                  {book.description}
                </Paragraph>
              )}
            </div>

            {/* Book Status Grid */}
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f6ffed',
                    borderColor: '#b7eb8f'
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {book.status.available}
                  </div>
                  <Text style={{ color: '#52c41a' }}>Available</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#fff7e6',
                    borderColor: '#ffd591'
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {book.status.loaned}
                  </div>
                  <Text style={{ color: '#fa8c16' }}>Loaned</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#fff2f0',
                    borderColor: '#ffccc7'
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {book.status.disabled}
                  </div>
                  <Text style={{ color: '#ff4d4f' }}>Disabled</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f0f8ff',
                    borderColor: '#91d5ff'
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {book.status.renovated}
                  </div>
                  <Text style={{ color: '#1890ff' }}>Renovated</Text>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Additional Information */}
      <Card 
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            <BookOutlined />
            Book Information
          </div>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}>
              <BarcodeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
              <div>
                <Text strong>ISBN:</Text>
                <br />
                <Text>{book.ISBN || 'N/A'}</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}>
              <FileTextOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
              <div>
                <Text strong>Total Copies:</Text>
                <br />
                <Text>{book.num}</Text>
              </div>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Timestamps */}
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px'
            }}>
              <ClockCircleOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
              <div>
                <Text strong>Created:</Text>
                <br />
                <Text>{new Date(book.createdAt).toLocaleDateString()}</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px'
            }}>
              <ClockCircleOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
              <div>
                <Text strong>Last Updated:</Text>
                <br />
                <Text>{new Date(book.updatedAt).toLocaleDateString()}</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Action Buttons */}
      <div style={{ 
        marginTop: '32px', 
        textAlign: 'center',
        padding: '24px'
      }}>
        <Space size="large">
          <Link href={`/books/${book.id}/edit`}>
            <Button 
              type="primary" 
              size="large"
              style={{ 
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              Edit Book
            </Button>
          </Link>
          <Link href="/books">
            <Button 
              size="large"
              style={{ 
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              Back to List
            </Button>
          </Link>
        </Space>
      </div>
    </div>
  );
}