"use client";

import { useOne, useUpdate } from "@refinedev/core";
import { useParams } from "next/navigation";
import { Input, Button, Card, Form, Typography, Space, InputNumber, Row, Col, App } from "antd";
import { ArrowLeftOutlined, SaveOutlined, BookOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useEffect, useState } from "react";
import { Book } from "@/app/interface/book";

const { Title, Text } = Typography;
const { TextArea } = Input;



export default function EditBook() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [stateBookData, setStateBookData] = useState<Book>();
  const { notification } = App.useApp();
  
  const { mutate: updateBook, isPending: isUpdating } = useUpdate();
  const { data: bookData, isLoading: isBookLoading, refetch } = useOne({
    resource: "books",
    id: id as string,
  });

  useEffect(() => {
    if (bookData?.data) {
      setStateBookData(bookData.data as Book);
      setCurrentTotal(bookData.data.num);
      form.setFieldsValue({ description: bookData.data.description || '' });
    }
  }, [bookData, form]);

  const updateCurrentTotal = (available: number, loaned: number, disabled: number, renovated: number) => {
    setCurrentTotal(available + loaned + disabled + renovated);
  };

  const onFinish = (values: { description: string }) => {
    updateBook({
      resource: "books",
      id: id as string,
      values: { description: values.description },
      successNotification: { message: "Update successful", description: "Book description has been updated", type: "success" },
      errorNotification: { message: "Update failed", description: "Could not update book description", type: "error" },
    }, {
      onSuccess: () => {
        notification.success({ message: "Success", description: "Book description updated successfully!" });
        // Refetch data to get the latest information from database
        refetch();
      },
    });
  };

  const onStatusFinish = (values: { available: number; loaned: number; disabled: number; renovated: number }) => {
    // Validation: Check if total remains the same (num should not change)
    if (!stateBookData || currentTotal !== stateBookData.num) {
      notification.error({ 
        message: "Validation Error", 
        description: `Total must equal ${stateBookData?.num} (current total: ${currentTotal})` 
      });
      return;
    }

    // Validation: Check if loaned count doesn't increase (optional - you can remove this if you want to allow loaned to increase)
    // if (values.loaned > book.status.loaned) {
    //   notification.error({ 
    //     message: "Validation Error", 
    //     description: `Loaned count cannot increase. Current: ${book.status.loaned}, New: ${values.loaned}` 
    //   });
    //   return;
    // }

    // Update book status
    updateBook({
      resource: "books",
      id: id as string,
      values: {
        status: {
          available: values.available,
          loaned: values.loaned,
          disabled: values.disabled,
          renovated: values.renovated
        }
      },
      successNotification: { message: "Status update successful", description: "Book status has been updated", type: "success" },
      errorNotification: { message: "Status update failed", description: "Could not update book status", type: "error" },
    }, {
      onSuccess: () => {
        notification.success({ message: "Success", description: "Book status updated successfully!" });
        setIsEditingStatus(false);
        // Refetch data to get the latest information from database
        refetch();
      },
    });
  };

  if (isBookLoading) {
    return (
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fafafa', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
          <Title level={3} style={{ color: '#8c8c8c', margin: '16px 0' }}>Loading...</Title>
        </div>
      </div>
    );
  }

  if (!bookData?.data) {
    return (
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fafafa', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
          <Title level={3} style={{ color: '#8c8c8c', margin: '16px 0' }}>Book not found</Title>
          <Link href="/books"><Button type="primary">Back to books</Button></Link>
        </div>
      </div>
    );
  }
  
  const renderStatusCard = (type: 'available' | 'loaned' | 'disabled' | 'renovated', value: number, label: string) => {
    const statusColors = {
      available: { bg: '#f6ffed', border: '#b7eb8f', color: '#52c41a' },
      loaned: { bg: '#fff7e6', border: '#ffd591', color: '#fa8c16' },
      disabled: { bg: '#fff2f0', border: '#ffccc7', color: '#ff4d4f' },
      renovated: { bg: '#f0f8ff', border: '#91d5ff', color: '#1890ff' }
    };
    
    return (
      <Col xs={12} sm={6}>
        <div style={{ 
          textAlign: 'center', 
          padding: '16px', 
          borderRadius: '8px',
          backgroundColor: statusColors[type].bg,
          border: `1px solid ${statusColors[type].border}` 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: statusColors[type].color }}>{value}</div>
          <Text style={{ color: statusColors[type].color }}>{label}</Text>
        </div>
      </Col>
    );
  };

  const renderInputField = (name: string, label: string, max: number, onChange: (value: number | null) => void) => (
    <Col xs={12} sm={6}>
      <Form.Item label={label} name={name} rules={[{ required: true, message: 'Required!' }, { type: 'number', min: 0, message: 'Must be >= 0!' }]}>
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          max={max}
          placeholder={label}
          onChange={onChange}
        />
      </Form.Item>
    </Col>
  );

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '0' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', padding: '24px 0', marginBottom: '32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px' }}>
          <Link href={`/books/${id}`}>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: '16px', height: 'auto', padding: '12px 20px', color: '#1890ff', borderRadius: '8px', transition: 'all 0.3s ease' }}>
              Back to book detail
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px 32px 32px' }}>
        {/* Book Info Card */}
        <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: '0 0 8px 0', color: '#1f1f1f' }}>{stateBookData?.name}</Title>
              <Text style={{ color: '#8c8c8c' }}>Author: {stateBookData?.author} • Category: {stateBookData?.category}</Text>
            </div>
          </div>
        </Card>

        {/* Status Management Card */}
        <Card 
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: '600', color: '#1f1f1f' }}>
            <BookOutlined style={{ color: '#1890ff' }} />Book Status Management
          </div>}
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px', border: 'none' }}
        >
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>
              Total Copies (num): {stateBookData?.num} • Current Total: {currentTotal}
            </Text>
            {currentTotal !== stateBookData?.num && (
              <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <Text style={{ color: '#ff4d4f', fontSize: '14px' }}>
                  Warning: Current total ({currentTotal}) doesn't match total copies ({stateBookData?.num})
                </Text>
              </div>
            )}
          </div>

          {!isEditingStatus ? (
            <div>
              <Row gutter={[16, 16]}>
                {renderStatusCard('available', stateBookData?.status?.available || 0, 'Available')}
                {renderStatusCard('loaned', stateBookData?.status?.loaned || 0, 'Loaned')}
                {renderStatusCard('disabled', stateBookData?.status?.disabled || 0, 'Disabled')}
                {renderStatusCard('renovated', stateBookData?.status?.renovated || 0, 'Renovated')}
              </Row>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button type="primary" onClick={() => setIsEditingStatus(true)} style={{ borderRadius: '8px' }}>
                  Edit Status
                </Button>
              </div>
            </div>
          ) : (
            <Form
              form={statusForm}
              layout="vertical"
              onFinish={onStatusFinish}
              initialValues={{
                available: stateBookData?.status?.available || 0,
                loaned: stateBookData?.status?.loaned || 0,
                disabled: stateBookData?.status?.disabled || 0,
                renovated: stateBookData?.status?.renovated || 0,
              }}
            >
              <Row gutter={[16, 16]}>
                {renderInputField('available', 'Available', stateBookData?.num || 0, (value) => {
                  const currentValues = statusForm.getFieldsValue();
                  updateCurrentTotal(value || 0, currentValues.loaned || 0, currentValues.disabled || 0, currentValues.renovated || 0);
                })}
                 <Col xs={12} sm={6}>
                   <Form.Item label="Loaned" name="loaned">
                     <InputNumber
                       style={{ width: '100%' }}
                       value={stateBookData?.status?.loaned || 0}
                       disabled={true}
                       placeholder="Loaned (read-only)"
                     />
                   </Form.Item>
                 </Col>
                {renderInputField('disabled', 'Disabled', stateBookData?.num || 0, (value) => {
                  const currentValues = statusForm.getFieldsValue();
                  updateCurrentTotal(currentValues.available || 0, currentValues.loaned || 0, value || 0, currentValues.renovated || 0);
                })}
                {renderInputField('renovated', 'Renovated', stateBookData?.num || 0, (value) => {
                  const currentValues = statusForm.getFieldsValue();
                  updateCurrentTotal(currentValues.available || 0, currentValues.loaned || 0, currentValues.disabled || 0, value || 0);
                })}
              </Row>

                <div style={{ padding: '16px', backgroundColor: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f', marginBottom: '20px' }}>
                 <Text style={{ color: '#52c41a', fontSize: '14px' }}>
                   <strong>Validation Rules:</strong><br/>
                   • Total must equal {stateBookData?.num} copies (Current: {currentTotal})<br/>
                   • All values must be &gt;= 0<br/>
                   • <strong>Note: Total copies (num) will remain unchanged</strong><br/>
                   • <strong>Note: Loaned count cannot be modified (read-only)</strong>
                 </Text>
               </div>

              <Form.Item style={{ marginBottom: '0', textAlign: 'center' }}>
                <Space size="middle">
                  <Button onClick={() => {
                    setIsEditingStatus(false);
                    statusForm.resetFields();
                    if (stateBookData) {
                      const total = stateBookData.status.available + stateBookData.status.loaned + stateBookData.status.disabled + stateBookData.status.renovated;
                      setCurrentTotal(total);
                    }
                  }}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={isUpdating} style={{ borderRadius: '8px' }}>
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Card>

        {/* Edit Form Card */}
        <Card 
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: '600', color: '#1f1f1f' }}>
            <BookOutlined style={{ color: '#1890ff' }} />Edit book description
          </div>}
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px', border: 'none' }}
        >
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ description: stateBookData?.description || '' }}>
            <Form.Item
              label="Book description"
              name="description"
              rules={[
                { required: true, message: 'Please enter book description!' },
                { min: 10, message: 'Book description must be at least 10 characters!' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Enter book description..."
                style={{ fontSize: '16px', borderRadius: '8px', resize: 'vertical' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '0', textAlign: 'right' }}>
              <Space size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={isUpdating}
                  style={{ height: '44px', padding: '0 24px', fontSize: '16px', borderRadius: '8px', fontWeight: '600' }}
                >
                  {isUpdating ? 'Updating...' : 'Update description'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Current Description Preview */}
        {stateBookData?.description && (
          <Card title="Current description" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px', border: 'none', marginTop: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#1f1f1f', whiteSpace: 'pre-wrap' }}>
                {stateBookData?.description}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
