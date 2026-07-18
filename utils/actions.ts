import { currentUser, clerkClient } from "@clerk/nextjs/server";
import db from "@/utils/db";
import { redirect } from "next/navigation";
import { ticketSchema, validateWithZodSchema } from "./schemas";
import { ZodType } from "zod";
import { revalidatePath } from "next/cache";

// generic error to display in a toast
const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "ops.. errore",
  };
};

// get normal user logged
export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return user;
};

// get admin user logged
export const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.publicMetadata?.role !== "admin") {
    redirect("/");
  }
  return user;
};

// crete a new ticket
export const newTicketAction = async (
  prevState: unknown,
  formData: FormData,
): Promise<{ message: string }> => {
  try {
    const rawData = Object.fromEntries(formData);
    const validateFields = validateWithZodSchema(ticketSchema, rawData);

    await db.ticket.create({
      data: {
        ...validateFields,
      },
    });
    revalidatePath("/");
    return { message: "Ticket creato" };
  } catch (error) {
    return renderError(error);
  }
};

// fetch all tickets
export const fetchTicketsAction = async () => {};

// fetch single ticket
export const fetchSingleTicketAction = async () => {};

// transform a ticket from open to assigned to someone
export const takeTiketAction = async () => {};

// close ticket and add final informations
export const closeTiketAction = async () => {};

// update a ticket info
export const updateTicketAction = async () => {};

// delete a ticket
export const deleteTicketAction = async () => {};
