/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/utils/prismaClient";
import generateRandomString from "@/utils/randomStringGenerator";
import { Prisma, PaymentStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET": {
        const {
          id,
          invoiceNumber,
          customerId,
          startDate,
          endDate,
          paymentStatus,
        } = req.query;

        const filter: Prisma.InvoicesWhereInput = {};

        if (id && typeof id === "string") {
          // Fetch a single invoice by id
          const invoice = await prisma.invoices.findUnique({
            where: { id },
            include: {
              customer: true,
              order: true,
              invoiceItems: {
                include: {
                  product: true,
                  gstCode: true,
                },
              },
              payments: true,
            },
          });

          if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
          }

          return res.status(200).json(invoice);
        }

        if (invoiceNumber && typeof invoiceNumber === "string") {
          filter.invoiceNumber = {
            contains: invoiceNumber,
            mode: "insensitive",
          };
        }

        if (customerId && typeof customerId === "string") {
          filter.customerId = customerId;
        }

        if (startDate || endDate) {
          filter.invoiceDate = {};
          if (startDate && typeof startDate === "string") {
            filter.invoiceDate.gte = new Date(startDate);
          }
          if (endDate && typeof endDate === "string") {
            filter.invoiceDate.lte = new Date(endDate);
          }
        }

        if (paymentStatus && typeof paymentStatus === "string") {
          filter.payments = {
            some: {
              paymentStatus: paymentStatus as PaymentStatus,
            },
          };
        }

        const invoices = await prisma.invoices.findMany({
          where: filter,
          include: {
            customer: true,
            order: true,
            invoiceItems: {
              include: {
                product: true,
                gstCode: true,
              },
            },
            payments: true,
          },
        });

        return res.status(200).json(invoices);
      }

      case "POST": {
        const {
          orderId,
          customerId,
          invoiceDate,
          invoiceAmount,
          adjustedInvoiceAmount,
          reconciledInvoiceAmount,
          packagingChargesAmount,
          shippingChargesAmount,
          discountAmount,
          customerGst,
          invoiceComments,
          invoiceItems,
          payments,
        } = req.body;

        if (
          !orderId ||
          !customerId ||
          !invoiceDate ||
          !invoiceAmount ||
          !invoiceItems
        ) {
          return res.status(400).json({
            error:
              "Missing required fields: orderId, customerId, invoiceNumber, invoiceDate, invoiceAmount, invoiceItems",
          });
        }

        const newInvoice = await prisma.invoices.create({
          data: {
            orderId,
            customerId,
            invoiceNumber: `INV-${generateRandomString(6)}`,
            invoiceDate: new Date(invoiceDate),
            invoiceAmount: parseFloat(invoiceAmount),
            adjustedInvoiceAmount: parseFloat(adjustedInvoiceAmount || 0),
            reconciledInvoiceAmount: parseFloat(reconciledInvoiceAmount || 0),
            packagingChargesAmount: parseFloat(packagingChargesAmount || 0),
            shippingChargesAmount: parseFloat(shippingChargesAmount || 0),
            discountAmount: parseFloat(discountAmount || 0),
            customerGst,
            invoiceComments,
            createdOn: new Date(),
            invoiceItems: {
              create: invoiceItems.map(
                (item: {
                  productId: string;
                  itemCode: string;
                  itemQuantity: number;
                  itemRate: number;
                  invoiceAmount: number;
                  gstCodeId: string;
                }) => ({
                  productId: item.productId,
                  itemCode: item.itemCode,
                  itemQuantity: item.itemQuantity,
                  itemRate: item.itemRate,
                  invoiceAmount: item.invoiceAmount,
                  gstCodeId: item.gstCodeId,
                  createdOn: new Date(),
                })
              ),
            },
            payments: {
              create: payments?.map(
                (payment: {
                  paymentMode: string;
                  paymentDate: string;
                  paymentAmount: number;
                  paymentReferenceId: string;
                  paymentDetails: string;
                  paymentComments: string;
                  paymentStatus: string;
                }) => ({
                  paymentMode: payment.paymentMode,
                  paymentDate: new Date(payment.paymentDate),
                  paymentAmount: payment.paymentAmount,
                  paymentReferenceId: payment.paymentReferenceId,
                  paymentDetails: payment.paymentDetails,
                  paymentComments: payment.paymentComments,
                  paymentStatus: payment.paymentStatus || PaymentStatus.Pending,
                  createdOn: new Date(),
                })
              ),
            },
          },
        });

        return res.status(201).json(newInvoice);
      }

      case "PUT": {
        const {
          id,
          orderId,
          customerId,
          invoiceNumber,
          invoiceDate,
          invoiceAmount,
          adjustedInvoiceAmount,
          reconciledInvoiceAmount,
          packagingChargesAmount,
          shippingChargesAmount,
          discountAmount,
          customerGst,
          invoiceComments,
          invoiceItems,
          payments,
        } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating an invoice" });
        }

        const updatedInvoice = await prisma.invoices.update({
          where: { id },
          data: {
            orderId,
            customerId,
            invoiceNumber,
            invoiceDate: new Date(invoiceDate),
            invoiceAmount: parseFloat(invoiceAmount),
            adjustedInvoiceAmount: parseFloat(adjustedInvoiceAmount || 0),
            reconciledInvoiceAmount: parseFloat(reconciledInvoiceAmount || 0),
            packagingChargesAmount: parseFloat(packagingChargesAmount || 0),
            shippingChargesAmount: parseFloat(shippingChargesAmount || 0),
            discountAmount: parseFloat(discountAmount || 0),
            customerGst,
            invoiceComments,
            invoiceItems: {
              deleteMany: {},
              create: invoiceItems.map(
                (item: {
                  productId: string;
                  itemCode: string;
                  itemQuantity: number;
                  itemRate: number;
                  invoiceAmount: number;
                  gstCodeId: string;
                }) => ({
                  productId: item.productId,
                  itemCode: item.itemCode,
                  itemQuantity: item.itemQuantity,
                  itemRate: item.itemRate,
                  invoiceAmount: item.invoiceAmount,
                  gstCodeId: item.gstCodeId,
                  createdOn: new Date(),
                })
              ),
            },
            payments: {
              deleteMany: {},
              create: payments?.map(
                (payment: {
                  paymentMode: string;
                  paymentDate: string;
                  paymentAmount: number;
                  paymentReferenceId: string;
                  paymentDetails: string;
                  paymentComments: string;
                  paymentStatus: string;
                }) => ({
                  paymentMode: payment.paymentMode,
                  paymentDate: new Date(payment.paymentDate),
                  paymentAmount: payment.paymentAmount,
                  paymentReferenceId: payment.paymentReferenceId,
                  paymentDetails: payment.paymentDetails,
                  paymentComments: payment.paymentComments,
                  paymentStatus: payment.paymentStatus || PaymentStatus.Pending,
                  createdOn: new Date(),
                })
              ),
            },
          },
        });

        return res.status(200).json(updatedInvoice);
      }

      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.invoices.delete({
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
    console.error("Error handling invoices API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
