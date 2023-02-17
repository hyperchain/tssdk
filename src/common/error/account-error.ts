import { Account } from "../../account";

export class IllegalAccountError extends Error {
  constructor(account: Account) {
    super(`illegal account type, ${account.getAlgo()}`);
  }
}
