export enum TransactionTarget {
  NONE,
  SRC,
  DST,
}

export type Step = {
  id: number;
  name: string;
  chainTarget: TransactionTarget;
};
