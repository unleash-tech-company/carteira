import {
  createSchema,
  definePermissions,
  ANYONE_CAN,
  table,
  string,
  number,
  Row,
} from "@rocicorp/zero";

const posts = table("posts")
  .columns({
    id: number(),
    name: string(),
    createdAt: string(),
    updatedAt: string(),
  })
  .primaryKey("id");

export const schema = createSchema(1, {
  tables: [posts],
  relationships: [],
});

export type Schema = typeof schema;
export type Post = Row<typeof schema.tables.posts>;

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => ({
  posts: {
    row: {
      insert: ANYONE_CAN,
      update: {
        preMutation: ANYONE_CAN,
        postMutation: ANYONE_CAN,
      },
      delete: ANYONE_CAN,
      select: ANYONE_CAN,
    },
  },
})); 