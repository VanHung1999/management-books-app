'use client';

import React, { useState } from 'react';
import { Book } from '../interface/book';
import { DonationRecord } from '../interface/donationRecord';
import { Form, Input, Select, Button, Card, Typography, Space, Row, Col } from 'antd';
import { getCategories } from '../database/categoryDatabase';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCreate } from '@refinedev/core';

const { Title } = Typography;
const { TextArea } = Input;

export default function Donations() {
  const [form] = Form.useForm();
  const categories = getCategories();
  const { mutate: createDonationRecord } = useCreate<DonationRecord>();

  const handleSubmit = (values: any) => {
        
    createDonationRecord({
      values: values.donatedBooks
    });
    
    alert(`Successfully submitted ${values.donatedBooks.length} book(s)!`);
    form.resetFields();
  };

  const resetAllForms = () => {
    form.resetFields();
  };

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Donation
        </Title>
        
        <Form 
          form={form} 
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{
            donatedBooks: [{}]
          }}
        >
          <Form.List name="donatedBooks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    style={{ marginBottom: '20px', border: '1px solid #d9d9d9' }}
                    title={`Book ${name + 1}`}
                    extra={
                      fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        >
                          Remove
                        </Button>
                      )
                    }
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'bookTitle']}
                          label="Book Title"
                          rules={[
                            { required: true, message: 'Please enter the book title!' },
                            { min: 2, message: 'The book title must be at least 2 characters!' },
                            { max: 200, message: 'The book title must be less than 200 characters!' }
                          ]}
                        >
                          <Input placeholder="Enter the book title" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'author']}
                          label="Author"
                          rules={[
                            { required: true, message: 'Please enter the author name!' },
                            { min: 2, message: 'The author name must be at least 2 characters!' },
                            { max: 100, message: 'The author name must be less than 100 characters!' }
                          ]}
                        >
                          <Input placeholder="Enter the author name" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'category']}
                          label="Category"
                          rules={[
                            { required: true, message: 'Please select the category!' }
                          ]}
                        >
                          <Select placeholder="Select the category" options={categories.map(category => ({
                            label: category,
                            value: category
                          }))} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'num']}
                          label="Number"
                          rules={[
                            { required: true, message: 'Please enter the number of books!' },
                            { type: 'number', min: 1, message: 'The number of books must be at least 1!' },
                          ]}
                        >
                          <Input 
                            type="number" 
                            placeholder="Enter the number of books"
                            min={1}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'ISBN']}
                          label="ISBN"
                          rules={[
                            { required: true, message: 'Please enter the ISBN!' },
                            { 
                              pattern: /^(?:[0-9]{10}|[0-9]{13})$/, 
                              message: 'ISBN must be 10 or 13 digits!' 
                            }
                          ]}
                        >
                          <Input placeholder="Enter the ISBN" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'publishYear']}
                          label="Publish Year"
                          rules={[
                            { 
                              type: 'number', 
                              min: 1900, 
                              max: new Date().getFullYear() + 1,
                              message: `The publish year must be from 1900 to ${new Date().getFullYear() + 1}!` 
                            }
                          ]}
                        >
                          <Input 
                            type="number" 
                            placeholder="Enter the publish year"
                            min={1900}
                            max={new Date().getFullYear() + 1}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'coverImage']}
                          label="Cover Image"
                          rules={[
                            { 
                              type: 'url', 
                              message: 'The cover image must be a valid URL!' 
                            }
                          ]}
                        >
                          <Input placeholder="Enter the cover image (optional)" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                          label="Notes"
                          rules={[
                            { max: 300, message: 'Notes must be less than 300 characters!' }
                          ]}
                        >
                          <TextArea 
                            rows={2} 
                            placeholder="Enter additional notes (optional)"
                            showCount
                            maxLength={300}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[
                        { max: 500, message: 'The description must be less than 500 characters!' }
                      ]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Enter the description (optional)"
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                  </Card>
                ))}

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    size="large"
                    style={{ width: '200px' }}
                  >
                    Add Another Book
                  </Button>
                </div>
              </>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: 'center', marginTop: '30px' }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  padding: '0 40px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Submit Donation
              </Button>
              <Button 
                onClick={resetAllForms}
                size="large"
                style={{
                  padding: '0 40px',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Reset All
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
