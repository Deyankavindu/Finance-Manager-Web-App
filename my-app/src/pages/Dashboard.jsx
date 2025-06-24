import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Delete,
  Edit,
  CheckCircleOutline,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useColorMode } from '../theme'; // adjust if needed

const categories = {
  Income: ['Salary', 'Freelance', 'Investments', 'Other'],
  Expense: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Other'],
  Savings: ['Emergency Fund', 'ROI', 'Vacation', 'Bank', 'Other'],
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

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // Handlers
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

  const validateTransaction = (data) => {
    if (!data.date) {
      toast.error('Date is required');
      return false;
    }
    if (!data.type) {
      toast.error('Type is required');
      return false;
    }
    if (!data.category) {
      toast.error('Category is required');
      return false;
    }
    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
      toast.error('Amount must be a positive number');
      return false;
    }
    return true;
  };

  const saveTransaction = () => {
    if (!validateTransaction(form)) return;

    const newTransaction = {
      date: form.date,
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
    };

    const updated = editingIndex !== null
      ? transactions.map((t, i) => (i === editingIndex ? newTransaction : t))
      : [...transactions, newTransaction];

    setTransactions(updated);
    setDialogOpen(false);
    toast.success(`Transaction ${editingIndex !== null ? 'updated' : 'added'}!`);
  };

  const deleteTransaction = (index) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter((_, i) => i !== index));
      toast.info('Transaction deleted');
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

  const validateGoal = (goal) => {
    if (!goal.title) {
      toast.error('Goal title is required');
      return false;
    }
    if (!goal.targetAmount || isNaN(goal.targetAmount) || Number(goal.targetAmount) <= 0) {
      toast.error('Target amount must be a positive number');
      return false;
    }
    if (!goal.deadline) {
      toast.error('Deadline is required');
      return false;
    }
    return true;
  };

  const saveGoal = () => {
    const newGoal = { ...goalForm, targetAmount: Number(goalForm.targetAmount) };
    if (!validateGoal(newGoal)) return;

    const updatedGoals = [...goals];
    if (goalEditingIndex !== null) {
      updatedGoals[goalEditingIndex] = newGoal;
    } else {
      updatedGoals.push(newGoal);
    }

    setGoals(updatedGoals);
    setGoalDialogOpen(false);
    toast.success(`Goal ${goalEditingIndex !== null ? 'updated' : 'added'}!`);
  };

  const deleteGoal = (index) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter((_, i) => i !== index));
      toast.info('Goal deleted');
    }
  };

  const markGoalAchieved = (index) => {
    const updatedGoals = [...goals];
    updatedGoals[index].achieved = true;
    setGoals(updatedGoals);
    toast.success(`🎉 Goal "${updatedGoals[index].title}" marked as achieved!`);
  };

  // Filter transactions by month
  const filteredTransactions = useMemo(() => {
    return filterMonth
      ? transactions.filter((t) => t.date.startsWith(filterMonth))
      : transactions;
  }, [filterMonth, transactions]);

  // Aggregates
  const totalIncome = useMemo(() =>
    filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]);

  const totalExpense = useMemo(() =>
    filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]);

  const totalSavings = useMemo(() =>
    filteredTransactions.filter(t => t.type === 'Savings').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]);

  const balance = totalIncome - totalExpense;

  // **Daily summary for chart (NEW)**
  const dailyData = useMemo(() => {
    const map = {};
    transactions.forEach(({ date, type, amount }) => {
      if (!date) return;
      const day = date; // YYYY-MM-DD
      if (!map[day]) map[day] = { day, Income: 0, Expense: 0, Savings: 0 };
      map[day][type] += amount;
    });
    return Object.values(map).sort((a, b) => new Date(a.day) - new Date(b.day));
  }, [transactions]);

  // Category distribution for pie chart
  const pieData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(({ category, amount }) => {
      map[category] = (map[category] || 0) + amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Finance Dashboard
        </Typography>
        
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
            <Paper
              sx={{
                p: 2,
                backgroundColor: theme.palette.background.paper,
                textAlign: 'center',
                borderRadius: 2,
              }}
              elevation={3}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
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
          <Alert severity="info">No transactions found.</Alert>
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
                verticalAlign: 'middle',
              },
              th: {
                backgroundColor: theme.palette.mode === 'dark' ? '#2c2c2c' : '#f4f4f4',
              },
              'tbody tr:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            aria-label="Transactions table"
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount (LKR)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, i) => (
                <tr key={i}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td>{t.amount.toFixed(2)}</td>
                  <td>
                    <Tooltip title="Edit Transaction">
                      <IconButton
                        aria-label={`Edit transaction on ${formatDate(t.date)}`}
                        onClick={() => openDialog(transactions.indexOf(t))}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Transaction">
                      <IconButton
                        aria-label={`Delete transaction on ${formatDate(t.date)}`}
                        onClick={() => deleteTransaction(transactions.indexOf(t))}
                        size="small"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </Paper>

      {/* Charts Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Daily Summary
        </Typography>
        <Paper sx={{ p: 2, mb: 4, height: 400, position: 'relative' }}>
          {dailyData.length === 0 ? (
            <Alert severity="info">No data to display.</Alert>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis
                  dataKey="day"
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(tick) => {
                    try {
                      return new Intl.DateTimeFormat(undefined, {
                        month: 'short',
                        day: 'numeric',
                      }).format(new Date(tick));
                    } catch {
                      return tick;
                    }
                  }}
                />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 4 }}
                  itemStyle={{ color: theme.palette.text.primary }}
                  labelStyle={{ color: theme.palette.text.secondary }}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Legend wrapperStyle={{ color: theme.palette.text.secondary }} />
                <Bar dataKey="Income" stackId="a" fill="#4caf50" />
                <Bar dataKey="Expense" stackId="a" fill="#f44336" />
                <Bar dataKey="Savings" stackId="a" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Typography variant="h6" gutterBottom>
          Category Distribution
        </Typography>
        <Paper sx={{ p: 2, height: 400, position: 'relative' }}>
          {pieData.length === 0 ? (
            <Alert severity="info">No data to display.</Alert>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: theme.palette.text.secondary }}
                />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 4 }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>

      {/* Goals & Achievements Section */}
      <Box sx={{ mb: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h5">Financial Goals & Achievements</Typography>
          <Button variant="contained" onClick={() => openGoalDialog()}>
            + Add Goal
          </Button>
        </Box>

        {goals.length === 0 ? (
          <Alert severity="info">No goals yet. Add one!</Alert>
        ) : (
          <Grid container spacing={2}>
            {goals.map((goal, index) => {
              const isPastDeadline = new Date(goal.deadline) < new Date() && !goal.achieved;
              return (
                <Grid item xs={12} sm={6} md={4} key={goal.title + index}>
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
                      transition: 'background-color 0.3s',
                      minHeight: 140,
                    }}
                    elevation={3}
                  >
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2">Target: LKR {goal.targetAmount}</Typography>
                    <Typography variant="body2">Deadline: {formatDate(goal.deadline)}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status:{' '}
                      {goal.achieved
                        ? '✅ Achieved'
                        : isPastDeadline
                        ? '❌ Missed Deadline'
                        : 'In Progress'}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1}>
                      {!goal.achieved && !isPastDeadline && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleOutline />}
                          onClick={() => markGoalAchieved(index)}
                          aria-label={`Mark goal ${goal.title} as achieved`}
                        >
                          Mark Achieved
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openGoalDialog(index)}
                        aria-label={`Edit goal ${goal.title}`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => deleteGoal(index)}
                        aria-label={`Delete goal ${goal.title}`}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingIndex !== null ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                label="Type"
                name="type"
                value={form.type}
                onChange={(e) => {
                  handleFormChange(e);
                  setForm((prev) => ({ ...prev, category: '' })); // reset category on type change
                }}
              >
                {Object.keys(categories).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {categories[form.type]?.map((cat) => (
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
              inputProps={{ min: 0, step: '0.01' }}
              value={form.amount}
              onChange={handleFormChange}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={saveTransaction}
            variant="contained"
            disabled={
              !form.date || !form.type || !form.category || !form.amount || Number(form.amount) <= 0
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={goalDialogOpen} onClose={closeGoalDialog} fullWidth maxWidth="sm">
        <DialogTitle>{goalEditingIndex !== null ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              name="title"
              value={goalForm.title}
              onChange={handleGoalFormChange}
              fullWidth
              required
            />
            <TextField
              label="Target Amount"
              name="targetAmount"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={goalForm.targetAmount}
              onChange={handleGoalFormChange}
              fullWidth
              required
            />
            <TextField
              label="Deadline"
              type="date"
              name="deadline"
              value={goalForm.deadline}
              onChange={handleGoalFormChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGoalDialog}>Cancel</Button>
          <Button
            onClick={saveGoal}
            variant="contained"
            disabled={
              !goalForm.title ||
              !goalForm.targetAmount ||
              Number(goalForm.targetAmount) <= 0 ||
              !goalForm.deadline
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FinanceDashboard;
