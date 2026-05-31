import * as fs from "fs";
import * as path from "path";

export function setupFileLogger(
  options: { dir?: string; filename?: string } = {},
): void {
  const logsDir = path.resolve(options.dir ?? process.cwd(), "logs");
  const filename = options.filename ?? "app.log";
  fs.mkdirSync(logsDir, { recursive: true });
  const logStream = fs.createWriteStream(path.join(logsDir, filename), {
    flags: "a",
  });

  const tee = (
    original: typeof process.stdout.write,
  ): typeof process.stdout.write =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (chunk: any, encoding?: any, cb?: any) {
      logStream.write(chunk);
      return original(chunk, encoding, cb);
    };

  process.stdout.write = tee(process.stdout.write.bind(process.stdout));
  process.stderr.write = tee(process.stderr.write.bind(process.stderr));
}
