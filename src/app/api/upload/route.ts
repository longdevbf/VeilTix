import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Prepare exactly what Pinata expects
    const pinataData = new FormData();
    pinataData.append("file", file);
    
    // Add optional metadata
    const metadata = JSON.stringify({
      name: file.name,
    });
    pinataData.append("pinataMetadata", metadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    pinataData.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataData as any,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Pinata error:", errorText);
      return NextResponse.json(
        { error: `Pinata API Error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const resData = await res.json();
    
    return NextResponse.json({ ipfsHash: resData.IpfsHash }, { status: 200 });
  } catch (e: any) {
    console.error("Server upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}
