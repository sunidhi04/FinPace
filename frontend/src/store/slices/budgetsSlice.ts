import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Budget {
  id: number;
  category_id: number;
  amount: number;
  month: number;
  year: number;
  user_id: number;
  created_at: string;
  updated_at?: string | null;
}

interface BudgetWithCategory extends Budget {
  category_name: string;
}

interface BudgetWithProgress extends BudgetWithCategory {
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
}

interface BudgetsState {
  budgets: BudgetWithCategory[];
  budgetsWithProgress: BudgetWithProgress[];
  budget: BudgetWithCategory | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  budgetsWithProgress: [],
  budget: null,
  loading: false,
  error: null,
};

// Get all budgets with optional month and year filters
export const getBudgets = createAsyncThunk(
  'budgets/getBudgets',
  async (params: { month?: number; year?: number } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const { month, year } = params;
      
      // Build query params
      const queryParams = new URLSearchParams();
      if (month !== undefined) queryParams.append('month', month.toString());
      if (year !== undefined) queryParams.append('year', year.toString());
      
      const queryString = queryParams.toString();
      const url = `/api/v1/budgets${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch budgets.'
      );
    }
  }
);

// Get budgets with progress information
export const getBudgetsWithProgress = createAsyncThunk(
  'budgets/getBudgetsWithProgress',
  async (params: { month: number; year: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const { month, year } = params;
      const response = await axios.get(`/api/v1/budgets/progress?month=${month}&year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch budget progress.'
      );
    }
  }
);

// Get single budget
export const getBudget = createAsyncThunk(
  'budgets/getBudget',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(`/api/v1/budgets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch budget.'
      );
    }
  }
);

// Create budget
export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: {
    category_id: number;
    amount: number;
    month: number;
    year: number;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post('/api/v1/budgets/', budgetData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create budget.'
      );
    }
  }
);

// Update budget
export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budgetData }: {
    id: number;
    budgetData: Partial<{
      category_id: number;
      amount: number;
      month: number;
      year: number;
    }>;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.put(`/api/v1/budgets/${id}`, budgetData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update budget.'
      );
    }
  }
);

// Delete budget
export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      await axios.delete(`/api/v1/budgets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete budget.'
      );
    }
  }
);

// Budgets slice
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetError: (state) => {
      state.error = null;
    },
    clearCurrentBudget: (state) => {
      state.budget = null;
    }
  },
  extraReducers: (builder) => {
    // Get all budgets cases
    builder.addCase(getBudgets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBudgets.fulfilled, (state, action: PayloadAction<BudgetWithCategory[]>) => {
      state.loading = false;
      state.budgets = action.payload;
    });
    builder.addCase(getBudgets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get budgets with progress cases
    builder.addCase(getBudgetsWithProgress.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBudgetsWithProgress.fulfilled, (state, action: PayloadAction<BudgetWithProgress[]>) => {
      state.loading = false;
      state.budgetsWithProgress = action.payload;
    });
    builder.addCase(getBudgetsWithProgress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get single budget cases
    builder.addCase(getBudget.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBudget.fulfilled, (state, action: PayloadAction<BudgetWithCategory>) => {
      state.loading = false;
      state.budget = action.payload;
    });
    builder.addCase(getBudget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create budget cases
    builder.addCase(createBudget.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
      state.loading = false;
      // We would need to refetch the budgets list to get the category_name
    });
    builder.addCase(createBudget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update budget cases
    builder.addCase(updateBudget.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
      state.loading = false;
      if (state.budget?.id === action.payload.id) {
        state.budget = { ...state.budget, ...action.payload };
      }
      
      // Update in the list if found
      state.budgets = state.budgets.map(budget => 
        budget.id === action.payload.id
          ? { ...budget, ...action.payload }
          : budget
      );
      
      // Update in progress list if found
      state.budgetsWithProgress = state.budgetsWithProgress.map(budget => 
        budget.id === action.payload.id
          ? { ...budget, ...action.payload }
          : budget
      );
    });
    builder.addCase(updateBudget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete budget cases
    builder.addCase(deleteBudget.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteBudget.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      if (state.budget?.id === action.payload) {
        state.budget = null;
      }
      state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
      state.budgetsWithProgress = state.budgetsWithProgress.filter(
        budget => budget.id !== action.payload
      );
    });
    builder.addCase(deleteBudget.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearBudgetError, clearCurrentBudget } = budgetsSlice.actions;

export default budgetsSlice.reducer;