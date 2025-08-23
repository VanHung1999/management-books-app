'use client';

import React, { useState } from 'react';
import { Switch } from 'antd';
import UserProfile from '../components/UserProfile';
import ShowAllUsers from '../components/ShowAllUsers';

export default function Users() {
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Get current user email from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserEmail = currentUser.email;

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
          <Switch
            checked={showAllUsers}
            onChange={setShowAllUsers}
            checkedChildren="All Users"
            unCheckedChildren="Profile"
            style={{
              background: showAllUsers ? '#1890ff' : '#d9d9d9'
            }}
          />
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: showAllUsers ? '#1890ff' : '#8c8c8c' 
          }}>
            All Users
          </span>
        </div>
      </div>

      {/* Show UserProfile when switch is off (default) */}
      {!showAllUsers ? (
        <UserProfile currentUserEmail={currentUserEmail} />
      ) : (
        /* Show All Users when switch is on */
        <ShowAllUsers />
      )}
    </div>

  );
}