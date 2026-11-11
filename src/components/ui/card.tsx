import type {HTMLAttributes} from "react";
import {cn} from "@/lib/utils";
export function Card({className,...props}:HTMLAttributes<HTMLDivElement>){return <div data-slot="card" className={cn("panel",className)} {...props}/>;}
export function CardHeader({className,...props}:HTMLAttributes<HTMLDivElement>){return <div data-slot="card-header" className={cn("stack",className)} {...props}/>;}
export function CardTitle(props:HTMLAttributes<HTMLHeadingElement>){return <h3 data-slot="card-title" {...props}/>;}
export function CardContent(props:HTMLAttributes<HTMLDivElement>){return <div data-slot="card-content" {...props}/>;}
