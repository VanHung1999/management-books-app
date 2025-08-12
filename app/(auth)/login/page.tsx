"use client";

import { Form, Input, Button, Alert, Card} from "antd";
import styles from "./login.module.css";
import { ConsoleSqlOutlined, EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from "@ant-design/icons";
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
      <div className={styles.header}>
        <h1 className={styles.title}>Management Books System</h1>
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
          className={styles.loginForm}
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
              prefix={<UserOutlined className={styles.inputIcon} />}
              placeholder="Enter your email"
              size="large"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className={styles.inputIcon} />}
              placeholder="Enter your password"
              size="large"
              className={styles.input}
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
              className={styles.loginButton}
              block
              loading={isPending}
            >
              {isPending ? 'Loading...' : 'Log in'}
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.actionsContainer} style={{ width: "100%" }}>
          <Link className={styles.link} href="/forgot-password">Forgot password?</Link>
          <Link className={styles.link} href="/register">Create account</Link>
        </div>
      </Card>

    </div>
  );
}
