import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

const DEFAULT_OFFICER_PIN = process.env.PETUGAS_PIN || "1926";

function isAuthorizedOfficer(req: Request): boolean {
  const pinHeader = req.headers.get("x-petugas-pin");
  const authHeader = req.headers.get("authorization");
  
  if (pinHeader && pinHeader === DEFAULT_OFFICER_PIN) {
    return true;
  }
  if (authHeader && authHeader === `Bearer ${DEFAULT_OFFICER_PIN}`) {
    return true;
  }
  return false;
}

// 1. GET: Only authenticated officers can view crisis tickets
export async function GET(req: Request) {
  if (!isAuthorizedOfficer(req)) {
    return NextResponse.json(
      { success: false, error: "Akses Ditolak: Otorisasi PIN Petugas Posko Diperlukan" },
      { status: 401 }
    );
  }

  try {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM crisis_tickets ORDER BY id DESC");
    const tickets = stmt.all();
    return NextResponse.json({ success: true, tickets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Public endpoint for kiosk submission with Strict Zero-Knowledge enforcement
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, token_hash, mode, category, urgency, ciphertext, iv_hex, encrypted_key, alibi, santri_nis, santri_name } = body;

    if (!token || !token_hash || !ciphertext || !iv_hex) {
      return NextResponse.json({ success: false, error: "Payload tidak lengkap" }, { status: 400 });
    }

    // STRICT ZERO-KNOWLEDGE SERVER GUARD:
    // If mode is not explicitly VERIFIED_KTS, sanitize identity fields to null regardless of client input
    const isVerified = mode === "VERIFIED_KTS";
    const safeNis = isVerified ? (santri_nis || null) : null;
    const safeName = isVerified ? (santri_name || null) : null;

    const db = getDatabase();
    const insert = db.prepare(`
      INSERT INTO crisis_tickets (token, token_hash, mode, category, urgency, ciphertext, iv_hex, encrypted_key, alibi, status, santri_nis, santri_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'MASUK', ?, ?)
    `);

    insert.run(
      token,
      token_hash,
      mode || "ANONYMOUS",
      category,
      urgency,
      ciphertext,
      iv_hex,
      encrypted_key || null,
      alibi || "medical",
      safeNis,
      safeName
    );

    return NextResponse.json({ success: true, token, token_hash });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record ticket";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. PATCH: Only authenticated officers can update ticket status
export async function PATCH(req: Request) {
  if (!isAuthorizedOfficer(req)) {
    return NextResponse.json(
      { success: false, error: "Akses Ditolak: Otorisasi PIN Petugas Posko Diperlukan" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { token, status } = body;

    const db = getDatabase();
    const update = db.prepare("UPDATE crisis_tickets SET status = ? WHERE token = ?");
    update.run(status, token);

    return NextResponse.json({ success: true, token, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update ticket";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

