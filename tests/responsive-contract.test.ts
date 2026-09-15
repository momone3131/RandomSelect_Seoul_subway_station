import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const styles=[readFileSync(new URL('../src/ui/styles.css',import.meta.url),'utf8'),readFileSync(new URL('../src/ui/mobile-overrides.css',import.meta.url),'utf8')].join('\n');
const primaryDrawPlacement=readFileSync(new URL('../src/ui/primary-draw-placement.ts',import.meta.url),'utf8');
const drawAnimation=readFileSync(new URL('../src/ui/draw-animation.ts',import.meta.url),'utf8');
const drawView=readFileSync(new URL('../src/ui/draw-view.ts',import.meta.url),'utf8');
describe('Random Seoul responsive visual contract',()=>{
 it('stacks restaurant cards vertically on phone-sized screens',()=>{expect(styles).toContain('grid-template-columns:1fr !important');});
 it('keeps touch-sized restaurant map buttons on mobile',()=>{expect(styles).toContain('min-height:44px');expect(styles).toContain('width:100%');});
 it('uses denser result cards',()=>{expect(styles).toContain('min-height:176px');expect(styles).toContain('min-height:164px');expect(styles).toContain('min-height:96px');expect(styles).toContain('min-height:154px');});
 it('removes redundant container and card borders',()=>{expect(styles).toContain('.draw-shell { border: 0;');expect(styles).toContain('border: 0 !important;');expect(styles).toContain('border:0; border-radius:13px');expect(styles).toContain('border:0; border-radius:10px');});
 it('uses the whole next-result card as primary target',()=>{expect(styles).toContain('.panel.next-draw > .draw-btn.integrated');expect(styles).toContain('inset:0');expect(styles).toContain('opacity:0');expect(primaryDrawPlacement).toContain("panel.classList.add('next-draw')");});
 it('reserves strong outline for active card',()=>{expect(styles).toContain('border: 2px solid var(--dark) !important');expect(styles).toContain('background: var(--lime)');expect(styles).toContain('content:"⚄"');});
 it('keeps tactile hold feedback',()=>{expect(primaryDrawPlacement).toContain("addEventListener('pointerdown'");expect(primaryDrawPlacement).toContain("translateY(3px) scale(.985)");expect(primaryDrawPlacement).toContain('duration: 75');});
 it('uses a large settled-result reveal',()=>{expect(drawAnimation).toContain("translateY(-10px) scale(1.075)");expect(drawAnimation).toContain('0 0 0 8px #d7f775');expect(drawAnimation).toContain('duration:520');});
 it('hides nonessential explanatory copy',()=>{expect(styles).toContain('.scope-summary');expect(styles).toContain('.line-meta');expect(styles).toContain('.food-examples');});
 it('uses concise labels',()=>{expect(drawView).toContain("textContent = '노선'");expect(drawView).toContain("textContent = '역'");expect(drawView).toContain("textContent = '음식'");});
});
