/**
 * useAnalytics — V8.0
 * Fires analytics.page() on every route change using react-router-dom's location.
 * Also initialises PerformanceMonitor and marks route transitions.
 *
 * Mount once inside App (which is already inside BrowserRouter).
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../services/analyticsService';
import { PerformanceMonitor } from '../services/performance/PerformanceMonitor';

export function useAnalytics(): void {
  const location = useLocation();

  // Initialise performance monitoring once
  useEffect(() => {
    PerformanceMonitor.init();
  }, []);

  // Fire page view + perf mark on every route change
  useEffect(() => {
    const path = location.pathname + location.search;
    analytics.page(path, document.title);
    PerformanceMonitor.markRouteChange(path);
  }, [location]);
}
