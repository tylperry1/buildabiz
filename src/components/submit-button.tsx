"use client";
import {Button} from "@/components/ui/button";
import {useFormStatus} from "react-dom";
import type {ButtonHTMLAttributes} from "react";
export function SubmitButton({children,disabled,...props}:ButtonHTMLAttributes<HTMLButtonElement>){const {pending}=useFormStatus();return <Button {...props} disabled={disabled||pending} aria-disabled={disabled||pending} aria-busy={pending}>{pending?"Saving…":children}</Button>;}
