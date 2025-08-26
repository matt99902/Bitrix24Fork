"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";

/**
 * @description Delete a screener
 * @param screenerId - The id of the screener to delete
 * @returns {Object} - An object containing the success status and message
 */
export async function deleteScreener(screenerId: string) {
  const userSession = await auth();

  if (!userSession) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!screenerId) {
    return {
      success: false,
      message: "screener id is not defined",
    };
  }

  try {
    await prismaDB.screener.delete({
      where: {
        id: screenerId,
      },
    });

    return {
      success: true,
      message: "deleted screener successfully",
    };
  } catch (error) {
    console.error("Error deleting screener", error);
    return {};
  }
}
