enum Algo {
  ECKDF2 = "0x01",
  ECDES = "0x02",
  ECRAW = "0x03",
  ECAES = "0x04",
  EC3DES = "0x05",

  ECKDF2R1 = "0x011",
  ECDESR1 = "0x021",
  ECRAWR1 = "0x031",
  ECAESR1 = "0x041",
  EC3DESR1 = "0x051",

  SMSM4 = "0x11",
  SMDES = "0x12",
  SMRAW = "0x13",
  SMAES = "0x14",
  SM3DES = "0x15",

  ED25519DES = "0x21",
  ED25519RAW = "0x22",
  ED25519AES = "0x23",
  ED255193DES = "0x24",

  // PKI requires a pkcs12 certificate as an input in PKI Account.
  PKI = "0x41",
}

export default Algo;
