// 6097fdc18f8535920e8f9fc7498c911da5151bbb4e7f1886118b1e93b0b79a2d22c5bfa1e33e08d366a71fdec22bccf25d96a52091e2d417b32e961c0bcb831c
declare global {
    namespace Sirutils {
        namespace Schema {
            namespace Generated {
                interface Tables {
                    blogs: Blogs;
                }

                interface Blogs {
                    id: string;
                    author: Sirutils.Schema.Generated.Users;
                    viewers: Sirutils.Schema.Generated.Users[];
                }
            }
        }
    }
}
