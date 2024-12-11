import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/prismaClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      // Fetch all GstCodes or a specific one by ID
      case "GET": {
        const { id } = req.query;

        if (id) {
          const gstCode = await prisma.gstCodes.findUnique({
            where: { id: id as string },
            include: {
              gst: true, // Include related Gst details
            },
          });

          if (!gstCode) {
            return res.status(404).json({ error: "GstCode not found" });
          }

          return res.status(200).json(gstCode);
        }

        const gstCodes = await prisma.gstCodes.findMany({
          include: {
            gst: true, // Include related Gst details
          },
        });
        return res.status(200).json(gstCodes);
      }

      // Create a new GstCode
      case "POST": {
        const {
          code,
          name,
          effectiveStartDate,
          effectiveEndDate,
          isActive,
          gstId,
        } = req.body;

        if (
          !code ||
          !name ||
          !effectiveStartDate ||
          isActive === undefined ||
          !gstId
        ) {
          return res.status(400).json({
            error:
              "Missing required fields: code, name, effectiveStartDate, isActive, gstId",
          });
        }

        const newGstCode = await prisma.gstCodes.create({
          data: {
            code,
            name,
            effectiveStartDate: new Date(effectiveStartDate),
            effectiveEndDate: effectiveEndDate
              ? new Date(effectiveEndDate)
              : null,
            isActive,
            gstId,
            createdOn: new Date(),
          },
        });

        return res.status(201).json(newGstCode);
      }

      // Update an existing GstCode
      case "PUT": {
        const {
          id,
          code,
          name,
          effectiveStartDate,
          effectiveEndDate,
          isActive,
          gstId,
        } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating GstCode" });
        }

        const updatedGstCode = await prisma.gstCodes.update({
          where: { id },
          data: {
            code,
            name,
            effectiveStartDate: effectiveStartDate
              ? new Date(effectiveStartDate)
              : undefined,
            effectiveEndDate: effectiveEndDate
              ? new Date(effectiveEndDate)
              : undefined,
            isActive,
            gstId,
          },
        });

        return res.status(200).json(updatedGstCode);
      }

      // Delete a GstCode
      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.gstCodes.delete({
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
    console.error("Error handling GstCodes API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
