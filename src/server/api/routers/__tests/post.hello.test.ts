import { test, expect } from "@jest/globals";
import { db } from "../../../db";
import { type inferProcedureInput } from "@trpc/server";
import { type AppRouter, appRouter } from "../../root";
// import { createInnerTRPCContext } from "../../trpc";

test("hello test", async () => {
  const caller = appRouter.createCaller({
    session: null,
    db: db,
  });

  type Input = inferProcedureInput<AppRouter["post"]["hello"]>;

  const input: Input = {
    text: "test",
  };

  const result = await caller.post.hello(input);

  expect(result).toStrictEqual({ greeting: "Hello test" });
});
