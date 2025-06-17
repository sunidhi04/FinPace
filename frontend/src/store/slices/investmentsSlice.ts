import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Investment {
  id: number;
  ticker: string;
  quantity: number;
  avg_buy_price: number;
  asset_type: string;
  purchase_date?: string | null;
  notes?: string | null;
  user_id: number;
  created_at: string;
  updated_at?: string | null;
}

interface InvestmentWithMarketData extends Investment {
  current_price: number;
  market_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  last_updated: string;
  error?: string;
}

interface InvestmentsState {
  investments: Investment[];
  portfolioWithMarketData: InvestmentWithMarketData[];
  investment: Investment | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvestmentsState = {
  investments: [],
  portfolioWithMarketData: [],
  investment: null,
  loading: false,
  error: null,
};

// Get all investments with optional asset_type filter
export const getInvestments = createAsyncThunk(
  'investments/getInvestments',
  async (params: { assetType?: string } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const { assetType } = params;
      
      // Build query params
      const queryParams = new URLSearchParams();
      if (assetType) queryParams.append('asset_type', assetType);
      
      const queryString = queryParams.toString();
      const url = `/api/v1/investments${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch investments.'
      );
    }
  }
);

// Get portfolio with market data
export const getPortfolioWithMarketData = createAsyncThunk(
  'investments/getPortfolioWithMarketData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get('/api/v1/investments/portfolio', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch portfolio data.'
      );
    }
  }
);

// Get single investment
export const getInvestment = createAsyncThunk(
  'investments/getInvestment',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(`/api/v1/investments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch investment.'
      );
    }
  }
);

// Create investment
export const createInvestment = createAsyncThunk(
  'investments/createInvestment',
  async (investmentData: {
    ticker: string;
    quantity: number;
    avg_buy_price: number;
    asset_type: string;
    purchase_date?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post('/api/v1/investments/', investmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create investment.'
      );
    }
  }
);

// Update investment
export const updateInvestment = createAsyncThunk(
  'investments/updateInvestment',
  async ({ id, investmentData }: {
    id: number;
    investmentData: Partial<{
      ticker: string;
      quantity: number;
      avg_buy_price: number;
      asset_type: string;
      purchase_date?: string;
      notes?: string;
    }>;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.put(`/api/v1/investments/${id}`, investmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update investment.'
      );
    }
  }
);

// Delete investment
export const deleteInvestment = createAsyncThunk(
  'investments/deleteInvestment',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      await axios.delete(`/api/v1/investments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete investment.'
      );
    }
  }
);

// Investments slice
const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearInvestmentError: (state) => {
      state.error = null;
    },
    clearCurrentInvestment: (state) => {
      state.investment = null;
    }
  },
  extraReducers: (builder) => {
    // Get all investments cases
    builder.addCase(getInvestments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getInvestments.fulfilled, (state, action: PayloadAction<Investment[]>) => {
      state.loading = false;
      state.investments = action.payload;
    });
    builder.addCase(getInvestments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get portfolio with market data cases
    builder.addCase(getPortfolioWithMarketData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getPortfolioWithMarketData.fulfilled, (state, action: PayloadAction<InvestmentWithMarketData[]>) => {
      state.loading = false;
      state.portfolioWithMarketData = action.payload;
    });
    builder.addCase(getPortfolioWithMarketData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get single investment cases
    builder.addCase(getInvestment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getInvestment.fulfilled, (state, action: PayloadAction<Investment>) => {
      state.loading = false;
      state.investment = action.payload;
    });
    builder.addCase(getInvestment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create investment cases
    builder.addCase(createInvestment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createInvestment.fulfilled, (state, action: PayloadAction<Investment>) => {
      state.loading = false;
      state.investments.push(action.payload);
    });
    builder.addCase(createInvestment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update investment cases
    builder.addCase(updateInvestment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateInvestment.fulfilled, (state, action: PayloadAction<Investment>) => {
      state.loading = false;
      if (state.investment?.id === action.payload.id) {
        state.investment = action.payload;
      }
      state.investments = state.investments.map(investment => 
        investment.id === action.payload.id ? action.payload : investment
      );
      
      // Also update in the portfolio with market data if it exists
      state.portfolioWithMarketData = state.portfolioWithMarketData.map(investment => {
        if (investment.id === action.payload.id) {
          // Recalculate market data using existing current price
          const currentPrice = investment.current_price;
          const marketValue = action.payload.quantity * currentPrice;
          const costBasis = action.payload.quantity * action.payload.avg_buy_price;
          const profitLoss = marketValue - costBasis;
          const profitLossPercentage = (profitLoss / costBasis) * 100;
          
          return {
            ...action.payload,
            current_price: currentPrice,
            market_value: marketValue,
            profit_loss: profitLoss,
            profit_loss_percentage: profitLossPercentage,
            last_updated: investment.last_updated
          };
        }
        return investment;
      });
    });
    builder.addCase(updateInvestment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete investment cases
    builder.addCase(deleteInvestment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteInvestment.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      if (state.investment?.id === action.payload) {
        state.investment = null;
      }
      state.investments = state.investments.filter(investment => investment.id !== action.payload);
      state.portfolioWithMarketData = state.portfolioWithMarketData.filter(
        investment => investment.id !== action.payload
      );
    });
    builder.addCase(deleteInvestment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearInvestmentError, clearCurrentInvestment } = investmentsSlice.actions;

export default investmentsSlice.reducer;