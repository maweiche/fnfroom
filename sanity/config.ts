import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { muxInput } from "sanity-plugin-mux-input";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "Friday Night Film Room",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  plugins: [
    structureTool(),
    visionTool(),
    muxInput({
      mp4_support: "standard",
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
