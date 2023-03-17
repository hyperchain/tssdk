import TransportStream from "winston-transport";
import fs from "fs";

interface LogInfo {
  message: string;
  level: string;
  nodeAuditFile: string;
  timestamp: string;
}

export default class DailyRotateFileTransport extends TransportStream {
  public static readonly LOG_END_EVENT = "hyperchain-log-end";
  private fileWiteStream: fs.WriteStream;
  private logDirAbsPath: string;
  private currentLogPath: string;

  constructor(logDirAbsPath: string) {
    super();
    if (!fs.existsSync(logDirAbsPath)) {
      fs.mkdirSync(logDirAbsPath);
    }
    this.logDirAbsPath = logDirAbsPath;
    this.currentLogPath = this.todayLogPath();
    this.fileWiteStream = this.createWriteStream();
  }

  public log(info: LogInfo, next: () => void) {
    // 一天之后需要新建日志
    if (this.isAfterOneDay()) {
      this.fileWiteStream.end();
      this.fileWiteStream = this.createWriteStream();
    }
    this.fileWiteStream.write(`[${info.level}][${info.timestamp}]: ${info.message}\n`);
    next();
  }

  public close(): void {
    this.fileWiteStream.end(() => {
      this.emit(DailyRotateFileTransport.LOG_END_EVENT);
    });
  }

  private isAfterOneDay() {
    // 通过比较时间文件名来判断是否已经是新的一天
    return this.todayLogPath() !== this.currentLogPath;
  }

  // logDir/YYYY-MM-DD.log
  private todayLogPath(): string {
    const date = new Date();
    const todayLogPath = `${this.logDirAbsPath}/${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}.log`;
    return todayLogPath;
  }

  private createWriteStream() {
    return fs.createWriteStream(this.todayLogPath(), {
      flags: "a",
    });
  }
}

// winston/logger.js 的 close 部分代码：
// _final(callback) {
//   const transports = this.transports.slice();
//   asyncForEach(
//     transports,
//     (transport, next) => {
//       if (!transport || transport.finished) return setImmediate(next);
//       transport.once('finish', next);
//       transport.end();
//     },
//     callback
//   );
// }
// 结论：transport.end() 只是触发了 transport 的 finish 事件，但是并没有等待”执行体“（例如写完文件）执行完毕再继续执行 callback
// 所以我们只能监听 transport 内的自定义的 "hyperchain-log-end" 事件
