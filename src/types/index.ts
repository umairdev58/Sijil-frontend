export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  position: string;
  trn?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  ename: string;
  uname?: string;
  email?: string;
  number?: string;
  trn?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface CustomerQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | string;
  fetchAll?: boolean;
}

export interface Supplier {
  _id: string;
  ename: string;
  uname?: string;
  email?: string;
  number?: string;
  marka?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface Sales {
  _id: string;
  customer: string;
  containerNo: string;
  supplier: string;
  invoiceDate: string;
  invoiceNumber: string;
  product: string;
  marka: string;
  description: string;
  return: number;
  quantity: number;
  rate: number;
  vatAmount: number;
  vatPercentage: number;
  discount: number;
  amount: number;
  dueDate: string;
  receivedAmount: number;
  outstandingAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  lastPaymentDate?: string;
  createdBy: string | User;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  saleId: string;
  amount: number;
  receivedBy: string | User;
  paymentType: 'full' | 'partial';
  paymentMethod: string;
  reference?: string;
  notes?: string;
  paymentDate: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  _id: string;
  containerNo: string;
  product: string;
  quantity: number;
  rate: number; // PKR per unit
  transport: number;
  freight: number;
  eForm: number;
  miscellaneous: number;
  transferRate: number; // PKR per AED
  subtotalPKR: number;
  totalPKR: number;
  totalAED: number;
  notes?: string;
  createdBy: string | User;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLedger {
  _id: string;
  date: string;
  opening_cash: number;
  opening_bank: number;
  receipts_cash: number;
  receipts_bank: number;
  payments_cash: number;
  payments_bank: number;
  auto_sales_inflow: number;
  notes?: string;
  closing_cash: number;
  closing_bank: number;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  _id: string;
  ledger_date: string;
  type: 'receipt' | 'payment';
  mode: 'cash' | 'bank';
  description: string;
  amount: number;
  reference_type: 'manual' | 'sales_payment' | 'purchase_payment';
  reference_id?: string;
  reference_model?: 'Sales' | 'Purchase';
  created_at: string;
  updated_at: string;
}

export interface LedgerSummary {
  totalDays: number;
  totalOpeningCash: number;
  totalOpeningBank: number;
  totalReceiptsCash: number;
  totalReceiptsBank: number;
  totalPaymentsCash: number;
  totalPaymentsBank: number;
  totalAutoSalesInflow: number;
  totalClosingCash: number;
  totalClosingBank: number;
  ledgers: DailyLedger[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SaleApiResponse {
  success: boolean;
  sale?: Sales;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalCustomers?: number;
  };
}

export interface CustomerOutstanding {
  _id: string;
  customerName: string;
  totalOutstanding: number;
  totalAmount: number;
  totalReceived: number;
  invoiceCount: number;
  unpaidInvoices: number;
  partiallyPaidInvoices: number;
  overdueInvoices: number;
  lastPaymentDate: string | null;
  oldestDueDate: string;
  status: 'unpaid' | 'partially_paid' | 'overdue';
}

export interface ProductOutstanding {
  _id: string;
  productName: string;
  totalOutstanding: number;
  totalAmount: number;
  totalReceived: number;
  totalInvoices: number;
  totalCustomers: number;
  customers: CustomerOutstanding[];
}

export type OutstandingData = CustomerOutstanding | ProductOutstanding;

export interface FreightInvoice {
  _id: string;
  invoice_number: string;
  amount_pkr: number;
  conversion_rate: number;
  amount_aed: number;
  agent: string;
  invoice_date: string;
  due_date: string;
  paid_amount_pkr: number;
  paid_amount_aed: number;
  outstanding_amount_pkr: number;
  outstanding_amount_aed: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  last_payment_date?: string;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
  payments?: FreightPayment[];
}

export interface TransportInvoice {
  _id: string;
  invoice_number: string;
  amount_pkr: number;
  conversion_rate: number;
  amount_aed: number;
  agent: string;
  invoice_date: string;
  due_date: string;
  paid_amount_pkr: number;
  paid_amount_aed: number;
  outstanding_amount_pkr: number;
  outstanding_amount_aed: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  last_payment_date?: string;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
  payments?: TransportPayment[];
}

export interface FreightPayment {
  _id: string;
  freightInvoiceId: string;
  amount: number;
  receivedBy: string | User;
  paymentType: 'partial' | 'full';
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportPayment {
  _id: string;
  transportInvoiceId: string;
  amount: number;
  receivedBy: string | User;
  paymentType: 'partial' | 'full';
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DubaiTransportInvoice {
  _id: string;
  invoice_number: string;
  amount_pkr: number;
  conversion_rate: number;
  amount_aed: number;
  agent: string;
  invoice_date: string;
  due_date: string;
  paid_amount_pkr: number;
  paid_amount_aed: number;
  outstanding_amount_pkr: number;
  outstanding_amount_aed: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  last_payment_date?: string;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
  payments?: DubaiTransportPayment[];
}

export interface DubaiClearanceInvoice {
  _id: string;
  invoice_number: string;
  amount_pkr: number;
  conversion_rate: number;
  amount_aed: number;
  agent: string;
  invoice_date: string;
  due_date: string;
  paid_amount_pkr: number;
  paid_amount_aed: number;
  outstanding_amount_pkr: number;
  outstanding_amount_aed: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  last_payment_date?: string;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
  payments?: DubaiClearancePayment[];
}

export interface DubaiTransportPayment {
  _id: string;
  dubaiTransportInvoiceId: string;
  amount: number;
  receivedBy: string | User;
  paymentType: 'partial' | 'full';
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DubaiClearancePayment {
  _id: string;
  dubaiClearanceInvoiceId: string;
  amount: number;
  receivedBy: string | User;
  paymentType: 'partial' | 'full';
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContainerStatementProduct {
  srNo: number;
  product: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ContainerStatementExpense {
  _id?: string;
  description: string;
  amount: number;
  isAutoGenerated?: boolean;
}

export interface ContainerStatement {
  _id: string;
  containerNo: string;
  products: ContainerStatementProduct[];
  expenses: ContainerStatementExpense[];
  grossSale: number;
  totalExpenses: number;
  netSale: number;
  totalQuantity: number;
  createdBy: string | User;
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
} 