'use client';

import React, { useState, useEffect } from 'react';
import { Switch, message, Tooltip } from 'antd';
import UserProfile from '../components/UserProfile';
import ShowAllUsers from '../components/ShowAllUsers';
import { User } from '../interface/user';

export default function Users() {
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user email from localStorage safely on client side
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(user);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      setCurrentUser(null);
    }
  }, []);

  // Handle switch change with admin check
  const handleSwitchChange = (checked: boolean) => {
    if (currentUser?.role !== 'admin') {
      message.warning('Only admin can view all users!');
      return;
    }
    setShowAllUsers(checked);
  };

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* View Toggle Switch */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          background: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: showAllUsers ? '#8c8c8c' : '#1890ff' 
          }}>
            My Profile
          </span>
          <Tooltip 
            title={currentUser?.role !== 'admin' ? 'Only admin can view all users' : ''}
            placement="top"
          >
            <Switch
              checked={showAllUsers}
              onChange={handleSwitchChange}
              checkedChildren="All Users"
              unCheckedChildren="Profile"
              style={{
                background: showAllUsers ? '#1890ff' : '#d9d9d9'
              }}
              disabled={currentUser?.role === 'user'}
            />
          </Tooltip>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: showAllUsers ? '#1890ff' : '#8c8c8c' 
          }}>
            All Users
          </span>
        </div>
      </div>

      {/* Admin Access Notice */}
      {currentUser?.role !== 'admin' && (
        <div style={{
          background: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#d46b08'
        }}>
          <strong>⚠️ Notice:</strong> Only admin can view all users. 
          You can only view and edit your own profile.
        </div>
      )}

      {/* Show UserProfile when switch is off (default) */}
      {!showAllUsers ? (
        currentUser ? (
          <UserProfile currentUser={currentUser} />
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#8c8c8c'
          }}>
            Loading user profile...
          </div>
        )
      ) : (
        /* Show All Users when switch is on */
        <ShowAllUsers />
      )}
    </div>

  );
}