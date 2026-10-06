"use server";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import {
  CreateCategoryInput,
  createCategorySchema,
} from "../type/schemaCategory";
import createCategoryDb from "../data/create";
export default async function createCategoryService(data: CreateCategoryInput) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  await createCategoryDb({
    ...createCategorySchema.parse(data),
    userId: auth.session.userId,
  });
}
