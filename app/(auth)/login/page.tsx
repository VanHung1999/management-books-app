"use client";

import { Form, Input, Button, Alert, Card} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";
import { useLogin } from "@refinedev/core";

export default function Login() {
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { mutate: login, isPending } = useLogin();
  const onFinish = async (values: any) => {

    login({
      email: values.email,
      password: values.password,
    }, {
      onSuccess: async (data) => {
        setSuccessMessage('✅ Login successful! Redirecting to menu...');
        setErrorMessage('');  
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      },
      onError: (error) => {
        const errorMessage = error?.message || '❌ Login failed. Please check your credentials.';
        setErrorMessage(errorMessage);
        setSuccessMessage('');
      }
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column" }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1890ff',
          margin: '0',
          textShadow: '2px 2px 4px rgba(24, 144, 255, 0.3)'
        }}>Management Books System</h1>
      </div>
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: '20px', maxWidth: '400px', margin: '20px auto 20px' }}
        />
      )}
      
      {successMessage && (
        <Alert
          message="Success"
          description={successMessage}
          type="success"
          showIcon
          style={{ marginBottom: '20px', maxWidth: '400px', margin: '20px auto 20px' }}
        />
      )}

      <Card
        title= {
          <div style={{ textAlign: "center", color: "blue", fontWeight: "bold", fontSize: "24px" }}>Login</div>
        }
        style={{ width: 420, marginTop: 16, textAlign: "center",
                 border: "2px solid rgb(77, 119, 255)",
                 boxShadow: "0 0 10px rgba(77, 119, 255, 0.5)",
         }}
      >
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          style={{
            padding: '20px 0'
          }}
          disabled={isPending}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please input a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{
                color: '#bfbfbf',
                marginRight: '8px'
              }} />}
              placeholder="Enter your email"
              size="large"
              style={{
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{
                color: '#bfbfbf',
                marginRight: '8px'
              }} />}
              placeholder="Enter your password"
              size="large"
              style={{
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                height: '48px',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              block
              loading={isPending}
            >
              {isPending ? 'Loading...' : 'Log in'}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ 
          width: "100%",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0 0 0',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Link style={{
            color: '#1890ff',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }} href="/forgot-password">Forgot password?</Link>
          <Link style={{
            color: '#1890ff',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }} href="/register">Create account</Link>
        </div>
      </Card>

    </div>
  );
}
