import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, IconButton, Button, Dialog,
  DialogActions, DialogContent, DialogTitle, useTheme
} from '@mui/material';
import { Edit, Delete, CheckCircleOutline } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function GoalsSection() {
  const theme = useTheme();
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    achieved: false,
  });

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleGoalFormChange = (e) => {
    const { name, value } = e.target;
    setGoalForm((prev) => ({ ...prev, [name]: value }));
  };

  const openDialog = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setGoalForm(goals[index]);
    } else {
      setEditingIndex(null);
      setGoalForm({
        title: '',
        targetAmount: '',
        deadline: '',
        achieved: false,
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const saveGoal = () => {
    const newGoal = { ...goalForm, targetAmount: Number(goalForm.targetAmount) };
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error('Please fill all fields!');
      return;
    }

    const newGoals = [...goals];
    if (editingIndex !== null) {
      newGoals[editingIndex] = newGoal;
    } else {
      newGoals.push(newGoal);
    }

    setGoals(newGoals);
    setDialogOpen(false);
  };

  const deleteGoal = (index) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const newGoals = goals.filter((_, i) => i !== index);
      setGoals(newGoals);
    }
  };

  const markAsAchieved = (index) => {
    const newGoals = [...goals];
    newGoals[index].achieved = true;
    setGoals(newGoals);
    toast.success(`🎉 Goal "${newGoals[index].title}" marked as achieved!`);
  };

  return (
    <Box sx={{ mt: 5 }}>
      <ToastContainer position="top-right" />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">🎯 Financial Goals & Achievements</Typography>
        <Button variant="contained" onClick={() => openDialog()}>
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
                  <Typography variant="body2">
                    Target: LKR {goal.targetAmount}
                  </Typography>
                  <Typography variant="body2">
                    Deadline: {goal.deadline}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {goal.achieved ? '✅ Achieved' : isPastDeadline ? '⏰ Overdue' : 'In Progress'}
                  </Typography>
                  <Box mt={1}>
                    {!goal.achieved && (
                      <IconButton onClick={() => markAsAchieved(index)} color="success">
                        <CheckCircleOutline />
                      </IconButton>
                    )}
                    <IconButton onClick={() => openDialog(index)} color="primary">
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
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
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
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={saveGoal} variant="contained">
            {editingIndex !== null ? 'Save Changes' : 'Add Goal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GoalsSection;
