import {test,expect} from '@playwright/test';
test('install manifest and icons are valid and the worker reconnects offline',async({page,request,context})=>{
 const response=await request.get('/manifest.webmanifest');expect(response.ok()).toBeTruthy();
 const manifest=await response.json();expect(manifest.display).toBe('standalone');expect(manifest.start_url).toBe('/dashboard');
 for(const icon of manifest.icons){const image=await request.get(icon.src);expect(image.ok()).toBeTruthy();expect(image.headers()['content-type']).toContain('image/png');const bytes=await image.body();expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');const size=Number(icon.sizes.split('x')[0]);expect(bytes.readUInt32BE(16)).toBe(size);expect(bytes.readUInt32BE(20)).toBe(size);}
 await page.goto('/install');await expect(page.getByRole('heading',{name:'iPhone & iPad'})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
 await context.setOffline(true);
 try{await page.goto('/dashboard');await expect(page.getByRole('heading',{name:'Let’s reconnect.'})).toBeVisible();}finally{await context.setOffline(false);}
});
