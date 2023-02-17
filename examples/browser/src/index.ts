import * as HvmTest from "./hvm-test";
import * as EvmTest from "./evm-test";
import * as BvmTest from "./bvm-test";
import { logger } from "@hyperchain/jssdk";

logger.level = "debug";

HvmTest.deployBtnOnClickInit();
HvmTest.invokeBtnOnClickInit();

EvmTest.deployBtnOnClickInit();
EvmTest.testIntAndUint();

// BvmTest.testDidOperation();
// BvmTest.testProposalOperation();
