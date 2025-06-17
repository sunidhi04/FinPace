import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import transactionsReducer from './slices/transactionsSlice';
import categoriesReducer from './slices/categoriesSlice';
import budgetsReducer from './slices/budgetsSlice';
import goalsReducer from './slices/goalsSlice';
import investmentsReducer from './slices/investmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    categories: categoriesReducer,
    budgets: budgetsReducer,
    goals: goalsReducer,
    investments: investmentsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;