import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useColorMode } from '../theme';

const SettingsPage = () => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();

  const [currency, setCurrency] = useState('LKR');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') || 'LKR';
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const savedGoals = JSON.parse(localStorage.getItem('goals') || '[]');

    setCurrency(savedCurrency);
    setTransactions(savedTransactions);
    setGoals(savedGoals);
  }, []);

  const handleCurrencyChange = (e) => {
    const value = e.target.value;
    setCurrency(value);
    localStorage.setItem('currency', value);
    toast.success(`Currency set to ${value}`);
  };

  const handleClearData = () => {
    if (window.confirm('This will clear all data. Are you sure?')) {
      localStorage.removeItem('transactions');
      localStorage.removeItem('goals');
      setTransactions([]);
      setGoals([]);
      toast.success('All data cleared.');
    }
  };

  const handleExportData = () => {
    const data = { transactions, goals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-data-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Stack spacing={3}>
        <Button onClick={toggleColorMode} variant="contained" startIcon={mode === 'light' ? <Brightness4 /> : <Brightness7 />}>
          Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
        </Button>

        <FormControl fullWidth>
          <InputLabel id="currency-label">Currency</InputLabel>
          <Select
            labelId="currency-label"
            value={currency}
            label="Currency"
            onChange={handleCurrencyChange}
          >
            <MenuItem value="LKR">LKR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" color="error" onClick={handleClearData}>
          Clear All Data
        </Button>

        <Button variant="outlined" onClick={handleExportData}>
          Export Data as JSON
        </Button>
      </Stack>
    </Container>
  );
};

export default SettingsPage;
