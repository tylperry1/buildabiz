import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {approvedDestination} from "@/lib/core.mjs";
import {supabase,configured} from "@/lib/supabase/server";
export async function GET(request:NextRequest,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!configured()||!/^[-a-z0-9]{1,100}$/.test(slug))return new NextResponse("Referral unavailable",{status:404});
 try{
  const ip=process.env.VERCEL?request.headers.get("x-vercel-forwarded-for")?.split(",")[0]||"unknown":"local";
  const visitorHash=createHash("sha256").update(`${process.env.AFFILIATE_TRACKING_SALT||"buildabiz"}:${ip}:${request.headers.get("user-agent")||"unknown"}:${new Date().toISOString().slice(0,10)}`).digest("hex");
  const resolved=await supabase("/rest/v1/rpc/resolve_affiliate",{method:"POST",body:JSON.stringify({link_slug:slug,visitor_hash:visitorHash})});
  if(resolved?.rate_limited)return new NextResponse("Please try again shortly",{status:429,headers:{"Retry-After":"60","Cache-Control":"no-store"}});
  if(!resolved||typeof resolved.destination!=="string"||!approvedDestination(resolved.destination,resolved.approved_host))return new NextResponse("Referral unavailable",{status:404});
  const response=NextResponse.redirect(resolved.destination,302);response.headers.set("Cache-Control","no-store");response.headers.set("X-Robots-Tag","noindex");return response;
 }catch{return new NextResponse("Referral unavailable",{status:503,headers:{"Cache-Control":"no-store"}});}
}
