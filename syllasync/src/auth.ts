import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Super user bypass
        if (credentials.email === "admin" && credentials.password === "adminss3") {
          return { id: "admin_id", email: "admin@syllasync.com", name: "System Admin", role: "ADMIN" };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (user && user.passwordHash === credentials.password) {
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET || "syllasync_super_secret_key_12345",
});
