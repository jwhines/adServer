<script setup lang="ts">
/**
 * AnalyticsView
 *
 * This view is a placeholder for future business-specific analytics.
 * Currently, use the App Analytics for real analytics data.
 */

import { useRouter } from 'vue-router';
import EnvironmentBadge from '@/components/EnvironmentBadge.vue';

const router = useRouter();

function goToInvestorDashboard() {
  router.push('/');
}
</script>

<template>
  <div class="analytics-view">
    <div class="header">
      <div>
        <h1>Analytics Dashboard</h1>
        <p class="subtitle">Track your reward performance and campaign metrics</p>
      </div>
      <EnvironmentBadge />
    </div>

    <!-- Empty State -->
    <div class="empty-state">
      <div class="empty-icon">📊</div>
      <h2>Business Analytics Coming Soon</h2>
      <p class="description">
        This page will show business-specific analytics including reward performance,
        campaign metrics, and ROI tracking.
      </p>

      <div class="current-option">
        <h3>📈 View Platform Analytics Now</h3>
        <p>
          For comprehensive analytics including DAU, MAU, revenue, platform breakdown,
          and growth metrics, visit the App Analytics.
        </p>
        <button @click="goToInvestorDashboard" class="btn-primary">
          Go to App Analytics
        </button>
      </div>

      <div class="coming-soon">
        <h4>Coming Soon:</h4>
        <ul>
          <li>✨ Per-reward performance tracking</li>
          <li>📈 Campaign ROI and spend analysis</li>
          <li>🎯 Impression, click, and redemption metrics</li>
          <li>📊 Category and demographic breakdowns</li>
          <li>📅 Custom date range comparisons</li>
          <li>💾 CSV and PDF export</li>
        </ul>
      </div>

      <div class="api-note">
        <p class="note-text">
          <strong>For Developers:</strong> This view needs to be connected to the
          <code>getBusinessAnalytics</code> GraphQL query to show real data.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.description {
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.current-option {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 600px;
}

.current-option h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.current-option p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0.95;
  line-height: 1.6;
}

.btn-primary {
  background: white;
  color: #667eea;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.coming-soon {
  margin-top: 3rem;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.coming-soon h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.coming-soon ul {
  list-style: none;
  padding: 0;
  text-align: left;
}

.coming-soon li {
  padding: 0.5rem 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.api-note {
  margin-top: 2rem;
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.note-text {
  font-size: 0.875rem;
  color: #1e40af;
  margin: 0;
}

.note-text code {
  background: #dbeafe;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.813rem;
}
</style>
