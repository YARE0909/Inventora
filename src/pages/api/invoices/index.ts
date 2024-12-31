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
        const { id, paymentStatus, invoiceNumber } = req.query;

        try {
          if (id && typeof id === "string") {
            const invoice = await prisma.invoices.findUnique({
              where: { id },
              include: {
                customer: true,
                order: true,
                invoiceItems: {
                  include: {
                    product: true,
                    service: true,
                    gstCode: {
                      include: {
                        gst: true,
                      },
                    },
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
            const invoice = await prisma.invoices.findMany({
              where: { invoiceNumber },
              include: {
                customer: true,
                order: true,
                invoiceItems: {
                  include: {
                    product: true,
                    service: true,
                    gstCode: {
                      include: {
                        gst: true,
                      },
                    },
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

          const filter: Prisma.InvoicesWhereInput = {};
          if (paymentStatus && typeof paymentStatus === "string") {
            if (paymentStatus === "Pending") {
              // Include invoices with no payments, pending payments, or partially paid
              filter.OR = [
                {
                  payments: {
                    some: {
                      paymentStatus: {
                        in: ["Pending", "PartiallyPaid"] as PaymentStatus[],
                      },
                    },
                  },
                },
                {
                  payments: {
                    none: {},
                  },
                },
              ];
            } else if (paymentStatus === "Paid") {
              // Include invoices where all payments have the status "Paid"
              filter.AND = [
                {
                  payments: {
                    some: {},
                  },
                },
                {
                  payments: {
                    every: {
                      paymentStatus: "Paid" as PaymentStatus,
                    },
                  },
                },
              ];
            } else {
              filter.payments = {
                some: {
                  paymentStatus: paymentStatus as PaymentStatus,
                },
              };
            }
          }

          const invoices = await prisma.invoices.findMany({
            where: filter,
            include: {
              customer: true,
              order: true,
              invoiceItems: {
                include: {
                  product: true,
                  service: true,
                  gstCode: {
                    include: {
                      gst: true,
                    },
                  },
                },
              },
              payments: true,
            },
          });

          return res.status(200).json(invoices);
        } catch (error) {
          console.error("Error fetching invoices:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        }
      }

      case "POST": {
        const {
          orderId,
          customerId,
          invoiceDate,
          invoiceAmount,
          adjustedInvoiceAmount,
          reconciledInvoiceAmount,
          reconcileComments,
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
              "Missing required fields: orderId, customerId, invoiceDate, invoiceAmount, invoiceItems",
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
            reconcileComments,
            discountAmount: parseFloat(discountAmount || 0),
            customerGst,
            invoiceComments,
            createdOn: new Date(),
            invoiceItems: {
              create: invoiceItems.map(
                (item: {
                  productId?: string;
                  serviceId?: string;
                  itemQuantity: number;
                  itemRate: number;
                  invoiceAmount: number;
                  gstCodeId: string;
                }) => ({
                  ...(item.productId
                    ? { productId: item.productId }
                    : { serviceId: item.serviceId }),
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
          reconcileComments,
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

        try {
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
              reconcileComments,
              discountAmount: parseFloat(discountAmount || 0),
              customerGst,
              invoiceComments,
              invoiceItems: {
                deleteMany: {},
                create: invoiceItems.map(
                  (item: {
                    productId?: string;
                    serviceId?: string;
                    itemQuantity: number;
                    itemRate: number;
                    invoiceAmount: number;
                    gstCodeId: string;
                  }) => ({
                    ...(item.productId
                      ? { productId: item.productId }
                      : { serviceId: item.serviceId }),
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
                    paymentStatus:
                      payment.paymentStatus || PaymentStatus.Pending,
                    createdOn: new Date(),
                  })
                ),
              },
            },
          });
          return res.status(200).json(updatedInvoice);
        } catch (error) {
          console.error("Error updating invoice:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        }
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
