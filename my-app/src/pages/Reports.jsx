import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import jsPDF from 'jspdf';

const ReportsPage = ({ transactions = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const filtered = transactions.filter((t) => {
      return t.date >= startDate && t.date <= endDate;
    });

    setReportData(filtered);
  };

  const getTotal = (type) =>
    reportData
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Transaction Report', 10, 10);

    let y = 20;
    doc.setFontSize(12);
    doc.text(`Start Date: ${startDate}`, 10, y);
    y += 7;
    doc.text(`End Date: ${endDate}`, 10, y);
    y += 10;

    doc.text(`Income: LKR ${getTotal('Income').toFixed(2)}`, 10, y);
    y += 7;
    doc.text(`Expense: LKR ${getTotal('Expense').toFixed(2)}`, 10, y);
    y += 7;
    doc.text(`Savings: LKR ${getTotal('Savings').toFixed(2)}`, 10, y);
    y += 10;

    doc.text('Transactions:', 10, y);
    y += 7;

    // Table headers
    doc.text('Date', 10, y);
    doc.text('Type', 50, y);
    doc.text('Category', 90, y);
    doc.text('Amount', 150, y);
    y += 7;

    // Table rows
    reportData.forEach((t) => {
      doc.text(t.date, 10, y);
      doc.text(t.type, 50, y);
      doc.text(t.category, 90, y);
      doc.text(`LKR ${t.amount.toFixed(2)}`, 150, y);
      y += 7;
      if (y > 270) {
        // Avoid writing off the page
        doc.addPage();
        y = 10;
      }
    });

    doc.save('transaction_report.pdf');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate Transaction Report
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleGenerateReport}>
          Generate Report
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Summary
        </Typography>
        {reportData.length === 0 ? (
          <Typography>No transactions in selected date range.</Typography>
        ) : (
          <>
            <Typography>Income: LKR {getTotal('Income').toFixed(2)}</Typography>
            <Typography>Expense: LKR {getTotal('Expense').toFixed(2)}</Typography>
            <Typography>Savings: LKR {getTotal('Savings').toFixed(2)}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Transactions
            </Typography>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((t, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px' }}>{t.date}</td>
                    <td style={{ padding: '8px' }}>{t.type}</td>
                    <td style={{ padding: '8px' }}>{t.category}</td>
                    <td style={{ padding: '8px' }}>LKR {t.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
            <Button
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </>
        )}
      </Paper>

      
    </Box>
  );
};

export default ReportsPage;
