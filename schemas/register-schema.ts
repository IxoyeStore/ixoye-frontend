import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .trim(),
    email: z.string().email("Correo inválido").trim().toLowerCase(),
    phone: z
      .string()
      .min(10, "El teléfono debe tener 10 dígitos")
      .max(10, "El teléfono debe tener 10 dígitos")
      .regex(/^[0-9]+$/, "El teléfono solo debe contener números")
      .optional(),
    password: z
      .string()
      .min(8, "La contraseña debe tener mínimo 8 caracteres")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "La contraseña debe contener letras y números, sin espacios"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
