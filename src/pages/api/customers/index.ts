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

        const prismaFilter: Prisma.CustomersWhereInput | undefined =
          filter && typeof filter === "string"
            ? {
                OR: [
                  { name: { contains: filter, mode: "insensitive" } },
                  { contactPerson: { contains: filter, mode: "insensitive" } },
                  { email: { contains: filter, mode: "insensitive" } },
                  { phone: { contains: filter, mode: "insensitive" } },
                ],
              }
            : undefined;

        try {
          const customers = await prisma.customers.findMany({
            where: prismaFilter,
            include: {
              orders: true,
              invoices: true,
            },
          });

          return res.status(200).json(customers);
        } catch (error) {
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
            ...updateData,
            modifiedOn: new Date(),
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
