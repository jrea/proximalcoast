import test from 'node:test';
import assert from 'node:assert/strict';
import {topProof} from '../public/public-proof.mjs';
import {allPublicProofs} from '../lib/leaderboard.mjs';
test('headline and card feature one actual proof-reviewed payout',async()=>{
 const {rows}=await allPublicProofs();
 assert.equal(topProof(rows).payoutUsd,576.49);
 assert.equal(topProof([]),null);
 assert.equal(topProof([{payoutUsd:'1000'},{payoutUsd:0}]),null);
});
