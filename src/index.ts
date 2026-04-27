import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { registerSnapHandler } from "@farcaster/snap-hono";
import type { SnapFunction } from "@farcaster/snap";
import fs from "fs";
import path from "path";

const app = new Hono();

function getBaseUrl(): string {
  const fromEnv = process.env.SNAP_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3003";
}

const snap: SnapFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const screen = url.searchParams.get("screen");
  const baseUrl = getBaseUrl();

  if (screen === "image") {
    return {
      version: "2.0",
      theme: { accent: "purple" },
      ui: {
        root: "page",
        elements: {
          page: {
            type: "stack",
            props: {},
            children: ["img"],
          },
          img: {
            type: "image",
            props: {
              url: `${baseUrl}/image.png`,
              aspect: "1:1",
              alt: "image",
            },
          },
        },
      },
    };
  }

  return {
    version: "2.0",
    theme: { accent: "purple" },
    ui: {
      root: "page",
      elements: {
        page: {
          type: "stack",
          props: {},
          children: ["btn"],
        },
        btn: {
          type: "button",
          props: { label: "testing", variant: "primary" },
          on: {
            press: {
              action: "submit",
              params: { target: `${baseUrl}/?screen=image` },
            },
          },
        },
      },
    },
  };
};

registerSnapHandler(app, snap, {
  skipJFSVerification: process.env.SKIP_JFS_VERIFICATION === "1",
});

// Serve image.png from /public
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
