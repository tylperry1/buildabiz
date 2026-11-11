import {z} from "zod";
const uuid=z.string().uuid();const name=z.string().min(1).max(150);const slug=z.string().regex(/^[a-z0-9-]+$/);const description=z.string().max(5000);const https=z.url().startsWith("https://");
const cents=z.coerce.number().int().min(0).max(2147483647);
const jsonList=z.string().transform((v,ctx)=>{try{return z.array(z.string().max(120)).max(20).parse(JSON.parse(v));}catch{ctx.addIssue({code:"custom",message:"Enter a JSON array of configuration names"});return z.NEVER;}});
export const adminSchemas={
 providers:z.object({name,slug,website:https,approved_host:z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/),description,enabled:z.boolean()}),
 marketplace_categories:z.object({name,slug,description}),
 provider_products:z.object({name,provider_id:uuid,category_id:uuid}),
 provider_plans:z.object({name,product_id:uuid,description}),
 plan_prices:z.object({plan_id:uuid,amount_cents:cents,renewal_cents:z.preprocess(v=>v===""?null:v,cents.nullable()),billing_months:z.coerce.number().int().min(1).max(36),setup_cents:cents,required_cents:cents,currency:z.string().regex(/^[A-Z]{3}$/),source_url:https,verified_at:z.iso.datetime()}),
 plan_features:z.object({plan_id:uuid,name,value:z.string().max(1000)}),
 offers:z.object({plan_id:uuid,title:name,terms:description,ends_at:z.preprocess(v=>v?new Date(String(v)).toISOString():null,z.iso.datetime().nullable())}),
 affiliate_programs:z.object({provider_id:uuid,name,status:z.enum(["Not Configured","Active","Disabled"])}),
 affiliate_links:z.object({provider_id:uuid,slug,destination:https,campaign:z.string().max(120),enabled:z.boolean()}),
 referral_events:z.object({link_id:uuid,event_type:z.enum(["reported_conversion","verified_commission"]),amount_cents:cents,external_reference:z.string().min(1).max(200)}),
 content_pages:z.object({slug,title:name,body:z.string().max(50000),published:z.boolean()}),
 feature_flags:z.object({key:z.string().regex(/^[a-z0-9_]+$/),description,enabled:z.boolean()}),
 integration_registry:z.object({name,integration_type:z.enum(["billing","email","database","other"]),adapter:z.enum(["manual","stripe","resend","supabase"]),requirements:jsonList,enabled:z.boolean()}),
 notifications:z.object({user_id:uuid,title:z.string().min(1).max(500)}),
 platform_settings:z.object({key:z.enum(["support_email","support_hours","contact_notice"]),value:z.string().max(2000)})
};
export type AdminResource=keyof typeof adminSchemas;
export const adminFields:Record<AdminResource,string[]>={providers:["name","slug","website","approved_host","description","enabled"],marketplace_categories:["name","slug","description"],provider_products:["name","provider_id","category_id"],provider_plans:["name","product_id","description"],plan_prices:["plan_id","amount_cents","renewal_cents","billing_months","setup_cents","required_cents","currency","source_url"],plan_features:["plan_id","name","value"],offers:["plan_id","title","terms","ends_at"],affiliate_programs:["provider_id","name","status"],affiliate_links:["provider_id","slug","destination","campaign","enabled"],referral_events:["link_id","event_type","amount_cents","external_reference"],content_pages:["slug","title","body","published"],feature_flags:["key","description","enabled"],integration_registry:["name","integration_type","adapter","requirements","enabled"],notifications:["user_id","title"],platform_settings:["key","value"]};
export const resourceOptions:Record<string,string[]>={status:["Not Configured","Active","Disabled"],event_type:["reported_conversion","verified_commission"],integration_type:["billing","email","database","other"],adapter:["manual","stripe","resend","supabase"]};
export const references:Record<string,string>={provider_id:"providers",category_id:"marketplace_categories",product_id:"provider_products",plan_id:"provider_plans",link_id:"affiliate_links",user_id:"profiles"};
export function isResource(value:string):value is AdminResource{return Object.hasOwn(adminSchemas,value);}
