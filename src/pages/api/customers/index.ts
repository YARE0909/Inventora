import prisma from "@/utils/prismaClient";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET": {
        const { filter } = req.query;

        try {
          // Check if `filter` is a valid customer ID
          if (
            filter &&
            typeof filter === "string" &&
            filter.match(/^[a-f\d]{24}$/i)
          ) {
            const customer = await prisma.customers.findUnique({
              where: { id: filter },
              include: {
                orders: true,
                invoices: true,
              },
            });

            if (!customer) {
              return res.status(404).json({ message: "Customer not found" });
            }

            return res.status(200).json(customer);
          }

          // If `filter` is not a valid ID, perform a search query
          const prismaFilter: Prisma.CustomersWhereInput | undefined =
            filter && typeof filter === "string"
              ? {
                  OR: [
                    { id: { contains: filter, mode: "insensitive" } },
                    { name: { contains: filter, mode: "insensitive" } },
                    {
                      contactPerson: { contains: filter, mode: "insensitive" },
                    },
                    { email: { contains: filter, mode: "insensitive" } },
                    { phone: { contains: filter, mode: "insensitive" } },
                  ],
                }
              : undefined;

          const customers = await prisma.customers.findMany({
            where: prismaFilter,
            include: {
              orders: true,
              invoices: true,
            },
          });

          return res.status(200).json(customers);
        } catch (error) {
          console.error("Error fetching customers:", error);
          return res
            .status(500)
            .json({ message: "Something went wrong", error });
        }
      }

      case "POST": {
        const {
          name,
          contactPerson,
          email,
          phone,
          customerGST,
          billingAddress,
          shippingAddress,
        } = req.body;

        if (!name || !email) {
          return res.status(400).json({
            error: "Missing required fields: name, email",
          });
        }

        const newCustomer = await prisma.customers.create({
          data: {
            name,
            contactPerson,
            email,
            phone,
            customerGST,
            billingAddress,
            shippingAddress,
            createdOn: new Date(),
          },
        });

        return res.status(201).json(newCustomer);
      }

      case "PUT": {
        const { id, ...updateData } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating a customer" });
        }

        const updatedCustomer = await prisma.customers.update({
          where: { id },
          data: {
            name: updateData.name,
            contactPerson: updateData.contactPerson,
            phone: updateData.phone,
            email: updateData.email,
            customerGST: updateData.customerGST,
            billingAddress: updateData.billingAddress,
            shippingAddress: updateData.shippingAddress,
          },
        });

        return res.status(200).json(updatedCustomer);
      }

      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.customers.delete({
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
    console.error("Error handling customers API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
