BANANA VISION — iPHONE PWA
==========================

यह एक installable website/PWA है, native iPhone app नहीं। इसे HTTPS hosting (जैसे GitHub Pages) पर चलाएं।

INSTALL (मोबाइल से):
1. ZIP को Extract करें।
2. GitHub पर नया public repository बनाएं: banana-vision-iphone
3. ZIP के अंदर की सभी files और icons folder को repository के ROOT में upload करें।
4. GitHub repo > Settings > Pages खोलें।
5. "Deploy from a branch" चुनें; Branch: main और Folder: /(root), फिर Save करें।
6. Pages URL बनने के बाद iPhone के Safari में खोलें।
7. Safari Share button > Add to Home Screen > "Open as Web App" ON > Add.
8. Home Screen पर Banana Vision icon से खोलें।

FEATURES:
- Multiple photos/videos select और IndexedDB local library में save
- Photos/videos grid, search, sort, favorites
- Full-screen style photo/video viewer
- Photo rotate, double-tap zoom, swipe next/previous, slideshow
- Video play/pause, seekbar, ±10 sec, speed 0.25x–2x
- Share/download (browser support पर निर्भर)
- Recently added, local library size indicator, dark/light theme
- App shell offline cache (media files offline cache नहीं होते; चुनी हुई media IndexedDB में रखी जाती है)

IMPORTANT iPHONE LIMITATIONS:
- iOS PWA पूरी Photos library को खुद scan नहीं कर सकती। User को iOS picker से media select करना होगा।
- Browser/iOS storage quota सीमित है और iOS storage साफ कर सकता है। बहुत बड़ी videos एक साथ import न करें।
- iPhone volume boost 100% से ऊपर browser द्वारा guaranteed नहीं है; iOS hardware/system volume अलग control करता है।
- Picture-in-Picture, background playback, codecs, subtitles और fullscreen व्यवहार iOS/Safari version पर निर्भर हैं।
- इस build को इस environment में physical iPhone पर test नहीं किया गया। इसे "हर iPhone पर guaranteed" नहीं कहा जा सकता।
- Privacy: चुनी हुई media browser के local IndexedDB में save होती है; app किसी server पर upload नहीं करती। "Delete library" से app की saved copies हटती हैं। Original Photos/Files नहीं हटते।

TROUBLESHOOT:
- अगर update नहीं दिखे: Safari website reload करें; जरूरत पर Home Screen app बंद करके दोबारा खोलें।
- Storage issue: कम files import करें; iOS Settings > Safari > Advanced > Website Data में site data हटाने से app की saved library भी हट सकती है।
- GitHub Pages पर root files सही upload करें; index.html root में होना चाहिए।
