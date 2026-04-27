import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { registerSnapHandler } from "@farcaster/snap-hono";

const app = new Hono();

registerSnapHandler(app, async (ctx) => {
  const url = new URL(ctx.request.url);
  const screen = url.searchParams.get("screen");

  // Screen 2: show the image after button is clicked
  if (screen === "image") {
    const baseUrl = process.env.SNAP_PUBLIC_BASE_URL ?? "http://localhost:3003";
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

  // Screen 1: the button
  const baseUrl = process.env.SNAP_PUBLIC_BASE_URL ?? "http://localhost:3003";
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
});

// Serve static files from /public
app.get("/image.png", async (c) => {
  const fs = await import("fs");
  const path = await import("path");
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
