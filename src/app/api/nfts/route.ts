import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nexus.oasis.io/v1/sapphire/accounts/${address}/nfts?limit=100&offset=0`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error(`Nexus API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('NFT fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}
