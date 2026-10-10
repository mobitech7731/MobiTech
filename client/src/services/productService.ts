import api from './api';
import { ApiProduct, Product, mapApiProductToUI } from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceRanges?: string;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetAdminProductsParams extends GetProductsParams {
  status?: 'all' | 'active' | 'inactive';
}

export interface PaginatedApiProducts {
  products: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const productService = {
  async getProducts(params: GetProductsParams = {}): Promise<PaginatedProducts> {
    const { data } = await api.get('/products', { params });
    return {
      products: data.data.products.map(mapApiProductToUI),
      pagination: data.data.pagination,
    };
  },

  async getAdminProducts(params: GetAdminProductsParams = {}): Promise<PaginatedApiProducts> {
    const { data } = await api.get('/products/admin', { params });
    return {
      products: data.data.products,
      pagination: data.data.pagination,
    };
  },

  async getAdminProductById(id: string): Promise<ApiProduct> {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  async createProduct(productData: Partial<ApiProduct>): Promise<ApiProduct> {
    const { data } = await api.post('/products', productData);
    return data.data;
  },

  async updateProduct(id: string, productData: Partial<ApiProduct>): Promise<ApiProduct> {
    const { data } = await api.patch(`/products/${id}`, productData);
    return data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return mapApiProductToUI(data.data);
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const { data } = await api.get(`/products/slug/${slug}`);
    return mapApiProductToUI(data.data);
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const { data } = await api.get('/products/featured');
    return data.data.map(mapApiProductToUI);
  },

  async getTrendingProducts(): Promise<Product[]> {
    const { data } = await api.get('/products/trending');
    return data.data.map(mapApiProductToUI);
  },

  async getBestSellerProducts(): Promise<Product[]> {
    const { data } = await api.get('/products/best-sellers');
    return data.data.map(mapApiProductToUI);
  },

  async getNewProducts(): Promise<Product[]> {
    const { data } = await api.get('/products/new');
    return data.data.map(mapApiProductToUI);
  },
};
