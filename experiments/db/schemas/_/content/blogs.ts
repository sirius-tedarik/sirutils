// 755056963a91980c16223c6e604690b360151340775a47bc1736eb4d99633cf452360a4ee41a23572afd8cb4aada98c39b83789f7a77604ca7ea36d35da739a2
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

export type Blogs = Static<typeof blogs>;
export const blogs = Type.Object(
  { id: Type.Optional(Type.String()) },
  { $id: "blogs" }
);

