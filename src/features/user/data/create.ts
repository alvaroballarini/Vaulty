import prisma from "@/lib/prisma";
import { CreateUserInput, createUserSchema } from "../types/schemaUser";
import argon2 from "argon2";

async function createUser(input: CreateUserInput) {
  const { email, name, passwordHash } = createUserSchema.parse(input);
  const hash = await argon2.hash(passwordHash);
  return prisma.user.create({
    data: {
      email,
      name,
      password: hash,
      categories: {
        create: [
          {
            color: "#155512",
            icon: "Home",
            name: "Vivienda",
            type: "EXPENSE",
          },
          {
            color: "#553112",
            icon: "Music",
            name: "Ocio",
            type: "EXPENSE",
          },
          {
            color: "#cb0909",
            icon: "ShoppingCart",
            name: "Alimentación",
            type: "EXPENSE",
          },
          {
            color: "#ff6a00",
            icon: "ArrowDown",
            name: "Sueldo",
            type: "INCOME",
          },
        ],
      },
      accounts: {
        createMany: {
          data: [
            {
              name: "Efectivo",
              type: "CASH",
            },
            {
              name: "Mercado Pago",
              type: "BANK",
            },
          ],
        },
      },
    },
  });
}

export default createUser;
