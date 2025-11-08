import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import KPIMetricCard from '../components/Dashboard/KPIMetricCard';
import PremiumChart from '../components/Dashboard/PremiumChart';

// Mock data - replace with real API calls
const mockKPIData = {
  totalRevenue: {
    aed: 2500000,
    pkr: 195000000,
    trend: 12.5,
    period: 'vs last month',
    isPositive: true,
  },
  outstandingAmount: {
    aed: 375000,
    pkr: 29250000,
    trend: -8.2,
    period: 'vs last month',
    isPositive: false,
  },
  paymentRate: {
    value: 87.3,
    trend: 5.2,
    period: 'vs last month',
    isPositive: true,
  },
  activeInvoices: {
    value: 156,
    trend: 2.1,
    period: 'vs last month',
    isPositive: true,
  },
  averageInvoiceValue: {
    aed: 16025,
    pkr: 1250000,
    trend: 3.8,
    period: 'vs last month',
    isPositive: true,
  },
  customerSatisfaction: {
    value: 94.2,
    trend: 1.5,
    period: 'vs last month',
    isPositive: true,
  },
};

const ExecutiveDashboard: React.FC = () => {
  const theme = useTheme();
  const [lastUpdated] = useState(new Date());

  const formatCurrency = (amount: number, currency: 'AED' | 'PKR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Unused function - commented out
  // const formatPercentage = (num: number) => {
  //   return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  // };

  return (
    <DashboardLayout
      title="Executive Dashboard"
      subtitle="Real-time business intelligence and performance metrics"
    >
      {/* Last Updated Indicator */}
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      </Box>

      {/* KPI Metrics Grid */}
      <Box sx={{ mb: 3 }}>
        {/* Main KPI Cards - Equal Height Row */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          {/* Total Revenue */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Total Revenue"
              value={formatCurrency(mockKPIData.totalRevenue.aed, 'AED')}
              subtitle={`${formatCurrency(mockKPIData.totalRevenue.pkr, 'PKR')} PKR`}
              trend={{
                value: mockKPIData.totalRevenue.trend,
                period: mockKPIData.totalRevenue.period,
                isPositive: mockKPIData.totalRevenue.isPositive,
              }}
              status="success"
              icon={<AccountBalanceIcon />}
              size="medium"
            />
          </Box>

          {/* Outstanding Amount */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Outstanding Amount"
              value={formatCurrency(mockKPIData.outstandingAmount.aed, 'AED')}
              subtitle={`${formatCurrency(mockKPIData.outstandingAmount.pkr, 'PKR')} PKR`}
              trend={{
                value: mockKPIData.outstandingAmount.trend,
                period: mockKPIData.outstandingAmount.period,
                isPositive: mockKPIData.outstandingAmount.isPositive,
              }}
              status="warning"
              icon={<ReceiptIcon />}
              size="medium"
            />
          </Box>

          {/* Payment Rate */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Payment Collection Rate"
              value={`${mockKPIData.paymentRate.value}%`}
              subtitle="Current month performance"
              trend={{
                value: mockKPIData.paymentRate.trend,
                period: mockKPIData.paymentRate.period,
                isPositive: mockKPIData.paymentRate.isPositive,
              }}
              progress={mockKPIData.paymentRate.value}
              status="success"
              icon={<PaymentIcon />}
              size="medium"
            />
          </Box>
        </Box>

        {/* Secondary KPI Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2
        }}>
          {/* Active Invoices */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Active Invoices"
              value={formatNumber(mockKPIData.activeInvoices.value)}
              subtitle="Currently outstanding"
              trend={{
                value: mockKPIData.activeInvoices.trend,
                period: mockKPIData.activeInvoices.period,
                isPositive: mockKPIData.activeInvoices.isPositive,
              }}
              status="info"
              icon={<AssessmentIcon />}
              size="small"
            />
          </Box>

          {/* Average Invoice Value */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Average Invoice Value"
              value={formatCurrency(mockKPIData.averageInvoiceValue.aed, 'AED')}
              subtitle={`${formatCurrency(mockKPIData.averageInvoiceValue.pkr, 'PKR')} PKR`}
              trend={{
                value: mockKPIData.averageInvoiceValue.trend,
                period: mockKPIData.averageInvoiceValue.period,
                isPositive: mockKPIData.averageInvoiceValue.isPositive,
              }}
              status="success"
              icon={<TrendingUpIcon />}
              size="small"
            />
          </Box>

          {/* Customer Satisfaction */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Customer Satisfaction"
              value={`${mockKPIData.customerSatisfaction.value}%`}
              subtitle="Based on feedback"
              trend={{
                value: mockKPIData.customerSatisfaction.trend,
                period: mockKPIData.customerSatisfaction.period,
                isPositive: mockKPIData.customerSatisfaction.isPositive,
              }}
              progress={mockKPIData.customerSatisfaction.value}
              status="success"
              icon={<PeopleIcon />}
              size="small"
            />
          </Box>

          {/* Processing Speed */}
          <Box sx={{ gridColumn: { xs: '1', sm: 'span 1', md: 'span 1', lg: 'span 1' } }}>
            <KPIMetricCard
              title="Processing Speed"
              value="2.3 days"
              subtitle="Average invoice processing"
              trend={{
                value: -12.5,
                period: 'vs last month',
                isPositive: true,
              }}
              status="success"
              icon={<SpeedIcon />}
              size="small"
            />
          </Box>
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(12, 1fr)' },
        gap: 3 
      }}>
        {/* Revenue Trend Chart */}
        <Box sx={{ gridColumn: { xs: '1', md: 'span 2', lg: 'span 8' } }}>
          <PremiumChart
            title="Revenue Trend Analysis"
            subtitle="Monthly revenue performance with year-over-year comparison"
            chartVariant="elevated"
            chartHeight={400}
          >
            <Box
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  Revenue Trend Chart
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Interactive line chart showing monthly revenue growth<br />
                  with year-over-year comparison and trend analysis
                </Typography>
              </Stack>
            </Box>
          </PremiumChart>
        </Box>

        {/* Payment Status Distribution */}
        <Box sx={{ gridColumn: { xs: '1', md: 'span 2', lg: 'span 4' } }}>
          <PremiumChart
            title="Payment Status Distribution"
            subtitle="Current outstanding amounts by status"
            chartVariant="elevated"
            chartHeight={400}
          >
            <Box
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.warning.main}15 100%)`,
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  Payment Status Chart
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Interactive pie chart showing payment status<br />
                  distribution with real-time updates
                </Typography>
              </Stack>
            </Box>
          </PremiumChart>
        </Box>

        {/* Agent Performance */}
        <Box sx={{ gridColumn: { xs: '1', md: 'span 1', lg: 'span 6' } }}>
          <PremiumChart
            title="Agent Performance Comparison"
            subtitle="Top performing agents by revenue generated"
            chartVariant="default"
            chartHeight={300}
          >
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.primary.main}15 100%)`,
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  Agent Performance Chart
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Horizontal bar chart comparing agent<br />
                  performance with revenue metrics
                </Typography>
              </Stack>
            </Box>
          </PremiumChart>
        </Box>

        {/* Customer Analysis */}
        <Box sx={{ gridColumn: { xs: '1', md: 'span 1', lg: 'span 6' } }}>
          <PremiumChart
            title="Customer Value Analysis"
            subtitle="Customer segments by lifetime value"
            chartVariant="default"
            chartHeight={300}
          >
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.success.main}15 100%)`,
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  Customer Analysis Chart
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Multi-series chart showing customer<br />
                  segments and lifetime value trends
                </Typography>
              </Stack>
            </Box>
          </PremiumChart>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;
