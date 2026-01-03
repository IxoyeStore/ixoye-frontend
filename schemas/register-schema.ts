import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "El nombre es obligatorio"),
    lastName: z.string().min(2, "El apellido es obligatorio"),
    motherLastName: z.string().optional(),
    birthDate: z.string().min(1, "La fecha es obligatoria"),
    phone: z.string().min(8, "Teléfono inválido"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
