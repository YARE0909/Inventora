export interface Customer {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  createdOn?: Date;
  orders?: Order[];
  invoices?: Invoice[];
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: Date;
  proformaInvoice: string;
  proformaInvoiceDate: Date;
  orderValue: number;
  orderCount: number;
  orderDeliveryDate: Date;
  orderStatus: OrderStatus;
  orderComments?: string;
  createdOn: Date;
  customerId: string;
  customer: Customer;
  orderItems: OrderItem[];
  invoices: Invoice[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  gstCodeId: string;
  createdOn: Date;
  gstCode: GstCode;
  orderItems: OrderItem[];
  invoiceItems: InvoiceItem[];
}

export interface Gst {
  id?: string;
  taxPercentage: number;
  isActive: boolean;
  createdOn?: Date;
  gstCodes?: GstCode[];
}

export interface GstCode {
  id?: string;
  code: string;
  name: string;
  effectiveStartDate: Date;
  effectiveEndDate?: Date;
  isActive: boolean;
  createdOn?: Date;
  gstId: string;
  gst?: Gst;
  products?: Product[];
  invoiceItems?: InvoiceItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdOn: Date;
  order: Order;
  product: Product;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceAmount: number;
  adjustedInvoiceAmount: number;
  reconciledInvoiceAmount: number;
  packagingChargesAmount: number;
  shippingChargesAmount: number;
  discountAmount: number;
  customerGst: string;
  invoiceComments?: string;
  createdOn: Date;
  order: Order;
  customer: Customer;
  invoiceItems: InvoiceItem[];
  payments: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  itemCode: string;
  itemQuantity: number;
  itemRate: number;
  invoiceAmount: number;
  gstCodeId: string;
  gstCode: GstCode;
  createdOn: Date;
  invoice: Invoice;
  product: Product;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentMode: string;
  paymentDate: Date;
  paymentAmount: number;
  paymentReferenceId: string;
  paymentDetails?: string;
  paymentComments?: string;
  paymentStatus: PaymentStatus;
  createdOn: Date;
  invoice: Invoice;
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
