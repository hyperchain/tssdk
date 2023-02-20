import fs from "fs";
import path from "path";
import {
  Algo,
  HttpProvider,
  ProviderManager,
  ServiceManager,
  Transaction,
  logger,
  InvokeParams,
  StringUtil,
} from "../../src";
import { BeanType } from "../../src/common/type/vm/hvm";

describe("InvokeParams", () => {
  test("HvmAbiParamsBuilder", () => {
    const abiBuffer: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/setHash/setHash.abi")
    );

    {
      const paramsBuilder = new InvokeParams.HvmAbiParamsBuilder(
        abiBuffer,
        BeanType.InvokeBean,
        "com.hyperchain.contract.setHash.invoke.SetHashInvoke"
      );
      paramsBuilder.addParam("hello").addParam("world");
      const params = paramsBuilder.build();
      expect(params.getParams()).toBe(
        "000005af0034cafebabe00000034003a0a000e002509000d002609000d00270700280a000400250800290a0004002a0b000b002b0a0004002c0a0004002d07002e0a000d002f0700300700310700320100036b65790100124c6a6176612f6c616e672f537472696e673b01000576616c75650100124c6a6176612f6c616e672f4f626a6563743b0100063c696e69743e010003282956010004436f646501000f4c696e654e756d6265725461626c650100124c6f63616c5661726961626c655461626c65010004746869730100364c636f6d2f6879706572636861696e2f636f6e74726163742f736574486173682f696e766f6b652f53657448617368496e766f6b653b010027284c6a6176612f6c616e672f537472696e673b4c6a6176612f6c616e672f4f626a6563743b2956010006696e766f6b65010044284c636f6d2f6879706572636861696e2f636f6e74726163742f736574486173682f6c6f6769632f49736574486173683b294c6a6176612f6c616e672f537472696e673b01000869736574486173680100304c636f6d2f6879706572636861696e2f636f6e74726163742f736574486173682f6c6f6769632f49736574486173683b010042284c636e2f6879706572636861696e2f636f6e74726163742f42617365436f6e7472616374496e746572666163653b294c6a6176612f6c616e672f4f626a6563743b0100095369676e61747572650100794c6a6176612f6c616e672f4f626a6563743b4c636e2f6879706572636861696e2f636f6e74726163742f42617365496e766f6b653c4c6a6176612f6c616e672f537472696e673b4c636f6d2f6879706572636861696e2f636f6e74726163742f736574486173682f6c6f6769632f49736574486173683b3e3b01000a536f7572636546696c6501001253657448617368496e766f6b652e6a6176610c001400150c001000110c001200130100176a6176612f6c616e672f537472696e674275696c6465720100000c003300340c003500360c003300370c0038003901002e636f6d2f6879706572636861696e2f636f6e74726163742f736574486173682f6c6f6769632f49736574486173680c001c001d010034636f6d2f6879706572636861696e2f636f6e74726163742f736574486173682f696e766f6b652f53657448617368496e766f6b650100106a6176612f6c616e672f4f626a656374010021636e2f6879706572636861696e2f636f6e74726163742f42617365496e766f6b65010006617070656e6401002d284c6a6176612f6c616e672f537472696e673b294c6a6176612f6c616e672f537472696e674275696c6465723b01000773657448617368010027284c6a6176612f6c616e672f537472696e673b4c6a6176612f6c616e672f4f626a6563743b295a01001c285a294c6a6176612f6c616e672f537472696e674275696c6465723b010008746f537472696e6701001428294c6a6176612f6c616e672f537472696e673b0021000d000e0001000f0002000200100011000000020012001300000004000100140015000100160000002f00010001000000052ab70001b10000000200170000000600010000000900180000000c0001000000050019001a000000010014001b0001001600000059000200030000000f2ab700012a2bb500022a2cb50003b10000000200170000001200040000000d0004000e0009000f000e001000180000002000030000000f0019001a00000000000f0010001100010000000f0012001300020001001c001d00010016000000550004000200000021bb000459b700051206b600072b2ab400022ab40003b900080300b60009b6000ab0000000020017000000060001000000160018000000160002000000210019001a000000000021001e001f00011041001c0020000100160000003300020002000000092a2bc0000bb6000cb00000000200170000000600010000000700180000000c0001000000090019001a0000000200210000000200220023000000020024636f6d2e6879706572636861696e2e636f6e74726163742e736574486173682e696e766f6b652e53657448617368496e766f6b657b226b6579223a2268656c6c6f222c2276616c7565223a22776f726c64227d"
      );
    }

    {
      const paramsBuilder = new InvokeParams.HvmAbiParamsBuilder(
        abiBuffer,
        BeanType.MethodBean,
        "getHash"
      );
      paramsBuilder.addParam("hello");
      const params = paramsBuilder.build();
      expect(params.getParams()).toBe(
        "fefffbce0007676574486173680010000000056a6176612e6c616e672e537472696e6768656c6c6f"
      );
    }
  });

  test("setHash contract", async () => {
    const httpProvider = new HttpProvider(1, "localhost:8081");
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider],
    });
    const contractService = ServiceManager.getContractService(providerManager);
    const accountService = ServiceManager.getAccountService(providerManager);

    const account = accountService.genAccount(Algo.SMRAW);

    const jarBuffer: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/setHash/setHash.jar")
    );
    const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .deploy(jarBuffer)
      .then((builder) => builder.build());
    transaction.sign(account);

    const request = contractService.deploy(transaction);
    const response = await request.send();
    const receipt = await response.poll();
    const contractAddress = receipt.result.contractAddress;
    logger.info(`contractAddress: ${contractAddress}`);
    logger.info("=========================== deploy contract success ===========================");

    // setHash(test, {a: 1, b: 2})
    {
      const params = new InvokeParams.HvmDirectParamsBuilder("setHash");
      params.addString("test").addObject("java.lang.Object", {
        a: 1,
        b: 2,
      });
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      expect(decodedRet).toBe("true");
      logger.info(`result of setHash: ${decodedRet}`);
      logger.info("=========================== setHash success ===========================");
    }

    // setHash(y, qb)
    {
      const params = new InvokeParams.HvmDirectParamsBuilder("setHash");
      params.addString("y").addObject("java.lang.Object", "qb");
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      expect(decodedRet).toBe("true");
      logger.info(`result of setHash: ${decodedRet}`);
      logger.info("=========================== setHash success ===========================");
    }

    // SetHashInvoke
    {
      const abiBuffer: Buffer = fs.readFileSync(
        path.resolve(__dirname, "../resource/hvm-jar/setHash/setHash.abi")
      );
      const params = new InvokeParams.HvmAbiParamsBuilder(
        abiBuffer,
        BeanType.InvokeBean,
        "com.hyperchain.contract.setHash.invoke.SetHashInvoke"
      );
      params.addParam("hello").addParam("world");
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of SetHashInvoke: ${decodedRet}`);
      logger.info("=========================== SetHashInvoke success ===========================");
    }

    // getSize()
    {
      const params = new InvokeParams.HvmDirectParamsBuilder("getSize");
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of getSize: ${decodedRet}`);
      logger.info("=========================== getSize success ===========================");
    }

    // getHash(test)
    {
      const abiBuffer: Buffer = fs.readFileSync(
        path.resolve(__dirname, "../resource/hvm-jar/setHash/setHash.abi")
      );
      const params = new InvokeParams.HvmAbiParamsBuilder(
        abiBuffer,
        BeanType.MethodBean,
        "getHash"
      );
      params.addParam("test");
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of getHash(test): ${decodedRet}`);
      logger.info("=========================== getHash(test) success ===========================");
      expect(decodedRet).toBe(`{"a":1,"b":2}`);
    }

    // get(hello)
    {
      const abiBuffer: Buffer = fs.readFileSync(
        path.resolve(__dirname, "../resource/hvm-jar/setHash/setHash.abi")
      );
      const params = new InvokeParams.HvmAbiParamsBuilder(
        abiBuffer,
        BeanType.MethodBean,
        "getHash"
      );
      params.addParam("hello");
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of getHash(hello): ${decodedRet}`);
      expect(decodedRet).toBe("world");
      logger.info("=========================== getHash(hello) success ===========================");
    }
  });

  test("contractcollection-2.0-SNAPSHOT contract", async () => {
    const httpProvider = new HttpProvider(1, "localhost:8081");
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider],
    });
    const contractService = ServiceManager.getContractService(providerManager);
    const accountService = ServiceManager.getAccountService(providerManager);

    const account = accountService.genAccount(Algo.SMRAW);

    const jarBuffer: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/contractcollection-2.0-SNAPSHOT.jar")
    );
    const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .deploy(jarBuffer)
      .then((builder) => builder.build());
    transaction.sign(account);

    const request = contractService.deploy(transaction);
    const response = await request.send();
    const receipt = await response.poll();
    const contractAddress = receipt.result.contractAddress;
    logger.info(`contractAddress: ${contractAddress}`);
    logger.info("=========================== deploy contract success ===========================");

    {
      const params = new InvokeParams.HvmDirectParamsBuilder("add");
      params.addObject("cn.test.logic.entity.Person", {
        name: "yqb",
        age: 1,
        balance: 9999,
      });
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of add: ${decodedRet}`);
      expect(decodedRet).toBe("null");
      logger.info("=========================== add success ===========================");
    }

    {
      const params = new InvokeParams.HvmDirectParamsBuilder("get");
      params.addIntPrimitive(0);
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of get: ${decodedRet}`);
      expect(decodedRet).toBe(`{"name":"db1","age":10,"balance":10}`);
      logger.info("=========================== get success ===========================");
    }
  });

  test("boundary-complement overload", async () => {
    const httpProvider = new HttpProvider(1, "localhost:8081");
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider],
    });
    const contractService = ServiceManager.getContractService(providerManager);
    const accountService = ServiceManager.getAccountService(providerManager);

    const account = accountService.genAccount(Algo.SMRAW);

    const jarBuffer: Buffer = fs.readFileSync(
      path.resolve(
        __dirname,
        "../resource/hvm-jar/boundary-complement/target/boundary-complement-1.0-table.jar"
      )
    );
    const abiBuffer: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/boundary-complement/target/hvm.abi")
    );

    const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .deploy(jarBuffer)
      .then((builder) => builder.build());
    transaction.sign(account);

    const request = contractService.deploy(transaction);
    const response = await request.send();
    const receipt = await response.poll();
    const contractAddress = receipt.result.contractAddress;
    logger.info(`contractAddress: ${contractAddress}`);
    logger.info("=========================== deploy contract success ===========================");

    {
      const params = new InvokeParams.HvmAbiParamsBuilder(abiBuffer, BeanType.MethodBean, "getX()");
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of getX(): ${decodedRet}`);
      expect(decodedRet).toBe("5555");
      logger.info("=========================== getX() success ===========================");
    }

    {
      const params = new InvokeParams.HvmAbiParamsBuilder(
        abiBuffer,
        BeanType.MethodBean,
        "getX(int)"
      );
      params.addParam(123);
      const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
        .invoke(contractAddress, params.build())
        .build();
      transaction.sign(account);
      const request = contractService.invoke(transaction);
      const response = await request.send();
      const receipt = await response.poll();
      const ret = receipt.result.ret;
      const decodedRet = StringUtil.fromHex(ret);
      logger.info(`result of getX(int): ${decodedRet}`);
      expect(decodedRet).toBe(`123`);
      logger.info("=========================== getX(int) success ===========================");
    }
  });
});
