import { config } from "dotenv";
import fs from "fs";

config({ path: ".env" });

async function test() {
  const formData = new FormData();
  // Create a dummy file
  const fileBlob = new Blob(["test"], { type: "text/plain" });
  formData.append("file", fileBlob, "test.txt");

  const metadata = JSON.stringify({ name: "test.txt" });
  formData.append("pinataMetadata", metadata);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwODJjMzEyMC1jMjRhLTQxOGUtYTliMi0yMTQ5NjRlNjJiYWYiLCJlbWFpbCI6InZhbm5hbmcyMDA1MDQxNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWQ1ZGI1MTg1Zjk5ZDY1NmIxZGYiLCJzY29wZWRLZXlTZWNyZXQiOiI1ZmEwNTU1MDFmNjQ4MTNhNTA4NzkzMDk2OTE1OGQ3ZTQ4ZmJmNmRlN2MyY2IwZDAwNGRhMjk1MjUwOTExZWIyIiwiZXhwIjoxODEwMjE3MzYzfQ.kaR6bGGc8WF6YcbG5y78a3aHHvTUPHpjxxWf7EDwm7o`,
    },
    body: formData as any,
  });

  console.log("Status:", res.status);
  if (!res.ok) {
    const text = await res.text();
    console.error("Error:", text);
  } else {
    const json = await res.json();
    console.log("Success:", json);
  }
}

test();
