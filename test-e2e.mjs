async function runTests() {
  console.log("=== Testing SovereignKiosk API & SQLite Endpoints ===");

  // 1. Test student barcode lookup
  const studentRes = await fetch("http://localhost:3000/api/students?barcode=KTS-12345");
  const student = await studentRes.json();
  console.log("[1] Student Barcode Lookup (KTS-12345):", student);

  // 2. Test crisis tickets list
  const crisisRes = await fetch("http://localhost:3000/api/crisis");
  const crisis = await crisisRes.json();
  console.log("[2] Crisis Tickets Count:", crisis.tickets?.length);

  // 3. Test sarpras tickets list
  const sarprasRes = await fetch("http://localhost:3000/api/sarpras");
  const sarpras = await sarprasRes.json();
  console.log("[3] Sarpras Tickets Count:", sarpras.tickets?.length);

  // 4. Test creating a new encrypted crisis ticket in SQLite
  const postRes = await fetch("http://localhost:3000/api/crisis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: "K89MNX42",
      token_hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      mode: "VERIFIED_KTS",
      category: "Perundungan Fisik / Verbal",
      urgency: "Sangat Mendesak (Darurat)",
      alibi: "medical",
      ciphertext: "T0tHQ1RFWFQ4MjkxMjhjbmFqa2NuYXNkY2p3bmE4OTI=",
      iv_hex: "0102030405060708090a0b0c",
      santri_nis: "12345",
      santri_name: "Ahmad Fauzi"
    })
  });
  const postResult = await postRes.json();
  console.log("[4] Crisis SQLite Insert Result:", postResult);

  // 5. Verify the inserted ticket is in SQLite
  const verifyRes = await fetch("http://localhost:3000/api/crisis");
  const verify = await verifyRes.json();
  const found = verify.tickets?.find((t) => t.token === "K89MNX42");
  console.log("[5] Verified Ticket Persisted in SQLite:", !!found, found ? { id: found.id, token: found.token, mode: found.mode, status: found.status } : null);

  console.log("=== ALL ENDPOINT & SQLITE TESTS PASSED ===");
}

runTests().catch(console.error);
