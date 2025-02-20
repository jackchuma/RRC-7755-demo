import { Step, TransactionTarget } from "@/utils/types/step";

export const steps: Step[] = [
  { id: 0, name: "Submit request", chainTarget: TransactionTarget.SRC },
  { id: 1, name: "Fulfill request", chainTarget: TransactionTarget.DST },
  { id: 2, name: "Generate Proof", chainTarget: TransactionTarget.NONE },
  { id: 3, name: "Claim reward", chainTarget: TransactionTarget.SRC },
];
