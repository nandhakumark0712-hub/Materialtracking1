import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const initialState = {
  materials: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Get all materials
export const getMaterials = createAsyncThunk('materials/getAll', async (_, thunkAPI) => {
  try {
    const response = await API.get('/api/materials');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Create new material
export const createMaterial = createAsyncThunk('materials/create', async (materialData, thunkAPI) => {
  try {
    const response = await API.post('/api/materials', materialData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const materialSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload.data;
      })
      .addCase(getMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createMaterial.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials.push(action.payload.data);
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = materialSlice.actions;
export default materialSlice.reducer;
