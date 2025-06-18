import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Categories example for dropdown (you can customize)
const categories = {
  Income: ['Salary', 'Freelance', 'Investments', 'Other'],
  Expense: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Other'],
  Savings: ['Emergency Fund', 'Retirement', 'Vacation', 'Other'],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#336AAA'];

function FinanceDashboard() {
  // Load transactions from localStorage or start empty
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [filterMonth, setFilterMonth] = useState(''); // format 'YYYY-MM' or empty for all

  // For add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    date: '',
    description: '',
    type: 'Income',
    category: '',
    amount: '',
  });

  // Save transactions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Filter transactions by month
  const filteredTransactions = filterMonth
    ? transactions.filter((t) => t.date.startsWith(filterMonth))
    : transactions;

  // Handle form input change
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Open dialog for add or edit
  function openDialog(index = null) {
    if (index !== null) {
      // Edit
      setEditingIndex(index);
      setForm(transactions[index]);
    } else {
      // Add
      setEditingIndex(null);
      setForm({
        date: '',
        description: '',
        type: 'Income',
        category: '',
        amount: '',
      });
    }
    setDialogOpen(true);
  }

  // Close dialog
  function closeDialog() {
    setDialogOpen(false);
  }

  // Save new or edited transaction
  function saveTransaction() {
    if (
      !form.date ||
      !form.description.trim() ||
      !form.type ||
      !form.category ||
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert('Please fill all fields correctly.');
      return;
    }

    const newTransaction = {
      date: form.date,
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
    };

    let newTransactions;
    if (editingIndex !== null) {
      // Edit existing
      newTransactions = [...transactions];
      newTransactions[editingIndex] = newTransaction;
    } else {
      // Add new
      newTransactions = [...transactions, newTransaction];
    }
    setTransactions(newTransactions);
    setDialogOpen(false);
  }

  // Delete a transaction
  function deleteTransaction(index) {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const newTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(newTransactions);
    }
  }

  // Aggregate data for monthly bar chart
  // Sum by month and type
  const monthlyDataMap = {};
  transactions.forEach(({ date, type, amount }) => {
    const month = date.slice(0, 7); // YYYY-MM
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, Income: 0, Expense: 0, Savings: 0 };
    }
    monthlyDataMap[month][type] += amount;
  });
  const monthlyData = Object.values(monthlyDataMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Aggregate for category pie chart (filtered transactions)
  const categoryMap = {};
  filteredTransactions.forEach(({ category, amount }) => {
    if (!categoryMap[category]) categoryMap[category] = 0;
    categoryMap[category] += amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" mb={3} align="center">
        Finance Management Dashboard
      </Typography>

      {/* Filter by month */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          label="Filter by Month"
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          sx={{ maxWidth: 180 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => openDialog()}>
          + Add Transaction
        </Button>
      </Box>

      {/* Transactions Table */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transactions {filterMonth ? `(Filtered: ${filterMonth})` : ''}
        </Typography>
        {filteredTransactions.length === 0 ? (
          <Typography>No transactions found.</Typography>
        ) : (
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              'th, td': { border: '1px solid #ddd', p: 1, textAlign: 'left' },
              'th': { backgroundColor: '#f4f4f4' },
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, i) => {
                // Adjust index relative to original array
                const originalIndex = transactions.indexOf(t);
                return (
                  <tr key={i}>
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td>{t.type}</td>
                    <td>{t.category}</td>
                    <td>{t.amount.toFixed(2)}</td>
                    <td>
                      <IconButton
                        aria-label="edit"
                        size="small"
                        onClick={() => openDialog(originalIndex)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => deleteTransaction(originalIndex)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Box>
        )}
      </Paper>

      {/* Charts Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7} sx={{ height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Summary
          </Typography>
          {monthlyData.length === 0 ? (
            <Typography>No data to display.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, bottom: 20 }}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Income" stackId="a" fill="#4caf50" />
                <Bar dataKey="Expense" stackId="a" fill="#f44336" />
                <Bar dataKey="Savings" stackId="a" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={5} sx={{ height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Category Distribution {filterMonth ? `(Filtered)` : ''}
          </Typography>
          {pieData.length === 0 ? (
            <Typography>No data to display.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grid>
      </Grid>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              required
            />
            <FormControl required>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                label="Type"
                name="type"
                value={form.type}
                onChange={(e) => {
                  handleFormChange(e);
                  // Reset category when type changes
                  setForm((prev) => ({ ...prev, category: '' }));
                }}
              >
                <MenuItem value="Income">Income</MenuItem>
                <MenuItem value="Expense">Expense</MenuItem>
                <MenuItem value="Savings">Savings</MenuItem>
              </Select>
            </FormControl>
            <FormControl required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {(categories[form.type] || []).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              inputProps={{ min: '0.01', step: '0.01' }}
              value={form.amount}
              onChange={handleFormChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveTransaction}>
            {editingIndex !== null ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FinanceDashboard;
