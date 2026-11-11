import { ImageResponse } from "next/og";
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  if (!["180", "192", "512"].includes(size)) return new Response("Not found", { status: 404 });
  const width = Number(size);
  return new ImageResponse(<div style={{display:"flex",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",background:"#064E3B",color:"#A7F3D0",fontSize:width*.35,fontWeight:800}}>B<span style={{color:"#22C55E"}}>↗</span></div>, { width, height: width, headers: { "Cache-Control": "public, max-age=86400" } });
}
