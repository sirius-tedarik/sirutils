// 2b8f9919de5581622b7fa56a3d44ac9c8cf0f56bbe1842502f96ee205f892604497c88f378b945b2b02905f93b1414bf93e737c2d7522a0d65a8d619b8b80217
declare global {
    namespace Sirutils {
        namespace Schema {
            namespace Generated {
                interface Tables {
                    users: Users;
                }
            }
        }
    }
}


import { type Static, Type } from "@sinclair/typebox";

export type Users = Static<typeof users>;
export const users = Type.Object(
  {
    id: Type.Optional(Type.String()),
    name: Type.Optional(Type.String({ maxLength: 255 })),
    surname: Type.Optional(Type.Number({ maxLength: 255 })),
    age: Type.Optional(Type.Number({ attributes: ["personal"] })),
    isAdmin: Type.Optional(Type.Boolean()),
  },
  { $id: "users" }
);