import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSnapshot} from '../lib/data.mjs';
import {buildLeaderboard,csvLeaderboard,leaderboard} from '../lib/leaderboard.mjs';
const {observations}=await loadSnapshot();
const approval={decision:'approved',creator:'ofBleuMoon',cycle:'2026-09-25',payoutUsd:64.20,verifiedImpressions:123074,start:'2026-09-09',end:'2026-09-22',payoutProof:'https://x.com/ofBleuMoon/status/2103555413698613582/photo/2',impressionsProof:'https://x.com/ofBleuMoon/status/2103555413698613582/photo/1'};
test('existing matched data does not qualify without reviewed screenshot approval',()=>{
  assert.deepEqual(buildLeaderboard([],observations).rows,[]);
  assert.equal(buildLeaderboard([approval],observations).rows[0].rank,1);
});
test('rejects duplicate creator/cycle, same proof, dates, amounts, counts and wrong owners',()=>{
  for(const change of [
    {impressionsProof:approval.payoutProof},{decision:'pending'},{cycle:'2026-10-09'},{payoutUsd:10},
    {verifiedImpressions:123075},{start:'2026-09-08'},{impressionsProof:'https://x.com/wrong/status/2103555413698613582/photo/1'},
    {impressionsProof:'https://x.com/ofBleuMoon/status/2103555413698613582'},
    {impressionsProof:'https://x.com.evil/ofBleuMoon/status/2103555413698613582/photo/1'}
  ]) assert.throws(()=>buildLeaderboard([{...approval,...change}],observations));
  assert.throws(()=>buildLeaderboard([approval,{...approval,creator:'ofbleumoon'}],observations));
});
test('rank is per payout cycle and exports only normalized fields',async()=>{
  const result=await leaderboard('2026-10-23');
  assert.equal(result.rows[0].creator,'KxeSHkstW453827');
  assert.equal(result.rows[0].rank,1);
  assert.equal(result.rows[0].verifiedImpressions,1294196);
  assert.ok(!('decision' in result.rows[0]));
  assert.match(csvLeaderboard(result.rows),/1,KxeSHkstW453827,2026-10-23,576.49,1294196/);
  assert.deepEqual((await leaderboard('2026-10-09')).rows.map(r=>r.creator),['yoppy_cyber']);
  assert.deepEqual((await leaderboard('2026-11-20')).rows.map(r=>r.creator),['RyDawg42']);
  const all=await leaderboard();
  assert.equal((await Promise.all(all.cycles.map(x=>leaderboard(x)))).flatMap(x=>x.rows).length,7);
});
test('ranks by payout descending, not verified impressions',()=>{
  const row=observations.find(r=>r.creator==='ofBleuMoon');
  const high={...approval,creator:'test_creator',payoutUsd:966,verifiedImpressions:9,
    payoutProof:approval.payoutProof.replace('ofBleuMoon','test_creator'),impressionsProof:approval.impressionsProof.replace('ofBleuMoon','test_creator')};
  const result=buildLeaderboard([approval,high],[row,{...row,creator:high.creator,payoutUsd:966,count:9}]);
  assert.deepEqual(result.rows.map(x=>x.payoutUsd),[966,64.2]);
});

import {normalizeStatus,queueStatus} from '../lib/submissions.mjs';
test('submission input canonicalizes X status IDs without accepting arbitrary content',()=>{
  const canonical={statusId:'2103555413698613582',url:'https://x.com/i/web/status/2103555413698613582'};
  assert.deepEqual(normalizeStatus('https://x.com/ofBleuMoon/status/2103555413698613582?s=46'),canonical);
  assert.deepEqual(normalizeStatus('https://twitter.com/ofBleuMoon/status/2103555413698613582/photo/1'),canonical);
  for(const bad of ['https://x.com.evil/name/status/2103555413698613582','https://x.com/abc',' https://x.com/u/status/2103555413698613582 https://evil.test','http://x.com/u/status/2103555413698613582',{},'https://x.com/@u/status/2103555413698613582'])assert.throws(()=>normalizeStatus(bad));
  assert.deepEqual(queueStatus,{accepting:false,pendingCount:null});
});
