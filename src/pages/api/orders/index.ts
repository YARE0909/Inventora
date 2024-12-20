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
      case "GET": {
        const { status, clientName, orderNumber, startDate, endDate } =
          req.query;

        const filter: Prisma.OrdersWhereInput = {};

        if (status && typeof status === "string") {
          filter.orderStatus = OrderStatus[status as keyof typeof OrderStatus];
        }

        if (clientName && typeof clientName === "string") {
          filter.customer = {
            name: { contains: clientName, mode: "insensitive" },
          };
        }

        if (orderNumber && typeof orderNumber === "string") {
          filter.orderNumber = { contains: orderNumber, mode: "insensitive" };
        }

        if (startDate || endDate) {
          filter.orderDate = {};
          if (startDate && typeof startDate === "string") {
            filter.orderDate.gte = new Date(startDate);
          }
          if (endDate && typeof endDate === "string") {
            filter.orderDate.lte = new Date(endDate);
          }
        }

        const orders = await prisma.orders.findMany({
          where: filter,
          include: {
            customer: true,
            orderItems: {
              include: {
                product: {
                  include: {
                    gstCode: {
                      include: {
                        gst: true,
                      },
                    },
                  },
                },
              },
            },
            orderAdvanceDetails: true,
          },
        });

        return res.status(200).json(orders);
      }

      case "POST": {
        const {
          customerId,
          orderDate,
          proformaInvoice,
          proformaInvoiceDate,
          orderValue,
          orderCount,
          orderDeliveryDate,
          orderStatus,
          orderComments,
          orderItems,
          orderAdvanceDetails,
        } = req.body;

        if (!customerId || !orderDate || !orderValue || !orderItems) {
          return res.status(400).json({
            error:
              "Missing required fields: customerId, orderDate, orderValue, orderItems",
          });
        }

        const newOrder = await prisma.orders.create({
          data: {
            orderNumber: generateRandomString(6),
            customerId,
            orderDate: new Date(orderDate),
            proformaInvoice,
            proformaInvoiceDate: proformaInvoiceDate
              ? new Date(proformaInvoiceDate)
              : proformaInvoiceDate,
            orderValue: parseFloat(orderValue),
            orderCount: parseInt(orderCount, 10),
            orderDeliveryDate: orderDeliveryDate
              ? new Date(orderDeliveryDate)
              : orderDeliveryDate,
            orderStatus: orderStatus || "Active",
            orderComments,
            createdOn: new Date(),
            orderItems: {
              create: orderItems.map(
                (item: {
                  productId: string;
                  quantity: number;
                  unitPrice: number;
                  totalAmount: number;
                }) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalAmount: item.totalAmount,
                  createdOn: new Date(),
                })
              ),
            },
            orderAdvanceDetails: {
              create: orderAdvanceDetails?.map(
                (advance: {
                  orderAdvanceAmount: number;
                  orderAdvanceDate: string;
                  orderAdvancePaymentDetails: string;
                  orderAdvanceStatus: string;
                  orderAdvanceComments: string;
                }) => ({
                  orderAdvanceAmount: advance.orderAdvanceAmount,
                  orderAdvanceDate: new Date(advance.orderAdvanceDate),
                  orderAdvancePaymentDetails:
                    advance.orderAdvancePaymentDetails,
                  orderAdvanceStatus: advance.orderAdvanceStatus,
                  orderAdvanceComments: advance.orderAdvanceComments,
                  createdOn: new Date(),
                })
              ),
            },
          },
        });

        return res.status(201).json(newOrder);
      }

      case "PUT": {
        const { id, ...updateData } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating an order" });
        }

        if (updateData.orderDate) {
          updateData.orderDate = new Date(updateData.orderDate);
        }
        if (updateData.proformaInvoiceDate) {
          updateData.proformaInvoiceDate = new Date(
            updateData.proformaInvoiceDate
          );
        }
        if (updateData.orderDeliveryDate) {
          updateData.orderDeliveryDate = new Date(updateData.orderDeliveryDate);
        }

        const updatedOrder = await prisma.orders.update({
          where: { id },
          data: {
            ...updateData,
            modifiedOn: new Date(),
          },
        });

        return res.status(200).json(updatedOrder);
      }

      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.orders.delete({
          where: { id },
        });

        return res.status(204).end();
      }

      default: {
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Error handling orders API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
