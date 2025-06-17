import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  parent_category_id?: number | null;
  user_id: number;
  created_at: string;
  updated_at?: string | null;
}

interface CategoryWithSubcategories extends Category {
  sub_categories: CategoryWithSubcategories[];
}

interface CategoryTree {
  categories: CategoryWithSubcategories[];
}

interface CategoriesState {
  categories: Category[];
  categoryTree: CategoryWithSubcategories[];
  category: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  categoryTree: [],
  category: null,
  loading: false,
  error: null,
};

// Get all categories
export const getCategories = createAsyncThunk(
  'categories/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get('/api/v1/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch categories.'
      );
    }
  }
);

// Get category tree
export const getCategoryTree = createAsyncThunk(
  'categories/getCategoryTree',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get('/api/v1/categories/tree', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch category tree.'
      );
    }
  }
);

// Create category
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: {
    name: string;
    parent_category_id?: number | null;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post('/api/v1/categories/', categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create category.'
      );
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }: {
    id: number;
    categoryData: {
      name?: string;
      parent_category_id?: number | null;
    };
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.put(`/api/v1/categories/${id}`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update category.'
      );
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      await axios.delete(`/api/v1/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete category.'
      );
    }
  }
);

// Categories slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.category = null;
    },
  },
  extraReducers: (builder) => {
    // Get all categories cases
    builder.addCase(getCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(getCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get category tree cases
    builder.addCase(getCategoryTree.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCategoryTree.fulfilled, (state, action: PayloadAction<CategoryTree>) => {
      state.loading = false;
      state.categoryTree = action.payload.categories;
    });
    builder.addCase(getCategoryTree.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create category cases
    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      state.loading = false;
      state.categories.push(action.payload);
      // Triggering a refetch of the category tree would be ideal here
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update category cases
    builder.addCase(updateCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      state.loading = false;
      state.categories = state.categories.map(category => 
        category.id === action.payload.id ? action.payload : category
      );
      // Triggering a refetch of the category tree would be ideal here
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete category cases
    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.categories = state.categories.filter(category => category.id !== action.payload);
      // Triggering a refetch of the category tree would be ideal here
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCategoryError, clearCurrentCategory } = categoriesSlice.actions;

export default categoriesSlice.reducer;