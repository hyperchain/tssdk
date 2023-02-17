// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init, invokeHvmContract } from "../common";

describe("ContractService.deploy", () => {
  test("normal test", async () => {
    const { deployHvmResult } = await invokeHvmContract();
    console.log(deployHvmResult);
  });
});

describe("ContractService.getReceipt", () => {
  test("normal test", async () => {
    const { contractService } = await init();
    const { deployHvmResult } = await invokeHvmContract();
    const request = contractService.getReceipt(deployHvmResult.result.txHash);
    const response = await request.send();
    console.log(response.result);
  });
});

// describe("ContractService.compileContract", () => {
//   test("normal test", async () => {
//     const code =
//       "contract ByteArrayTest {\n" +
//       "    bytes name;\n" +
//       "\n" +
//       "    function ByteArrayTest(bytes name1) public {\n" +
//       "        name = name1;\n" +
//       "    }\n" +
//       "\n" +
//       "    function testArray(uint32[2] a, bool[2] b) public returns (uint32[2], bool[2]){\n" +
//       "        return (a, b);\n" +
//       "    }\n" +
//       "}";
//     const { contractService } = await init();
//     const request = contractService.compileContract(code);
//     const response = await request.send();
//     expect(response.code).toBe(0);
//     console.log(response.result);
//   });
// });

describe("ContractService.getCode", () => {
  test("normal test", async () => {
    const { contractService } = await init();
    const { deployHvmResult } = await invokeHvmContract();
    const request = contractService.getCode(deployHvmResult.result.contractAddress);
    const response = await request.send();
    expect(response.code).toBe(0);
    console.log(response.result);
  });
});

describe("ContractService.getContractCountByAddr", () => {
  test("normal test", async () => {
    const { contractService } = await init();
    const request = contractService.getContractCountByAddr(
      "6275b09dbb9d49252150e52647101665f8f60ca4"
    );
    const response = await request.send();
    expect(response.code).toBe(0);
    console.log(response.result);
  });
});

describe("ContractService.getDeployedList", () => {
  test("normal test", async () => {
    const { contractService } = await init();
    const request = contractService.getDeployedList("6275b09dbb9d49252150e52647101665f8f60ca4");
    const response = await request.send();
    expect(response.code).toBe(0);
    console.log(response.result);
  });
});

describe("ContractService.getCreator", () => {
  test("normal test", async () => {
    const { contractService } = await init();
    const { deployHvmResult } = await invokeHvmContract();
    const request = contractService.getCreator(deployHvmResult.result.contractAddress);
    const response = await request.send();
    expect(response.code).toBe(0);
    expect(response.result).toBe("0x6275b09dbb9d49252150e52647101665f8f60ca4");
  });
});

describe("ContractService.getCreateTime", () => {
  test("normal test", async () => {
    const { contractService } = await init();
    const { deployHvmResult } = await invokeHvmContract();
    const request = contractService.getCreator(deployHvmResult.result.contractAddress);
    const response = await request.send();
    expect(response.code).toBe(0);
  });
});
