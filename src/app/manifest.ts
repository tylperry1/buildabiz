import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { id: "/", name: "Build A Biz", short_name: "Build A Biz", description: "Start Smart. Build Confidently.", start_url: "/dashboard", scope: "/", display: "standalone", background_color: "#F0FDF4", theme_color: "#064E3B", icons: [192, 512].map(size => ({ src: `/icons/${size}`, sizes: `${size}x${size}`, type: "image/png", purpose: "any" as const })).concat([{src:"/icons/512",sizes:"512x512",type:"image/png",purpose:"maskable" as "any"}]) };
}
