import {SubmitButton} from "@/components/submit-button";
import Link from "next/link";
import { saveBusiness } from "@/app/actions";
export type Business = {
    id: string;
    name: string;
    state: string;
    business_type: string;
    structure: string;
    industry: string;
    formation_status: string;
    budget: string;
    website: string;
    goals: string;
};
export function BusinessForm({ business, step = 1 }: {
    business?: Business;
    step?: number;
}) { return <form action={saveBusiness} className="form panel"><p className="eyebrow">STARTUP WIZARD · STEP {step} OF 3</p>{business&&<nav className="cta-row" aria-label="Wizard steps">{[1,2,3].map(n=><Link key={n} className="button small secondary" href={`/dashboard/businesses/${business.id}?step=${n}`}>Step {n}</Link>)}</nav>}<p className="muted">Save each step and return later. Your progress stays with this business.</p><input type="hidden" name="wizard_step" value={step}/><input type="hidden" name="id" value={business?.id || ""}/><div className="field-grid"><div style={{ display: step === 1 ? "contents" : "none" }}><label>Business or working name<input name="name" required maxLength={150} defaultValue={business?.name}/></label><label>State of operation<input name="state" required minLength={2} maxLength={60} placeholder="e.g. Ohio" defaultValue={business?.state}/></label><label>Business type<input name="business_type" required maxLength={100} placeholder="e.g. Online services" defaultValue={business?.business_type}/></label></div><div style={{ display: step === 2 ? "contents" : "none" }}><label>Business structure<select name="structure" defaultValue={business?.structure || "Undecided"}>{["Undecided", "Sole proprietor", "LLC", "Corporation", "Partnership", "Nonprofit"].map(s => <option key={s}>{s}</option>)}</select></label><label>Industry<input name="industry" maxLength={120} defaultValue={business?.industry}/></label><label>Formation status<select name="formation_status" defaultValue={business?.formation_status || "Idea"}>{["Idea", "In progress", "Registered"].map(s => <option key={s}>{s}</option>)}</select><small>Choose Registered only after completing registration.</small></label><label>Startup budget<select name="budget" defaultValue={business?.budget || "Under $500"}>{["Under $500", "$500–$2,500", "$2,500–$10,000", "Over $10,000", "Undecided"].map(s => <option key={s}>{s}</option>)}</select></label></div><div style={{ display: step === 3 ? "contents" : "none" }}><label>Existing domain or website<input name="website" maxLength={250} placeholder="Leave blank if you don’t have one" defaultValue={business?.website}/></label></div></div><div style={{ display: step === 3 ? "contents" : "none" }}><label>Primary business goals<textarea name="goals" maxLength={2000} defaultValue={business?.goals}/></label></div><div className="cta-row"><SubmitButton className="button" name="wizard_action" value={step < 3 ? "next" : "finish"}>{step < 3 ? "Save & continue" : "Finish & generate checklist"}</SubmitButton><SubmitButton className="button secondary" name="wizard_action" value="draft">Save progress & leave</SubmitButton></div></form>; }
