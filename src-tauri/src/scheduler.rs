use crate::db;
use chrono::Utc;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;

pub fn start_reminder_scheduler(app: AppHandle, db_path: PathBuf) {
    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(30)).await;
            check_reminders(&app, &db_path);
        }
    });
}

fn check_reminders(app: &AppHandle, db_path: &PathBuf) {
    let conn = match Connection::open(db_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to open DB for reminders: {}", e);
            return;
        }
    };

    let now = Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
    let due_notes = match db::get_due_reminders(&conn, &now) {
        Ok(notes) => notes,
        Err(e) => {
            eprintln!("Failed to query due reminders: {}", e);
            return;
        }
    };

    for note in &due_notes {
        let title = if note.title.is_empty() {
            "Reminder".to_string()
        } else {
            format!("Reminder: {}", note.title)
        };

        let body = if note.body.len() > 200 {
            format!("{}...", &note.body[..200])
        } else if note.body.is_empty() {
            "You have a task due!".to_string()
        } else {
            note.body.clone()
        };

        if let Err(e) = app.notification()
            .builder()
            .title(&title)
            .body(&body)
            .show()
        {
            eprintln!("Failed to send notification: {}", e);
        }

        if let Err(e) = db::mark_reminder_sent(&conn, &note.id) {
            eprintln!("Failed to mark reminder sent: {}", e);
        }

        let _ = app.emit("note-reminder-fired", &note.id);
    }
}
