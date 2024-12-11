import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/prismaClient";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      // Fetch all products or filter by name
      // Fetch all products or filter by name
      case "GET": {
        const { name } = req.query;

        const filter = {
          where: name
            ? {
                name: {
                  contains: name as string,
                  mode: Prisma.QueryMode.insensitive, // Use the correct `QueryMode` enum value
                },
              }
            : {},
        };

        const products = await prisma.products.findMany({
          ...filter,
          include: {
            gst: true, // Include GST details
          },
        });

        return res.status(200).json(products);
      }

      // Create a new product
      case "POST": {
        const { name, description, price, gstId } = req.body;

        if (!name || !description || !price || !gstId) {
          return res.status(400).json({
            error:
              "Missing required fields: name, description, price, gstId",
          });
        }

        const newProduct = await prisma.products.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            gstId,
            createdOn: new Date(),
          },
        });

        return res.status(201).json(newProduct);
      }

      // Update an existing product
      case "PUT": {
        const { id, ...updateData } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating a product" });
        }

        const updatedProduct = await prisma.products.update({
          where: { id },
          data: {
            ...updateData,
          },
        });

        return res.status(200).json(updatedProduct);
      }

      // Delete a product
      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.products.delete({
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
    console.error("Error handling products API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
