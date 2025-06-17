import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Goal {
  id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: string;
  user_id: number;
  created_at: string;
  updated_at?: string | null;
}

interface GoalWithProgress extends Goal {
  progress_percentage: number;
}

interface GoalsState {
  goals: GoalWithProgress[];
  goal: GoalWithProgress | null;
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  goal: null,
  loading: false,
  error: null,
};

// Get all goals with optional status filter
export const getGoals = createAsyncThunk(
  'goals/getGoals',
  async (params: { status?: string } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const { status } = params;
      
      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      
      const queryString = queryParams.toString();
      const url = `/api/v1/goals${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch goals.'
      );
    }
  }
);

// Get single goal
export const getGoal = createAsyncThunk(
  'goals/getGoal',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(`/api/v1/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch goal.'
      );
    }
  }
);

// Create goal
export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: {
    name: string;
    description?: string;
    target_amount: number;
    current_amount?: number;
    deadline?: string;
    status?: string;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post('/api/v1/goals/', goalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create goal.'
      );
    }
  }
);

// Update goal
export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }: {
    id: number;
    goalData: Partial<{
      name: string;
      description?: string;
      target_amount: number;
      current_amount: number;
      deadline?: string;
      status: string;
    }>;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.put(`/api/v1/goals/${id}`, goalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update goal.'
      );
    }
  }
);

// Delete goal
export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      await axios.delete(`/api/v1/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete goal.'
      );
    }
  }
);

// Goals slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalError: (state) => {
      state.error = null;
    },
    clearCurrentGoal: (state) => {
      state.goal = null;
    }
  },
  extraReducers: (builder) => {
    // Get all goals cases
    builder.addCase(getGoals.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getGoals.fulfilled, (state, action: PayloadAction<GoalWithProgress[]>) => {
      state.loading = false;
      state.goals = action.payload;
    });
    builder.addCase(getGoals.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get single goal cases
    builder.addCase(getGoal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getGoal.fulfilled, (state, action: PayloadAction<GoalWithProgress>) => {
      state.loading = false;
      state.goal = action.payload;
    });
    builder.addCase(getGoal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create goal cases
    builder.addCase(createGoal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
      state.loading = false;
      // Calculate progress percentage
      const progressPercentage = action.payload.target_amount > 0 
        ? (action.payload.current_amount / action.payload.target_amount) * 100 
        : 0;
      
      // Add new goal to state with progress percentage
      state.goals.push({
        ...action.payload,
        progress_percentage: progressPercentage
      });
    });
    builder.addCase(createGoal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update goal cases
    builder.addCase(updateGoal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
      state.loading = false;
      
      // Calculate progress percentage
      const progressPercentage = action.payload.target_amount > 0 
        ? (action.payload.current_amount / action.payload.target_amount) * 100 
        : 0;
      
      // Update current goal if it's the one being viewed
      if (state.goal?.id === action.payload.id) {
        state.goal = {
          ...action.payload,
          progress_percentage: progressPercentage
        };
      }
      
      // Update in the goals list
      state.goals = state.goals.map(goal => 
        goal.id === action.payload.id
          ? { ...action.payload, progress_percentage: progressPercentage }
          : goal
      );
    });
    builder.addCase(updateGoal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete goal cases
    builder.addCase(deleteGoal.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteGoal.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      if (state.goal?.id === action.payload) {
        state.goal = null;
      }
      state.goals = state.goals.filter(goal => goal.id !== action.payload);
    });
    builder.addCase(deleteGoal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearGoalError, clearCurrentGoal } = goalsSlice.actions;

export default goalsSlice.reducer;