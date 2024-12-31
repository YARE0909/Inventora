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
      // Fetch all services or filter by name or ID
      case "GET": {
        const { name, id } = req.query;

        if (id) {
          if (typeof id !== "string") {
            return res
              .status(400)
              .json({ error: "Invalid ID format. Must be a string." });
          }

          const service = await prisma.service.findUnique({
            where: { id },
            include: {
              gstCode: true, // Include related GST Code details
            },
          });

          if (!service) {
            return res.status(404).json({ error: "Service not found" });
          }

          return res.status(200).json(service);
        }

        const filter = {
          where: name
            ? {
              name: {
                contains: name as string,
                mode: Prisma.QueryMode.insensitive,
              },
            }
            : {},
        };

        const services = await prisma.service.findMany({
          ...filter,
          include: {
            gstCode: true, // Include related GST Code details
          },
        });

        return res.status(200).json(services);
      }

      // Create a new service
      case "POST": {
        const { name, gstCodeId, effectiveStartDate, effectiveEndDate, isActive } = req.body;

        if (!name || !gstCodeId || !effectiveStartDate || !effectiveEndDate) {
          return res.status(400).json({
            error: "Missing required fields: name, gstCodeId, effectiveStartDate, effectiveEndDate",
          });
        }

        const newService = await prisma.service.create({
          data: {
            name,
            gstCodeId,
            effectiveStartDate: new Date(effectiveStartDate),
            effectiveEndDate: new Date(effectiveEndDate),
            isActive: isActive ?? true,
            createdOn: new Date(),
          },
        });

        return res.status(201).json(newService);
      }

      // Update an existing service
      case "PUT": {
        const { id, ...updateData } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating a service" });
        }

        try {
          const updatedService = await prisma.service.update({
            where: { id },
            data: {
              ...updateData,
              effectiveStartDate: updateData.effectiveStartDate
                ? new Date(updateData.effectiveStartDate)
                : undefined,
              effectiveEndDate: updateData.effectiveEndDate
                ? new Date(updateData.effectiveEndDate)
                : undefined,
            },
          });

          return res.status(200).json(updatedService);
        } catch (error) {
          console.error("Error updating service:", error);
          return res.status(500).json({ error: "Error updating service" });
        }
      }

      // Delete a service
      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        try {
          await prisma.service.delete({
            where: { id },
          });
        } catch (error) {
          console.error("Error deleting service:", error);
          return res
            .status(500)
            .json({ error: "Service is linked to other tables" });
        }

        return res.status(204).end();
      }

      default: {
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Error handling service API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
