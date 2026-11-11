export const modules = ["Startup & formation","Domains & hosting","Email & productivity","Business credit","Banking & funding","Business management","Accounting & invoicing","Compliance","Marketing","AI assistant","Business planning","Insurance","HR & payroll","Learning academy","Partner marketplace","Administration"];
export function safePath(value, fallback="/dashboard") {return typeof value === "string" && /^\/(?![\/\\])/.test(value) && !/[\\\x00-\x20]/.test(value) ? value : fallback;}
export function approvedDestination(url, allowedHost) {try {const u=new URL(url);return u.protocol==="https:" && !u.username && !u.password && u.hostname===allowedHost && !u.port;}catch{return false;}}
export function annualCost(price) {if(!Number.isInteger(price.billing_months)||price.billing_months<1||price.billing_months>36)throw new RangeError("Invalid billing term");
 const terms=Math.ceil(12/price.billing_months);
 if(terms>1 && price.renewal_cents==null)return null;
 const amounts=[price.amount_cents,price.setup_cents,price.required_cents,...(terms>1?[price.renewal_cents]:[])];
 if(amounts.some(v=>!Number.isSafeInteger(v)||v<0))throw new RangeError("Invalid monetary amount");
 return (price.amount_cents+(terms-1)*(price.renewal_cents??0)+price.setup_cents+price.required_cents)/100;}
export function checklistFor(business) {return ["Confirm your business name",...(business.structure==="Undecided"?["Choose a business structure"]:[]),...(business.formation_status!=="Registered"?["Review state registration requirements","Record completed state registration"]:[]),"Review EIN requirements","Separate business and personal finances",...(!business.website?["Choose a domain and business email"]:[]),"Review licenses, permits, and insurance","Plan your first 90 days"];}
export const entitlements={free:["checklist","formation","comparisons","dashboard","resources"],pro:["checklist","formation","comparisons","dashboard","resources","credit","expenses","documents","reminders","ai_limited"],plus:["checklist","formation","comparisons","dashboard","resources","credit","expenses","documents","reminders","ai_limited","multiple_businesses","invoicing","reports","team","ai_expanded"]};
