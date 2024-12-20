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

    const currentYear = new Date().getFullYear();
    const selectedYear = year ? parseInt(year as string, 10) : currentYear;

    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31, 23, 59, 59);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid financial year provided" });
    }

    const [
      totalOrders,
      totalOrderValue,
      ordersGroupedByMonth,
      orderTotalsByStatus,
    ] = await Promise.all([
      prisma.orders.count({
        where: { orderDate: { gte: start, lte: end } },
      }),
      prisma.orders.aggregate({
        _sum: { orderValue: true },
        where: {
          orderDate: { gte: start, lte: end },
          orderStatus: { not: OrderStatus.Cancelled },
        },
      }),
      prisma.orders.groupBy({
        by: ["orderDate"],
        _sum: { orderValue: true },
        _count: true,
        where: {
          orderDate: { gte: start, lte: end },
          orderStatus: { in: [OrderStatus.Active, OrderStatus.Completed] },
        },
      }),
      prisma.orders.groupBy({
        by: ["orderStatus"],
        _sum: { orderValue: true },
        _count: true,
        where: { orderDate: { gte: start, lte: end } },
      }),
    ]);

    const graphData: {
      label: string;
      value: number;
      count: number;
    }[] = [];

    const monthlyData = new Map<string, { total: number; count: number }>();
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(0, month).toLocaleString("en-US", {
        month: "short",
      });
      monthlyData.set(monthName, { total: 0, count: 0 });
    }

    ordersGroupedByMonth.forEach((group) => {
      const monthName = new Date(group.orderDate).toLocaleString("en-US", {
        month: "short",
      });
      const currentData = monthlyData.get(monthName) || { total: 0, count: 0 };
      monthlyData.set(monthName, {
        total: parseFloat(
          (currentData.total + (group._sum.orderValue || 0)).toFixed(2)
        ),
        count: currentData.count + (group._count || 0),
      });
    });

    monthlyData.forEach((data, key) => {
      graphData.push({
        label: key,
        count: data.count,
        value: data.total,
      });
    });

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
