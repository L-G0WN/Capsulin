import { defineCollection, z } from "astro:content";

const sintomas = defineCollection({
  schema: z.object({
    title: z.string(),
    descripcion: z.string(),
    recomendacion: z.string(),
    medicamentos: z.array(z.string()),
    emergencia: z.string(),
  }),
});

const medicamentos = defineCollection({
  schema: z.object({
    title: z.string(),
    dosis: z.string(),
    efectos: z.string().optional(),
  }),
});

export const collections = {
  sintomas,
  medicamentos,
};