import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "sovereign-kiosk.db");

let dbInstance: DatabaseSync | null = null;

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS crisis_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      token_hash TEXT NOT NULL,
      mode TEXT NOT NULL,
      category TEXT NOT NULL,
      urgency TEXT NOT NULL,
      ciphertext TEXT NOT NULL,
      iv_hex TEXT NOT NULL,
      encrypted_key TEXT,
      alibi TEXT NOT NULL,
      status TEXT DEFAULT 'MASUK',
      santri_nis TEXT,
      santri_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sarpras_tickets (
      id TEXT PRIMARY KEY,
      nis TEXT NOT NULL,
      santri_name TEXT NOT NULL,
      dorm_room TEXT NOT NULL,
      issue_title TEXT NOT NULL,
      issue_desc TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      nis TEXT PRIMARY KEY,
      barcode TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      dorm_room TEXT NOT NULL
    );
  `);

  // Migrate existing schema if encrypted_key column is missing
  try {
    db.exec("ALTER TABLE crisis_tickets ADD COLUMN encrypted_key TEXT;");
  } catch {
    // Column already exists
  }

    // Seed default students
    const insertStudent = db.prepare(
      "INSERT OR IGNORE INTO students (nis, barcode, name, class_name, dorm_room) VALUES (?, ?, ?, ?, ?)"
    );
    insertStudent.run("2024-KTS-09101", "2024-KTS-09101", "Syahrul Hidayat", "Kelas 11 Ula Salafiyah", "Asrama Al-Fath Kamar 03");
    insertStudent.run("2024-KTS-09102", "2024-KTS-09102", "Moch. Mawahibus Shomad", "Kelas 12 Ulya Salafiyah", "Asrama Al-Ikhlas Kamar 07");
    insertStudent.run("2024-KTS-09103", "2024-KTS-09103", "M. Irfan Maulana Hanafi", "Kelas 10 Wustho Salafiyah", "Asrama An-Nur Kamar 05");
    insertStudent.run("2024-KTS-08912", "2024-KTS-08912", "Muhammad Raihan Pratama", "Kelas 11 Aliyah", "Asrama Al-Farabi Kamar 09");
    insertStudent.run("12345", "12345", "Ahmad Fauzi", "Kelas 10 Aliyah", "Asrama Al-Ghazali Kamar 04");
    insertStudent.run("12489", "12489", "Muhammad Rizky", "Kelas 12 Aliyah", "Asrama Ibnu Sina Kamar 12");
    insertStudent.run("12501", "12501", "Farih Maulana", "Kelas 10 Aliyah", "Asrama Bukhari Kamar 09");

  // Seed default sarpras tickets if empty
  const sarprasStmt = db.prepare("SELECT COUNT(*) as count FROM sarpras_tickets");
  const sarprasRow = sarprasStmt.get() as { count: number };
  if (sarprasRow.count === 0) {
    const insertSarpras = db.prepare(
      "INSERT INTO sarpras_tickets (id, nis, santri_name, dorm_room, issue_title, issue_desc, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insertSarpras.run("#TK-2026-081", "12345", "Ahmad Fauzi", "Al-Ghazali 04", "Pipa Bocor", "Kran wudhu kamar mandi belakang patah", "Tinggi", "Menunggu Sparepart");
    insertSarpras.run("#TK-2026-079", "12489", "Muhammad Rizky", "Ibnu Sina 12", "Lampu Padam", "Fitting neon aula belajar konslet", "Sedang", "Selesai Dikerjakan");
  }

  // Seed mock initial crisis tickets if empty
  const crisisStmt = db.prepare("SELECT COUNT(*) as count FROM crisis_tickets");
  const crisisRow = crisisStmt.get() as { count: number };
  if (crisisRow.count === 0) {
    const insertCrisis = db.prepare(
      "INSERT INTO crisis_tickets (token, token_hash, mode, category, urgency, ciphertext, iv_hex, alibi, status, santri_nis, santri_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insertCrisis.run(
      "K7M9P2X4",
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "ANONYMOUS",
      "Kekerasan/TPKS",
      "CRITICAL",
      "U292ZXJlaWduS2lvc2stQ0lQSEVSLVRQS1MtQ1JJVElDQUwtRU5DUllQVEVE",
      "3d8a9e14bc21780f29ab04e1",
      "medical",
      "MASUK",
      null,
      null
    );
    insertCrisis.run(
      "KTS-ADV-2026-0419",
      "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
      "VERIFIED_KTS",
      "Bullying Fisik/Verbal",
      "CRITICAL",
      "U292ZXJlaWduS2lvc2stQ0lQSEVSLUtUUy1CVUxMWUlORy1FTkNSWVBURUQ=",
      "78a9bc012def3456789abcde",
      "medical",
      "MASUK",
      "2024-KTS-08912",
      "Muhammad Raihan Pratama"
    );
  }
}

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    dbInstance = new DatabaseSync(dbPath);
    initSchema(dbInstance);
  }
  return dbInstance;
}
