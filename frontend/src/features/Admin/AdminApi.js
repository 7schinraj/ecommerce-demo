import api from '../../services/api';

export const adminApi = {
  // Get products with query parameters (q for search, sort_by, page, page_size, is_available)
  getProducts: async (params = {}) => {
    const response = await api.get('/api/v1/products/', { params });
    // StandardJSONRenderer wraps response under response.data.data
    return response.data.data;
  },

  // Create a new product
  createProduct: async (productData) => {
    const response = await api.post('/api/v1/products/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Update an existing product
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/api/v1/products/${productId}/`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Partially update an existing product (using PATCH for partial fields)
  patchProduct: async (productId, partialData) => {
    const response = await api.patch(`/api/v1/products/${productId}/`, partialData);
    return response.data.data;
  },

  // Delete a product
  deleteProduct: async (productId) => {
    const response = await api.delete(`/api/v1/products/${productId}/`);
    return response.data.data;
  },

  // Get all categories sorted alphabetically
  getCategories: async () => {
    const response = await api.get('/api/v1/products/categories/');
    return response.data.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await api.post('/api/v1/products/categories/', categoryData);
    return response.data.data;
  }
};

export default adminApi;
