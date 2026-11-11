import "server-only";
import {configured,supabase} from "./supabase/server";
export async function featureEnabled(key:string,fallback:boolean){if(!configured())return fallback;try{return await supabase("/rest/v1/rpc/feature_value",{method:"POST",body:JSON.stringify({flag_key:key,default_value:fallback})}) as boolean;}catch{return false;}}
