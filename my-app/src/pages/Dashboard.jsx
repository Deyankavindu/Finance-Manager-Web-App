import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Switch,
  FormControlLabel,
  LinearProgress, // For budget progress
} from '@mui/material';
import {
  Delete,
  Edit,
  CheckCircleOutline,
  Brightness4,
  Brightness7,
  AddAlarmOutlined,
  AttachMoneyOutlined, // For Budgets
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
  Expense: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Shopping', 'Other'],
  Savings: ['Emergency Fund', 'ROI', 'Vacation', 'Bank', 'Retirement', 'Other'],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#336AAA', '#8A2BE2', '#DEB887', '#5F9EA0', '#D2691E'];

function FinanceDashboard() {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();

  // State Management
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [filterMonth, setFilterMonth] = useState(''); //YYYY-MM format
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    date: '',
    type: 'Income',
    category: '',
    amount: '',
  });

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

  const [recurrentPayments, setRecurrentPayments] = useState(() => {
    const saved = localStorage.getItem('recurrentPayments');
    return saved ? JSON.parse(saved) : [];
  });
  const [recurrentPaymentDialogOpen, setRecurrentPaymentDialogOpen] = useState(false);
  const [recurrentPaymentEditingIndex, setRecurrentPaymentEditingIndex] = useState(null);
  const [recurrentPaymentForm, setRecurrentPaymentForm] = useState({
    title: '',
    type: 'Expense',
    category: '',
    amount: '',
    startDate: '',
    endDate: '',
    active: true,
  });

  // Budgeting State
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetEditingIndex, setBudgetEditingIndex] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    limit: '',
    type: 'Expense', // Budgets are typically for expenses, but can be income/savings targets too
  });

  // --- Sync with localStorage ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('recurrentPayments', JSON.stringify(recurrentPayments));
  }, [recurrentPayments]);

  // Sync budgets with localStorage
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);


  // --- Recurrent Payment Transaction Generation Logic (Refined) ---
  const generateRecurrentTransactions = useCallback(() => {
    const currentMonth = filterMonth || new Date().toISOString().slice(0, 7); //YYYY-MM
    const generated = [];

    recurrentPayments.forEach(rp => {
      if (!rp.active) return;

      const startDate = new Date(rp.startDate + 'T00:00:00'); // Ensure UTC for consistent date math
      const endDate = rp.endDate ? new Date(rp.endDate + 'T00:00:00') : null;

      const [startYear, startMonth] = rp.startDate.split('-').map(Number);
      const [currentYear, currentMonthNum] = currentMonth.split('-').map(Number);

      // Check if the recurrent payment is active in the current filter month
      const isBeforeEndDate = !endDate || new Date(currentMonth + '-01') <= endDate;
      const isAfterStartDate = new Date(currentMonth + '-01') >= new Date(`${startYear}-${String(startMonth).padStart(2, '0')}-01`);

      if (isBeforeEndDate && isAfterStartDate) {
        const dayOfMonth = startDate.getDate();
        const transactionDate = `${currentMonth}-${String(dayOfMonth).padStart(2, '0')}`;

        generated.push({
          date: transactionDate,
          type: rp.type,
          category: rp.category,
          amount: Number(rp.amount),
          isRecurrent: true,
          recurrentTitle: rp.title,
          id: `${rp.title}-${rp.type}-${rp.category}-${rp.amount}-${transactionDate}`, // Unique ID for recurrent tx
        });
      }
    });

    setTransactions(prevTransactions => {
      // Filter out old generated recurrent transactions if the filterMonth changed
      const nonRecurrentTransactions = prevTransactions.filter(t => !t.isRecurrent);

      // Add only new recurrent transactions that aren't already present
      const newGeneratedTransactions = generated.filter(genT =>
        !prevTransactions.some(prevT => prevT.id === genT.id)
      );

      // Combine and sort
      return [...nonRecurrentTransactions, ...newGeneratedTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  }, [recurrentPayments, filterMonth]);

  useEffect(() => {
    generateRecurrentTransactions();
  }, [generateRecurrentTransactions]);


  // --- General Handlers (Transactions, Goals, Recurrent Payments, Budgets) ---
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
      setForm({ date: '', type: 'Income', category: '', amount: '' });
    }
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  const validateTransaction = (data) => {
    if (!data.date) { toast.error('Date is required'); return false; }
    if (!data.type) { toast.error('Type is required'); return false; }
    if (!data.category) { toast.error('Category is required'); return false; }
    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) { toast.error('Amount must be a positive number'); return false; }
    return true;
  };

  const saveTransaction = () => {
    if (!validateTransaction(form)) return;

    const newTransaction = {
      ...form,
      amount: Number(form.amount),
      id: Date.now(), // Unique ID for manual transaction
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
      const transactionToDelete = transactions[index];
      if (transactionToDelete.isRecurrent) {
        toast.warn('Cannot delete auto-generated recurrent transaction. Deactivate the recurrent payment instead.');
        return;
      }
      setTransactions(transactions.filter((_, i) => i !== index));
      toast.info('Transaction deleted');
    }
  };


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
      setGoalForm({ title: '', targetAmount: '', deadline: '', achieved: false });
    }
    setGoalDialogOpen(true);
  };
  const closeGoalDialog = () => setGoalDialogOpen(false);

  const validateGoal = (goal) => {
    if (!goal.title) { toast.error('Goal title is required'); return false; }
    if (!goal.targetAmount || isNaN(goal.targetAmount) || Number(goal.targetAmount) <= 0) { toast.error('Target amount must be a positive number'); return false; }
    if (!goal.deadline) { toast.error('Deadline is required'); return false; }
    return true;
  };
  const saveGoal = () => {
    const newGoal = { ...goalForm, targetAmount: Number(goalForm.targetAmount) };
    if (!validateGoal(newGoal)) return;

    const updatedGoals = goalEditingIndex !== null
      ? goals.map((g, i) => (i === goalEditingIndex ? newGoal : g))
      : [...goals, newGoal];
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


  const handleRecurrentPaymentFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecurrentPaymentForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const openRecurrentPaymentDialog = (index = null) => {
    if (index !== null) {
      setRecurrentPaymentEditingIndex(index);
      setRecurrentPaymentForm(recurrentPayments[index]);
    } else {
      setRecurrentPaymentEditingIndex(null);
      setRecurrentPaymentForm({
        title: '', type: 'Expense', category: '', amount: '', startDate: '', endDate: '', active: true,
      });
    }
    setRecurrentPaymentDialogOpen(true);
  };
  const closeRecurrentPaymentDialog = () => setRecurrentPaymentDialogOpen(false);

  const validateRecurrentPayment = (rp) => {
    if (!rp.title) { toast.error('Recurrent payment title is required'); return false; }
    if (!rp.type) { toast.error('Type is required for recurrent payment'); return false; }
    if (!rp.category) { toast.error('Category is required for recurrent payment'); return false; }
    if (!rp.amount || isNaN(rp.amount) || Number(rp.amount) <= 0) { toast.error('Amount must be a positive number for recurrent payment'); return false; }
    if (!rp.startDate) { toast.error('Start Date is required for recurrent payment'); return false; }
    if (rp.endDate && new Date(rp.endDate) < new Date(rp.startDate)) { toast.error('End Date cannot be before Start Date'); return false; }
    return true;
  };

  const saveRecurrentPayment = () => {
    const newRecurrentPayment = { ...recurrentPaymentForm, amount: Number(recurrentPaymentForm.amount) };
    if (!validateRecurrentPayment(newRecurrentPayment)) return;

    const updatedRecurrentPayments = recurrentPaymentEditingIndex !== null
      ? recurrentPayments.map((r, i) => (i === recurrentPaymentEditingIndex ? newRecurrentPayment : r))
      : [...recurrentPayments, newRecurrentPayment];
    setRecurrentPayments(updatedRecurrentPayments);
    setRecurrentPaymentDialogOpen(false);
    toast.success(`Recurrent Payment ${recurrentPaymentEditingIndex !== null ? 'updated' : 'added'}!`);
  };

  const deleteRecurrentPayment = (index) => {
    if (window.confirm('Are you sure you want to delete this recurrent payment?')) {
      setRecurrentPayments(recurrentPayments.filter((_, i) => i !== index));
      toast.info('Recurrent payment deleted');
    }
  };
  const toggleRecurrentPaymentStatus = (index) => {
    const updatedRecurrentPayments = [...recurrentPayments];
    updatedRecurrentPayments[index].active = !updatedRecurrentPayments[index].active;
    setRecurrentPayments(updatedRecurrentPayments);
    toast.info(`Recurrent payment "${updatedRecurrentPayments[index].title}" ${updatedRecurrentPayments[index].active ? 'activated' : 'deactivated'}.`);
  };

  // Budget Handlers
  const handleBudgetFormChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm((prev) => ({ ...prev, [name]: value }));
  };

  const openBudgetDialog = (index = null) => {
    if (index !== null) {
      setBudgetEditingIndex(index);
      setBudgetForm(budgets[index]);
    } else {
      setBudgetEditingIndex(null);
      setBudgetForm({ category: '', limit: '', type: 'Expense' });
    }
    setBudgetDialogOpen(true);
  };
  const closeBudgetDialog = () => setBudgetDialogOpen(false);

  const validateBudget = (budget) => {
    if (!budget.category) { toast.error('Budget category is required'); return false; }
    if (!budget.limit || isNaN(budget.limit) || Number(budget.limit) <= 0) { toast.error('Budget limit must be a positive number'); return false; }
    return true;
  };

  const saveBudget = () => {
    const newBudget = { ...budgetForm, limit: Number(budgetForm.limit) };
    if (!validateBudget(newBudget)) return;

    const updatedBudgets = budgetEditingIndex !== null
      ? budgets.map((b, i) => (i === budgetEditingIndex ? newBudget : b))
      : [...budgets, newBudget];
    setBudgets(updatedBudgets);
    setBudgetDialogOpen(false);
    toast.success(`Budget ${budgetEditingIndex !== null ? 'updated' : 'added'}!`);
  };

  const deleteBudget = (index) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter((_, i) => i !== index));
      toast.info('Budget deleted');
    }
  };


  // --- Aggregates & Calculations ---
  const filteredTransactions = useMemo(() => {
    return filterMonth
      ? transactions.filter((t) => t.date.startsWith(filterMonth))
      : transactions;
  }, [filterMonth, transactions]);

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

  const dailyData = useMemo(() => {
    const map = {};
    transactions.forEach(({ date, type, amount }) => {
      if (!date) return;
      const day = date; //YYYY-MM-DD
      if (!map[day]) map[day] = { day, Income: 0, Expense: 0, Savings: 0 };
      map[day][type] += amount;
    });
    return Object.values(map).sort((a, b) => new Date(a.day) - new Date(b.day));
  }, [transactions]);

  const pieData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(({ category, amount }) => {
      map[category] = (map[category] || 0) + amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Budget Progress Calculation
  const budgetProgress = useMemo(() => {
    const progress = {};
    // Sum spending for the current month by category and type
    filteredTransactions.forEach(t => {
      if (!progress[t.type]) progress[t.type] = {};
      progress[t.type][t.category] = (progress[t.type][t.category] || 0) + t.amount;
    });

    return budgets.map(budget => {
      const spent = progress[budget.type]?.[budget.category] || 0;
      const remaining = budget.limit - spent;
      const percentage = (spent / budget.limit) * 100;
      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(100, Math.max(0, percentage)), // Cap between 0 and 100
        isOverBudget: spent > budget.limit,
      };
    });
  }, [budgets, filteredTransactions]);

  // Emergency Fund Progress Calculation
  const emergencyFundGoal = useMemo(() => goals.find(g => g.title === 'Emergency Fund' || g.title.toLowerCase().includes('emergency fund')), [goals]);
  const currentEmergencyFund = useMemo(() =>
    filteredTransactions.filter(t => t.type === 'Savings' && t.category === 'Emergency Fund').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  const emergencyFundProgress = useMemo(() => {
    if (!emergencyFundGoal || !emergencyFundGoal.targetAmount) return null;
    const progress = (currentEmergencyFund / emergencyFundGoal.targetAmount) * 100;
    return {
      target: emergencyFundGoal.targetAmount,
      current: currentEmergencyFund,
      percentage: Math.min(100, Math.max(0, progress)),
      achieved: currentEmergencyFund >= emergencyFundGoal.targetAmount,
    };
  }, [emergencyFundGoal, currentEmergencyFund]);


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
                <tr key={t.id || i}> {/* Use unique ID if available */}
                  <td>{formatDate(t.date)}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td>{t.amount.toFixed(2)} {t.isRecurrent && <Tooltip title={`Generated from recurrent payment: ${t.recurrentTitle}`}>(R)</Tooltip>}</td>
                  <td>
                    {t.isRecurrent ? (
                      <Tooltip title="Manage from Recurrent Payments section">
                        <IconButton size="small" disabled>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit Transaction">
                        <IconButton
                          aria-label={`Edit transaction on ${formatDate(t.date)}`}
                          onClick={() => openDialog(transactions.indexOf(t))}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {t.isRecurrent ? (
                       <Tooltip title="Manage from Recurrent Payments section">
                         <IconButton size="small" disabled color="error">
                           <Delete fontSize="small" />
                         </IconButton>
                       </Tooltip>
                    ) : (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </Paper>

      {/* --- Charts Section --- */}
      
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom>
          Financial Overview Charts
        </Typography>
        <Typography variant="h6" gutterBottom mt={2}>
          Daily Income/Expense/Savings
        </Typography>
        <Paper sx={{ p: 2, mb: 4, height: 400, position: 'relative' }}>
          {dailyData.length === 0 ? (
            <Alert severity="info">No data to display in Daily Summary chart.</Alert>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis
                  dataKey="day"
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(tick) => {
                    try {
                      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(tick));
                    } catch { return tick; }
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
          Category Distribution (Filtered Month)
        </Typography>
        <Paper sx={{ p: 2, height: 400, position: 'relative' }}>
          {pieData.length === 0 ? (
            <Alert severity="info">No data to display in Category Distribution chart for the filtered month.</Alert>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

      {/* --- Budgets Section --- */}
      <Box sx={{ mb: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h5">Monthly Budgets <AttachMoneyOutlined sx={{ verticalAlign: 'middle', ml: 0.5 }} /></Typography>
          <Button variant="contained" onClick={() => openBudgetDialog()}>
            + Set Budget
          </Button>
        </Box>

        {budgets.length === 0 ? (
          <Alert severity="info">No budgets set yet. Set a budget to track your spending!</Alert>
        ) : (
          <Grid container spacing={2}>
            {budgetProgress.map((budget, index) => (
              <Grid item xs={12} sm={6} md={4} key={budget.category + index}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: budget.isOverBudget
                      ? theme.palette.error.light
                      : budget.percentage >= 80
                      ? theme.palette.warning.light
                      : theme.palette.background.paper,
                    borderLeft: `6px solid ${
                      budget.isOverBudget
                        ? theme.palette.error.main
                        : budget.percentage >= 80
                        ? theme.palette.warning.main
                        : theme.palette.primary.main
                    }`,
                    transition: 'background-color 0.3s',
                    minHeight: 140,
                  }}
                  elevation={3}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {budget.category} ({budget.type})
                  </Typography>
                  <Typography variant="body2">Limit: LKR {budget.limit.toFixed(2)}</Typography>
                  <Typography variant="body2">Spent: LKR {budget.spent.toFixed(2)}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Remaining: LKR {budget.remaining.toFixed(2)}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={budget.percentage}
                    color={budget.isOverBudget ? 'error' : budget.percentage >= 80 ? 'warning' : 'primary'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {budget.percentage.toFixed(1)}% {budget.isOverBudget ? ' (OVER BUDGET)' : ''}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openBudgetDialog(index)}
                      aria-label={`Edit budget for ${budget.category}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => deleteBudget(index)}
                      aria-label={`Delete budget for ${budget.category}`}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* --- Recurrent Payments Section --- */}
      <Box sx={{ mb: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h5">Monthly Recurrent Payments <AddAlarmOutlined sx={{ verticalAlign: 'middle', ml: 0.5 }} /></Typography>
          <Button variant="contained" onClick={() => openRecurrentPaymentDialog()}>
            + Add Recurrent Payment
          </Button>
        </Box>

        {recurrentPayments.length === 0 ? (
          <Alert severity="info">No recurrent payments set up yet. Add one to automate!</Alert>
        ) : (
          <Grid container spacing={2}>
            {recurrentPayments.map((rp, index) => (
              <Grid item xs={12} sm={6} md={4} key={rp.title + index}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: rp.active ? theme.palette.background.paper : theme.palette.action.disabledBackground,
                    borderLeft: `6px solid ${rp.active ? theme.palette.primary.main : theme.palette.grey[500]}`,
                    transition: 'background-color 0.3s',
                    minHeight: 180,
                  }}
                  elevation={3}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {rp.title}
                  </Typography>
                  <Typography variant="body2">Type: {rp.type}</Typography>
                  <Typography variant="body2">Category: {rp.category}</Typography>
                  <Typography variant="body2">Amount: LKR {rp.amount.toFixed(2)}</Typography>
                  <Typography variant="body2">Starts: {formatDate(rp.startDate)}</Typography>
                  <Typography variant="body2">Ends: {rp.endDate ? formatDate(rp.endDate) : 'Ongoing'}</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rp.active}
                        onChange={() => toggleRecurrentPaymentStatus(index)}
                        name="active"
                        color="primary"
                        aria-label={`Toggle active status for ${rp.title}`}
                      />
                    }
                    label={rp.active ? 'Active' : 'Inactive'}
                    sx={{ mt: 1 }}
                  />
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openRecurrentPaymentDialog(index)}
                      aria-label={`Edit recurrent payment ${rp.title}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => deleteRecurrentPayment(index)}
                      aria-label={`Delete recurrent payment ${rp.title}`}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* --- Goals & Achievements Section (Including Emergency Fund Progress) --- */}
     
      <Box sx={{ mb: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h5">Financial Goals & Achievements</Typography>
          <Button variant="contained" onClick={() => openGoalDialog()}>
            + Add Goal
          </Button>
        </Box>

        {emergencyFundProgress && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: theme.palette.info.light, borderLeft: `6px solid ${theme.palette.info.main}` }} elevation={3}>
            <Typography variant="h6" gutterBottom>Emergency Fund Progress</Typography>
            <Typography variant="body1">
              Current: LKR {emergencyFundProgress.current.toFixed(2)} / Target: LKR {emergencyFundProgress.target.toFixed(2)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={emergencyFundProgress.percentage}
              color={emergencyFundProgress.achieved ? 'success' : 'info'}
              sx={{ height: 10, borderRadius: 5, mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {emergencyFundProgress.percentage.toFixed(1)}% Achieved {emergencyFundProgress.achieved && ' (Goal Met!)'}
            </Typography>
          </Paper>
        )}

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
                    <Typography variant="body2">Target: LKR {goal.targetAmount.toFixed(2)}</Typography>
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

      {/* --- Transaction Dialog --- */}
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
                  setForm((prev) => ({ ...prev, category: '' }));
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

      {/* --- Goal Dialog --- */}
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

      {/* --- Recurrent Payment Dialog --- */}
      <Dialog open={recurrentPaymentDialogOpen} onClose={closeRecurrentPaymentDialog} fullWidth maxWidth="sm">
        <DialogTitle>{recurrentPaymentEditingIndex !== null ? 'Edit Recurrent Payment' : 'Add Recurrent Payment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              name="title"
              value={recurrentPaymentForm.title}
              onChange={handleRecurrentPaymentFormChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="recurrent-type-label">Type</InputLabel>
              <Select
                labelId="recurrent-type-label"
                label="Type"
                name="type"
                value={recurrentPaymentForm.type}
                onChange={(e) => {
                  handleRecurrentPaymentFormChange(e);
                  setRecurrentPaymentForm((prev) => ({ ...prev, category: '' }));
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
              <InputLabel id="recurrent-category-label">Category</InputLabel>
              <Select
                labelId="recurrent-category-label"
                label="Category"
                name="category"
                value={recurrentPaymentForm.category}
                onChange={handleRecurrentPaymentFormChange}
              >
                {categories[recurrentPaymentForm.type]?.map((cat) => (
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
              value={recurrentPaymentForm.amount}
              onChange={handleRecurrentPaymentFormChange}
              fullWidth
              required
            />
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={recurrentPaymentForm.startDate}
              onChange={handleRecurrentPaymentFormChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="End Date (Optional)"
              type="date"
              name="endDate"
              value={recurrentPaymentForm.endDate}
              onChange={handleRecurrentPaymentFormChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={recurrentPaymentForm.active}
                  onChange={handleRecurrentPaymentFormChange}
                  name="active"
                  color="primary"
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRecurrentPaymentDialog}>Cancel</Button>
          <Button
            onClick={saveRecurrentPayment}
            variant="contained"
            disabled={
              !recurrentPaymentForm.title ||
              !recurrentPaymentForm.type ||
              !recurrentPaymentForm.category ||
              !recurrentPaymentForm.amount ||
              Number(recurrentPaymentForm.amount) <= 0 ||
              !recurrentPaymentForm.startDate ||
              (recurrentPaymentForm.endDate && new Date(recurrentPaymentForm.endDate) < new Date(recurrentPaymentForm.startDate))
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Budget Dialog --- */}
      <Dialog open={budgetDialogOpen} onClose={closeBudgetDialog} fullWidth maxWidth="sm">
        <DialogTitle>{budgetEditingIndex !== null ? 'Edit Budget' : 'Set New Budget'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth required>
              <InputLabel id="budget-type-label">Type</InputLabel>
              <Select
                labelId="budget-type-label"
                label="Type"
                name="type"
                value={budgetForm.type}
                onChange={(e) => handleBudgetFormChange(e)}
              >
                 <MenuItem value="Expense">Expense</MenuItem>
                 <MenuItem value="Income">Income Target</MenuItem>
                 <MenuItem value="Savings">Savings Target</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="budget-category-label">Category</InputLabel>
              <Select
                labelId="budget-category-label"
                label="Category"
                name="category"
                value={budgetForm.category}
                onChange={handleBudgetFormChange}
              >
                {categories[budgetForm.type]?.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Budget Limit (LKR)"
              name="limit"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={budgetForm.limit}
              onChange={handleBudgetFormChange}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBudgetDialog}>Cancel</Button>
          <Button
            onClick={saveBudget}
            variant="contained"
            disabled={
              !budgetForm.category || !budgetForm.limit || Number(budgetForm.limit) <= 0
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