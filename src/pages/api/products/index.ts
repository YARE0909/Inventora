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
        const { name, id } = req.query;

        if (id) {
          if (typeof id !== "string") {
            return res
              .status(400)
              .json({ error: "Invalid ID format. Must be a string." });
          }

          const product = await prisma.products.findUnique({
            where: { id },
            include: {
              gstCode: {
                include: {
                  gst: true,
                },
              }, // Include GST details
            },
          });

          if (!product) {
            return res.status(404).json({ error: "Product not found" });
          }

          return res.status(200).json(product);
        }

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
            gstCode: {
              include: {
                gst: true,
              },
            }, // Include GST details
          },
        });

        return res.status(200).json(products);
      }

      // Create a new product
      case "POST": {
        const { name, description, price, gstCodeId, isActive } = req.body;

        if (!name || !description || !price || !gstCodeId) {
          return res.status(400).json({
            error:
              "Missing required fields: name, description, price, gstCodeId",
          });
        }

        const newProduct = await prisma.products.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            gstCodeId,
            isActive,
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

        try {
          const updatedProduct = await prisma.products.update({
            where: { id },
            data: {
              name: updateData.name,
              description: updateData.description,
              price: Number(updateData.price),
              isActive: updateData.isActive,
              gstCodeId: updateData.gstCodeId,
            },
          });
          return res.status(200).json(updatedProduct);
        } catch (error) {
          console.error("Error updating product:", error);
          return res.status(500).json({ error: "Error updating product" });
        }
      }

      // Delete a product
      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        try {
          await prisma.products.delete({
            where: { id },
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          return res
            .status(500)
            .json({ error: "Item is linked to other tables" });
        }

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
