"use client";

import { useEffect } from "react";
import { initializeUserDatabase } from "../database/userService";
import { initializeBookDatabase } from "../database/bookService";

export default function DatabaseInitializer() {
  useEffect(() => {
    // Initialize databases immediately when component mounts
    // This ensures database is ready for auth checks
    initializeUserDatabase();
    initializeBookDatabase();
    
    console.log('Database initialized');
  }, []);

  // This component doesn't render anything
  return null;
}
