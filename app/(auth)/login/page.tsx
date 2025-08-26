"use client";

import { Form, Input, Button, Alert, Card} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";
import { useLogin } from "@refinedev/core";
import styles from "../../styles/pages/auth/Login.module.css";

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Management Books System</h1>
      </div>
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          className={styles.errorAlert}
        />
      )}
      
      {successMessage && (
        <Alert
          message="Success"
          description={successMessage}
          type="success"
          showIcon
          className={styles.successAlert}
        />
      )}

      <Card
        title= {
          <div className={styles.cardTitle}>Login</div>
        }
        className={styles.loginCard}
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
              prefix={<UserOutlined className={styles.userOutlinedIconStyle} />}
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
              prefix={<LockOutlined className={styles.lockOutlinedIconStyle} />}
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
              className={styles.submitButton}
              block
              loading={isPending}
            >
              {isPending ? 'Loading...' : 'Log in'}
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.formFooter}>
          <Link className={styles.forgotLink} href="/forgot-password">Forgot password?</Link>
          <Link className={styles.registerLink} href="/register">Create account</Link>
        </div>
      </Card>

    </div>
  );
}
