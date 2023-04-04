import {
  HttpProvider,
  InvokeParams,
  ProviderManager,
  ServiceManager,
  StringUtil,
  Transaction,
} from "@hyperchain/jssdk";

const argsSeparator = " ";
const TEST_HOST = "localhost:8081";

let contractAddressNew: string;

// 对 button 做 onClick 绑定：读取选中的文件，并将 buffer 转换为 hex
export function deployBtnOnClickInit() {
  const hvmContractFileElement = document.getElementById("hvm-contract");
  const hvmButton = document.getElementById("hvm-contract-button");
  if (hvmContractFileElement != null && hvmButton != null) {
    hvmButton.onclick = function () {
      const file: File | null | undefined = (
        hvmContractFileElement as HTMLInputElement
      ).files?.item(0);
      if (file != null) {
        file.arrayBuffer().then((buffer: ArrayBuffer) => {
          deploy(buffer);
        });
      }
    };
  }
}

async function deploy(file: ArrayBuffer) {
  const accountJson = JSON.stringify({
    publicKey:
      "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
    privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
    address: "6275b09dbb9d49252150e52647101665f8f60ca4",
    algo: "0x13",
    version: "4.0",
  });

  // 1. 新建 provider mananger
  const httpProvider1 = new HttpProvider(1, TEST_HOST);
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
  });
  // 2. 新建 account
  const accountService = ServiceManager.getAccountService(providerManager);
  const account = accountService.fromAccountJson(accountJson);
  // 3. 创建交易体
  const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
    .deploy(file)
    .then((builder) => builder.build());
  // 4. 签名
  transaction.sign(account);
  // 5. 通过 contract service 部署
  const contractService = ServiceManager.getContractService(providerManager);
  const deployRequest = contractService.deploy(transaction);
  const response = await deployRequest.send();
  const deployResult = await response.poll();
  contractAddressNew = deployResult.result.contractAddress;
  console.log(deployResult);
}

export function invokeBtnOnClickInit() {
  const contractAddressElement = document.getElementById("contract-address");
  const hvmAbiFileElement = document.getElementById("abi-file");
  const beanTypeInputElement = document.getElementById("bean-type");
  const beanNameInputElement = document.getElementById("bean-name");
  const argsInputElement = document.getElementById("args");
  const hvmAbiButton = document.getElementById("hvm-abi-button");
  if (
    contractAddressElement != null &&
    hvmAbiFileElement != null &&
    beanTypeInputElement != null &&
    beanNameInputElement != null &&
    hvmAbiButton != null &&
    argsInputElement != null
  ) {
    hvmAbiButton.onclick = function () {
      const file: File | null | undefined = (hvmAbiFileElement as HTMLInputElement).files?.item(0);
      if (file == null) {
        alert("please select an abi file first!");
        return;
      }
      file.arrayBuffer().then((buffer: ArrayBuffer) => {
        invoke(
          (contractAddressElement as HTMLInputElement).value,
          buffer,
          (beanTypeInputElement as HTMLInputElement).value,
          (beanNameInputElement as HTMLInputElement).value,
          (argsInputElement as HTMLInputElement).value
        );
      });
    };
  }
}

async function invoke(
  contractAddress: string,
  file: ArrayBuffer,
  beanType: string,
  beanName: string,
  args: string
) {
  if (contractAddress === "") {
    contractAddress = contractAddressNew;
  }
  const accountJson = JSON.stringify({
    publicKey:
      "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
    privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
    address: "6275b09dbb9d49252150e52647101665f8f60ca4",
    algo: "0x13",
    version: "4.0",
  });
  // 1. 新建 provider manager
  const httpProvider1 = new HttpProvider(1, TEST_HOST);
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
  });
  // 2. 新建 account
  const accountService = ServiceManager.getAccountService(providerManager);
  const account = accountService.fromAccountJson(accountJson);
  // 3. 创建交易体
  const params = new InvokeParams.HvmAbiBuilder(file, beanType as any, beanName);
  if (args !== "") {
    args.split(argsSeparator).forEach((argStr) => {
      params.addParam(argStr);
    });
  }
  const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
    .invoke(contractAddress, params.build())
    .build();
  // 4. 签名
  transaction.sign(account);
  // 5. 通过 contract service 部署
  const contractService = ServiceManager.getContractService(providerManager);
  const invokeRequest = contractService.invoke(transaction);
  const response = await invokeRequest.send();
  const invokeResult = await response.poll();
  console.log("--------invokeResult", StringUtil.fromHex(invokeResult.result.ret));
}
