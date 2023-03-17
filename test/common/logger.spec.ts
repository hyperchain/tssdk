import fs from "fs";
import path from "path";
import shelljs from "shelljs";
import { HttpProvider, ProviderManager, logger, resetLogger } from "../../src";
import { DailyRotateFileTransport } from "../../src/common/logger";

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

describe("DailyRotateFileTransport", () => {
  beforeAll(() => {
    if (fs.existsSync(todayLogPath)) {
      fs.rmSync(todayLogPath, {
        recursive: true,
        force: true,
      });
    }
    console.log("beforeAll: 日志清理完毕");
    resetLogger();
  });

  test("异步的测试输出 after 1.5s", async () => {
    const num = await getNumAfter(1500);
    logger.info("异步输出的日志 after 1.5s");
    x += num;
    expect(x).toBe(1);
  });

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

  test("同步的测试输出", async () => {
    logger.info("同步输出的日志");
  });

  test("异步的测试输出 after 0.5s", async () => {
    const num = await getNumAfter(500);
    logger.info("异步输出的日志 after 0.5s");
    x += num;
    expect(x).toBe(2);
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      logger.transports.forEach((t) => {
        t.on(DailyRotateFileTransport.LOG_END_EVENT, () => {
          resolve();
        });
      });
      logger.end();
    });
    resetLogger();
    // htmlConvert(todayLogPath);
  });
});

function htmlConvert(filePath: string) {
  const logPyToolPath = path.resolve(__dirname, "../resource/py/tool.py");
  const ret = shelljs.exec(`python3 ${logPyToolPath} -f ${filePath}`);
}
