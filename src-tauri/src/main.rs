#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::io::{Read, Write};
use std::fs::File;
use std::path::Path;
use walkdir::{WalkDir};

#[tauri::command]
fn exists(path: String) -> bool {
  return Path::new(&path).exists();
}

fn extract_aux(zip_path: String, target_path: String) -> std::result::Result<(), Box<dyn std::error::Error>> {
  let source = File::open(Path::new(&zip_path))?;
  let mut archive = zip::ZipArchive::new(source)?;
  archive.extract(Path::new(&target_path))?;
  Ok(())
}

#[tauri::command]
fn extract(zip_path: String, target_path: String) -> std::result::Result<(), String> {
  match extract_aux(zip_path, target_path) {
    Ok(_) => Ok(()),
    Err(err) => Err(err.to_string()),
  }
}

fn archive_aux(source_dir: String, dest_file: String) -> std::result::Result<(), Box<dyn std::error::Error>> {
  let dest_file = std::fs::File::create(&dest_file).unwrap();
  let dir_iter = WalkDir::new(&source_dir).into_iter().filter_map(|e| e.ok());

  let mut zip = zip::ZipWriter::new(&dest_file);
  let options = zip::write::FileOptions::default().unix_permissions(0o755);

  let mut buffer = Vec::new();
  for entry in dir_iter {
    let path = entry.path();
    let name = path.strip_prefix(Path::new(&source_dir)).unwrap();
    if path.is_file() {
      zip.start_file(name.to_string_lossy().to_string(), options)?;
      let mut file = File::open(path)?;
      file.read_to_end(&mut buffer)?;
      zip.write_all(&*buffer)?;
      buffer.clear();
    } else if name.as_os_str().len() != 0 {
      zip.add_directory(name.to_string_lossy().to_string(), options)?;
    }
  }

  zip.finish()?;
  return Ok(());
}

#[tauri::command]
fn archive(dir_path: String) -> std::result::Result<(), String> {
  let dest_path = dir_path.clone() + ".zip";

  let source_dir_path = Path::new(&dir_path);
  let dest_file_path = Path::new(&dest_path);

  if !source_dir_path.is_dir() {
    return Err("Directory doesn't exist".to_string());
  }
  if dest_file_path.exists() {
    return Err("The zip file already exists".to_string());
  }

  match archive_aux(dir_path, dest_path) {
    Ok(_) => Ok(()),
    Err(err) => Err(err.to_string()),
  }
}

#[tauri::command]
fn is_dir(path: String) -> bool {
  let exists = Path::new(&path).exists();
  if !exists { return false };
  let metadata = std::fs::metadata(path).unwrap();
  return metadata.is_dir();
}

#[tauri::command]
fn is_file(path: String) -> bool {
  let exists = Path::new(&path).exists();
  if !exists { return false };
  let metadata = std::fs::metadata(path).unwrap();
  return metadata.is_file();
}

#[tauri::command]
fn join(path1: String, path2: String) -> String {
  let path = Path::new(&path1).join(&path2);
  return path.to_string_lossy().to_string();
}

#[tauri::command]
fn normalize(path: String) -> String {
  match std::fs::canonicalize(Path::new(&path)) {
    Ok(p) => p.to_string_lossy().to_string(),
    Err(_) => path,
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![archive, exists, extract, is_dir, is_file, join, normalize])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
