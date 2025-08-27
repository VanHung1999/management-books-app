import React from 'react';
import { Button, Typography } from 'antd';
import styles from '../styles/components/DonationActionComponents.module.css';

const { Text } = Typography;

// Action button configuration
export interface DonationActionButtonConfig {
  text: string;
  onClick: () => void;
  gradient: string;
  shadowColor: string;
  minWidth?: string;
}

// Status display configuration
export interface DonationStatusDisplayConfig {
  text: string;
  background: string;
  borderColor: string;
  textColor: string;
  description: string;
}

// Helper function to render action button
export const renderDonationActionButton = (config: DonationActionButtonConfig) => (
  <Button
    type="primary"
    size="small"
    onClick={config.onClick}
    className={styles.actionButton}
    style={{
      background: config.gradient,
      boxShadow: `0 2px 8px ${config.shadowColor}`,
      minWidth: config.minWidth || "80px"
    }}
  >
    {config.text}
  </Button>
);

// Helper function to render status display
export const renderDonationStatusDisplay = (config: DonationStatusDisplayConfig) => (
  <div className={styles.statusDisplayContainer}>
    <div 
      className={styles.statusDisplayBadge}
      style={{
        background: config.background,
        borderColor: config.borderColor
      }}
    >
      <Text 
        className={styles.statusDisplayText}
        style={{ color: config.textColor }}
      >
        {config.text}
      </Text>
    </div>
    <Text 
      className={styles.statusDisplayDescription}
      style={{ color: config.textColor }}
    >
      {config.description}
    </Text>
  </div>
);

// Helper function to render action container
export const renderDonationActionContainer = (buttons: React.ReactNode[], description: string, descriptionColor: string) => (
  <div className={styles.actionContainer}>
    <div className={styles.actionButtonsRow}>
      {buttons.map((button, index) => (
        <div key={`action-button-${index}`}>
          {button}
        </div>
      ))}
    </div>
    <Text 
      className={styles.actionDescription}
      style={{ color: descriptionColor }}
    >
      {description}
    </Text>
  </div>
);

// Helper function to render single action button with description
export const renderDonationSingleAction = (button: React.ReactNode, description: string, descriptionColor: string) => (
  <div className={styles.singleActionContainer}>
    {button}
    <Text 
      className={styles.singleActionDescription}
      style={{ color: descriptionColor }}
    >
      {description}
    </Text>
  </div>
);

// Predefined action configurations for donations
export const DONATION_ACTION_CONFIGS = {
  confirm: {
    text: "✅ Confirm",
    gradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
    shadowColor: "rgba(82, 196, 26, 0.3)",
    minWidth: "80px"
  },
  cancel: {
    text: "❌ Cancel",
    gradient: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
    shadowColor: "rgba(255, 77, 79, 0.3)",
    minWidth: "80px"
  },
  send: {
    text: "📦 Send",
    gradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
    shadowColor: "rgba(114, 46, 209, 0.3)",
    minWidth: "100px"
  },
  receive: {
    text: "🎉 Receive",
    gradient: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
    shadowColor: "rgba(250, 140, 22, 0.3)",
    minWidth: "100px"
  }
};

// Predefined status display configurations for donations
export const DONATION_STATUS_CONFIGS = {
  received: {
    text: "🎉 Received",
    background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
    borderColor: "#b7eb8f",
    textColor: "#52c41a",
    description: "Books added to library"
  },
  canceled: {
    text: "❌ Canceled",
    background: "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)",
    borderColor: "#ffbb96",
    textColor: "#ff4d4f",
    description: "Donation request canceled"
  },
  waiting: {
    background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
    borderColor: "#d9d9d9",
    textColor: "#8c8c8c"
  }
};
