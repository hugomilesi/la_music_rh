// Utility para debug de re-renders e performance
import React from 'react';

let renderCount = 0;
let lastRenderTime = Date.now();

export const debugRender = (componentName: string, props?: any) => {
  renderCount++;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTime;
  
  // Render logging disabled
  
  lastRenderTime = currentTime;
};

export const debugPermissions = (componentName: string, permissions: any, loading: boolean) => {
  // Permissions logging disabled
};

export const debugNavigation = (from: string, to: string, reason?: string) => {
  // Navigation logging disabled
};

export const debugAuth = (event: string, data?: any) => {
  // Auth logging disabled
};

export const debugCache = (operation: string, key: string, data?: any) => {
  // Cache logging disabled
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
};

// Component render tracker (simple counter without hooks)
let componentRenderCounts = new Map<string, number>();

export const trackRender = (componentName: string) => {
  const currentCount = componentRenderCounts.get(componentName) || 0;
  const newCount = currentCount + 1;
  componentRenderCounts.set(componentName, newCount);
};

// Memory usage tracker
export const logMemoryUsage = () => {
  // Memory logging disabled
};

// Clear console with timestamp
export const clearConsoleWithTimestamp = () => {
  console.clear();
  // Console clear logging disabled
};

export default {
  debugRender,
  debugPermissions,
  debugNavigation,
  debugAuth,
  debugCache,
  measurePerformance,
  trackRender,
  logMemoryUsage,
  clearConsoleWithTimestamp
};