import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import crypto from "node:crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim().toUpperCase();
    const tokenHash = searchParams.get("token_hash")?.trim().toLowerCase();

    if (!token && !tokenHash) {
      return NextResponse.json(
        { success: false, error: "Parameter 'token' atau 'token_hash' wajib disertakan" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Compute SHA-256 if plain token provided
    let queryHash = tokenHash;
    if (token && !queryHash) {
      queryHash = crypto.createHash("sha256").update(token).digest("hex");
    }

    // Lookup strictly by token or token_hash
    const stmt = db.prepare(`
      SELECT 
        token,
        token_hash,
        mode,
        category,
        urgency,
        alibi,
        status,
        created_at
      FROM crisis_tickets 
      WHERE token = ? OR token_hash = ?
      LIMIT 1
    `);

    interface TicketRow {
      token: string;
      token_hash: string;
      mode: string;
      category: string;
      urgency: string;
      alibi: string;
      status: string;
      created_at: string;
    }

    const row = stmt.get(token || "", queryHash || "") as TicketRow | undefined;

    if (!row) {
      return NextResponse.json(
        {
          success: false,
          error: "Tiket tidak ditemukan. Pastikan 8-karakter kode token sudah sesuai dengan tanda terima Anda.",
        },
        { status: 404 }
      );
    }

    // STRICT ZERO-KNOWLEDGE:
    // Never return identity (santri_nis, santri_name) or ciphertext in public tracker!
    return NextResponse.json({
      success: true,
      ticket: {
        token: row.token,
        mode: row.mode,
        category: row.category,
        urgency: row.urgency,
        alibi: row.alibi,
        status: row.status,
        created_at: row.created_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses pelacakan tiket";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
