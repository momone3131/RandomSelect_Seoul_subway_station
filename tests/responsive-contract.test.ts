import { readFileSync } from 'node:fs';import { describe,expect,it } from 'vitest';
const styles=[readFileSync(new URL('../src/ui/styles.css',import.meta.url),'utf8'),readFileSync(new URL('../src/ui/mobile-overrides.css',import.meta.url),'utf8')].join('\n');const primaryDrawPlacement=readFileSync(new URL('../src/ui/primary-draw-placement.ts',import.meta.url),'utf8');const drawAnimation=readFileSync(new URL('../src/ui/draw-animation.ts',import.meta.url),'utf8');const drawView=readFileSync(new URL('../src/ui/draw-view.ts',import.meta.url),'utf8');const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
describe('Random Seoul responsive visual contract',()=>{
it('stacks restaurant cards vertically on phone-sized screens',()=>expect(styles).toContain('grid-template-columns:1fr!important'));
it('keeps touch-sized restaurant map buttons on mobile',()=>{expect(styles).toContain('min-height:44px');expect(styles).toContain('width:100%')});
it('keeps dense result cards',()=>{expect(styles).toContain('min-height:176px');expect(styles).toContain('min-height:164px');expect(styles).toContain('min-height:96px');expect(styles).toContain('min-height:154px')});
it('uses distinct pastel surfaces without card outlines',()=>{expect(styles).toContain('.line-panel{background:#dfeecb}');expect(styles).toContain('.station-panel{background:#dbeaf1}');expect(styles).toContain('.food-panel{background:#f4dfc5}');expect(styles).toContain('border:0!important')});
it('uses whole next-result card as primary target',()=>{expect(styles).toContain('.panel.next-draw>.draw-btn.integrated');expect(primaryDrawPlacement).toContain("panel.classList.add('next-draw')")});
it('keeps strong outline only on active card',()=>{expect(styles).toContain('border:2px solid var(--dark)!important');expect(styles).toContain('content:"⚄"')});
it('uses a longer unmistakable result reveal',()=>{expect(drawAnimation).toContain("translateY(-12px) scale(1.09)");expect(drawAnimation).toContain('0 0 0 10px #f2cf78');expect(drawAnimation).toContain('duration:900')});
it('reveals food before starting recommendation lookup',()=>{expect(main).toContain("revealDrawStage('food')");expect(main.indexOf("revealDrawStage('food')")).toBeLessThan(main.indexOf('await controller.loadRecommendations()'))});
it('separates restaurant metadata from map action',()=>{expect(styles).toContain('margin-bottom:12px');expect(styles).toContain('.restaurant-map-link{min-height:42px;margin-top:2px')});
it('uses concise labels',()=>{expect(drawView).toContain("textContent = '노선'");expect(drawView).toContain("textContent = '역'");expect(drawView).toContain("textContent = '음식'")});
});
