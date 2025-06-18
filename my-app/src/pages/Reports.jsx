// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  useTheme,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#6633AA'];

const Reports = ({ transactions }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // default: one month ago
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Filter transactions by date range
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= new Date(startDate) && tDate <= new Date(endDate);
  });

  // Summary calculations
  const incomeTotal = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = incomeTotal - expenseTotal;

  // Prepare monthly summary data for bar chart
  // Group by month (format: YYYY-MM)
  const monthlyDataMap = {};
  filteredTransactions.forEach((t) => {
    const month = t.date.slice(0, 7); // "YYYY-MM"
    if (!monthlyDataMap[month]) monthlyDataMap[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') monthlyDataMap[month].income += t.amount;
    else monthlyDataMap[month].expense += t.amount;
  });
  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));

  // Expense by category pie chart data
  const expenseCategoryMap = {};
  filteredTransactions.forEach((t) => {
    if (t.type === 'expense') {
      expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;
    }
  });
  const expenseCategoryData = Object.entries(expenseCategoryMap).map(([name, value]) => ({ name, value }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="text.primary">
        Reports
      </Typography>

      {/* Date Range Selector */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#1e1e1e' : '#fff' }}>
        <Typography variant="h6" gutterBottom>
          Select Date Range
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Summary */}
      <Grid container spacing={3} mb={4}>
        {[{
          title: 'Income',
          value: incomeTotal,
          color: 'green',
        }, {
          title: 'Expenses',
          value: expenseTotal,
          color: 'red',
        }, {
          title: 'Balance',
          value: balance,
          color: balance >= 0 ? 'blue' : 'red',
        }].map(({ title, value, color }) => (
          <Grid item xs={12} sm={4} key={title}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
              <Typography variant="h5" sx={{ color }}>LKR {value.toLocaleString()}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Monthly Income & Expense Bar Chart */}
      <Typography variant="h6" gutterBottom>
        Monthly Income & Expenses
      </Typography>
      <Paper sx={{ p: 2, mb: 4, height: 300 }}>
        {monthlyData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={10}>
            No data available for selected range.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" stroke={isDark ? '#ddd' : '#333'} />
              <YAxis stroke={isDark ? '#ddd' : '#333'} />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#82ca9d" name="Income" />
              <Bar dataKey="expense" fill="#ff6b6b" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Expense by Category Pie Chart */}
      <Typography variant="h6" gutterBottom>
        Expenses by Category
      </Typography>
      <Paper sx={{ p: 2, height: 300 }}>
        {expenseCategoryData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={10}>
            No expense data for selected range.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseCategoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {expenseCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Reports;
