import {inferAsyncReturnType} from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

export async function createContext(ctx: trpcNext.CreateNextContextOptions) {
	return ctx;
}
export type Context = inferAsyncReturnType<typeof createContext>;
