import "server-only";
import {configured,supabase} from "./supabase/server";
export type Price={id:string;amount_cents:number;renewal_cents:number|null;billing_months:number;setup_cents:number;required_cents:number;verified_at:string;currency:string;source_url:string};
export type Plan={id:string;name:string;description:string;provider_products:{name:string;marketplace_categories:{slug:string;name:string};providers:{id:string;name:string;website:string;enabled:boolean}};plan_prices:Price[];plan_features:{name:string;value:string}[];offers:{id:string;title:string;terms:string;ends_at:string|null}[]};
const selection="id,name,description,provider_products!inner(name,marketplace_categories!inner(slug,name),providers!inner(id,name,website,enabled)),plan_prices(*),plan_features(name,value),offers(*)";
export async function publicPlans(ids?:string[]){if(!configured())return [];const filter=ids?.length?`&id=in.(${ids.join(",")})`:"";return await supabase(`/rest/v1/provider_plans?select=${selection}&order=name&plan_prices.order=verified_at.desc${filter}`) as Plan[];}
export async function referralMap(){if(!configured())return new Map<string,string>();const rows: {provider_id:string;slug:string}[]=await supabase("/rest/v1/rpc/public_affiliate_links",{method:"POST",body:"{}"});return new Map(rows.map(r=>[r.provider_id,r.slug]));}
export function latestPrice(plan:Plan){return [...plan.plan_prices].sort((a,b)=>b.verified_at.localeCompare(a.verified_at))[0];}
export function money(cents:number,currency="USD"){return new Intl.NumberFormat("en-US",{style:"currency",currency}).format(cents/100);}
