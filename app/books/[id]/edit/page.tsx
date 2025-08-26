"use client";

import { useOne, useUpdate } from "@refinedev/core";
import { useParams } from "next/navigation";
import { Input, Button, Card, Form, Typography, Space, InputNumber, Row, Col, App } from "antd";
import { ArrowLeftOutlined, SaveOutlined, BookOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useEffect, useState } from "react";
import { Book } from "@/app/interface/book";
import styles from "../../../styles/pages/books/detail/edit/EditBook.module.css";

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <BookOutlined className={styles.loadingIcon} />
          <Title level={3} className={styles.loadingTitle}>Loading...</Title>
        </div>
      </div>
    );
  }

  if (!bookData?.data) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <BookOutlined className={styles.errorIcon} />
          <Title level={3} className={styles.errorTitle}>Book not found</Title>
          <Link href="/books"><Button type="primary" className={styles.errorButton}>Back to books</Button></Link>
        </div>
      </div>
    );
  }
  
  const renderStatusCard = (type: 'available' | 'loaned' | 'disabled' | 'renovated', value: number, label: string) => {
    const statusClassMap = {
      available: styles.statusCardAvailable,
      loaned: styles.statusCardLoaned,
      disabled: styles.statusCardDisabled,
      renovated: styles.statusCardRenovated
    };
    
    const numberClassMap = {
      available: styles.statusNumberAvailable,
      loaned: styles.statusNumberLoaned,
      disabled: styles.statusNumberDisabled,
      renovated: styles.statusNumberRenovated
    };
    
    const labelClassMap = {
      available: styles.statusLabelAvailable,
      loaned: styles.statusLabelLoaned,
      disabled: styles.statusLabelDisabled,
      renovated: styles.statusLabelRenovated
    };
    
    return (
      <Col xs={12} sm={6}>
        <div className={`${styles.statusCard} ${statusClassMap[type]}`}>
          <div className={`${styles.statusNumber} ${numberClassMap[type]}`}>{value}</div>
          <Text className={`${styles.statusLabel} ${labelClassMap[type]}`}>{label}</Text>
        </div>
      </Col>
    );
  };

  const renderInputField = (name: string, label: string, max: number, onChange: (value: number | null) => void) => (
    <Col xs={12} sm={6}>
      <Form.Item label={label} name={name} rules={[{ required: true, message: 'Required!' }, { type: 'number', min: 0, message: 'Must be >= 0!' }]}>
        <InputNumber
          className={styles.inputField}
          min={0}
          max={max}
          placeholder={label}
          onChange={onChange}
        />
      </Form.Item>
    </Col>
  );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <Link href={`/books/${id}`}>
            <Button type="text" icon={<ArrowLeftOutlined />} className={styles.backButton}>
              Back to book detail
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Book Info Card */}
        <Card className={styles.bookInfoCard}>
          <div className={styles.bookInfoHeader}>
            <BookOutlined className={styles.bookInfoIcon} />
            <div>
              <Title level={3} className={styles.bookInfoTitle}>{stateBookData?.name}</Title>
              <Text className={styles.bookInfoSubtitle}>Author: {stateBookData?.author} • Category: {stateBookData?.category}</Text>
            </div>
          </div>
        </Card>

        {/* Status Management Card */}
        <Card 
          title={<div className={styles.cardTitle}>
            <BookOutlined className={styles.cardTitleIcon} />Book Status Management
          </div>}
          className={styles.statusManagementCard}
        >
          <div className={styles.statusInfo}>
            <Text strong className={styles.statusInfoText}>
              Total Copies (num): {stateBookData?.num} • Current Total: {currentTotal}
            </Text>
            {currentTotal !== stateBookData?.num && (
              <div className={styles.statusWarning}>
                <ExclamationCircleOutlined className={styles.statusWarningIcon} />
                <Text className={styles.statusWarningText}>
                  Warning: Current total ({currentTotal}) doesn't match total copies ({stateBookData?.num})
                </Text>
              </div>
            )}
          </div>

          {!isEditingStatus ? (
            <div>
              <Row gutter={[16, 16]} className={styles.statusCardsContainer}>
                {renderStatusCard('available', stateBookData?.status?.available || 0, 'Available')}
                {renderStatusCard('loaned', stateBookData?.status?.loaned || 0, 'Loaned')}
                {renderStatusCard('disabled', stateBookData?.status?.disabled || 0, 'Disabled')}
                {renderStatusCard('renovated', stateBookData?.status?.renovated || 0, 'Renovated')}
              </Row>
              <div className={styles.editStatusButtonContainer}>
                <Button type="primary" onClick={() => setIsEditingStatus(true)} className={styles.editStatusButton}>
                  Edit Status
                </Button>
              </div>
            </div>
          ) : (
            <Form
              form={statusForm}
              layout="vertical"
              onFinish={onStatusFinish}
              className={styles.statusForm}
              initialValues={{
                available: stateBookData?.status?.available || 0,
                loaned: stateBookData?.status?.loaned || 0,
                disabled: stateBookData?.status?.disabled || 0,
                renovated: stateBookData?.status?.renovated || 0,
              }}
            >
              <Row gutter={[16, 16]} className={styles.formRow}>
                {renderInputField('available', 'Available', stateBookData?.num || 0, (value) => {
                  const currentValues = statusForm.getFieldsValue();
                  updateCurrentTotal(value || 0, currentValues.loaned || 0, currentValues.disabled || 0, currentValues.renovated || 0);
                })}
                 <Col xs={12} sm={6}>
                   <Form.Item label="Loaned" name="loaned">
                     <InputNumber
                       className={styles.inputField}
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

                <div className={styles.validationInfo}>
                 <Text className={styles.validationText}>
                   <strong>Validation Rules:</strong><br/>
                   • Total must equal {stateBookData?.num} copies (Current: {currentTotal})<br/>
                   • All values must be &gt;= 0<br/>
                   • <strong>Note: Total copies (num) will remain unchanged</strong><br/>
                   • <strong>Note: Loaned count cannot be modified (read-only)</strong>
                 </Text>
               </div>

              <Form.Item className={styles.formActions}>
                <Space size="middle" className={styles.formActionsSpace}>
                  <Button onClick={() => {
                    setIsEditingStatus(false);
                    statusForm.resetFields();
                    if (stateBookData) {
                      const total = stateBookData.status.available + stateBookData.status.loaned + stateBookData.status.disabled + stateBookData.status.renovated;
                      setCurrentTotal(total);
                    }
                  }} className={styles.cancelButton}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={isUpdating} className={styles.updateStatusButton}>
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Card>

        {/* Edit Form Card */}
        <Card 
          title={<div className={styles.cardTitle}>
            <BookOutlined className={styles.cardTitleIcon} />Edit book description
          </div>}
          className={styles.editFormCard}
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
                className={styles.descriptionTextArea}
              />
            </Form.Item>

            <Form.Item className={styles.updateDescriptionButtonContainer}>
              <Space size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={isUpdating}
                  className={styles.updateDescriptionButton}
                >
                  {isUpdating ? 'Updating...' : 'Update description'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Current Description Preview */}
        {stateBookData?.description && (
          <Card title="Current description" className={styles.currentDescriptionCard}>
            <div className={styles.currentDescriptionContent}>
              <Text className={styles.currentDescriptionText}>
                {stateBookData?.description}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
