const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = 3000;

const mime = {
  ".html": "text/html",
  ".js":   "text/javascript",
  ".css":  "text/css",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
};

http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  const ext      = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": mime[ext] || "text/plain" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`BlazeRun sur http://localhost:${PORT}`));
