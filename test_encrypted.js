// Test with Sapphire SDK encryption - sapphire-viem-v2
const { createPublicClient, http } = require('viem');
const { sapphireTestnet } = require('viem/chains');

// Try importing sapphire viem transport
let sapphireHttpTransport;
try {
  const mod = require('@oasisprotocol/sapphire-viem-v2');
  sapphireHttpTransport = mod.sapphireHttpTransport;
  console.log('sapphire-viem-v2 exports:', Object.keys(mod).join(', '));
} catch (e) {
  console.log('sapphire-viem-v2 not found, trying sapphire-wagmi-v2...');
  const mod = require('@oasisprotocol/sapphire-wagmi-v2');
  sapphireHttpTransport = mod.sapphireHttpTransport;
  console.log('sapphire-wagmi-v2 exports:', Object.keys(mod).join(', '));
}

const CONTRACT = '0x754FfFEFefE220125665e2B4709765CB6EB3cB5D';

const ABI = [
  {
    inputs: [], name: "nextEventId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view", type: "function"
  },
  {
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
  },
  {
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
  }
];

async function main() {
  console.log('\n--- Test with Sapphire encrypted transport ---');

  const client = createPublicClient({
    chain: sapphireTestnet,
    transport: sapphireHttpTransport(),
  });

  // 1. nextEventId
  try {
    const nextId = await client.readContract({
      address: CONTRACT, abi: ABI, functionName: 'nextEventId'
    });
    console.log('[nextEventId] OK:', nextId.toString());
  } catch (e) {
    console.log('[nextEventId] ERROR:', e.message?.slice(0, 200));
  }

  // 2. events(0) with encrypted transport
  try {
    const ev0 = await client.readContract({
      address: CONTRACT, abi: ABI, functionName: 'events', args: [0n]
    });
    console.log('[events(0)] OK:', JSON.stringify(ev0, (k, v) => typeof v === 'bigint' ? v.toString() : v));
  } catch (e) {
    console.log('[events(0)] ERROR:', e.message?.slice(0, 300));
  }

  // 3. getEvent(0) with encrypted transport
  try {
    const ge0 = await client.readContract({
      address: CONTRACT, abi: ABI, functionName: 'getEvent', args: [0n]
    });
    console.log('[getEvent(0)] OK:', JSON.stringify(ge0, (k, v) => typeof v === 'bigint' ? v.toString() : v));
  } catch (e) {
    console.log('[getEvent(0)] ERROR:', e.message?.slice(0, 300));
  }

  // 4. Test with plain http transport for comparison
  console.log('\n--- Test with PLAIN http transport ---');
  const plainClient = createPublicClient({
    chain: sapphireTestnet,
    transport: http('https://testnet.sapphire.oasis.dev'),
  });

  try {
    const nextId2 = await plainClient.readContract({
      address: CONTRACT, abi: ABI, functionName: 'nextEventId'
    });
    console.log('[plain nextEventId] OK:', nextId2.toString());
  } catch (e) {
    console.log('[plain nextEventId] ERROR:', e.message?.slice(0, 200));
  }

  try {
    const ev0b = await plainClient.readContract({
      address: CONTRACT, abi: ABI, functionName: 'events', args: [0n]
    });
    console.log('[plain events(0)] OK:', JSON.stringify(ev0b, (k, v) => typeof v === 'bigint' ? v.toString() : v));
  } catch (e) {
    console.log('[plain events(0)] ERROR:', e.message?.slice(0, 200));
  }
}

main().catch(e => console.error('FATAL:', e.message));
