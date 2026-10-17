import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM sarpras_tickets ORDER BY created_at DESC");
    const tickets = stmt.all();
    return NextResponse.json({ success: true, tickets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, nis, santri_name, dorm_room, issue_title, issue_desc, priority, status } = body;

    const db = getDatabase();
    const ticketId = id || `#TK-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const insert = db.prepare(`
      INSERT INTO sarpras_tickets (id, nis, santri_name, dorm_room, issue_title, issue_desc, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      ticketId,
      nis,
      santri_name,
      dorm_room,
      issue_title,
      issue_desc || "",
      priority || "Sedang",
      status || "Tiket Baru"
    );

    return NextResponse.json({ success: true, ticketId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record sarpras ticket";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID dan status tiket wajib ada" }, { status: 400 });
    }

    const db = getDatabase();
    const update = db.prepare("UPDATE sarpras_tickets SET status = ? WHERE id = ?");
    update.run(status, id);

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update sarpras ticket";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
