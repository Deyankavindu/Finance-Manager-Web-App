import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
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
  useTheme,
} from '@mui/material';
import {
  Delete,
  Edit,
  CheckCircleOutline,
} from '@mui/icons-material';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useColorMode } from '../theme'; // adjust this import path if needed

const categories = {
  Income: ['Salary', 'Freelance', 'Investments', 'Other'],
  Expense: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Other'],
  Savings: ['Emergency Fund', 'Retirement', 'Vacation', 'Other'],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#336AAA'];

function FinanceDashboard() {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();

  // Transactions State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter, Dialog, Form State
  const [filterMonth, setFilterMonth] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    date: '',
    type: 'Income',
    category: '',
    amount: '',
  });

  // Goals State
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalEditingIndex, setGoalEditingIndex] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    achieved: false,
  });

  // Save transactions and goals to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // Transaction handlers
  const filteredTransactions = filterMonth
    ? transactions.filter((t) => t.date.startsWith(filterMonth))
    : transactions;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openDialog = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setForm(transactions[index]);
    } else {
      setEditingIndex(null);
      setForm({
        date: '',
        type: 'Income',
        category: '',
        amount: '',
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const saveTransaction = () => {
    if (!form.date || !form.type || !form.category || !form.amount || Number(form.amount) <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }

    const newTransaction = {
      date: form.date,
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
    };

    const newTransactions =
      editingIndex !== null
        ? transactions.map((t, i) => (i === editingIndex ? newTransaction : t))
        : [...transactions, newTransaction];

    setTransactions(newTransactions);
    setDialogOpen(false);
  };

  const deleteTransaction = (index) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const newTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(newTransactions);
    }
  };

  // Goals handlers
  const handleGoalFormChange = (e) => {
    const { name, value } = e.target;
    setGoalForm((prev) => ({ ...prev, [name]: value }));
  };

  const openGoalDialog = (index = null) => {
    if (index !== null) {
      setGoalEditingIndex(index);
      setGoalForm(goals[index]);
    } else {
      setGoalEditingIndex(null);
      setGoalForm({
        title: '',
        targetAmount: '',
        deadline: '',
        achieved: false,
      });
    }
    setGoalDialogOpen(true);
  };

  const closeGoalDialog = () => setGoalDialogOpen(false);

  const saveGoal = () => {
    const newGoal = { ...goalForm, targetAmount: Number(goalForm.targetAmount) };
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error('Please fill all goal fields!');
      return;
    }

    const newGoals = [...goals];
    if (goalEditingIndex !== null) {
      newGoals[goalEditingIndex] = newGoal;
    } else {
      newGoals.push(newGoal);
    }

    setGoals(newGoals);
    setGoalDialogOpen(false);
  };

  const deleteGoal = (index) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const newGoals = goals.filter((_, i) => i !== index);
      setGoals(newGoals);
    }
  };

  const markGoalAchieved = (index) => {
    const newGoals = [...goals];
    newGoals[index].achieved = true;
    setGoals(newGoals);
    toast.success(`🎉 Goal "${newGoals[index].title}" marked as achieved!`);
  };

  // Aggregates
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = filteredTransactions
    .filter((t) => t.type === 'Savings')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Charts data
  const monthlyDataMap = {};
  transactions.forEach(({ date, type, amount }) => {
    const month = date.slice(0, 7);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, Income: 0, Expense: 0, Savings: 0 };
    }
    monthlyDataMap[month][type] += amount;
  });
  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));

  const categoryMap = {};
  filteredTransactions.forEach(({ category, amount }) => {
    categoryMap[category] = (categoryMap[category] || 0) + amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <ToastContainer position="top-right" />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        {/* You can add toggleColorMode button here if you want */}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Income', value: totalIncome, color: 'success.main' },
          { label: 'Total Expense', value: totalExpense, color: 'error.main' },
          { label: 'Total Savings', value: totalSavings, color: 'info.main' },
          { label: 'Balance', value: balance, color: 'warning.main' },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="subtitle2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h6" color={color}>
                LKR {value.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter & Add Transaction */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
          Transactions {filterMonth && `(Filtered: ${filterMonth})`}
        </Typography>
        {filteredTransactions.length === 0 ? (
          <Typography>No transactions found.</Typography>
        ) : (
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              'th, td': {
                border: `1px solid ${theme.palette.divider}`,
                padding: 1,
                textAlign: 'left',
              },
              th: {
                backgroundColor: theme.palette.mode === 'dark' ? '#2c2c2c' : '#f4f4f4',
              },
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td>LKR {t.amount.toFixed(2)}</td>
                  <td>
                    <IconButton onClick={() => openDialog(transactions.indexOf(t))}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => deleteTransaction(transactions.indexOf(t))}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </Paper>

      {/* Charts */}
      <Grid container spacing={4} mb={5}>
        <Grid item xs={12} md={7} sx={{ height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Summary
          </Typography>
          {monthlyData.length === 0 ? (
            <Typography>No data to display.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Bar dataKey="Income" stackId="a" fill="#4caf50" />
                <Bar dataKey="Expense" stackId="a" fill="#f44336" />
                <Bar dataKey="Savings" stackId="a" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={5} sx={{ height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Category Distribution
          </Typography>
          {pieData.length === 0 ? (
            <Typography>No data to display.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Tooltip contentStyle={{ backgroundColor: '#333' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grid>
      </Grid>

      {/* Goals & Achievements Section */}
      <Box sx={{ mb: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5"> Financial Goals & Achievements</Typography>
          <Button variant="contained" onClick={() => openGoalDialog()}>
            + Add Goal
          </Button>
        </Box>
        {goals.length === 0 ? (
          <Typography>No goals yet. Add one!</Typography>
        ) : (
          <Grid container spacing={2}>
            {goals.map((goal, index) => {
              const isPastDeadline = new Date(goal.deadline) < new Date() && !goal.achieved;
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: goal.achieved
                        ? theme.palette.success.light
                        : isPastDeadline
                        ? theme.palette.error.light
                        : theme.palette.background.paper,
                      borderLeft: `6px solid ${
                        goal.achieved
                          ? theme.palette.success.main
                          : isPastDeadline
                          ? theme.palette.error.main
                          : theme.palette.primary.main
                      }`,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2">Target: LKR {goal.targetAmount}</Typography>
                    <Typography variant="body2">Deadline: {goal.deadline}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {goal.achieved ? '✅ Achieved' : isPastDeadline ? '⏰ Overdue' : 'In Progress'}
                    </Typography>
                    <Box mt={1}>
                      {!goal.achieved && (
                        <IconButton onClick={() => markGoalAchieved(index)} color="success">
                          <CheckCircleOutline />
                        </IconButton>
                      )}
                      <IconButton onClick={() => openGoalDialog(index)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteGoal(index)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Goal Dialog */}
        <Dialog open={goalDialogOpen} onClose={closeGoalDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{goalEditingIndex !== null ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Goal Title"
                name="title"
                value={goalForm.title}
                onChange={handleGoalFormChange}
                required
              />
              <TextField
                label="Target Amount (LKR)"
                name="targetAmount"
                type="number"
                value={goalForm.targetAmount}
                onChange={handleGoalFormChange}
                required
              />
              <TextField
                label="Deadline"
                name="deadline"
                type="date"
                value={goalForm.deadline}
                onChange={handleGoalFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeGoalDialog}>Cancel</Button>
            <Button onClick={saveGoal} variant="contained">
              {goalEditingIndex !== null ? 'Save Changes' : 'Add Goal'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl required>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={form.type}
                label="Type"
                onChange={(e) => {
                  handleFormChange(e);
                  setForm((prev) => ({ ...prev, category: '' }));
                }}
              >
                {Object.keys(categories).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={form.category}
                label="Category"
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
              inputProps={{ min: 0.01, step: 0.01 }}
              value={form.amount}
              onChange={handleFormChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={saveTransaction} variant="contained">
            {editingIndex !== null ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FinanceDashboard;
