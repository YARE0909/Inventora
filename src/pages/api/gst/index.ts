import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/prismaClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      // Fetch all GST records
      case "GET": {
        const { id } = req.query;

        if (id) {
          const gstRecord = await prisma.gst.findUnique({
            where: { id: id as string },
          });

          return res.status(200).json(gstRecord);
        }
        const gstRecords = await prisma.gst.findMany();
        return res.status(200).json(gstRecords);
      }

      // Create a new GST record
      case "POST": {
        const { taxPercentage, isActive } = req.body;

        if (taxPercentage === undefined || isActive === undefined) {
          return res.status(400).json({
            error: "Missing required fields: taxPercentage, isActive, gstCode",
          });
        }

        const newGst = await prisma.gst.create({
          data: {
            taxPercentage,
            isActive,
            createdOn: new Date(),
          },
        });

        return res.status(201).json(newGst);
      }

      // Update an existing GST record
      case "PUT": {
        const { id, taxPercentage, isActive } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: "ID is required for updating GST" });
        }

        const updatedGst = await prisma.gst.update({
          where: { id },
          data: {
            taxPercentage,
            isActive,
          },
        });

        return res.status(200).json(updatedGst);
      }

      // Delete a GST record
      case "DELETE": {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "ID is required for deletion" });
        }

        await prisma.gst.delete({
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
    console.error("Error handling GST API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
