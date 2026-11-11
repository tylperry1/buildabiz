import "server-only";
import {cache} from "react";
import {requireUser} from "./auth";
import {db} from "./supabase/server";
import type {Business} from "@/components/business-form";
export const workspaceContext=cache(async()=>{const user=await requireUser();const [businesses,profiles]=await Promise.all([db(`businesses?owner_id=eq.${user.id}&order=created_at`),db(`profiles?id=eq.${user.id}`)]);const list=businesses as Business[];return {user,businesses:list,profile:profiles[0],active:list.find(b=>b.id===profiles[0]?.active_business_id)||list[0]};});
