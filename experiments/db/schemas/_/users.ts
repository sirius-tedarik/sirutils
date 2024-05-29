// 98c2b99b14850cad1ddcdab41956c4ad493a3dab73062481d9b23af57b50efb9415922e72a6f2dbe90db3000c62348d33b9b66f7a092034021a6bc92b49ad7fb
import { ProjectError, unwrap, wrap } from "@sirutils/core";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { schemaTags } from "@sirutils/schema";

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

export type Users = Static<typeof $users>;
export const $users = Type.Object(
    {
        id: Type.String(),
        name: Type.String({ maxLength: 255 }),
        surname: Type.String({ maxLength: 255 }),
        age: Type.Number(),
        isAdmin: Type.Optional(Type.Boolean()),
        attributes: Type.Array(
            Type.Object({ id: Type.Number() }, { $id: "attributes" }),
            { default: [] }
        ),
    },
    { $id: "$users" }
);
const compiled = TypeCompiler.Compile($users);
export const users = wrap((data: Users) => {
    const result = compiled.Check(data)
    if (!result) {
        unwrap(ProjectError.create(schemaTags.invalidData, 'invalid data').appendData([...compiled.Errors(data)]).asResult())
    }
    return true as const
}
    , schemaTags.invalidData);
