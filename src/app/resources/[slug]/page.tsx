import {notFound} from "next/navigation";
import {cache} from "react";
import {configured,supabase} from "@/lib/supabase/server";
import {Header,Footer} from "@/components/header";
const article=cache(async(slug:string)=>{if(!/^[a-z0-9-]{1,100}$/.test(slug)||!configured())return null;return (await supabase(`/rest/v1/content_pages?slug=eq.${slug}&published=eq.true&limit=1`))[0]||null;});
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const page=await article((await params).slug);return {title:page?.title||"Resource not found",description:page?.body.slice(0,160)};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const page=await article((await params).slug);if(!page)notFound();return <><Header/><main id="main" className="container section"><article style={{maxWidth:850}}><div className="eyebrow">BUILD A BIZ RESOURCES</div><h1>{page.title}</h1><div className="content-body">{page.body}</div></article></main><Footer/></>;}
