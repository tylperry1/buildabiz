"use client";
import {useState} from "react";
export function Notice({message}:{message?:string}){const [dismissed,setDismissed]=useState("");if(!message||dismissed===message)return null;return <div className="notice toast" role="status"><span>{message}</span><button type="button" className="icon-button" aria-label="Dismiss notification" onClick={()=>setDismissed(message)}>×</button></div>;}
