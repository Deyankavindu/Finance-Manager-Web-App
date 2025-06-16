import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  useTheme,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Transactions state
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', category: 'Salary', amount: 5000, date: '2025-06-15' },
    { id: 2, type: 'expense', category: 'Groceries', amount: 200, date: '2025-06-16' },
    { id: 3, type: 'expense', category: 'Utilities', amount: 150, date: '2025-06-17' },
  ]);

  // Form state
  const [form, setForm] = useState({
    type: 'income',
    category: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  });

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add new transaction
  const handleAddTransaction = () => {
    if (!form.category || !form.amount || !form.date) {
      alert('Please fill all fields');
      return;
    }
    const newTransaction = {
      id: Date.now(),
      ...form,
      amount: Number(form.amount),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    // Reset form except date
    setForm((prev) => ({ ...prev, category: '', amount: '' }));
  };

  // Calculate summary
  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = incomeTotal - expenseTotal;

  // Chart data by category
  const expenseData = [];
  const incomeData = [];

  const expenseCategories = {};
  const incomeCategories = {};

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    } else {
      incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
    }
  });

  for (const cat in expenseCategories) {
    expenseData.push({ name: cat, value: expenseCategories[cat] });
  }
  for (const cat in incomeCategories) {
    incomeData.push({ name: cat, value: incomeCategories[cat] });
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#6633AA'];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom color="text.primary">
        Dashboard Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {[{
          title: 'Income',
          value: incomeTotal,
          bg: isDark ? '#2e7d32' : '#e8f5e9',
          color: isDark ? '#a5d6a7' : 'green',
        }, {
          title: 'Expenses',
          value: expenseTotal,
          bg: isDark ? '#c62828' : '#ffebee',
          color: isDark ? '#ef9a9a' : 'red',
        }, {
          title: 'Balance',
          value: balance,
          bg: isDark ? '#1565c0' : '#e3f2fd',
          color: isDark ? '#90caf9' : '#1976d2',
        }].map((card) => (
          <Grid item xs={12} sm={4} key={card.title}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: card.bg,
                color: card.color,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle2">{card.title}</Typography>
              <Typography variant="h5">LKR {card.value.toLocaleString()}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add Transaction Form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: isDark ? '#1e1e1e' : '#fff' }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Add Transaction
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="Amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              fullWidth
              size="small"
              variant="outlined"
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              type="date"
              fullWidth
              size="small"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={handleAddTransaction} fullWidth>
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6} style={{ height: 300 }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            Expenses by Category
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-LKR {index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        <Grid item xs={12} md={6} style={{ height: 300 }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            Income by Category
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData}>
              <XAxis dataKey="name" stroke={isDark ? '#ddd' : '#333'} />
              <YAxis stroke={isDark ? '#ddd' : '#333'} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
