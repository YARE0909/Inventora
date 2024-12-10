import prisma from "@/utils/prismaClient";
import generateRandomString from "@/utils/randomStringGenerator";
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        // Get the 'status' and 'clientName' query parameters
        const { status, clientName } = req.query;

        // Build the filter object based on provided query parameters
        const filter: {
          orderStatus: string;
          customerName?: { contains: string; mode: Prisma.QueryMode };
        } = {
          orderStatus: String(status), // The 'status' is always required
        };

        // If 'clientName' is provided, add it to the filter
        if (clientName) {
          filter.customerName = {
            contains: String(clientName), // Use 'contains' for a case-insensitive search
            mode: Prisma.QueryMode.insensitive, // Use the correct QueryMode enum value
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
            orderStatus,
            orderComments,
            createdBy,
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
    console.error("Error handling orders API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
