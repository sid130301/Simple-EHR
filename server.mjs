import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const PORT = 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8"
};

createServer((request, response) => {
  const urlPath = request.url === "/" ? "/index.html" : request.url;
  const safePath = normalize(urlPath.replace(/^\/+/, "")).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(ROOT, safePath);

  if (!existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": MIME_TYPES[extname(filePath)] ?? "text/plain; charset=utf-8"
  });

  createReadStream(filePath).pipe(response);
}).listen(PORT, () => {
  console.log(`Simple EHR is available at http://localhost:${PORT}`);
});
