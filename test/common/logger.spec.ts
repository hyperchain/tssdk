import fs from "fs";
import path from "path";
import { HttpProvider, ProviderManager, logger, resetLogger } from "../../src";

async function getNumAfter(ms: number): Promise<number> {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  ).then(() => 1);
}

// 日志目录
const date = new Date();
const logsDir = path.resolve(__dirname, "../../logs");
const todayLogPath = `${logsDir}/${date.getFullYear()}-${(date.getMonth() + 1)
  .toString()
  .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}.log`;

let x = 0;

jest.setTimeout(15000);

// logger.level = "debug";

describe("jest 执行顺序测试", () => {
  it("新建 ProviderManager 1", async () => {
    try {
      const httpProvider1 = new HttpProvider(1, "localhost:8081");
      const providerManager = await ProviderManager.createManager({
        httpProviders: [httpProvider1],
      });
    } catch (e: any) {
      logger.error(`providerManager 1 初始化失败: ${e.message}`);
    }
  });

  it("异步的测试输出 after 1.5s", async () => {
    const result = await getNumAfter(1500);
    logger.info("test 1: 异步输出的日志 after 1.5s");
    x = x + result;
    expect(x).toBe(1);
  });

  it("新建 ProviderManager 2", async () => {
    try {
      const httpProvider1 = new HttpProvider(1, "localhost:8081");
      const providerManager = await ProviderManager.createManager({
        httpProviders: [httpProvider1],
      });
    } catch (e: any) {
      logger.error(`providerManager 2 初始化失败: ${e.message}`);
    }
  });

  it("同步的输出", () => {
    logger.info("test 2: 同步输出的日志");
    x = x + 1;
    expect(x).toBe(2);
  });

  it("异步的测试输出 after 0.5s", async () => {
    const result = await getNumAfter(500);
    logger.info("test 3: 异步输出的日志 after 0.5s");
    x = x + result;
    expect(x).toBe(3);
  });
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    logger.on("finish", () => {
      setTimeout(() => {
        resolve();
      });
    });
    logger.end();
  });

  resetLogger();
  // logger.level = "debug";

  console.log("afterEach: ======> 读取日志文件");
  const buffer = fs.readFileSync(todayLogPath);
  console.log(buffer.toString());
  console.log("afterEach: ======> 收集日志结束");
  console.log(
    "=================================================================================================================="
  );
});

afterAll(() => {
  if (fs.existsSync(logsDir)) {
    fs.rmSync(logsDir, {
      recursive: true,
      force: true,
    });
  }
  console.log(`afterAll: 已清空 ${logsDir}`);
});
