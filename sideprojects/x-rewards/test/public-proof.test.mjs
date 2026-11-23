import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedRateLabel} from '../public/public-proof.mjs';
import {allPublicProofs} from '../lib/leaderboard.mjs';
import {loadSnapshot} from '../lib/data.mjs';
import {benchmarkObservations,rangeFor} from '../public/metrics.mjs';
test('homepage and OG use the screenshot-reviewed cohort range',async()=>{
 const data=await loadSnapshot(),{rows}=await allPublicProofs(data);
 const range=rangeFor(benchmarkObservations(data.observations,data.payouts,rows),'verified');
 assert.equal(verifiedRateLabel(range),'$0.45–$0.80');
 assert.equal(verifiedRateLabel(null),null);
 assert.equal(verifiedRateLabel({min:.24,max:1.1}),'$0.24–$1.10');
});
