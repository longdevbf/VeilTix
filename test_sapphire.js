const { createPublicClient, http, formatEther } = require('viem');
const { sapphireTestnet } = require('viem/chains');

// Contract info
const CONTRACT_ADDRESS = '0x754FfFEFefE220125665e2B4709765CB6EB3cB5D';
const RPC_URL = 'https://testnet.sapphire.oasis.dev';

const ABI = [
  {
    "inputs": [],
    "name": "nextEventId",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256" }],
    "name": "events",
    "outputs": [
      { "name": "organizer", "type": "address" },
      { "name": "name", "type": "string" },
      { "name": "time", "type": "uint256" },
      { "name": "totalTickets", "type": "uint256" },
      { "name": "soldTickets", "type": "uint256" },
      { "name": "price", "type": "uint256" },
      { "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const { sapphireHttpTransport } = require('@oasisprotocol/sapphire-viem-v2');

async function main() {
  console.log(`Checking contract at ${CONTRACT_ADDRESS} on ${RPC_URL} (Encrypted)...`);

  const client = createPublicClient({
    chain: sapphireTestnet,
    transport: sapphireHttpTransport()
  });

  try {
    console.log('Fetching nextEventId...');
    const nextId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'nextEventId',
      account: '0x73100Ae36Bd127C71139403F4C965Eab981EA329',
    });
    console.log('Next Event ID:', nextId.toString());

    if (nextId > 0n) {
      console.log('Fetching event 0 with account and gas (Encrypted)...');
      console.log('Fetching event 999 (Non-existent) with account and gas (Encrypted)...');
      const event = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'events',
        args: [999n],
        account: '0x73100Ae36Bd127C71139403F4C965Eab981EA329',
        gas: 2000000n,
        gasPrice: 100000000000n,
      });
      console.log('Event 999 Success (Empty):', JSON.stringify(event, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
    }
  } catch (error) {
    console.error('Error during encrypted call:');
    console.error(error.message);
  }
}

main();
