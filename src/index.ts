import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { registerSnapHandler } from "@farcaster/snap-hono";
import fs from "fs";
import path from "path";

const app = new Hono();

function getBaseUrl(): string {
  const fromEnv = process.env.SNAP_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3003";
}

function screen1() {
  const baseUrl = getBaseUrl();
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
              params: { target: `${baseUrl}/?screen=image` },
            },
          },
        },
      },
    },
  };
}

function screen2() {
  const baseUrl = getBaseUrl();
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
            url: `${baseUrl}/image.png`,
            aspect: "1:1" as const,
            alt: "image",
          },
        },
      },
    },
  };
}

registerSnapHandler(app, async (ctx) => {
  const url = new URL(ctx.request.url);
  const screen = url.searchParams.get("screen");
  return screen === "image" ? screen2() : screen1();
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
