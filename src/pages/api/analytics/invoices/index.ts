/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { year } = req.query;

    const currentYear = new Date().getFullYear();
    const selectedYear = year ? parseInt(year as string, 10) : currentYear;

    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31, 23, 59, 59);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid financial year provided" });
    }

    const totalInvoices = await prisma.invoices.count({
      where: { invoiceDate: { gte: start, lte: end } },
    });

    const totalInvoiceValue = await prisma.invoices.aggregate({
      _sum: { invoiceAmount: true },
      where: { invoiceDate: { gte: start, lte: end } },
    });

    const invoicesGroupedByMonth = await prisma.invoices.findMany({
      select: {
        invoiceDate: true,
        invoiceAmount: true,
      },
      where: { invoiceDate: { gte: start, lte: end } },
    });

    const invoiceTotalsByStatus = await prisma.invoices.groupBy({
      by: ["id"], // Group by `id` since MongoDB does not support nested groupBy
      _sum: { invoiceAmount: true },
      _count: true,
      where: {
        invoiceDate: { gte: start, lte: end },
      },
    });

    // Process graph data for monthly aggregation
    const graphData: any = [];
    const monthlyData = new Map<string, { total: number; count: number }>();
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(0, month).toLocaleString("en-US", {
        month: "short",
      });
      monthlyData.set(monthName, { total: 0, count: 0 });
    }

    invoicesGroupedByMonth.forEach((invoice) => {
      const monthName = new Date(invoice.invoiceDate).toLocaleString("en-US", {
        month: "short",
      });
      const currentData = monthlyData.get(monthName) || { total: 0, count: 0 };
      monthlyData.set(monthName, {
        total: parseFloat(
          (currentData.total + (invoice.invoiceAmount || 0)).toFixed(2)
        ),
        count: currentData.count + 1,
      });
    });

    monthlyData.forEach((data, key) => {
      graphData.push({
        label: key,
        count: data.count,
        value: data.total,
      });
    });

    // Process status totals
    const statusTotals = {
      pendingInvoiceTotal: "0.00",
      pendingInvoiceCount: 0,
      partiallyPaidInvoiceTotal: "0.00",
      partiallyPaidInvoiceCount: 0,
      paidInvoiceTotal: "0.00",
      paidInvoiceCount: 0,
    };

    for (const group of invoiceTotalsByStatus) {
      const totalValue = group._sum.invoiceAmount
        ? group._sum.invoiceAmount.toFixed(2)
        : "0.00";
      const count = group._count || 0;

      // Assuming we map paymentStatus separately due to limitations in Prisma MongoDB
      const paymentStatus = await prisma.payments.findFirst({
        where: { invoiceId: group.id },
        select: { paymentStatus: true },
      });

      if (!paymentStatus) continue;

      switch (paymentStatus.paymentStatus) {
        case PaymentStatus.Pending:
          statusTotals.pendingInvoiceTotal = (
            parseFloat(statusTotals.pendingInvoiceTotal) +
            parseFloat(totalValue)
          ).toFixed(2);
          statusTotals.pendingInvoiceCount += count;
          break;
        case PaymentStatus.PartiallyPaid:
          statusTotals.partiallyPaidInvoiceTotal = (
            parseFloat(statusTotals.partiallyPaidInvoiceTotal) +
            parseFloat(totalValue)
          ).toFixed(2);
          statusTotals.partiallyPaidInvoiceCount += count;
          break;
        case PaymentStatus.Paid:
          statusTotals.paidInvoiceTotal = (
            parseFloat(statusTotals.paidInvoiceTotal) + parseFloat(totalValue)
          ).toFixed(2);
          statusTotals.paidInvoiceCount += count;
          break;
      }
    }

    const responseData = {
      invoices: {
        count: totalInvoices,
        totalValue: totalInvoiceValue._sum.invoiceAmount
          ? totalInvoiceValue._sum.invoiceAmount.toFixed(2)
          : "0.00",
        ...statusTotals,
        graphData,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
