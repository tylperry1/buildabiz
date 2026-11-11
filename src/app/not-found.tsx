import Link from "next/link";
import { Header, Footer } from "@/components/header";
export default function NotFound() { return <><Header /><main id="main" className="container section"><h1>A fresh starting point.</h1><p>This page could not be found.</p><Link href="/" className="button">Return home</Link></main><Footer /></>; }
