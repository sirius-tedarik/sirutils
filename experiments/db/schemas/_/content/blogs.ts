// 755056963a91980c16223c6e604690b360151340775a47bc1736eb4d99633cf452360a4ee41a23572afd8cb4aada98c39b83789f7a77604ca7ea36d35da739a2
import { ProjectError, unwrap, wrap } from "@sirutils/core";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { schemaTags } from "@sirutils/schema";

declare global {
    namespace Sirutils {
        namespace Schema {
            namespace Generated {
                interface Tables {
                    blogs: Blogs;
                }
            }
        }
    }
}


import { type Static, Type } from "@sinclair/typebox";

export type Blogs = Static<typeof $blogs>;
export const $blogs = Type.Object(
    {
        id: Type.String(),
        author: Type.Object(
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
            { $id: "author" }
        ),
        viewers: Type.Array(
            Type.Object(
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
                { $id: "viewers" }
            ),
            { defaults: [] }
        ),
    },
    { $id: "$blogs" }
);
const compiled = TypeCompiler.Compile($blogs);
export const blogs = wrap((data: Blogs) => {
    const result = compiled.Check(data)
    if (!result) {
        unwrap(ProjectError.create(schemaTags.invalidData, 'invalid data').appendData([...compiled.Errors(data)]).asResult())
    }
    return true as const
}
    , schemaTags.invalidData);
