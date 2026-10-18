/**
 * HaloSpark M01 experimental Blue Ocean scoring profile v0.1-demo.
 * All demo observations are SYNTHETIC and are never EverBee-verified measurements.
 * This is independent of the existing approved nine-dimensional M01 scoring profile.
 */
export const WEIGHTS = Object.freeze({ demand: .25, competition: .25, sales: .25, growth: .15, fit: .10 });
export const PROFILE_VERSION = 'BO-DEMO-0.1';
const clamp = (n, a=0, b=100) => Math.min(b, Math.max(a, n));
const finitePositive = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
export const canonicalKeyword = x => String(x ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
export function normalizeRows(rows) {
  if (!Array.isArray(rows)) throw new TypeError('Expected research array');
  const seen = new Map();
  let invalid = 0;
  for (const input of rows) {
    const keyword = canonicalKeyword(input?.keyword);
    if (!keyword || !finitePositive(input?.volume) || !finitePositive(input?.competition)) {invalid++;continue;}
    const row = {...input,keyword};
    const completeness = [row.monthly_sales_estimate,row.growth_percent,row.product_fit].filter(v=>typeof v==='number'&&Number.isFinite(v)).length;
    const old = seen.get(keyword);
    if (!old || completeness>old.completeness) seen.set(keyword,{row,completeness});
  }
  return { rows:[...seen.values()].map(o=>o.row),duplicates: rows.length-invalid-seen.size,invalid };
}
function log01(value,max) {return max>0 ? Math.log1p(value)/Math.log1p(max):0;}
export function computeScores(rows) {
  const validated=normalizeRows(rows);
  const d=validated.rows;
  const maxVolume=Math.max(1,...d.map(r=>r.volume));
  const maxRatio=Math.max(0.01,...d.map(r=>r.volume/(r.competition+100)));
  const maxSales=Math.max(1,...d.map(r=>finitePositive(r.monthly_sales_estimate)?r.monthly_sales_estimate:0));
  const scored=d.map(r=>{
    const demand=clamp(100*log01(r.volume,maxVolume));
    // Demand-adjusted inverse competition, normalized only within this research batch.
    // In production compare like-for-like markets/time windows and calibrate on historical evidence.
    const demandCompetitionRatio=r.volume/(r.competition+100);
    const competition=clamp(100*log01(demandCompetitionRatio,maxRatio));
    const sales=finitePositive(r.monthly_sales_estimate)?clamp(100*log01(r.monthly_sales_estimate,maxSales)):null;
    const growth=typeof r.growth_percent==='number'&&Number.isFinite(r.growth_percent)?clamp(50+r.growth_percent*1.3):null;
    const fit=finitePositive(r.product_fit)?clamp(r.product_fit):null;
    const components={demand,competition,sales,growth,fit};
    const available=Object.entries(WEIGHTS).filter(([k])=>components[k]!==null);
    const confidence= Math.round(100*available.reduce((sum,[key])=>sum+WEIGHTS[key],0));
    const complete=available.length===5;
    const score=complete?Number((available.reduce((sum,[key,w])=>sum+components[key]*w,0)*1).toFixed(1)):null;
    const partial=Number((available.reduce((sum,[key,w])=>sum+components[key]*w,0)).toFixed(1));
    const status=!complete?'INCOMPLETE':score>=75?'RECOMMENDED':score>=60?'REVIEW':'WATCHLIST';
    return {...r,components,confidence,score,partial,status,evidence_complete:complete};
  });
  scored.sort((a,b)=>(b.score??-1)-(a.score??-1) || b.volume-a.volume || a.keyword.localeCompare(b.keyword));
  return {...validated,rows:scored,profileVersion:PROFILE_VERSION};
}
export function createProductIntelligence(row, routing) {
  if (!row || row.status==='INCOMPLETE') throw new Error('Insufficient evidence for approval');
  return {
    contract: 'ProductCreationResearchBrief.demo.v1',
    demo_only:true,
    research_ref:`DEMO-${canonicalKeyword(row.keyword).replace(/[^a-z0-9]+/g,'-').toUpperCase()}`,
    research_status:'APPROVED_DEMO_ONLY',
    topic:row.keyword,
    primary_keyword:row.keyword,
    opportunity_score:row.score,
    evidence_confidence:row.confidence,
    observed_synthetic_metrics:{volume:row.volume,competition:row.competition,estimated_monthly_sales:row.monthly_sales_estimate,growth_percent:row.growth_percent},
    brand:routing.brand,niche:routing.niche,market:routing.market,product_family:routing.family,
    shop_routing:{status:'DEMO_NONCANONICAL',target_shop_id:null},
    production_hint:'Creative concept and storyboard are authored in M02. This research output does not create a SKU.',
    source:'SYNTHETIC_FIXTURE',scoring_profile:PROFILE_VERSION
  };
}
