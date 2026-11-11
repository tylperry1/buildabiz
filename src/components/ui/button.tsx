import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cn} from "@/lib/utils";
export type ButtonProps=React.ButtonHTMLAttributes<HTMLButtonElement>&{asChild?:boolean;variant?:"default"|"secondary";size?:"default"|"small"};
export function Button({className,variant="default",size="default",asChild=false,...props}:ButtonProps){const Component=asChild?Slot:"button";return <Component data-slot="button" className={cn("button",variant==="secondary"&&"secondary",size==="small"&&"small",className)} {...props}/>;}
