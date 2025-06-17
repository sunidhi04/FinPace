import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { getTransactions } from '../store/slices/transactionsSlice';
import { getBudgetsWithProgress } from '../store/slices/budgetsSlice';
import { getGoals } from '../store/slices/goalsSlice';
import { getPortfolioWithMarketData } from '../store/slices/investmentsSlice';
import { RootState, AppDispatch } from '../store';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { transactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transactions);
  const { budgetsWithProgress, loading: budgetsLoading } = useSelector((state: RootState) => state.budgets);
  const { goals, loading: goalsLoading } = useSelector((state: RootState) => state.goals);
  const { portfolioWithMarketData, loading: investmentsLoading } = useSelector((state: RootState) => state.investments);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalPortfolioProfit, setTotalPortfolioProfit] = useState(0);
  
  // Current month and year for filtering
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  useEffect(() => {
    // Fetch recent transactions for the current month
    dispatch(getTransactions({
      month: currentMonth,
      year: currentYear,
      limit: 5,
      offset: 0
    }));
    
    // Fetch budgets with progress for the current month
    dispatch(getBudgetsWithProgress({
      month: currentMonth,
      year: currentYear
    }));
    
    // Fetch all active goals
    dispatch(getGoals({ status: 'active' }));
    
    // Fetch investment portfolio with market data
    dispatch(getPortfolioWithMarketData());
  }, [dispatch, currentMonth, currentYear]);
  
  useEffect(() => {
    // Calculate financial summaries
    if (transactions.length > 0) {
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      setTotalIncome(income);
      setTotalExpense(expense);
      setNetSavings(income - expense);
    }
    
    if (portfolioWithMarketData.length > 0) {
      const portfolioValue = portfolioWithMarketData
        .reduce((sum, investment) => sum + investment.market_value, 0);
        
      const portfolioProfit = portfolioWithMarketData
        .reduce((sum, investment) => sum + investment.profit_loss, 0);
        
      setTotalPortfolioValue(portfolioValue);
      setTotalPortfolioProfit(portfolioProfit);
    }
  }, [transactions, portfolioWithMarketData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <div className="text-sm text-secondary-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-600">Monthly Income</h2>
            <div className="p-2 bg-green-100 rounded-full">
              <ArrowUpCircleIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-semibold text-secondary-900">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-secondary-500">This month</p>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-600">Monthly Expenses</h2>
            <div className="p-2 bg-red-100 rounded-full">
              <ArrowDownCircleIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-semibold text-secondary-900">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-secondary-500">This month</p>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-600">Net Savings</h2>
            <div className={`p-2 rounded-full ${netSavings >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {netSavings >= 0 ? (
                <ArrowUpCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ArrowDownCircleIcon className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <p className={`text-xl font-semibold ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netSavings)}
            </p>
            <p className="text-xs text-secondary-500">This month</p>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-600">Portfolio Value</h2>
            <div className={`p-2 rounded-full ${totalPortfolioProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalPortfolioProfit >= 0 ? (
                <ArrowUpCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ArrowDownCircleIcon className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-semibold text-secondary-900">{formatCurrency(totalPortfolioValue)}</p>
            <p className={`text-xs ${totalPortfolioProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPortfolioProfit >= 0 ? '+' : ''}{formatCurrency(totalPortfolioProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-secondary-900">Recent Transactions</h2>
            <Link
              to="/transactions"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-right text-secondary-500 uppercase"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {transactionsLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-secondary-600">
                          Loading recent transactions...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-secondary-600">
                          No transactions found for this month.
                        </td>
                      </tr>
                    ) : (
                      transactions.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4 text-sm text-secondary-900 whitespace-nowrap">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-900 whitespace-nowrap">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-900 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800">
                              {transaction.category_name}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium text-right whitespace-nowrap ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 text-center bg-white sm:px-6">
          <Link
            to="/transactions/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
            Add New Transaction
          </Link>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-secondary-900">Budget Progress</h2>
            <Link
              to="/budgets"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="px-4 pb-5 sm:px-6">
          {budgetsLoading ? (
            <div className="py-4 text-center text-secondary-600">
              Loading budget progress...
            </div>
          ) : budgetsWithProgress.length === 0 ? (
            <div className="py-4 text-center text-secondary-600">
              <p>No budgets set for this month.</p>
              <Link
                to="/budgets/new"
                className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                Create Budget
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetsWithProgress.slice(0, 3).map((budget) => (
                <div key={budget.id} className="p-4 border rounded-md border-secondary-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-secondary-900">
                      {budget.category_name}
                    </span>
                    <span className="text-sm font-medium text-secondary-700">
                      {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 mb-2 bg-secondary-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        budget.percentage_used > 100
                          ? 'bg-red-600'
                          : budget.percentage_used > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-secondary-600">
                    <span>{budget.percentage_used.toFixed(0)}% used</span>
                    <span>{formatCurrency(budget.remaining_amount)} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial Goals */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-secondary-900">Financial Goals</h2>
            <Link
              to="/goals"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="px-4 pb-5 sm:px-6">
          {goalsLoading ? (
            <div className="py-4 text-center text-secondary-600">
              Loading financial goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="py-4 text-center text-secondary-600">
              <p>No active financial goals.</p>
              <Link
                to="/goals/new"
                className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                Create Goal
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-4 border rounded-md border-secondary-200">
                  <div className="mb-2">
                    <h3 className="font-medium text-secondary-900">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Target Date: {formatDate(goal.deadline)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end justify-between mb-1">
                    <div>
                      <p className="text-xs text-secondary-500">Progress</p>
                      <p className="text-sm font-medium text-secondary-700">
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-secondary-700">
                      {goal.progress_percentage.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-full h-2 mb-2 bg-secondary-200 rounded-full">
                    <div
                      className="h-2 rounded-full bg-primary-600"
                      style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;