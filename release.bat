git add src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore: bump version to 1.1.0 for release"
git push origin main
git tag v1.1.0
git push origin v1.1.0
gh release create v1.1.0 --title "v1.1.0" --notes "this is just to test the viability of switching to traditional Chinese, no hard feelings"
