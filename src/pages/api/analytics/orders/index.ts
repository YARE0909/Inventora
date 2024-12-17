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

    const { startDate, endDate } = req.query;

    // Get the current date
    const currentDate = new Date();

    // Default date range to the current month
    const start = startDate
      ? new Date(startDate as string)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date range provided" });
    }

    // Fetch order data
    const [
      totalOrders,
      totalOrderValue,
      ordersGroupedByDateAndStatus,
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
      // Orders grouped by date and status
      prisma.orders.groupBy({
        by: ["orderDate", "orderStatus"],
        _count: true,
        where: { orderDate: { gte: start, lte: end } },
        orderBy: { orderDate: "asc" },
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
      active: number;
      onHold: number;
      completed: number;
      cancelled: number;
    }[] = [];

    // Group data by date and consolidate statuses
    const graphDataMap = new Map<
      string,
      { active: number; onHold: number; completed: number; cancelled: number }
    >();

    ordersGroupedByDateAndStatus.forEach((group) => {
      const dateLabel = group.orderDate.toISOString().split("T")[0];

      if (!graphDataMap.has(dateLabel)) {
        graphDataMap.set(dateLabel, {
          active: 0,
          onHold: 0,
          completed: 0,
          cancelled: 0,
        });
      }

      const currentStatusCounts = graphDataMap.get(dateLabel);
      switch (group.orderStatus) {
        case OrderStatus.Active:
          currentStatusCounts!.active += group._count;
          break;
        case OrderStatus.OnHold:
          currentStatusCounts!.onHold += group._count;
          break;
        case OrderStatus.Completed:
          currentStatusCounts!.completed += group._count;
          break;
        case OrderStatus.Cancelled:
          currentStatusCounts!.cancelled += group._count;
          break;
      }
      graphDataMap.set(dateLabel, currentStatusCounts!);
    });

    // Convert the map into an array
    graphDataMap.forEach((value, key) => {
      graphData.push({
        label: key,
        active: value.active,
        onHold: value.onHold,
        completed: value.completed,
        cancelled: value.cancelled,
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
