import { chromium } from "playwright";
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const r of ["/countries","/holidays","/about"]) {
  await page.goto("http://localhost:5200"+r,{waitUntil:"networkidle"});
  const res = await page.evaluate(() => {
    const isBlue = (c) => {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); if(!m) return false;
      const [R,G,B]=[+m[1],+m[2],+m[3]]; return B>R+18 && B>G+10;
    };
    const out=[];
    for (const el of document.querySelectorAll("*")) {
      const s=getComputedStyle(el), rect=el.getBoundingClientRect();
      const area=rect.width*rect.height;
      if(area < 25000) continue;
      if(isBlue(s.backgroundColor)) out.push({tag:el.tagName, cls:(el.className+"").slice(0,60), area:Math.round(area/1000)+"k", bg:s.backgroundColor});
    }
    return out.sort((a,b)=>parseInt(b.area)-parseInt(a.area)).slice(0,6);
  });
  console.log("==",r); res.forEach(x=>console.log("  ",x.area,x.bg,x.tag,x.cls));
}
await b.close();
