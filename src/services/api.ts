import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Customer, Supplier, Sales, Payment, LoginCredentials, ChangePasswordData, ApiResponse, PaginatedResponse, SaleApiResponse, Purchase, DailyLedger, LedgerEntry, LedgerSummary, FreightInvoice, TransportInvoice, FreightPayment, TransportPayment, DubaiTransportInvoice, DubaiClearanceInvoice, DubaiTransportPayment, DubaiClearancePayment } from '../types';

// Add interface for sales filter parameters
export interface SalesFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  customer?: string;
  supplier?: string;
  containerNo?: string;
  product?: string;
  status?: string;
  statuses?: string; // Multiple statuses separated by comma
  startDate?: string;
  endDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  minAmount?: number;
  maxAmount?: number;
  minOutstanding?: number;
  maxOutstanding?: number;
  dateFilter?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth';
  sortBy?: 'createdAt' | 'invoiceDate' | 'dueDate' | 'amount' | 'outstandingAmount' | 'customer' | 'supplier' | 'status';
  sortOrder?: 'asc' | 'desc';
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Payload for creating users (includes password which is not part of User type exposed to UI)
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  department?: string;
  position?: string;
  role?: 'admin' | 'employee';
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors and rate limiting
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (error.response?.status === 429) {
          console.warn('Rate limit exceeded. Please wait a moment before trying again.');
          // You could show a user-friendly message here
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Purchase endpoints
  async getPurchases(page = 1, limit = 10, search = ''): Promise<{ success: boolean; data: Purchase[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get(`/purchases?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return response.data;
  }

  async getPurchase(id: string): Promise<ApiResponse<Purchase>> {
    const response: AxiosResponse = await this.api.get(`/purchases/${id}`);
    return response.data;
  }

  async createPurchase(data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    const response: AxiosResponse = await this.api.post('/purchases', data);
    return response.data;
  }

  async updatePurchase(id: string, data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    const response: AxiosResponse = await this.api.put(`/purchases/${id}`, data);
    return response.data;
  }

  async deletePurchase(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/purchases/${id}`);
    return response.data;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string; token?: string; user?: User }> {
    console.log('API: Making login request to:', `${this.api.defaults.baseURL}/auth/login`);
    const response: AxiosResponse = await this.api.post('/auth/login', credentials);
    console.log('API: Login response:', response.data);
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse = await this.api.get('/auth/me');
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.post('/auth/logout');
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.post('/auth/change-password', data);
    return response.data;
  }

  async verifyAdminPassword(password: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.post('/auth/verify-admin-password', { password });
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse = await this.api.put('/auth/profile', profileData);
    return response.data;
  }

  // User endpoints
  async getUsers(page = 1, limit = 10): Promise<{ success: boolean; users: User[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  async createUser(userData: CreateUserPayload): Promise<ApiResponse<User>> {
    const response: AxiosResponse = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Customer endpoints
  async getCustomers(page = 1, limit = 10): Promise<PaginatedResponse<Customer>> {
    const response: AxiosResponse = await this.api.get(`/customers?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    const response: AxiosResponse = await this.api.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const response: AxiosResponse = await this.api.post('/customers', customerData);
    return response.data;
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const response: AxiosResponse = await this.api.put(`/customers/${id}`, customerData);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/customers/${id}`);
    return response.data;
  }

  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    const response: AxiosResponse = await this.api.get(`/customers/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Supplier endpoints
  async getSuppliers(page = 1, limit = 10): Promise<PaginatedResponse<Supplier>> {
    const response: AxiosResponse = await this.api.get(`/suppliers?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    const response: AxiosResponse = await this.api.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    const response: AxiosResponse = await this.api.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    const response: AxiosResponse = await this.api.put(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/suppliers/${id}`);
    return response.data;
  }

  async searchSuppliers(name: string, limit = 10): Promise<ApiResponse<Supplier[]>> {
    const response: AxiosResponse = await this.api.get(`/suppliers/search/${encodeURIComponent(name)}?limit=${limit}`);
    return response.data;
  }

  // Sales endpoints
  async getSales(filters: SalesFilterParams = {}): Promise<{ 
    success: boolean; 
    data: Sales[]; 
    pagination: any; 
    statistics: any;
    filteredStatistics: any;
    filters?: any;
  }> {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse = await this.api.get(`/sales?${params.toString()}`);
    return response.data;
  }

  async generateSalesReport(options: {
    startDate?: string;
    endDate?: string;
    customer?: string;
    supplier?: string;
    containerNo?: string;
    status?: string;
    statuses?: string;
    format?: 'json' | 'csv' | 'pdf';
    groupBy?: 'none' | 'customer' | 'supplier' | 'status' | 'month' | 'week' | 'container';
    includePayments?: boolean | string;
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    
    // Add all report parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'includePayments') {
          params.append(key, value === true ? 'true' : value === false ? 'false' : value.toString());
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response: AxiosResponse = await this.api.get(`/sales/report?${params.toString()}`);
    return response.data;
  }

  async downloadSalesReport(options: {
    startDate?: string;
    endDate?: string;
    customer?: string;
    supplier?: string;
    containerNo?: string;
    status?: string;
    statuses?: string;
    format?: 'csv' | 'pdf';
    groupBy?: 'none' | 'customer' | 'supplier' | 'status' | 'month' | 'week' | 'container';
    includePayments?: boolean | string;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    // Add all report parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'includePayments') {
          params.append(key, value === true ? 'true' : value === false ? 'false' : value.toString());
        } else {
          params.append(key, value.toString());
        }
      }
    });

    // Ensure format is set
    if (!params.get('format')) {
      params.set('format', 'csv');
    }

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/sales/report?${params.toString()}`;
    const token = localStorage.getItem('token');
    const format = params.get('format') || 'csv';
    const fileExtension = format === 'pdf' ? 'pdf' : 'csv';
    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
    
    // Add authorization header
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  // Purchase report methods
  async generatePurchaseReport(options: {
    startDate?: string;
    endDate?: string;
    containerNo?: string;
    product?: string;
    format?: 'json' | 'csv' | 'pdf';
    groupBy?: 'none' | 'product' | 'month' | 'week';
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    
    // Add all report parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse = await this.api.get(`/purchases/report?${params.toString()}`);
    return response.data;
  }

  async downloadPurchaseReport(options: {
    startDate?: string;
    endDate?: string;
    containerNo?: string;
    product?: string;
    format?: 'csv' | 'pdf';
    groupBy?: 'none' | 'product' | 'month' | 'week';
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    // Add all report parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Ensure format is set
    if (!params.get('format')) {
      params.set('format', 'csv');
    }

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/purchases/report?${params.toString()}`;
    const token = localStorage.getItem('token');
    const format = params.get('format') || 'csv';
    const fileExtension = format === 'pdf' ? 'pdf' : 'csv';
    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
    
    // Add authorization header
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `purchase-report-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  async getSale(id: string): Promise<SaleApiResponse> {
    const response: AxiosResponse = await this.api.get(`/sales/${id}`);
    return response.data;
  }

  async printInvoice(id: string): Promise<void> {
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/sales/${id}/print`;
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    xhr.send();
  }

  async createSale(saleData: Partial<Sales>): Promise<ApiResponse<Sales>> {
    const response: AxiosResponse = await this.api.post('/sales', saleData);
    return response.data;
  }

  async updateSale(id: string, saleData: Partial<Sales>): Promise<SaleApiResponse> {
    const response: AxiosResponse = await this.api.put(`/sales/${id}`, saleData);
    return response.data;
  }

  async deleteSale(id: string, password: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/sales/${id}`, { data: { password } });
    return response.data;
  }

  async getSalesStatistics(): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get('/sales/statistics');
    return response.data;
  }

  // Get recent payments
  async getRecentPayments(params: { limit?: number; days?: number } = {}): Promise<ApiResponse<Payment[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.days) queryParams.append('days', params.days.toString());
      
      const response = await this.api.get(`/sales/payments/recent?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw error;
    }
  }

  async getMonthlyStatistics(month?: string, year?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const response: AxiosResponse = await this.api.get(`/sales/statistics/monthly?${params.toString()}`);
    return response.data;
  }

  // Normalized monthly series for charts using report endpoint (groupBy=month)
  async getMonthlySeries(range: '7d' | '1m' | 'ytd'): Promise<{ success: boolean; data: Array<{ month: string; sales: number; received: number }> }> {
    // Compute start/end based on range
    const now = new Date();
    let startDate = new Date(now);
    if (range === '7d') {
      startDate.setDate(now.getDate() - 6);
    } else if (range === '1m') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    const endDate = now;

    const params: any = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      groupBy: 'month',
      includePayments: true,
      format: 'json'
    };
    const report = await this.generateSalesReport(params);

    // Normalize various possible shapes
    const series: Array<{ month: string; sales: number; received: number }> = [];

    // 1) Preferred: groupedData when groupBy=month (object keyed by YYYY-MM)
    const groupedData = report?.report?.groupedData;
    if (groupedData && typeof groupedData === 'object' && !Array.isArray(groupedData)) {
      Object.entries(groupedData).forEach(([key, val]: any) => {
        const monthKey = key as string; // e.g. 2025-07
        const totalAmount = Number(val?.totalAmount || 0);
        const totalReceived = Number(val?.totalReceived || 0);
        series.push({ month: monthKey, sales: totalAmount, received: totalReceived });
      });
    } else {
      // 2) Fallback: summary.monthlyBreakdown object
      const monthlyBreakdown = report?.report?.summary?.monthlyBreakdown;
      if (monthlyBreakdown && typeof monthlyBreakdown === 'object') {
        Object.entries(monthlyBreakdown).forEach(([key, val]: any) => {
          series.push({ month: key, sales: Number(val?.amount || 0), received: Number(val?.received || 0) });
        });
      } else {
        // 3) Last resort: try array-like shapes
        const groups = (report && (report.groups || report.report || report.data || report.monthly)) || [];
        if (Array.isArray(groups)) {
          groups.forEach((g: any) => {
            const label = g.label || g.month || g._id || g.name || '';
            const totalSales = g.totalSales ?? g.sales ?? g.amount ?? 0;
            const totalReceived = g.totalReceived ?? g.received ?? g.paymentsTotal ?? 0;
            if (label) {
              series.push({ month: label, sales: Number(totalSales) || 0, received: Number(totalReceived) || 0 });
            }
          });
        }
      }
    }
    return { success: true, data: series };
  }

  // Unified time series: YTD -> monthly; 1m/7d -> daily
  async getTimeSeries(range: '7d' | '1m' | 'ytd'): Promise<{ success: boolean; data: Array<{ month: string; sales: number; received: number }> }> {
    if (range === 'ytd') {
      return this.getMonthlySeries('ytd');
    }

    // Build daily bins for last 7 days or last 30 days (this month window)
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    if (range === '7d') {
      start.setDate(end.getDate() - 6);
    } else {
      // last 30 days rolling window
      start.setDate(end.getDate() - 29);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const report = await this.generateSalesReport({
      startDate: startStr,
      endDate: endStr,
      includePayments: true,
      groupBy: 'none',
      format: 'json'
    });

    const sales: any[] = report?.report?.sales || [];

    // Seed all days in range with zeros
    const dayKey = (d: Date) => d.toISOString().split('T')[0];
    const labels: string[] = [];
    const daily: Record<string, { sales: number; received: number }> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dayKey(d);
      labels.push(key);
      daily[key] = { sales: 0, received: 0 };
    }

    // Aggregate by day
    sales.forEach((s) => {
      const key = (new Date(s.invoiceDate)).toISOString().split('T')[0];
      if (daily[key]) {
        daily[key].sales += Number(s.amount || 0);
        daily[key].received += Number(s.receivedAmount || 0);
      }
    });

    const data = labels.map(key => ({ month: key, sales: daily[key].sales, received: daily[key].received }));
    return { success: true, data };
  }

  async getCustomerSales(customerId: string): Promise<ApiResponse<Sales[]>> {
    const response: AxiosResponse = await this.api.get(`/sales/customer/${customerId}`);
    return response.data;
  }

  // Payment endpoints
  async addPayment(saleId: string, paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> {
    const response: AxiosResponse = await this.api.post(`/sales/${saleId}/payments`, paymentData);
    return response.data;
  }

  async getPaymentHistory(saleId: string): Promise<{ success: boolean; payments?: Payment[]; paymentSummary?: any }> {
    const response: AxiosResponse = await this.api.get(`/sales/${saleId}/payments`);
    return response.data;
  }

  async deletePayment(saleId: string, paymentId: string, password: string): Promise<{ success: boolean; payments?: Payment[]; paymentSummary?: any; sale?: any; message?: string }> {
    const response: AxiosResponse = await this.api.delete(`/sales/${saleId}/payments/${paymentId}`, { data: { password } });
    return response.data;
  }

  // Customer Outstanding endpoints
  async getCustomerOutstanding(filters: {
    search?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    groupBy?: 'customer' | 'product';
    product?: string;
  } = {}): Promise<{ 
    success: boolean; 
    data: any[]; 
    pagination: any; 
    summary: any;
  }> {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse = await this.api.get(`/sales/customer-outstanding?${params.toString()}`);
    return response.data;
  }

  async getUniqueProducts(): Promise<{ 
    success: boolean; 
    data: string[];
  }> {
    const response: AxiosResponse = await this.api.get('/sales/products');
    return response.data;
  }

  async getAutocompleteSuggestions(field: string): Promise<{ 
    success: boolean; 
    suggestions: string[];
  }> {
    const response: AxiosResponse = await this.api.get(`/sales/autocomplete/${field}`);
    return response.data;
  }

  async downloadCustomerOutstandingPDF(filters: {
    search?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    product?: string;
    groupBy?: 'customer' | 'product';
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Use fetch to reduce noisy Axios/XHR console errors when download managers intercept
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const requestUrl = `${base}/sales/customer-outstanding/pdf?${params.toString()}`;
    const resp = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    if (!resp.ok) throw new Error(`Failed to fetch PDF (${resp.status})`);
    const blob = await resp.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `customer-outstanding-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }

  // Daily Ledger endpoints
  async getDailyLedger(date: string): Promise<{ success: boolean; data: { ledger: DailyLedger; entries: LedgerEntry[] } }> {
    const response: AxiosResponse = await this.api.get(`/daily-ledger/${date}`);
    return response.data;
  }

  async createOrUpdateDailyLedger(data: { date: string; opening_cash?: number; opening_bank?: number; notes?: string }): Promise<ApiResponse<DailyLedger>> {
    const response: AxiosResponse = await this.api.post('/daily-ledger', data);
    return response.data;
  }

  async addLedgerEntry(data: { ledger_date: string; type: 'receipt' | 'payment'; mode: 'cash' | 'bank'; description: string; amount: number; reference_type?: string; reference_id?: string; reference_model?: string }): Promise<ApiResponse<LedgerEntry>> {
    const response: AxiosResponse = await this.api.post('/daily-ledger/entries', data);
    return response.data;
  }

  async getLedgerEntries(date: string): Promise<{ success: boolean; data: LedgerEntry[] }> {
    const response: AxiosResponse = await this.api.get(`/daily-ledger/${date}/entries`);
    return response.data;
  }

  async deleteLedgerEntry(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/daily-ledger/entries/${id}`);
    return response.data;
  }

  async closeDailyLedger(date: string): Promise<ApiResponse<DailyLedger>> {
    const response: AxiosResponse = await this.api.put(`/daily-ledger/${date}/close`);
    return response.data;
  }

  async getLedgerSummary(startDate: string, endDate: string): Promise<{ success: boolean; data: LedgerSummary }> {
    const response: AxiosResponse = await this.api.get(`/daily-ledger/summary?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  async exportDailyLedgerPDF(date: string): Promise<void> {
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/daily-ledger/${date}/export/pdf`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-ledger-${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get('/health');
    return response.data;
  }

  // Freight Invoice endpoints
  async getFreightInvoices(
    page = 1, 
    limit = 10, 
    search = '', 
    status = '',
    agent = '',
    startDate = '',
    endDate = '',
    minAmount = '',
    maxAmount = '',
    dueDateFrom = '',
    dueDateTo = ''
  ): Promise<{ success: boolean; data: FreightInvoice[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/freight-invoices', {
      params: { page, limit, search, status, agent, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo }
    });
    return response.data;
  }

  async getFreightInvoice(id: string): Promise<ApiResponse<FreightInvoice>> {
    const response: AxiosResponse = await this.api.get(`/freight-invoices/${id}`);
    return response.data;
  }

  async createFreightInvoice(data: Partial<FreightInvoice>): Promise<ApiResponse<FreightInvoice>> {
    const response: AxiosResponse = await this.api.post('/freight-invoices', data);
    return response.data;
  }

  async updateFreightInvoice(id: string, data: Partial<FreightInvoice>): Promise<ApiResponse<FreightInvoice>> {
    const response: AxiosResponse = await this.api.put(`/freight-invoices/${id}`, data);
    return response.data;
  }

  async addFreightPayment(id: string, paymentData: any): Promise<ApiResponse<FreightInvoice>> {
    const response: AxiosResponse = await this.api.post(`/freight-invoices/${id}/payment`, paymentData);
    return response.data;
  }

  async getFreightPaymentHistory(id: string): Promise<ApiResponse<FreightPayment[]>> {
    const response: AxiosResponse = await this.api.get(`/freight-invoices/${id}/payments`);
    return response.data;
  }

  async deleteFreightInvoice(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/freight-invoices/${id}`);
    return response.data;
  }

  async getFreightInvoiceStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get('/freight-invoices/stats');
    return response.data;
  }

  async printFreightInvoice(id: string): Promise<void> {
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/freight-invoices/${id}/print`;
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freight-invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    xhr.send();
  }

  async downloadFreightReportPDF(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/freight-invoices/report/pdf?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freight-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  async downloadFreightReportCSV(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/freight-invoices/report/csv?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freight-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  // Transport Invoice endpoints
  async getTransportInvoices(
    page = 1, 
    limit = 10, 
    search = '', 
    status = '',
    agent = '',
    startDate = '',
    endDate = '',
    minAmount = '',
    maxAmount = '',
    dueDateFrom = '',
    dueDateTo = ''
  ): Promise<{ success: boolean; data: TransportInvoice[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/transport-invoices', {
      params: { page, limit, search, status, agent, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo }
    });
    return response.data;
  }

  async getTransportInvoice(id: string): Promise<ApiResponse<TransportInvoice>> {
    const response: AxiosResponse = await this.api.get(`/transport-invoices/${id}`);
    return response.data;
  }

  async createTransportInvoice(data: Partial<TransportInvoice>): Promise<ApiResponse<TransportInvoice>> {
    const response: AxiosResponse = await this.api.post('/transport-invoices', data);
    return response.data;
  }

  async updateTransportInvoice(id: string, data: Partial<TransportInvoice>): Promise<ApiResponse<TransportInvoice>> {
    const response: AxiosResponse = await this.api.put(`/transport-invoices/${id}`, data);
    return response.data;
  }

  async addTransportPayment(id: string, paymentData: any): Promise<ApiResponse<TransportInvoice>> {
    const response: AxiosResponse = await this.api.post(`/transport-invoices/${id}/payment`, paymentData);
    return response.data;
  }

  async getTransportPaymentHistory(id: string): Promise<ApiResponse<TransportPayment[]>> {
    const response: AxiosResponse = await this.api.get(`/transport-invoices/${id}/payments`);
    return response.data;
  }

  async deleteTransportInvoice(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/transport-invoices/${id}`);
    return response.data;
  }

  async getTransportInvoiceStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get('/transport-invoices/stats');
    return response.data;
  }

  async printTransportInvoice(id: string): Promise<void> {
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/transport-invoices/${id}/print`;
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transport-invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    xhr.send();
  }

  async downloadTransportReportPDF(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/transport-invoices/report/pdf?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transport-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  async downloadTransportReportCSV(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/transport-invoices/report/csv?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transport-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  // Dubai Transport Invoice endpoints
  async getDubaiTransportInvoices(
    page = 1, 
    limit = 10, 
    search = '', 
    status = '',
    agent = '',
    startDate = '',
    endDate = '',
    minAmount = '',
    maxAmount = '',
    dueDateFrom = '',
    dueDateTo = ''
  ): Promise<{ success: boolean; data: DubaiTransportInvoice[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/dubai-transport-invoices', {
      params: { page, limit, search, status, agent, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo }
    });
    return response.data;
  }

  async getDubaiTransportInvoice(id: string): Promise<ApiResponse<DubaiTransportInvoice>> {
    const response: AxiosResponse = await this.api.get(`/dubai-transport-invoices/${id}`);
    return response.data;
  }

  async createDubaiTransportInvoice(data: Partial<DubaiTransportInvoice>): Promise<ApiResponse<DubaiTransportInvoice>> {
    const response: AxiosResponse = await this.api.post('/dubai-transport-invoices', data);
    return response.data;
  }

  async updateDubaiTransportInvoice(id: string, data: Partial<DubaiTransportInvoice>): Promise<ApiResponse<DubaiTransportInvoice>> {
    const response: AxiosResponse = await this.api.put(`/dubai-transport-invoices/${id}`, data);
    return response.data;
  }

  async addDubaiTransportPayment(id: string, paymentData: any): Promise<ApiResponse<DubaiTransportInvoice>> {
    const response: AxiosResponse = await this.api.post(`/dubai-transport-invoices/${id}/payments`, paymentData);
    return response.data;
  }

  async getDubaiTransportPaymentHistory(id: string): Promise<ApiResponse<DubaiTransportPayment[]>> {
    const response: AxiosResponse = await this.api.get(`/dubai-transport-invoices/${id}/payments`);
    return response.data;
  }

  async deleteDubaiTransportInvoice(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/dubai-transport-invoices/${id}`);
    return response.data;
  }

  async getDubaiTransportInvoiceStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get('/dubai-transport-invoices/stats');
    return response.data;
  }

  async printDubaiTransportInvoice(id: string): Promise<void> {
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/dubai-transport-invoices/${id}/print`;
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubai-transport-invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    xhr.send();
  }

  async downloadDubaiTransportReportPDF(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/dubai-transport-invoices/report/pdf?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubai-transport-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  async downloadDubaiTransportReportCSV(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/dubai-transport-invoices/report/csv?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubai-transport-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  // Dubai Clearance Invoice endpoints
  async getDubaiClearanceInvoices(
    page = 1, 
    limit = 10, 
    search = '', 
    status = '',
    agent = '',
    startDate = '',
    endDate = '',
    minAmount = '',
    maxAmount = '',
    dueDateFrom = '',
    dueDateTo = ''
  ): Promise<{ success: boolean; data: DubaiClearanceInvoice[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/dubai-clearance-invoices', {
      params: { page, limit, search, status, agent, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo }
    });
    return response.data;
  }

  async getDubaiClearanceInvoice(id: string): Promise<ApiResponse<DubaiClearanceInvoice>> {
    const response: AxiosResponse = await this.api.get(`/dubai-clearance-invoices/${id}`);
    return response.data;
  }

  async createDubaiClearanceInvoice(data: Partial<DubaiClearanceInvoice>): Promise<ApiResponse<DubaiClearanceInvoice>> {
    const response: AxiosResponse = await this.api.post('/dubai-clearance-invoices', data);
    return response.data;
  }

  async updateDubaiClearanceInvoice(id: string, data: Partial<DubaiClearanceInvoice>): Promise<ApiResponse<DubaiClearanceInvoice>> {
    const response: AxiosResponse = await this.api.put(`/dubai-clearance-invoices/${id}`, data);
    return response.data;
  }

  async addDubaiClearancePayment(id: string, paymentData: any): Promise<ApiResponse<DubaiClearanceInvoice>> {
    const response: AxiosResponse = await this.api.post(`/dubai-clearance-invoices/${id}/payments`, paymentData);
    return response.data;
  }

  async getDubaiClearancePaymentHistory(id: string): Promise<ApiResponse<DubaiClearancePayment[]>> {
    const response: AxiosResponse = await this.api.get(`/dubai-clearance-invoices/${id}/payments`);
    return response.data;
  }

  async deleteDubaiClearanceInvoice(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/dubai-clearance-invoices/${id}`);
    return response.data;
  }

  async getDubaiClearanceInvoiceStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get('/dubai-clearance-invoices/stats');
    return response.data;
  }

  async printDubaiClearanceInvoice(id: string): Promise<void> {
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/dubai-clearance-invoices/${id}/print`;
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubai-clearance-invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    xhr.send();
  }

  async downloadDubaiClearanceReportPDF(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/dubai-clearance-invoices/report/pdf?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubai-clearance-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  async downloadDubaiClearanceReportCSV(options: {
    startDate?: string;
    endDate?: string;
    agent?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    groupBy?: 'none' | 'agent' | 'status' | 'month';
    includePayments?: boolean;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const url = `${base}/dubai-clearance-invoices/report/csv?${params.toString()}`;
    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubai-clearance-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  }

  // Container Statement endpoints
  async getContainerStatement(containerNo: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.get(`/container-statements/${containerNo}`);
    return response.data;
  }

  async downloadContainerStatementPDF(containerNo: string): Promise<void> {
    // Use fetch to avoid Axios/XHR CORS preflight warnings and extension interception noise
    const base = (this.api.defaults.baseURL || '').replace(/\/+$/, '');
    const requestUrl = `${base}/container-statements/${encodeURIComponent(containerNo)}/pdf`;
    const resp = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    if (!resp.ok) throw new Error(`Failed to fetch PDF (${resp.status})`);
    const response = { data: await resp.blob() } as any;
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `container-statement-${containerNo}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }

  async createContainerStatement(data: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.post('/container-statements', data);
    return response.data;
  }

  async updateContainerStatement(id: string, data: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.put(`/container-statements/${id}`, data);
    return response.data;
  }

  async addContainerStatementExpense(id: string, expenseData: { description: string; amount: number }): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.post(`/container-statements/${id}/expenses`, expenseData);
    return response.data;
  }

  async removeContainerStatementExpense(id: string, expenseId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.delete(`/container-statements/${id}/expenses/${expenseId}`);
    return response.data;
  }

  async getAllContainerStatements(page = 1, limit = 10, search = ''): Promise<{ success: boolean; data: any[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/container-statements', {
      params: { page, limit, search }
    });
    return response.data;
  }

  async deleteContainerStatement(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse = await this.api.delete(`/container-statements/${id}`);
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;