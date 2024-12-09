import prisma from "@/utils/prismaClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        if (req.query.id) {
          const order = await prisma.orderAdvanceDetails.findUnique({
            where: { id: String(req.query.id) },
          });
          if (!order) {
            return res.status(404).json({ error: "Order not found" });
          }
          return res.status(200).json(order);
        } else {
          const orderAdvanceDetails = await prisma.orderAdvanceDetails.findMany({
          });
          return res.status(200).json(orderAdvanceDetails);
        }

      case "POST":
        const {
          orderId,
          orderAdvanceAmount,
          orderAdvanceDate,
          orderAdvancePaymentDetails,
          orderAdvanceStatus,
          orderAdvanceComments,
          createdBy,
          createdOn,
          modifiedBy,
          modifiedOn,
        } = req.body;

        const newOrder = await prisma.orderAdvanceDetails.create({
          data: {
            orderId,
            orderAdvanceAmount: parseFloat(orderAdvanceAmount),
            orderAdvanceDate: new Date(orderAdvanceDate),
            orderAdvancePaymentDetails,
            orderAdvanceStatus,
            orderAdvanceComments,
            createdBy,
            createdOn: new Date(createdOn),
            modifiedBy,
            modifiedOn: new Date(modifiedOn),
          },
        });

        return res.status(201).json(newOrder);

      case "PUT":
        const { id, ...updateData } = req.body;

        const updatedOrder = await prisma.orderAdvanceDetails.update({
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

        await prisma.orderAdvanceDetails.delete({
          where: { id: String(req.query.id) },
        });

        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error handling orderAdvanceDetails API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
