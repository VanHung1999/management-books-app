'use client';

import React, { useState, useEffect } from 'react';
import { Switch, message, Tooltip } from 'antd';
import UserProfile from '../components/users/UserProfile';
import ShowAllUsers from '../components/users/ShowAllUsers';
import { User } from '../types/user';
import styles from '../styles/pages/users/Users.module.css';

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
    <div className={styles.usersContainer}>
      {/* View Toggle Switch */}
      <div className={styles.toggleSection}>
        <div className={styles.toggleContainer}>
          <span className={`${styles.toggleLabel} ${!showAllUsers ? styles.toggleLabelActive : styles.toggleLabelInactive}`}>
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
              className={showAllUsers ? styles.userSwitch : styles.userSwitchInactive}
              disabled={currentUser?.role === 'user'}
            />
          </Tooltip>
          <span className={`${styles.toggleLabel} ${showAllUsers ? styles.toggleLabelActive : styles.toggleLabelInactive}`}>
            All Users
          </span>
        </div>
      </div>

      {/* Admin Access Notice */}
      {currentUser?.role !== 'admin' && (
        <div className={styles.adminNotice}>
          <p className={styles.adminNoticeText}>
            <strong>⚠️ Notice:</strong> Only admin can view all users. 
            You can only view and edit your own profile.
          </p>
        </div>
      )}

      {/* Show UserProfile when switch is off (default) */}
      {!showAllUsers ? (
        currentUser ? (
          <UserProfile currentUser={currentUser} />
        ) : (
          <div className={styles.loadingContainer}>
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