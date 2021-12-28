#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
fn exists(path: String) -> bool {
  return std::path::Path::new(&path).exists();
}

#[tauri::command]
fn extract(zip_path: String, target_path: String) -> std::result::Result<(), String> {
  let source = match std::fs::File::open(std::path::Path::new(&zip_path)) {
    Ok(s) => s,
    Err(err) => return Err(err.to_string()),
  };
  let mut archive = match zip::ZipArchive::new(source) {
    Ok(a) => a,
    Err(err) => return Err(err.to_string()),
  };
  match archive.extract(std::path::Path::new(&target_path)) {
    Ok(_) => Ok(()),
    Err(err) => Err(err.to_string()),
  }
}

#[tauri::command]
fn is_dir(path: String) -> bool {
  let exists = std::path::Path::new(&path).exists();
  if !exists { return false };
  let metadata = std::fs::metadata(path).unwrap();
  return metadata.is_dir();
}

#[tauri::command]
fn is_file(path: String) -> bool {
  let exists = std::path::Path::new(&path).exists();
  if !exists { return false };
  let metadata = std::fs::metadata(path).unwrap();
  return metadata.is_file();
}

#[tauri::command]
fn join(path1: String, path2: String) -> String {
  let path = std::path::Path::new(&path1).join(&path2);
  return path.to_string_lossy().to_string();
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![exists, extract, is_dir, is_file, join])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
