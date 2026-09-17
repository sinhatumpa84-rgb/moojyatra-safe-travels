import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function apiDevPlugin() {
  return {
    name: "api-dev-server",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url || !req.url.startsWith("/api/ai/")) {
          return next();
        }

        const urlParts = req.url.split("?")[0].split("/");
        const endpoint = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];

        // Ensure process.env has GROQ_API_KEY from .env
        const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
        for (const [k, v] of Object.entries(env)) {
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }

        // Collect body for POST
        let body: any = {};
        if (req.method === "POST") {
          const chunks: any[] = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const str = Buffer.concat(chunks).toString("utf-8");
          try {
            body = JSON.parse(str || "{}");
          } catch {
            body = str;
          }
        }
        req.body = body;

        // Augment res with helper methods
        res.status = function (code: number) {
          res.statusCode = code;
          return res;
        };
        res.json = function (data: any) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          let mod: any;
          if (endpoint === "travel-assistant") {
            mod = await server.ssrLoadModule("./api/ai/travel-assistant.ts");
          } else if (endpoint === "itinerary") {
            mod = await server.ssrLoadModule("./api/ai/itinerary.ts");
          } else if (endpoint === "optimize-trip") {
            mod = await server.ssrLoadModule("./api/ai/optimize-trip.ts");
          } else if (endpoint === "recommendations") {
            mod = await server.ssrLoadModule("./api/ai/recommendations.ts");
          } else if (endpoint === "search") {
            mod = await server.ssrLoadModule("./api/ai/search.ts");
          } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ error: `Not found: /api/ai/${endpoint}` }));
          }

          const handler = mod.default || mod;
          return await handler(req, res);
        } catch (err: any) {
          console.error("Local API Handler Error:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ error: err.message || "Internal server error" }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), apiDevPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
