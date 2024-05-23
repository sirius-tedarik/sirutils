// f17ee7a0355d7d8354908fb22c698b8704fa8182d0533ec14aba347bcbe0fed77365603a4c13904881d30f002838dcf41e470e0a60887e93305fe6dd2b3b02c9
declare global {
    namespace Sirutils {
        namespace Schema {
            namespace Generated {
                interface Tables {
                    users: Users;
                }

                interface Users {
                    id: string;
                    name: string;
                    surname: string;
                    age: number;
                    isAdmin?: boolean;
                }
            }
        }
    }
}
