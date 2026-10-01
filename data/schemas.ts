import { z } from 'zod';

/**
 * A schema is an executable contract.
 * Define the shape ONCE, validate every response against it.
 */

// Nested objects get their own schema, then compose.
const GeoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

const AddressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: GeoSchema,
});

const CompanySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

export const UserSchema = z.object({
  // .positive() and .email() are built-in refinements —
  // they validate the VALUE, not just the type.
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  address: AddressSchema,
  phone: z.string(),
  website: z.string(),
  company: CompanySchema,
});

// Build an array schema from the object schema — no duplication.
export const UserListSchema = z.array(UserSchema);

/**
 * z.infer<> extracts a TypeScript type FROM the schema.
 * One source of truth: change the schema, the type follows.
 * This is why Zod beats hand-written interfaces.
 */
export type User = z.infer<typeof UserSchema>;