import { z } from "zod";

const textOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/;
const streetRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.#,/-]+$/;

export const addressSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias es muy corto")
    .max(20, "El alias no debe exceder 20 caracteres")
    .regex(textOnlyRegex, "El alias solo debe contener letras"),

  street: z
    .string()
    .min(5, "La calle y número parecen incompletos")
    .regex(streetRegex, "La dirección contiene caracteres no permitidos"),

  neighborhood: z
    .string()
    .min(3, "La colonia es obligatoria")
    .regex(textOnlyRegex, "La colonia no debe contener números ni símbolos"),

  city: z
    .string()
    .min(3, "La ciudad es obligatoria")
    .regex(textOnlyRegex, "La ciudad no debe contener números"),

  state: z
    .string()
    .min(3, "El estado es obligatorio")
    .regex(textOnlyRegex, "El estado no debe contener números"),

  postalCode: z
    .string()
    .length(5, "El Código Postal debe ser de exactamente 5 dígitos")
    .regex(/^[0-9]+$/, "El Código Postal solo puede contener números"),

  references: z
    .string()
    .max(200, "La referencia es demasiado larga (máx 200 caracteres)")
    .optional()
    .or(z.literal("")),

  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
