import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Transaction {
  id: number;
  amount: number;
  description?: string;
  date: string;
  is_income: boolean;
  is_recurring: boolean;
  recurrence_period?: string;
  category_id: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

interface TransactionWithCategory extends Transaction {
  category_name: string;
}

interface MonthlySummary {
  month: number;
  income: number;
  expenses: number;
  savings: number;
}

interface TransactionsState {
  transactions: TransactionWithCategory[];
  transaction: TransactionWithCategory | null;
  monthlySummary: MonthlySummary[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  transaction: null,
  monthlySummary: [],
  loading: false,
  error: null,
};

// Get all transactions with filters
export const getTransactions = createAsyncThunk(
  'transactions/getTransactions',
  async (params: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    isIncome?: boolean;
    skip?: number;
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const { startDate, endDate, categoryId, isIncome, skip, limit } = params;
      
      // Build query params
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);
      if (categoryId) queryParams.append('category_id', categoryId.toString());
      if (isIncome !== undefined) queryParams.append('is_income', isIncome.toString());
      if (skip) queryParams.append('skip', skip.toString());
      if (limit) queryParams.append('limit', limit.toString());
      
      const queryString = queryParams.toString();
      const url = `/api/v1/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch transactions.'
      );
    }
  }
);

// Get a single transaction
export const getTransaction = createAsyncThunk(
  'transactions/getTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(`/api/v1/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch transaction.'
      );
    }
  }
);

// Create a transaction
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: {
    amount: number;
    description?: string;
    date: string;
    is_income: boolean;
    is_recurring: boolean;
    recurrence_period?: string;
    category_id: number;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post('/api/v1/transactions/', transactionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create transaction.'
      );
    }
  }
);

// Update a transaction
export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }: {
    id: number;
    transactionData: Partial<Transaction>;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.put(`/api/v1/transactions/${id}`, transactionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update transaction.'
      );
    }
  }
);

// Delete a transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      await axios.delete(`/api/v1/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete transaction.'
      );
    }
  }
);

// Get monthly summary
export const getMonthlySummary = createAsyncThunk(
  'transactions/getMonthlySummary',
  async (year: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(`/api/v1/transactions/summary/monthly?year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch monthly summary.'
      );
    }
  }
);

// Transactions slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.transaction = null;
    },
  },
  extraReducers: (builder) => {
    // Get all transactions cases
    builder.addCase(getTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTransactions.fulfilled, (state, action: PayloadAction<TransactionWithCategory[]>) => {
      state.loading = false;
      state.transactions = action.payload;
    });
    builder.addCase(getTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get single transaction cases
    builder.addCase(getTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTransaction.fulfilled, (state, action: PayloadAction<TransactionWithCategory>) => {
      state.loading = false;
      state.transaction = action.payload;
    });
    builder.addCase(getTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create transaction cases
    builder.addCase(createTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
      state.loading = false;
      // We would normally add the new transaction to the list, but it doesn't have category_name
      // It's better to refetch the list to have consistent data
    });
    builder.addCase(createTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update transaction cases
    builder.addCase(updateTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
      state.loading = false;
      if (state.transaction?.id === action.payload.id) {
        state.transaction = { ...action.payload, category_name: state.transaction.category_name };
      }
      state.transactions = state.transactions.map(transaction => 
        transaction.id === action.payload.id 
          ? { ...action.payload, category_name: transaction.category_name } 
          : transaction
      );
    });
    builder.addCase(updateTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete transaction cases
    builder.addCase(deleteTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      if (state.transaction?.id === action.payload) {
        state.transaction = null;
      }
      state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
    });
    builder.addCase(deleteTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Monthly summary cases
    builder.addCase(getMonthlySummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMonthlySummary.fulfilled, (state, action: PayloadAction<MonthlySummary[]>) => {
      state.loading = false;
      state.monthlySummary = action.payload;
    });
    builder.addCase(getMonthlySummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearTransactionError, clearCurrentTransaction } = transactionsSlice.actions;

export default transactionsSlice.reducer;