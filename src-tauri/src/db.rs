use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StickyNote {
    pub id: String,
    pub title: String,
    pub body: String,
    pub color: String,
    pub is_completed: bool,
    pub position_x: f64,
    pub position_y: f64,
    pub width: f64,
    pub height: f64,
    pub reminder_at: Option<String>,
    pub reminder_sent: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub fn init_db(db_path: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(db_path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS notes (
            id            TEXT PRIMARY KEY,
            title         TEXT NOT NULL DEFAULT '',
            body          TEXT NOT NULL DEFAULT '',
            color         TEXT NOT NULL DEFAULT '#FDFD96',
            is_completed  INTEGER NOT NULL DEFAULT 0,
            position_x    REAL NOT NULL DEFAULT 100.0,
            position_y    REAL NOT NULL DEFAULT 100.0,
            width         REAL NOT NULL DEFAULT 240.0,
            height        REAL NOT NULL DEFAULT 200.0,
            reminder_at   TEXT,
            reminder_sent INTEGER NOT NULL DEFAULT 0,
            created_at    TEXT NOT NULL,
            updated_at    TEXT NOT NULL
        );"
    )?;
    Ok(conn)
}

pub fn get_all_notes(conn: &Connection) -> rusqlite::Result<Vec<StickyNote>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, body, color, is_completed, position_x, position_y,
                width, height, reminder_at, reminder_sent, created_at, updated_at
         FROM notes ORDER BY created_at DESC"
    )?;
    let notes = stmt.query_map([], |row| {
        Ok(StickyNote {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
            color: row.get(3)?,
            is_completed: row.get::<_, i32>(4)? != 0,
            position_x: row.get(5)?,
            position_y: row.get(6)?,
            width: row.get(7)?,
            height: row.get(8)?,
            reminder_at: row.get(9)?,
            reminder_sent: row.get::<_, i32>(10)? != 0,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    })?.collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(notes)
}

pub fn create_note(conn: &Connection, note: &StickyNote) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO notes (id, title, body, color, is_completed, position_x, position_y,
                           width, height, reminder_at, reminder_sent, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
        params![
            note.id, note.title, note.body, note.color,
            note.is_completed as i32, note.position_x, note.position_y,
            note.width, note.height, note.reminder_at,
            note.reminder_sent as i32, note.created_at, note.updated_at
        ],
    )?;
    Ok(())
}

pub fn update_note(conn: &Connection, note: &StickyNote) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE notes SET title=?1, body=?2, color=?3, is_completed=?4,
                position_x=?5, position_y=?6, width=?7, height=?8,
                reminder_at=?9, reminder_sent=?10, updated_at=?11
         WHERE id=?12",
        params![
            note.title, note.body, note.color, note.is_completed as i32,
            note.position_x, note.position_y, note.width, note.height,
            note.reminder_at, note.reminder_sent as i32, note.updated_at, note.id
        ],
    )?;
    Ok(())
}

pub fn delete_note(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM notes WHERE id=?1", params![id])?;
    Ok(())
}

pub fn get_due_reminders(conn: &Connection, now: &str) -> rusqlite::Result<Vec<StickyNote>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, body, color, is_completed, position_x, position_y,
                width, height, reminder_at, reminder_sent, created_at, updated_at
         FROM notes
         WHERE reminder_at IS NOT NULL
           AND reminder_at <= ?1
           AND reminder_sent = 0
           AND is_completed = 0"
    )?;
    let notes = stmt.query_map(params![now], |row| {
        Ok(StickyNote {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
            color: row.get(3)?,
            is_completed: row.get::<_, i32>(4)? != 0,
            position_x: row.get(5)?,
            position_y: row.get(6)?,
            width: row.get(7)?,
            height: row.get(8)?,
            reminder_at: row.get(9)?,
            reminder_sent: row.get::<_, i32>(10)? != 0,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    })?.collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(notes)
}

pub fn mark_reminder_sent(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE notes SET reminder_sent = 1 WHERE id = ?1",
        params![id],
    )?;
    Ok(())
}
