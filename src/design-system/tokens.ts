export const designTokens = {
  colors: {
    brand: {
      navy: '#041627', // Structural brand color
      blue: '#0040e0', // Primary interaction color
      focusBlue: '#1A73E8', // Input focus glow
      dark: '#020d18',
      lightNavy: '#0a2540',
    },
    surfaces: {
      appBg: '#fbf9fa',
      cardBg: '#ffffff',
      secondaryBg: '#f5f3f5',
      hoverBg: '#e5eeff',
      subtleBg: '#e9e7e9',
      borderSubtle: '#e4e2e3',
      borderDefault: '#e2e8f0',
    },
    status: {
      new: { bg: '#e5eeff', text: '#0040e0', label: 'New' },
      proformaSent: { bg: '#f3e8ff', text: '#7c3aed', label: 'Proforma Sent' },
      pendingReview: { bg: '#fef3c7', text: '#b45309', label: 'Pending Review' },
      accepted: { bg: '#dcfce7', text: '#15803d', label: 'Accepted' },
      converted: { bg: '#dcfce7', text: '#15803d', label: 'Converted' },
      lost: { bg: '#f3f4f6', text: '#4b5563', label: 'Lost' },
      reopened: { bg: '#e0f2fe', text: '#0369a1', label: 'Reopened' },
      active: { bg: '#dcfce7', text: '#15803d', label: 'Active' },
      expiringSoon: { bg: '#fef3c7', text: '#ca8a04', label: 'Expiring Soon' },
      actionNeeded: { bg: '#fef3c7', text: '#b45309', label: 'Action Needed' },
      urgent: { bg: '#fee2e2', text: '#ba1a1a', label: 'Urgent' },
      expired: { bg: '#fee2e2', text: '#ba1a1a', label: 'Expired' },
      normal: { bg: '#e0f2fe', text: '#0284c7', label: 'Normal' },
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  dimensions: {
    sidebarExpanded: '280px',
    sidebarCollapsed: '72px',
    maxContentWidth: '1440px',
    desktopEdgePadding: '32px',
    gutter: '24px',
    tablePaddingCompact: '8px',
    tablePaddingComfortable: '16px',
  },
  radii: {
    inputsButtons: '4px',
    cards: '8px',
    statusBadges: '2px',
  },
} as const;
