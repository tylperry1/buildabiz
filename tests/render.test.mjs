import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const root=new URL('../.next/server/app/',import.meta.url);
const built=existsSync(new URL('index.html',root));
test('production render includes the approved brand, hero, disclosures and sitemap links',{skip:!built},()=>{
 const html=readFileSync(new URL('index.html',root),'utf8');
 for(const text of ['Your business idea.','Let’s build it.','Start Smart. Build Confidently.','application/ld+json','href="/signup"','href="/compare"','affiliate'])assert(html.includes(text),text);
});
test('public informational routes have production-rendered output',{skip:!built},()=>{
 for(const route of ['start-business','formation','business-credit','tools','resources','pricing','about']){
  const html=readFileSync(new URL(route+'.html',root),'utf8');
  assert(html.includes('id="main"'),route);
  assert(html.includes('name="viewport"'),route);
  assert(!html.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),route);
 }
});
