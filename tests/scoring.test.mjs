import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computeScores,createProductIntelligence,normalizeRows,canonicalKeyword} from '../src/scoring.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('../data/keywords.json',import.meta.url),'utf8'));
test('keyword normalization is stable and deduplicates',()=>{
 assert.equal(canonicalKeyword('  Hello   WORLD '),'hello world');
 const cleaned=normalizeRows(fixture);
 assert.equal(cleaned.duplicates,1);
 assert.equal(cleaned.invalid,0);
});
test('scoring reproducible and bounded 0-100',()=>{
 const one=computeScores(fixture);const two=computeScores(fixture);
 assert.deepEqual(one,two);
 assert.equal(one.profileVersion,'BO-DEMO-0.1');
 for(const r of one.rows){ if(r.score!==null){assert.ok(r.score>=0&&r.score<=100);}assert.ok(r.confidence>=0&&r.confidence<=100);}
});
test('missing sales/growth creates INCOMPLETE not made-up zero',()=>{
 const data=computeScores(fixture);
 const row=data.rows.find(r=>r.keyword==='celtic mandala coloring');
 assert.equal(row.score,null);assert.equal(row.status,'INCOMPLETE');assert.equal(row.components.sales,null);assert.equal(row.components.growth,null);
 assert.throws(()=>createProductIntelligence(row,{}),/Insufficient evidence/);
});
test('M02 handoff is an isolated demo research brief without SKU',()=>{
 const row=computeScores(fixture).rows.find(r=>r.score!==null);
 const p=createProductIntelligence(row,{brand:'Demo Brand',niche:'Mandala',market:'US',family:'COLORING'});
 assert.equal(p.demo_only,true);assert.equal(p.shop_routing.target_shop_id,null);assert.equal(p.research_status,'APPROVED_DEMO_ONLY');assert.equal(p.sku,undefined);
});
test('invalid rows never count as competition or demand',()=>{
 const c=computeScores([{keyword:'',volume:5,competition:2},{keyword:'good',volume:-1,competition:5},{keyword:'fine',volume:3,competition:5}]);
 assert.equal(c.invalid,2);assert.equal(c.rows.length,1);
});
