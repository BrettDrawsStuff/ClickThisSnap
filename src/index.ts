import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { registerSnapHandler } from "@farcaster/snap-hono";
import fs from "fs";
import path from "path";

const app = new Hono();

function snapBaseUrl(request: Request): string {
  const fromEnv = process.env.SNAP_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const host = (forwardedHost ?? hostHeader)?.split(",")[0].trim();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isLoopback = host !== undefined && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  const proto = forwardedProto
    ? forwardedProto.split(",")[0].trim()
    : isLoopback ? "http" : "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3003";
}

function screen1(base: string) {
  return {
    version: "2.0" as const,
    theme: { accent: "purple" as const },
    ui: {
      root: "page",
      elements: {
        page: { type: "stack" as const, props: {}, children: ["btn"] },
        btn: {
          type: "button" as const,
          props: { label: "testing", variant: "primary" as const },
          on: {
            press: {
              action: "submit" as const,
              params: { target: `${base}/?screen=image` },
            },
          },
        },
      },
    },
  };
}

function screen2(base: string) {
  return {
    version: "2.0" as const,
    theme: { accent: "purple" as const },
    ui: {
      root: "page",
      elements: {
        page: { type: "stack" as const, props: {}, children: ["img"] },
        img: {
          type: "image" as const,
          props: {
            url: `${base}/image.png`,
            aspect: "1:1" as const,
            alt: "image",
          },
        },
      },
    },
  };
}

registerSnapHandler(app, async (ctx) => {
  const base = snapBaseUrl(ctx.request);
  const screen = new URL(ctx.request.url).searchParams.get("screen");
  return screen === "image" ? screen2(base) : screen1(base);
});

app.get("/image.png", (c) => {
  const filePath = path.join(process.cwd(), "public", "image.png");
  if (!fs.existsSync(filePath)) {
    return c.text("image.png not found", 404);
  }
  const file = fs.readFileSync(filePath);
  return c.body(file, 200, { "Content-Type": "image/png" });
});

const port = Number(process.env.PORT ?? 3003);
serve({ fetch: app.fetch, port });
console.log(`Snap running at http://localhost:${port}`);
