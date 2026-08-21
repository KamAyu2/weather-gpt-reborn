import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    conversations: defineTable({
      userId: v.string(),
      title: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    messages: defineTable({
      conversationId: v.id("conversations"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
      starred: v.optional(v.boolean()),
      metadata: v.optional(
        v.object({
          location: v.optional(v.string()),
          country: v.optional(v.string()),
          latitude: v.optional(v.number()),
          longitude: v.optional(v.number()),
          weatherData: v.optional(v.any()),
        })
      ),
    }).index("by_conversation", ["conversationId", "timestamp"])
      .index("by_starred", ["starred"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
