const { encodeFunctionData, decodeFunctionResult } = require('viem');

const RPC = 'https://testnet.sapphire.oasis.dev';
const CONTRACT = '0x754FfFEFefE220125665e2B4709765CB6EB3cB5D';

// Functions with no string return types
const ABI = [
  {
    inputs: [{ name: "eventId", type: "uint256" }],
    name: "getEventStats",
    outputs: [
      { name: "sold", type: "uint256" },
      { name: "total", type: "uint256" },
      { name: "revenue", type: "uint256" }
    ],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "tickets",
    outputs: [
      { name: "eventId", type: "uint256" },
      { name: "ticketType", type: "uint8" },
      { name: "isUsed", type: "bool" }
    ],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "eventRules",
    outputs: [
      { name: "transferable", type: "bool" },
      { name: "refundable", type: "bool" },
      { name: "refundDeadline", type: "uint256" },
      { name: "maxPerUser", type: "uint256" }
    ],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [], name: "nextTokenId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [], name: "verifier",
    outputs: [{ type: "address" }],
    stateMutability: "view", type: "function"
  },
  {
    inputs: [], name: "owner",
    outputs: [{ type: "address" }],
    stateMutability: "view", type: "function"
  }
];

async function test(fnName, args, label) {
  const data = encodeFunctionData({ abi: ABI, functionName: fnName, args });
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{ to: CONTRACT, data }, 'latest']
    })
  });
  const json = await res.json();
  if (json.error) {
    console.log(`[${label}] ERROR: ${json.error.message}`);
  } else {
    console.log(`[${label}] OK, len=${json.result?.length}`);
    try {
      const dec = decodeFunctionResult({ abi: ABI, functionName: fnName, data: json.result });
      console.log(`  =>`, JSON.stringify(dec, (k, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch (e) { console.log(`  decode err: ${e.message?.slice(0, 150)}`); }
  }
}

async function main() {
  await test('nextTokenId', [], 'nextTokenId()');
  await test('owner', [], 'owner()');
  await test('verifier', [], 'verifier()');
  await test('getEventStats', [0n], 'getEventStats(0)');
  await test('getEventStats', [1n], 'getEventStats(1)');
  await test('eventRules', [0n], 'eventRules(0)');
  await test('eventRules', [1n], 'eventRules(1)');
  await test('tickets', [0n], 'tickets(0)');
}

main().catch(e => console.error('FATAL:', e.message));
