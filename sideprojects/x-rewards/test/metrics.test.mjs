import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSnapshot,csvText} from '../lib/data.mjs';
import {allPublicProofs} from '../lib/leaderboard.mjs';
import {rangeFor,estimate,benchmarkObservations,dollarsPerThousand} from '../public/metrics.mjs';
const snapshot=await loadSnapshot();
const approx=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.000001,[actual,expected].join(' ≠ '));
test('canonical archive remains independently reproducible',()=>{
 assert.equal(snapshot.payouts.length,466);
 assert.equal(new Set(snapshot.payouts.map(x=>x.creator_handle.toLowerCase()+':'+x.payout_cycle)).size,466);
 assert.equal(snapshot.observations.length,20);
 assert.equal(csvText(snapshot.payouts).trimEnd().split('\r\n').length,snapshot.payouts.length+1);
});
test('verified range uses only audited exact-window observations',()=>{
 const rate=rangeFor(snapshot.observations,'verified');
 assert.equal(rate.sampleCount,8);assert.equal(rate.creatorCount,4);
 approx(rate.min,.430872);approx(rate.median,.652326);approx(rate.max,.796312);
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

test('Denche November 20 links payout screenshot without using the reported count as proof',async()=>{
 const payout=snapshot.payouts.find(r=>r.creator_handle==='Denche2005'&&r.payout_cycle==='2026-11-20');
 const observation=snapshot.observations.find(r=>r.creator==='Denche2005'&&r.cycle==='2026-11-20');
 assert.equal(payout.payout_usd,'2698.47');
 assert.equal(payout.receipt_media_url,'https://x.com/Denche2005/status/2124862280739274964/photo/1');
 assert.equal(payout.supporting_source_url,observation.source);
 assert.equal(observation.count,1563150);
 assert.equal(observation.kind,'reported_cycle');
 assert.equal(observation.start,undefined);assert.equal(observation.end,undefined);
 assert.equal(dollarsPerThousand(observation).toFixed(2),'1.73');
 const {rows}=await allPublicProofs(snapshot);
 const cohort=benchmarkObservations(snapshot.observations,snapshot.payouts,rows);
 assert.equal(rangeFor(cohort,'verified').sampleCount,7);
 assert.ok(!cohort.includes(observation));
 assert.ok(!rows.some(r=>r.creator==='Denche2005'&&r.cycle==='2026-11-20'));
 assert.equal(snapshot.historical.find(r=>r.creator==='Denche2005').payoutUsd,2639.84);
});

test('Manxlab November 6 is payout-only; unfiltered 2.3M chart is not a verified denominator', async ()=>{
 const payout=snapshot.payouts.find(r=>r.creator_handle==='manxlab'&&r.payout_cycle==='2026-11-06');
 assert.equal(payout.payout_usd,'1187.91');
 assert.equal(payout.receipt_media_url,'https://x.com/manxlab/status/2125598630006477123/photo/4');
 assert.ok(!snapshot.observations.some(r=>r.creator.toLowerCase()==='manxlab'));
 assert.ok(!(await allPublicProofs(snapshot)).rows.some(r=>r.creator==='manxlab'));
});
