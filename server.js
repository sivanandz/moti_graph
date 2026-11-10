const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = 3100;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const OUT_DIR = path.join(ROOT_DIR, "out");

let activeRender = null;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoints ---
  if (pathname === "/api/projects" && req.method === "GET") {
    const projectsPath = path.join(ROOT_DIR, "projects.json");
    if (fs.existsSync(projectsPath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(fs.readFileSync(projectsPath, "utf-8"));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify([]));
    }
    return;
  }

  if (pathname === "/api/investigate" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { topic, formats, languages, customAngle } = JSON.parse(body);
        if (!topic) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Topic title is required" }));
          return;
        }

        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const projectsPath = path.join(ROOT_DIR, "projects.json");
        let projects = [];
        if (fs.existsSync(projectsPath)) {
          projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
        }

        const newProj = {
          id: slug,
          title: topic,
          subtitle: customAngle || "Autonomous Investigation // Multi-Format Production",
          topic: topic,
          tag: "AUTONOMOUS DOSSIER // AGENTIC PIPELINE",
          languages: languages || ["en", "ta", "hi"],
          formats: formats || ["16x9", "9x16"],
          status: "investigating",
          createdAt: new Date().toISOString()
        };

        const existingIdx = projects.findIndex((p) => p.id === slug);
        if (existingIdx >= 0) {
          projects[existingIdx] = { ...projects[existingIdx], ...newProj };
        } else {
          projects.unshift(newProj);
        }
        fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), "utf-8");

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", project: newProj }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === "/api/dossier" && req.method === "GET") {
    const topic = parsedUrl.searchParams.get("topic") || "apollo";
    const dossierPath = path.join(ROOT_DIR, "01_research", "dossier.json");
    if (fs.existsSync(dossierPath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(fs.readFileSync(dossierPath, "utf-8"));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "none", message: "No research dossier active yet" }));
    }
    return;
  }

  if (pathname === "/api/manifest" && req.method === "GET") {
    const topic = parsedUrl.searchParams.get("topic") || "apollo";
    const projectsPath = path.join(ROOT_DIR, "projects.json");
    let manifestPath = null;
    if (fs.existsSync(projectsPath)) {
      try {
        const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
        const proj = projects.find((p) => p.id === topic);
        if (proj && proj.manifestPath) {
          manifestPath = path.join(ROOT_DIR, proj.manifestPath);
        }
      } catch (e) {}
    }
    if (!manifestPath || !fs.existsSync(manifestPath)) {
      if (topic === "apollo") {
        manifestPath = path.join(PUBLIC_DIR, "audio", "apollo", "manifest.json");
      } else {
        manifestPath = path.join(PUBLIC_DIR, "audio", "manifest.json");
      }
    }
    if (fs.existsSync(manifestPath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(fs.readFileSync(manifestPath, "utf-8"));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Manifest not found" }));
    }
    return;
  }

  if (pathname === "/api/renders" && req.method === "GET") {
    if (!fs.existsSync(OUT_DIR)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify([]));
      return;
    }
    const files = fs.readdirSync(OUT_DIR).map((f) => ({
      name: f,
      size: fs.statSync(path.join(OUT_DIR, f)).size,
      time: fs.statSync(path.join(OUT_DIR, f)).mtime,
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(files));
    return;
  }

  if (pathname === "/api/render" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        if (activeRender) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "A render job is already running" }));
          return;
        }

        // Support single render or batch jobs
        const jobs = payload.jobs && payload.jobs.length > 0
          ? payload.jobs
          : [{
              composition: payload.composition || "CleanVox-EN",
              outFile: payload.outFile || `out/${(payload.composition || "CleanVox-EN").toLowerCase()}.mp4`,
            }];

        activeRender = {
          jobs,
          currentJobIndex: 0,
          composition: jobs[0].composition,
          out: jobs[0].outFile,
          status: "running",
          logs: [`[QUEUE] Queued ${jobs.length} render job(s).`],
        };

        function runJob(index) {
          if (index >= jobs.length) {
            activeRender.status = "done";
            activeRender.logs.push(`[COMPLETE] All ${jobs.length} render jobs finished.`);
            setTimeout(() => {
              activeRender = null;
            }, 30000);
            return;
          }

          const currentJob = jobs[index];
          activeRender.currentJobIndex = index;
          activeRender.composition = currentJob.composition;
          activeRender.out = currentJob.outFile;
          activeRender.logs.push(`[REMOTION] Starting Job ${index + 1}/${jobs.length}: ${currentJob.composition} -> ${currentJob.outFile}`);

          const child = spawn("npx.cmd", ["remotion", "render", currentJob.composition, currentJob.outFile], {
            shell: true,
            cwd: ROOT_DIR,
          });

          child.stdout.on("data", (data) => {
            const line = data.toString();
            activeRender.logs.push(line);
            console.log(`[REMOTION] ${line.trim()}`);
          });

          child.stderr.on("data", (data) => {
            const line = data.toString();
            activeRender.logs.push(line);
            console.error(`[REMOTION] ${line.trim()}`);
          });

          child.on("close", (code) => {
            if (code === 0) {
              activeRender.logs.push(`[REMOTION] Job ${index + 1} succeeded.`);
              runJob(index + 1);
            } else {
              activeRender.status = "failed";
              activeRender.code = code;
              activeRender.logs.push(`[REMOTION] Job ${index + 1} failed with exit code ${code}.`);
              setTimeout(() => {
                activeRender = null;
              }, 30000);
            }
          });
        }

        runJob(0);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "started", jobsCount: jobs.length }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === "/api/render-status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(activeRender || { status: "idle" }));
    return;
  }

  if (pathname === "/api/delegate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { scenePath, prompt } = JSON.parse(body);
        const scriptPath = path.join(
          ROOT_DIR,
          ".agents",
          "plugins",
          "vox-motion-studio",
          "skills",
          "vox-motion-graphics",
          "scripts",
          "delegate_opencode.ps1"
        );

        spawn(
          "powershell",
          [
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            scriptPath,
            "-ScenePath",
            scenePath || "src/scenes/Beat01_ColdOpen.tsx",
            "-Prompt",
            prompt || "Refine this Vox Remotion scene.",
          ],
          { detached: true, stdio: "ignore" }
        ).unref();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "launched", scenePath, prompt }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === "/api/preview-remotion" && req.method === "POST") {
    spawn("npm.cmd", ["run", "dev"], {
      shell: true,
      cwd: ROOT_DIR,
      detached: true,
      stdio: "ignore",
    }).unref();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "studio_launched" }));
    return;
  }

  // --- Static File Routing ---
  let filePath = "";
  if (pathname === "/" || pathname === "/studio") {
    filePath = path.join(PUBLIC_DIR, "studio", "index.html");
  } else if (pathname.startsWith("/out/")) {
    filePath = path.join(OUT_DIR, pathname.replace("/out/", ""));
  } else {
    filePath = path.join(PUBLIC_DIR, pathname);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` 🎬 Vox Motion Studio Web UI running at:`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
