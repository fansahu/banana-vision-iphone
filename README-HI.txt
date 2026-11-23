BANANA VISION MAX — iPhone PWA

IMPORTANT LIMITATIONS
- A PWA cannot silently scan the entire iPhone Photos library. Use Import and choose files in the iOS picker.
- Imported media is stored locally in IndexedDB, not uploaded. iOS may evict website data. Keep original backups.
- Playback depends on Safari codecs/container support. No universal MKV/AVI/FLAC/RAW decoder is included.
- PiP, background audio, volume boost, lock-screen controls and Face ID are not guaranteed by a PWA.
- This is a best-effort PWA project, not physically tested on every iPhone. 100% glitch-free behavior cannot be promised.

FEATURES
Photo/video/audio import; local library; search/sort/favorites; photo viewer with zoom/rotate/slideshow; simple brightness/contrast export; video seek/speed/±10s; audio player; image converter; metadata info; likely duplicate finder; JSON library inventory export; dark/light theme; offline app shell.

ANDROID TERMUX DEPLOY / UPDATE
1. Download ZIP to Android Downloads and extract it to: ~/bv-max-new
2. Open Termux and run: termux-setup-storage
3. Run: pkg update -y && pkg install git unzip -y
4. If repo folder already exists: cd ~/banana-vision-iphone && git pull origin main
   If first time only: git clone https://github.com/fansahu/banana-vision-iphone.git
5. Copy extracted files: cp -r ~/bv-max-new/. ~/banana-vision-iphone/
   (If extracted elsewhere, change source path.)
6. Run: cd ~/banana-vision-iphone
7. Run: git add -A && git commit -m "Upgrade Banana Vision MAX"
8. Run: git push origin main
9. GitHub Pages URL: https://fansahu.github.io/banana-vision-iphone/

After push, wait for GitHub Pages deployment. Open the URL in Safari and refresh. If old shell remains cached, close Home Screen app and open the URL in Safari once; refresh, then reopen Home Screen app.
