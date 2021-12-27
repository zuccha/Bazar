#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
fn extract(zip_path: String, target_path: String) -> std::result::Result<(), String> {
  let zip = std::path::Path::new(&zip_path);
  let target = std::path::Path::new(&target_path);

  let extract = tauri::api::file::Extract::from_source(zip);
  let res = extract.extract_into(target);

  match res {
    Ok(()) => return Ok(()),
    Err(e) => return Err(e.to_string()),
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![extract])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
