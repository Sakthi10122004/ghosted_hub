import { betterAuth } from "better-auth";
export const auth = betterAuth({
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          console.log(session);
        }
      }
    }
  }
});
