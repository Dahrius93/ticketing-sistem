import { currentUser, clerkClient } from "@clerk/nextjs/server";
import db from "@/utils/db";
import { redirect } from "next/navigation";
import { ticketSchema, validateWithZodSchema } from "./schemas";
import { ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { Ticket } from "@/prisma/generated/prisma/client";

// errore generico da mostrare su toast
// utilizzato sulle catch delle actions

/**
 *
 * @param error
 * @returns if Error type -> error.message otherwise show "opps.."
 */
const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "ops.. errore",
  };
};

/**
 * check for actual user
 * @returns user
 *
 * check for any logged user
 * if !user -> redirect
 */
export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return user;
};

/**
 * Check if actual user is admin
 * @returns user
 *
 * if user.role != "admin" -> redirect
 *
 */
export const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.publicMetadata?.role !== "admin") {
    redirect("/");
  }
  return user;
};

/**
 * Create a new ticket
 * @param prevState
 * @param formData
 * @returns message:"Ticket creato" | error toast
 *
 * formData:
 * essential: orderNumber, company
 * optional: companyTechnician, email, telephone, problemDescription
 * inferred: openedBy = actual Clerk id
 *
 */
export const newTicketAction = async (
  prevState: unknown,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validateFields = validateWithZodSchema(ticketSchema, rawData);
    await db.ticket.create({
      data: {
        ...validateFields,
        openedBy: user.id,
      },
    });
    revalidatePath("/");
    return { message: "Ticket creato" };
  } catch (error) {
    return renderError(error);
  }
};

/**
 *
 * @returns tickets[] | error toast
 * fetch of all tickets
 */
export const fetchTicketsAction = async () => {
  await getAuthUser();

  try {
    const tickets = await db.ticket.findMany({
      orderBy: {
        openDate: "desc",
      },
    });
    return tickets;
  } catch (error) {
    return renderError(error);
  }
};

/**
 * fetch a single ticket data
 * @param id string
 * @returns ticket | error toast
 *
 */
export const fetchSingleTicketAction = async (id: string) => {
  await getAuthUser();
  try {
    const ticket = await db.ticket.findUnique({
      where: {
        id: id,
      },
    });
    return ticket;
  } catch (error) {
    return renderError(error);
  }
};

/**
 * assign ticket to a id and change status to ASSINGED
 * @param id string
 * @param assignedToId string | null (if null actual user will used)
 * @returns message:"ticket assegnato" | error toast
 */
export const takeTiketAction = async (
  id: string,
  assignedToId?: string,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  let userAssigned = "";

  // ticket viene assegnato ad un user se passato su prop
  // atrimenti viene assegnato all'utente attualmente registrato
  // il quale lo ha preso in carico
  if (assignedToId) {
    userAssigned = assignedToId;
  } else userAssigned = user.id;

  // acquisisco data e ora attuale per memorizzare
  // quando è stato preso in carico il ticket
  const now: Date = new Date();

  try {
    await db.ticket.update({
      where: {
        id: id,
      },
      data: {
        status: "ASSIGNED",
        assignedToId: userAssigned,
        assignedDate: now,
      },
    });
    return { message: "Tiket assegnato" };
  } catch (error) {
    return renderError(error);
  }
};

// close ticket and add final informations
export const closeTiketAction = async () => {};

// update a ticket info
export const updateTicketAction = async () => {};

// delete a ticket
export const deleteTicketAction = async () => {};
