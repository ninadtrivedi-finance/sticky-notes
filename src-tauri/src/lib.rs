mod db;
mod scheduler;

use db::StickyNote;
use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Manager, State};
use uuid::Uuid;
use chrono::Utc;

struct DbState(Mutex<Connection>);

fn get_db_path(app: &tauri::AppHandle) -> PathBuf {
    let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
    app_dir.join("notes.db")
}

#[tauri::command]
fn get_notes(state: State<DbState>) -> Result<Vec<StickyNote>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::get_all_notes(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_note(state: State<DbState>, title: String, color: String, position_x: f64, position_y: f64) -> Result<StickyNote, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
    let note = StickyNote {
        id: Uuid::new_v4().to_string(),
        title,
        body: String::new(),
        color,
        is_completed: false,
        position_x,
        position_y,
        width: 240.0,
        height: 200.0,
        reminder_at: None,
        reminder_sent: false,
        created_at: now.clone(),
        updated_at: now,
    };
    db::create_note(&conn, &note).map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
fn update_note(state: State<DbState>, note: StickyNote) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::update_note(&conn, &note).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::delete_note(&conn, &id).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let db_path = get_db_path(&app.handle());
            let conn = db::init_db(&db_path).expect("Failed to initialize database");
            app.manage(DbState(Mutex::new(conn)));
            scheduler::start_reminder_scheduler(app.handle().clone(), db_path);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_notes,
            create_note,
            update_note,
            delete_note,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
