import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { getTransactions, deleteTransaction } from '../store/slices/transactionsSlice';
import { getCategories } from '../store/slices/categoriesSlice';
import { AppDispatch, RootState } from '../store';

const Transactions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector((state: RootState) => state.transactions);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all'); // 'all', 'income', 'expense'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Show filter panel
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Get transactions with current filters
    dispatch(getTransactions({
      type: transactionType !== 'all' ? transactionType : undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      min_amount: minAmount ? parseFloat(minAmount) : undefined,
      max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
      sort_by: sortField,
      sort_direction: sortDirection,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    }));

    // Get categories for filter dropdown
    dispatch(getCategories());
  }, [
    dispatch, 
    currentPage, 
    itemsPerPage, 
    sortField, 
    sortDirection, 
    transactionType,
    selectedCategory,
    startDate,
    endDate,
    minAmount,
    maxAmount
  ]);

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(id));
    }
  };

  // Filter transactions by search term
  const filteredTransactions = transactions.filter((transaction) => {
    return transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };
  
  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netAmount = totalIncome - totalExpense;

  // Export transactions as CSV
  const exportToCSV = () => {
    // Create CSV header
    let csvContent = 'Date,Description,Category,Type,Amount\n';
    
    // Add transaction data
    filteredTransactions.forEach(transaction => {
      csvContent += `"${formatDate(transaction.date)}","${transaction.description}","${transaction.category_name}","${transaction.type}","${transaction.amount}"\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create download URL and trigger download
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Transactions</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md shadow-sm hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link
            to="/transactions/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-secondary-600">Total Income</h2>
          <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-secondary-600">Total Expenses</h2>
          <p className="mt-1 text-lg font-semibold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-secondary-600">Net Amount</h2>
          <p className={`mt-1 text-lg font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netAmount)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
          <div className="flex flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full py-2 pl-10 pr-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="inline-flex items-center px-3 py-2 ml-3 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md shadow-sm hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="itemsPerPage" className="block text-sm font-medium text-secondary-700">
                Show
              </label>
              <select
                id="itemsPerPage"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-4 mt-4 border rounded-md border-secondary-200">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <label htmlFor="transactionType" className="block text-sm font-medium text-secondary-700">
                  Transaction Type
                </label>
                <select
                  id="transactionType"
                  className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-secondary-700">
                  Category
                </label>
                <select
                  id="category"
                  className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700">
                  From Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="block w-full p-2 mt-1 border border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700">
                  To Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="block w-full p-2 mt-1 border border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="minAmount" className="block text-sm font-medium text-secondary-700">
                  Min Amount
                </label>
                <input
                  type="number"
                  id="minAmount"
                  className="block w-full p-2 mt-1 border border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label htmlFor="maxAmount" className="block text-sm font-medium text-secondary-700">
                  Max Amount
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  className="block w-full p-2 mt-1 border border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Any"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => {
                    setCurrentPage(1); // Reset to first page when filters change
                    // Actual filter is applied in useEffect
                  }}
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md shadow-sm hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => {
                    setSearchTerm('');
                    setTransactionType('all');
                    setSelectedCategory('all');
                    setStartDate('');
                    setEndDate('');
                    setMinAmount('');
                    setMaxAmount('');
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {sortField === 'date' && (
                      <ArrowsUpDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase cursor-pointer"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center">
                    <span>Description</span>
                    {sortField === 'description' && (
                      <ArrowsUpDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase cursor-pointer"
                  onClick={() => handleSort('category_name')}
                >
                  <div className="flex items-center">
                    <span>Category</span>
                    {sortField === 'category_name' && (
                      <ArrowsUpDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-right text-secondary-500 uppercase cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    <span>Amount</span>
                    {sortField === 'amount' && (
                      <ArrowsUpDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-right text-secondary-500 uppercase"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-secondary-600">
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-3 border-2 border-t-primary-600 border-primary-200 rounded-full animate-spin"></div>
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-secondary-600">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 text-sm text-secondary-900 whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-900 whitespace-nowrap">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-900 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {transaction.category_name}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium text-right whitespace-nowrap ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/transactions/edit/${transaction.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <nav
          className="flex items-center justify-between px-4 py-3 bg-white border-t border-secondary-200 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-secondary-700">
              Showing <span className="font-medium">{filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
              </span>{' '}
              of <span className="font-medium">{filteredTransactions.length}</span> results
            </p>
          </div>
          <div className="flex justify-between flex-1 sm:justify-end">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                currentPage === 1
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-700 hover:bg-secondary-50'
              } bg-white border border-secondary-300 rounded-md`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= filteredTransactions.length}
              className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium ${
                currentPage * itemsPerPage >= filteredTransactions.length
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-700 hover:bg-secondary-50'
              } bg-white border border-secondary-300 rounded-md`}
            >
              Next
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Transactions;