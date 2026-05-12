const { encodeFunctionData, decodeFunctionResult } = require('viem');

const RPC = 'https://testnet.sapphire.oasis.dev';
const CONTRACT = '0x754FfFEFefE220125665e2B4709765CB6EB3cB5D';

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

async function testWithGas(gas, from) {
  const data = encodeFunctionData({ abi: eventsAbi, functionName: 'events', args: [0n] });

  const params = { to: CONTRACT, data };
  if (gas) params.gas = gas;
  if (from) params.from = from;

  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [params, 'latest']
    })
  });
  const json = await res.json();

  const label = `gas=${gas || 'default'}, from=${from || 'none'}`;
  if (json.error) {
    console.log(`[${label}] ERROR: ${json.error.message} (code: ${json.error.code})`);
  } else {
    console.log(`[${label}] OK, result length: ${json.result?.length}`);
    try {
      const decoded = decodeFunctionResult({ abi: eventsAbi, functionName: 'events', data: json.result });
      console.log(`  decoded:`, JSON.stringify(decoded, (k, v) => typeof v === 'bigint' ? v.toString() : v).slice(0, 500));
    } catch (e) {
      console.log(`  decode error: ${e.message?.slice(0, 200)}`);
    }
  }
}

async function main() {
  // Test different gas values and from addresses
  await testWithGas(null, null);
  await testWithGas('0x1e8480', null);           // 2M gas
  await testWithGas('0x5F5E100', null);           // 100M gas
  await testWithGas(null, '0x0000000000000000000000000000000000000001');
  await testWithGas('0x1e8480', '0x0000000000000000000000000000000000000001');
  await testWithGas('0x5F5E100', '0x73100Ae36Bd127C71139403F4C965Eab981EA329');

  // Also try with stateOverride or blockOverride - sometimes Sapphire needs these
  console.log('\n--- Testing with gasPrice ---');
  const data = encodeFunctionData({ abi: eventsAbi, functionName: 'events', args: [0n] });
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{
        to: CONTRACT, data,
        from: '0x73100Ae36Bd127C71139403F4C965Eab981EA329',
        gas: '0x5F5E100',
        gasPrice: '0x174876E800'  // 100 gwei
      }, 'latest']
    })
  });
  const json = await res.json();
  if (json.error) {
    console.log(`[gasPrice test] ERROR: ${json.error.message}`);
  } else {
    console.log(`[gasPrice test] OK, result length: ${json.result?.length}`);
  }
}

main().catch(e => console.error('FATAL:', e.message));
