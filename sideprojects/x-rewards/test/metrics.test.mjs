import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSnapshot,csvText} from '../lib/data.mjs';
import {rangeFor,estimate} from '../public/metrics.mjs';
const snapshot=await loadSnapshot();
const approx=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.000001,[actual,expected].join(' ≠ '));
test('canonical archive remains independently reproducible',()=>{
 assert.equal(snapshot.payouts.length,464);
 assert.equal(new Set(snapshot.payouts.map(x=>x.creator_handle.toLowerCase()+':'+x.payout_cycle)).size,464);
 assert.equal(snapshot.observations.length,19);
 assert.equal(csvText(snapshot.payouts).trimEnd().split('\r\n').length,465);
});
test('verified range uses only audited exact-window observations',()=>{
 const rate=rangeFor(snapshot.observations,'verified');
 assert.equal(rate.sampleCount,8);assert.equal(rate.creatorCount,4);
 approx(rate.min,.430872);approx(rate.median,.652313);approx(rate.max,.796312);
 assert.equal(rate.creatorSpecific,false);
});
test('total impressions are separate and Denche falls back to cohort',()=>{
 const total=rangeFor(snapshot.observations,'total','@Denche2005');
 assert.equal(total.sampleCount,2);assert.equal(total.creatorSpecific,false);
 assert.ok(total.min<.01);
 assert.equal(rangeFor(snapshot.observations,'verified','@Denche2005').creatorSpecific,false);
 assert.equal(rangeFor(snapshot.observations,'verified','@YOPPY_CYBER').sampleCount,5);
 assert.equal(rangeFor(snapshot.observations,'verified','@YOPPY_CYBER').creatorSpecific,true);
 assert.equal(rangeFor(snapshot.observations,'total','@YOPPY_CYBER').creatorSpecific,false);
});
test('target payout inverts the ends of the range and rejects invalid data',()=>{
 const s={min:.4,median:.6,max:.8};
 assert.deepEqual(estimate(s,2400,'impressions'),{low:3000000,mid:4000000,high:6000000});
 assert.deepEqual(estimate(s,1000000,'payout'),{low:400,mid:600,high:800});
 assert.throws(()=>estimate(s,0,'payout'));assert.throws(()=>rangeFor([],'premium'));
});
