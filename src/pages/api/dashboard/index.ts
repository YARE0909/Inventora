// pages/api/dashboard.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { startDate, endDate } = req.query;

    // Get the current date
    const currentDate = new Date();

    // If no dates are provided, default to the current month
    const start = startDate
      ? new Date(startDate as string)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of the current month
    const end = endDate
      ? new Date(endDate as string)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // End of the current month

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date range provided" });
    }

    // Fetch data
    const [
      totalOrders,
      totalInvoices,
      totalPayments,
      ordersByStatus,
      orderValueSum,
      invoicesSummary,
      paymentsSummary,
      ordersOverTime,
      invoicesOverTime,
      paymentsOverTime,
    ] = await Promise.all([
      // Total orders count
      prisma.orders.count({
        where: { orderDate: { gte: start, lte: end } },
      }),
      // Total invoices count
      prisma.invoices.count({
        where: { invoiceDate: { gte: start, lte: end } },
      }),
      // Total payments count
      prisma.payments.count({
        where: { paymentDate: { gte: start, lte: end } },
      }),
      // Orders grouped by status
      prisma.orders.groupBy({
        by: ["orderStatus"],
        _count: true,
        where: { orderDate: { gte: start, lte: end } },
      }),
      // Sum of order values
      prisma.orders.aggregate({
        _sum: { orderValue: true },
        where: { orderDate: { gte: start, lte: end } },
      }),
      // Invoice summaries
      prisma.invoices.aggregate({
        _sum: { invoiceAmount: true, reconciledInvoiceAmount: true },
        where: { invoiceDate: { gte: start, lte: end } },
      }),
      // Payments summaries
      prisma.payments.aggregate({
        _sum: { paymentAmount: true },
        where: { paymentDate: { gte: start, lte: end } },
      }),
      // Orders over time (grouped by month)
      prisma.orders.groupBy({
        by: ["orderDate"],
        _count: true,
        where: { orderDate: { gte: start, lte: end } },
        orderBy: { orderDate: "asc" },
      }),
      // Invoices over time (grouped by month)
      prisma.invoices.groupBy({
        by: ["invoiceDate"],
        _sum: { invoiceAmount: true },
        where: { invoiceDate: { gte: start, lte: end } },
        orderBy: { invoiceDate: "asc" },
      }),
      // Payments over time (grouped by month)
      prisma.payments.groupBy({
        by: ["paymentDate"],
        _sum: { paymentAmount: true },
        where: { paymentDate: { gte: start, lte: end } },
        orderBy: { paymentDate: "asc" },
      }),
    ]);

    // Prepare graph data
    const graphData = {
      ordersByStatus: ordersByStatus.map((status) => ({
        status: status.orderStatus,
        count: status._count,
      })),
      ordersOverTime: ordersOverTime.map((order) => ({
        month: `${order.orderDate.getFullYear()}-${
          order.orderDate.getMonth() + 1
        }`,
        count: order._count,
      })),
      invoicesOverTime: invoicesOverTime.map((invoice) => ({
        month: `${invoice.invoiceDate.getFullYear()}-${
          invoice.invoiceDate.getMonth() + 1
        }`,
        totalAmount: invoice._sum.invoiceAmount || 0,
      })),
      paymentsOverTime: paymentsOverTime.map((payment) => ({
        month: `${payment.paymentDate.getFullYear()}-${
          payment.paymentDate.getMonth() + 1
        }`,
        totalAmount: payment._sum.paymentAmount || 0,
      })),
    };

    // Prepare the response
    const responseData = {
      totalOrders,
      totalInvoices,
      totalPayments,
      orderValueSum: orderValueSum._sum.orderValue || 0,
      invoicesSummary: {
        totalInvoiceAmount: invoicesSummary._sum.invoiceAmount || 0,
        reconciledInvoiceAmount:
          invoicesSummary._sum.reconciledInvoiceAmount || 0,
      },
      paymentsSummary: {
        totalPaymentAmount: paymentsSummary._sum.paymentAmount || 0,
      },
      graphData,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
