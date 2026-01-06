import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
