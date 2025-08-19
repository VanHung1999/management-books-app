import React from 'react';
import { Button, Typography } from 'antd';

const { Text } = Typography;

// Action button configuration
export interface ActionButtonConfig {
  text: string;
  onClick: () => void;
  gradient: string;
  shadowColor: string;
  minWidth?: string;
}

// Status display configuration
export interface StatusDisplayConfig {
  text: string;
  background: string;
  borderColor: string;
  textColor: string;
  description: string;
}

// Helper function to render action button
export const renderActionButton = (config: ActionButtonConfig) => (
  <Button
    type="primary"
    size="small"
    onClick={config.onClick}
    style={{
      background: config.gradient,
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      boxShadow: `0 2px 8px ${config.shadowColor}`,
      minWidth: config.minWidth || "80px",
      height: "32px"
    }}
  >
    {config.text}
  </Button>
);

// Helper function to render status display
export const renderStatusDisplay = (config: StatusDisplayConfig) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    gap: '4px'
  }}>
    <div style={{
      padding: '8px 16px',
      background: config.background,
      borderRadius: '8px',
      border: `2px solid ${config.borderColor}`
    }}>
      <Text style={{ 
        color: config.textColor, 
        fontStyle: "italic",
        fontSize: '13px',
        fontWeight: '600'
      }}>
        {config.text}
      </Text>
    </div>
    <Text style={{ 
      color: config.textColor, 
      fontSize: '11px',
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: '1.2'
    }}>
      {config.description}
    </Text>
  </div>
);

// Helper function to render action container
export const renderActionContainer = (buttons: React.ReactNode[], description: string, descriptionColor: string) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    gap: '8px'
  }}>
    <div style={{
      display: 'flex',
      gap: '8px',
      justifyContent: 'center'
    }}>
      {buttons}
    </div>
    <Text style={{ 
      color: descriptionColor, 
      fontSize: '11px',
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: '1.2'
    }}>
      {description}
    </Text>
  </div>
);

// Helper function to render single action button with description
export const renderSingleAction = (button: React.ReactNode, description: string, descriptionColor: string) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    gap: '4px'
  }}>
    {button}
    <Text style={{ 
      color: descriptionColor, 
      fontSize: '11px',
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: '1.2'
    }}>
      {description}
    </Text>
  </div>
);

// Predefined action configurations
export const ACTION_CONFIGS = {
  delivered: {
    text: "✨ Delivered",
    gradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
    shadowColor: "rgba(82, 196, 26, 0.3)",
    minWidth: "80px"
  },
  canceled: {
    text: "❌ Canceled",
    gradient: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
    shadowColor: "rgba(255, 77, 79, 0.3)",
    minWidth: "80px"
  },
  received: {
    text: "📦 Received",
    gradient: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
    shadowColor: "rgba(24, 144, 255, 0.3)",
    minWidth: "100px"
  },
  returned: {
    text: "🔄 Returned",
    gradient: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
    shadowColor: "rgba(250, 140, 22, 0.3)",
    minWidth: "100px"
  },
  completed: {
    text: "✅ Complete",
    gradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
    shadowColor: "rgba(114, 46, 209, 0.3)",
    minWidth: "100px"
  }
};

// Predefined status display configurations
export const STATUS_CONFIGS = {
  completed: {
    text: "🎉 Completed",
    background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
    borderColor: "#b7eb8f",
    textColor: "#52c41a",
    description: "The loan record book has complete"
  },
  canceled: {
    text: "❌ Canceled",
    background: "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)",
    borderColor: "#ffbb96",
    textColor: "#ff4d4f",
    description: "The loan request has been canceled"
  },
  waiting: {
    background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
    borderColor: "#d9d9d9",
    textColor: "#8c8c8c"
  }
};
