import {allPublicProofs} from '../lib/leaderboard.mjs';
import {loadSnapshot} from '../lib/data.mjs';
import {benchmarkObservations,rangeFor} from '../public/metrics.mjs';

const {observations,payouts}=await loadSnapshot();
const {rows}=await allPublicProofs();
const benchmark=benchmarkObservations(observations,payouts,rows);
if(benchmark.length!==rows.length)throw Error('An approved proof no longer matches the public payout and exact analytics.');
console.log(JSON.stringify({approvedWindows:rows.length,verifiedBenchmark:rangeFor(benchmark,'verified')},null,2));
