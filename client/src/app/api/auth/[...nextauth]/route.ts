import { authClient } from "@/lib/authClient";
import { ApiUser, Tokens } from "@/types/user";
import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/services/authService";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) {
          return null;
        }

        let user: User;
        try {
          const { data: body } = await authClient.post<ApiUser & Tokens>(
            "/auth/login",
            {
              email,
              password,
            }
          );
          user = body.data;
        } catch (error) {
          console.error("Error in login:", error);
          return null;
        }

        const result = {
          id: user.id,
          email: user.email,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };

        return result;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // Expose the JWT access token
  callbacks: {
    async jwt({ token, account, user }) {
      // Inital credentials sign in
      if (user) {
        console.log("inital sign in")
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        return token;
      }
      // Or initial oauth sign in
      else if (account) {
        token.accessToken = account.access_token;
        return token;
      }

      try {
        if (!token.accessToken || !token.refreshToken) {
          throw new Error("Missing access or refresh token");
        }

        // Get expiratoin time of the token
        const { exp } = jwtDecode(token.accessToken);
        if (!exp) throw new Error("Missing expiration time in token");

        // Check if token is expired
        if (Date.now() < exp * 1000) {
          return token;
        }

        // Refresh token
        const { data: body } = await authClient.post<Tokens>("/auth/token", {
          refreshToken: token.refreshToken,
        });

        token.accessToken = body.data.accessToken;
        token.refreshToken = body.data.refreshToken;

        return token;
      } catch (error) {
        console.error("Error in JWT callback:", error);
        await logout();
        return {
          ...token,
          error: "JWT_ERROR",
        };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
