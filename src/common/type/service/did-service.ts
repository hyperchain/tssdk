import PlainObject from "../plain-object";

export interface Credential {
  id: string;
  type: string;
  issuer: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  signType: string;
  signature: string;
  subject: string;
}

export interface Document {
  didAddress: string;
  state: number;
  publicKey: {
    type: string;
    key: string;
  };
  admins: string[];
  extra: PlainObject;
}
