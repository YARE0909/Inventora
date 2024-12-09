import prisma from "@/utils/prismaClient";
import generateRandomString from "@/utils/randomStringGenerator";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        if (req.query.id) {
          const order = await prisma.orders.findUnique({
            where: { id: String(req.query.id) },
          });
          if (!order) {
            return res.status(404).json({ error: "Order not found" });
          }
          return res.status(200).json(order);
        } else {
          const orders = await prisma.orders.findMany({
          });
          return res.status(200).json(orders);
        }

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
