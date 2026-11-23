import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approvedProof} from '../lib/approved-proof.mjs';
const p='2123873927130919281', i='2123873927130919282';
const base='https://x.com/RyDawg42/status/';
const valid={creator:'RyDawg42',cycle:'2026-11-20',start:'2026-11-04',end:'2026-11-17',amountCents:12030,impressions:189490,metric:'verified',screenshotsReviewed:true,payoutProof:base+p+'/photo/1',impressionsProof:base+i+'/photo/2'};
test('manual proof approval binds the exact values, URLs and window',()=>{
 assert.equal(approvedProof(valid,p,i).impressions,189490);
 for(const bad of [undefined,{...valid,metric:'total'},{...valid,screenshotsReviewed:false},{...valid,start:'2026-11-05'},{...valid,amountCents:120.30},{...valid,impressionsProof:base+p+'/photo/2'},{...valid,impressionsProof:valid.impressionsProof.replace('RyDawg42','other')},{...valid,payoutProof:base+p},{...valid,cycle:'2026-11-31'}])assert.throws(()=>approvedProof(bad,p,i));
 assert.throws(()=>approvedProof({...valid,impressionsProof:valid.payoutProof},p,p),/distinct/);
});
