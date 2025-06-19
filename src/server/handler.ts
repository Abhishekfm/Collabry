import { appRouter } from "./api/root";
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  //   createContext: () => ({}),
});
