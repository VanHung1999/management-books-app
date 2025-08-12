"use client";

import { Alert, Button, Card, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useDataProvider, useUpdate} from "@refinedev/core";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css";
import { User } from "@/app/interface/user";

export default function ForgotPassword() {
    const [form] = Form.useForm();
    const [oTpform] = Form.useForm();
    const [generatedOtp, setGeneratedOtp] = useState<string>("");
    const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
    const [status, setStatus] = useState<"enterEmail" | "verifyOtp" | "done">("enterEmail");
    const [email, setEmail] = useState<string>("");
    const [user, setUser] = useState<User | null>(null);
    const getDataProvider = useDataProvider();
    const router = useRouter();
    const { mutate: updateUser } = useUpdate(
      { resource: "users" ,
        mutationOptions: {
          onSuccess: (data: any) => {
            setStatus("done");
            setAlert({ type: "success", text: "Password has been reset to 12345678." });
          },
          onError: (error: any) => {
            setAlert({ type: "error", text: "Cannot reset password. Please try again." });
          }
        }
      }   
    );

    const onSubmitEmail = async (values: any) => {
        try {
            const dp = getDataProvider();
            const userResult = await dp.getOne({ resource: "users", id: values.email });
            setUser(userResult.data as User);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);
            setEmail(values.email);
            setStatus("verifyOtp");
            setAlert({ type: "info", text: `OTP (demo): ${code}` });
        } catch (error) {
            setAlert({ type: "error", text: "Email has not been registered" });
        }
    }
    
    const onSubmitOtp = async (values: any) => {
        if(values.otp !== generatedOtp){
            setAlert({ type: "error", text: "OTP is incorrect. Please try again." });
            return;
        }
        updateUser({id: user?.id, values: { password: "12345678" } });  
    }
    
    useEffect(() => {
        if (status === "done") {
            const timeoutId = setTimeout(() => {
                router.push("/login");
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [status, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", 
                  justifyContent: "center", padding: 24, flexDirection: "column",
                  borderRadius: "10px",

                  margin: "20px",
    }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Management Books System</h1>
      </div>
      <Card
        title={
          status === "enterEmail"
            ? <div style={{ textAlign: "center", color: "blue", fontWeight: "bold", fontSize: "24px" }}>Forgot Password</div>
            : status === "verifyOtp"
            ? <div style={{ textAlign: "center", color: "red", fontWeight: "bold", fontSize: "24px" }}>Verify OTP</div>
            : <div style={{ textAlign: "center", color: "green", fontWeight: "bold", fontSize: "24px" }}>Success</div>
        }
        style={{ width: 420, marginTop: 16, textAlign: "center",
          border: "2px solid rgb(77, 119, 255)",
          boxShadow: "0 0 10px rgba(77, 119, 255, 0.5)",
        }}
      >
        {alert && (
          <Alert showIcon type={alert.type} message={alert.text} style={{ marginBottom: 16 }} />
        )}

        {status === "enterEmail" && (
          <Form form={form} onFinish={onSubmitEmail} layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Send OTP
              </Button>
            </Form.Item>
          </Form>
        )}

        {status === "verifyOtp" && (
          <Form form={oTpform} layout="vertical" onFinish={onSubmitOtp} autoComplete="off">
            <Form.Item label="Email" hidden>
              <Input value={email} disabled />
            </Form.Item>
            <Form.Item name="otp" label="OTP" rules={[{ required: true, message: "Please enter your OTP" }]}>
              <Input placeholder="Enter your OTP" maxLength={6} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Verify & Reset Password
              </Button>
            </Form.Item>
          </Form>
        )}

        {status === "done" && (
          <div>
            <h3 style={{ marginBottom: 8 }}>Password reset successful</h3>
            <p>Your password has been reset to 12345678. Please log in with the new password.</p>
            <p>Redirecting to login page...</p>
          </div>
        )}

        <div className={styles.actionsContainer} style={{ width: "100%" }}>
          <Link className={styles.link} href="/login">Back to login</Link>
          <Link className={styles.link} href="/register">Create account</Link>
        </div>
      </Card>

    </div>  
  );
}