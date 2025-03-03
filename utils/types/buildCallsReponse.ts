import { Call } from "./call";

export type BuildCallsResponse = {
  success: boolean;
  data: { calls: Call[] };
};
