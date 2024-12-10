/* eslint-disable  @typescript-eslint/no-explicit-any @typescript-eslint/no-unused-vars */

import prisma from "@/utils/prismaClient";
import generateRandomString from "@/utils/randomStringGenerator";
import { Prisma, OrderStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        // Get the query parameters
        const { status, clientName, orderNumber, startDate, endDate } =
          req.query;

        // Build the filter object based on provided query parameters
        const filter: {
          orderStatus?: OrderStatus; // Enum value instead of string
          customerName?: { contains: string; mode: Prisma.QueryMode };
          orderNumber?: { contains: string; mode: Prisma.QueryMode };
          orderDate?: { gte?: Date; lte?: Date }; // Date range filter
        } = {};

        // If 'status' is provided, add it to the filter
        if (status) {
          filter.orderStatus = OrderStatus[status as keyof typeof OrderStatus]; // Use the enum value
        }

        // If 'clientName' is provided, add it to the filter
        if (clientName) {
          filter.customerName = {
            contains: String(clientName), // Use 'contains' for a case-insensitive search
            mode: Prisma.QueryMode.insensitive, // Use the correct QueryMode enum value
          };
        }

        // If 'orderNumber' is provided, add it to the filter
        if (orderNumber) {
          filter.orderNumber = {
            contains: String(orderNumber), // Use 'contains' for case-insensitive search
            mode: Prisma.QueryMode.insensitive,
          };
        }

        // If a date range is provided, add the 'orderDate' filter
        if (startDate && endDate) {
          filter.orderDate = {
            gte: new Date(startDate as string), // Greater than or equal to startDate
            lte: new Date(endDate as string), // Less than or equal to endDate
          };
        } else if (startDate) {
          filter.orderDate = {
            gte: new Date(startDate as string), // Only start date pr Fovided
          };
        } else if (endDate) {
          filter.orderDate = {
            lte: new Date(endDate as string), // Only end date provided
          };
        }

        // Fetch orders based on the filter
        const orders = await prisma.orders.findMany({
          where: filter,
        });

        return res.status(200).json(orders);

      case "POST":
        const {
          orderDate,
          customerName,
          contactPerson,
          proformaInvoice,
          proformaInvoiceDate,
          orderValue,
          orderCount,
          orderDeliveryDate,
          orderStatus,
          orderComments,
          createdBy,
        } = req.body;

        const newOrder = await prisma.orders.create({
          data: {
            orderNumber: generateRandomString(6),
            orderDate: new Date(orderDate),
            customerName,
            contactPerson,
            proformaInvoice,
            proformaInvoiceDate: new Date(proformaInvoiceDate),
            orderValue: parseFloat(orderValue),
            orderCount: parseInt(orderCount, 10),
            orderDeliveryDate: new Date(orderDeliveryDate),
            orderStatus, // Make sure orderStatus matches the enum type
            orderComments,
            createdBy, // TODO: Update this with the actual user ID
            createdOn: new Date(),
          },
        });

        return res.status(201).json(newOrder);

      case "PUT":
        const { id, ...updateData } = req.body;

        const updatedOrder = await prisma.orders.update({
          where: { id },
          data: {
            ...updateData,
            modifiedOn: new Date(),
          },
        });

        return res.status(200).json(updatedOrder);

      case "DELETE":
        if (!req.query.id) {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.orders.delete({
          where: { id: String(req.query.id) },
        });

        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.log("Error handling orders API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
