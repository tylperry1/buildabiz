import { Header, Footer } from "@/components/header";
import { BudgetTool } from "@/components/budget-tool";
export const metadata = { title: "Free business planning tools" };
export default function Page() { return <><Header /><main id="main" className="container section"><div className="page-heading"><div className="eyebrow">SMALL TOOLS. CLEARER DECISIONS.</div><h1>Plan your starting budget.</h1><p>Estimate a cash cushion before you launch. This calculator runs on your device and does not save financial information.</p></div><BudgetTool /></main><Footer /></>; }
