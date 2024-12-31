export interface Customer {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  customerGST?: string;
  createdOn?: Date | undefined;
  orders?: Order[];
  invoices?: Invoice[];
}

export interface Order {
  id?: string;
  orderNumber?: string;
  orderDate: Date | undefined | undefined;
  proformaInvoice: string;
  proformaInvoiceDate: Date | undefined | undefined;
  orderValue: number;
  orderCount: number;
  orderDeliveryDate: Date | undefined | undefined;
  orderStatus: OrderStatus;
  orderComments?: string;
  createdOn?: Date | undefined;
  customerId?: string;
  customer?: Customer;
  orderItems?: OrderItem[];
  invoices?: Invoice[];
  orderAdvanceDetails?: OrderAdvanceDetail[];
}

export interface OrderAdvanceDetail {
  id?: string;
  orderId?: string;
  orderAdvanceAmount: number;
  orderAdvanceDate: Date | undefined;
  orderAdvancePaymentDetails: string;
  orderAdvanceStatus: PaymentStatus | undefined;
  orderAdvanceComments?: string;
  createdOn?: Date | undefined;
  order?: Order;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  unitPrice?: number;
  gstCodeId: string;
  createdOn?: Date | undefined;
  gstCode?: GstCode;
  quantity?: number;
  orderItems?: OrderItem[];
  invoiceItems?: InvoiceItem[];
}

export interface Gst {
  id?: string;
  taxPercentage: number;
  isActive: boolean;
  createdOn?: Date | undefined;
  gstCodes?: GstCode[];
}

export interface GstCode {
  id?: string;
  code: string;
  name: string;
  effectiveStartDate: Date | string | undefined;
  effectiveEndDate?: Date | string | undefined;
  isActive: boolean;
  createdOn?: Date | undefined;
  gstId: string;
  gst?: Gst;
  products?: Product[];
  invoiceItems?: InvoiceItem[];
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  serviceId?: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount?: number;
  createdOn?: Date | undefined;
  order?: Order;
  product?: Product;
  gstCodeId?: string;
  gstCode?: GstCode;
}

export interface Invoice {
  id?: string;
  orderId: string;
  customerId: string;
  invoiceNumber?: string;
  invoiceDate: Date | undefined;
  invoiceAmount: number;
  adjustedInvoiceAmount: number;
  reconciledInvoiceAmount: number;
  reconcileComments: string;
  discountAmount: number;
  customerGst: string;
  invoiceComments?: string;
  createdOn?: Date | undefined;
  order?: Order;
  customer?: Customer;
  invoiceItems?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  serviceId?: string;
  productId?: string;
  itemQuantity: number;
  itemRate: number;
  invoiceAmount?: number;
  gstCodeId: string;
  createdOn?: Date | undefined;
  gstCode?: GstCode;
  invoice?: Invoice;
  product?: Product;
  service?: Service;
}

export interface Service {
  id?: string;
  name: string;
  gstCodeId: string;
  effectiveStartDate: Date | string | undefined;
  effectiveEndDate?: Date | string | undefined;
  isActive: boolean;
  createdOn?: Date | undefined;
  gstCode?: GstCode;
  InvoiceItems?: InvoiceItem[];
}

export interface Payment {
  id?: string;
  invoiceId?: string;
  paymentMode: string;
  paymentDate: Date | undefined;
  paymentAmount: number;
  paymentReferenceId: string;
  paymentDetails?: string;
  paymentComments?: string;
  paymentStatus?: PaymentStatus;
  createdOn?: Date | undefined;
  invoice?: Invoice;
}

export enum OrderStatus {
  Active = "Active",
  OnHold = "OnHold",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  Pending = "Pending",
  Paid = "Paid",
  PartiallyPaid = "PartiallyPaid",
}
