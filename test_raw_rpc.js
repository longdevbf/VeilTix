const { encodeFunctionData, decodeFunctionResult } = require('viem');

const RPC = 'https://testnet.sapphire.oasis.dev';
const CONTRACT = '0x754FfFEFefE220125665e2B4709765CB6EB3cB5D';

// Minimal ABI entries
const nextEventIdAbi = [{
  inputs: [], name: "nextEventId", outputs: [{ type: "uint256" }],
  stateMutability: "view", type: "function"
}];

const eventsAbi = [{
  inputs: [{ name: "", type: "uint256" }],
  name: "events",
  outputs: [
    { name: "organizer", type: "address" },
    { name: "name", type: "string" },
    { name: "time", type: "uint256" },
    { name: "totalTickets", type: "uint256" },
    { name: "soldTickets", type: "uint256" },
    { name: "price", type: "uint256" },
    { name: "isActive", type: "bool" }
  ],
  stateMutability: "view", type: "function"
}];

const getEventAbi = [{
  inputs: [{ name: "eventId", type: "uint256" }],
  name: "getEvent",
  outputs: [{
    components: [
      { name: "organizer", type: "address" },
      { name: "name", type: "string" },
      { name: "time", type: "uint256" },
      { name: "totalTickets", type: "uint256" },
      { name: "soldTickets", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "isActive", type: "bool" }
    ],
    type: "tuple"
  }],
  stateMutability: "view", type: "function"
}];

async function rawCall(data, label) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{ to: CONTRACT, data }, 'latest']
    })
  });
  const json = await res.json();
  console.log(`\n[${label}]`);
  console.log('  calldata:', data.slice(0, 20) + '...');
  if (json.error) {
    console.log('  ERROR:', json.error.message, json.error.code);
  } else {
    console.log('  OK! result length:', json.result?.length, 'chars');
    console.log('  result:', json.result?.slice(0, 130) + '...');
  }
  return json;
}

async function main() {
  // 1. nextEventId()
  const nextIdData = encodeFunctionData({ abi: nextEventIdAbi, functionName: 'nextEventId' });
  const r1 = await rawCall(nextIdData, 'nextEventId()');
  if (!r1.error) {
    const decoded = decodeFunctionResult({ abi: nextEventIdAbi, functionName: 'nextEventId', data: r1.result });
    console.log('  decoded:', decoded.toString());
  }

  // 2. events(0) - raw unencrypted
  const events0Data = encodeFunctionData({ abi: eventsAbi, functionName: 'events', args: [0n] });
  const r2 = await rawCall(events0Data, 'events(0)');
  if (!r2.error) {
    try {
      const decoded = decodeFunctionResult({ abi: eventsAbi, functionName: 'events', data: r2.result });
      console.log('  decoded:', JSON.stringify(decoded, (k, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch (e) { console.log('  decode error:', e.message?.slice(0, 200)); }
  }

  // 3. getEvent(0)
  const getEvent0Data = encodeFunctionData({ abi: getEventAbi, functionName: 'getEvent', args: [0n] });
  const r3 = await rawCall(getEvent0Data, 'getEvent(0)');
  if (!r3.error) {
    try {
      const decoded = decodeFunctionResult({ abi: getEventAbi, functionName: 'getEvent', data: r3.result });
      console.log('  decoded:', JSON.stringify(decoded, (k, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch (e) { console.log('  decode error:', e.message?.slice(0, 200)); }
  }

  // 4. eth_getCode
  const codeRes = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_getCode',
      params: [CONTRACT, 'latest']
    })
  });
  const codeJson = await codeRes.json();
  console.log('\n[eth_getCode]');
  console.log('  has code:', codeJson.result !== '0x' && codeJson.result?.length > 2);
  console.log('  code length:', codeJson.result?.length, 'chars');
}

main().catch(e => console.error('FATAL:', e.message));
