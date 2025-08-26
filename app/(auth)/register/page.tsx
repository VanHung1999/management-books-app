"use client";   
 
import { Button, Card, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import styles from "../../styles/pages/auth/Register.module.css";
import { useRouter } from "next/navigation";
import { useDataProvider, useForm } from "@refinedev/core";
import Link from "next/link";
import { useEffect } from "react";
        
export default function Register() {
  const router = useRouter();
  const [form] = Form.useForm();
  const getDataProvider = useDataProvider();

  const { onFinish, mutation } = useForm({
    action: "create",
    resource: "users",
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      message.success("Registration successful! Redirecting to login...");
      router.push("/login");
    }
    if (mutation.isError) {
      message.error('Registration error: ' + (mutation.error?.message || 'Unknown error'));
    }
  }, [mutation.isSuccess, mutation.isError, mutation.error, router]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Management Books System</h1>
      </div>
      <Card
        title={
          <div className={styles.cardTitle}>Register</div>
        }
        className={styles.registerCard}
      >
      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        disabled={mutation.isPending}
        className={styles.registerForm}
      >
        <Form.Item
          label="Email"
          name="email"
          hasFeedback
          validateTrigger="onBlur"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
            {
              validator: async (_rule, value) => {
                if (!value) return Promise.resolve();
                try {
                  const dp = getDataProvider();
                  const { data } = await dp.getOne({
                    resource: "users",
                    id: value,
                  });
                  if (data) {
                    return Promise.reject("Email has already been used");
                  }
                  return Promise.resolve();
                } catch {
                  return Promise.resolve();
                }
              },
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            className={styles.input}
            size="large"
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 7, message: "Password must be longer than 6 characters" },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
              message:
                "Password must contain both letters and numbers (letters/numbers only)",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            className={styles.input}
            size="large"
            placeholder="Enter your password"
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("The two passwords do not match");
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            className={styles.input}
            size="large"
            placeholder="Confirm your password"
          />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Please enter your name" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            className={styles.input}
            size="large"
            placeholder="Enter your name"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.registerButton}
            size="large"
            block
            loading={mutation.isPending}
          >
            {mutation.isPending ? "Registering..." : "Register"}
          </Button>
        </Form.Item>
        </Form>
        <div className={styles.actionsContainer}>
          <Link className={styles.link} href="/login">Back to Login</Link>
          <Link className={styles.link} href="/forgot-password">Forgot password</Link>
        </div>
      </Card>
    </div>

  );
}