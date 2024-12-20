import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, OrderStatus } from "@prisma/client";

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

    // Get the current year
    const currentYear = new Date().getFullYear();

    // If a year is provided in the query, use that, otherwise default to the current year
    const selectedYear = year ? parseInt(year as string, 10) : currentYear;

    // Start of the year (January 1st)
    const start = new Date(selectedYear, 0, 1); // January 1st of the selected year
    // End of the year (December 31st, 23:59:59)
    const end = new Date(selectedYear, 11, 31, 23, 59, 59); // December 31st of the selected year

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid financial year provided" });
    }

    // Fetch order data
    const [
      totalOrders,
      totalOrderValue,
      ordersGroupedByMonth,
      orderTotalsByStatus,
    ] = await Promise.all([
      // Total orders count
      prisma.orders.count({
        where: { orderDate: { gte: start, lte: end } },
      }),
      // Total sum of order values excluding cancelled
      prisma.orders.aggregate({
        _sum: { orderValue: true },
        where: {
          orderDate: { gte: start, lte: end },
          orderStatus: { not: OrderStatus.Cancelled },
        },
      }),
      // Orders grouped by month and filtered by completed and active statuses
      prisma.orders.groupBy({
        by: ["orderDate"],
        _sum: { orderValue: true },
        where: {
          orderDate: { gte: start, lte: end },
          orderStatus: { in: [OrderStatus.Active, OrderStatus.Completed] },
        },
      }),
      // Total amounts and counts grouped by status
      prisma.orders.groupBy({
        by: ["orderStatus"],
        _sum: { orderValue: true },
        _count: true,
        where: { orderDate: { gte: start, lte: end } },
      }),
    ]);

    // Prepare graph data
    const graphData: {
      label: string;
      value: number;
    }[] = [];

    // Initialize a map for monthly totals
    const monthlyTotals = new Map<string, number>();
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(0, month).toLocaleString("en-US", {
        month: "short",
      });
      monthlyTotals.set(monthName, 0);
    }

    // Populate monthly totals with grouped data
    ordersGroupedByMonth.forEach((group) => {
      const monthName = new Date(group.orderDate).toLocaleString("en-US", {
        month: "short",
      });
      const currentTotal = monthlyTotals.get(monthName) || 0;
      monthlyTotals.set(
        monthName,
        parseFloat((currentTotal + (group._sum.orderValue || 0)).toFixed(2))
      );
    });

    // Convert the map into an array for graph data
    monthlyTotals.forEach((value, key) => {
      graphData.push({
        label: key,
        value,
      });
    });

    // Calculate totals for each status
    const statusTotals: {
      activeOrderTotal: string;
      activeOrderCount: number;
      onHoldOrderTotal: string;
      onHoldOrderCount: number;
      completedOrderTotal: string;
      completedOrderCount: number;
      cancelledOrderTotal: string;
      cancelledOrderCount: number;
    } = {
      activeOrderTotal: "0.00",
      activeOrderCount: 0,
      onHoldOrderTotal: "0.00",
      onHoldOrderCount: 0,
      completedOrderTotal: "0.00",
      completedOrderCount: 0,
      cancelledOrderTotal: "0.00",
      cancelledOrderCount: 0,
    };

    orderTotalsByStatus.forEach((group) => {
      const totalValue = group._sum.orderValue
        ? group._sum.orderValue.toFixed(2)
        : "0.00";
      const count = group._count || 0;

      switch (group.orderStatus) {
        case OrderStatus.Active:
          statusTotals.activeOrderTotal = totalValue;
          statusTotals.activeOrderCount = count;
          break;
        case OrderStatus.OnHold:
          statusTotals.onHoldOrderTotal = totalValue;
          statusTotals.onHoldOrderCount = count;
          break;
        case OrderStatus.Completed:
          statusTotals.completedOrderTotal = totalValue;
          statusTotals.completedOrderCount = count;
          break;
        case OrderStatus.Cancelled:
          statusTotals.cancelledOrderTotal = totalValue;
          statusTotals.cancelledOrderCount = count;
          break;
      }
    });

    // Final response data format
    const responseData = {
      orders: {
        count: totalOrders,
        totalValue: totalOrderValue._sum.orderValue
          ? totalOrderValue._sum.orderValue.toFixed(2)
          : "0.00",
        ...statusTotals,
        graphData,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching orders data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
