export function normalizeStatus(input){
  if(typeof input!=='string'||input.length>300)throw Error('Paste one public X post URL.');
  const match=/^https:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(?:[a-zA-Z0-9_]{1,15}\/status|i\/web\/status)\/([1-9][0-9]{9,24})(?:\/photo\/[1-4])?\/?(?:\?[^\s#]*)?(?:#[^\s]*)?$/.exec(input.trim());
  if(!match)throw Error('Paste one public X post URL.');
  return {statusId:match[1],url:'https://x.com/i/web/status/'+match[1]};
}
// No durable intake was provisioned. Never acknowledge, count or retain unprocessed submissions.
export const queueStatus={accepting:false,pendingCount:null};
