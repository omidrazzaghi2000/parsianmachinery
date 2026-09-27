# Parsian Website — How to Run & Use (English Guide)

This folder is a complete multi-page website with a built-in content management panel (the "Option A" approach: HTML + JavaScript + a single `data.json` file, no complex server required).

---

## 1. What's inside

```
website/
├── index.html          Home page
├── about.html          About us
├── products.html       Products list
├── product.html        Single product detail (opens with ?id=...)
├── services.html       After-sales services
├── news.html           News list
├── news-article.html   Single news article (opens with ?id=...)
├── gallery.html        Gallery
├── contact.html        Contact page
├── admin.html          ⭐ Admin panel (password-protected)
├── data.json           ⭐ The "heart" — all site content lives here
└── assets/
    ├── css/style.css   Shared styling for all pages
    └── js/
        ├── common.js   Header, footer, language toggle
        ├── site.js     Builds page content from data.json
        └── admin.js    Admin panel logic
```

---

## 2. Why you can't just double-click index.html

Modern browsers block a page opened directly from your hard drive (a `file://` address) from loading other files like `data.json`. This is a browser security rule, not a bug in the site.

So to see the site you must open it through a small **local web server**. It sounds technical, but it's one command. Pick whichever method below matches what's installed on your PC.

---

## 3. Run the site — choose ONE method

### Method A — Python (most common, recommended)

Most Windows PCs already have Python. To check and run:

1. Open the `website` folder in File Explorer.
2. Click in the address bar at the top, type `cmd`, and press **Enter**. A black command window opens already pointing at this folder.
3. Type this and press Enter:
   ```
   python -m http.server 8000
   ```
   - If you see a message like `Serving HTTP on :: port 8000`, it's working.
   - If it says `python is not recognized`, try `py -m http.server 8000` instead. If that also fails, Python isn't installed — use Method B or C.
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```
5. To stop the server later, go back to the black window and press **Ctrl + C**.

### Method B — VS Code "Live Server" (best if you or your developer uses VS Code)

1. Install **Visual Studio Code** (free) from code.visualstudio.com.
2. Open VS Code → File → Open Folder → select the `website` folder.
3. In the Extensions panel (left sidebar, the squares icon), search **Live Server** and click Install.
4. Right-click `index.html` → **Open with Live Server**.
5. Your browser opens the site automatically.

### Method C — Node.js (if you have Node installed)

1. Open the `website` folder, type `cmd` in the address bar, press Enter.
2. Run:
   ```
   npx serve
   ```
3. It prints a local address (usually `http://localhost:3000`). Open it in your browser.

---

## 4. Using the Admin Panel

1. With the site running (Section 3), go to:
   ```
   http://localhost:8000/admin.html
   ```
   (or click "Admin" in the top utility bar / footer of the site).
2. Enter the password. Default: **parsian1381**
   - ⚠️ Change this immediately: open `assets/js/admin.js`, find the line `password: 'parsian1381'`, and replace it with your own.
3. Use the left menu to pick a section: **News, Products, Services, Gallery, About, Contact**.
4. Make your changes and click **Save**. Changes appear on the site instantly (in your browser).

### Add a news item (your main use case — after a trade fair, interview, etc.)
News → **+ New article** → fill in title, date, category (Event / Technology / Press / Sustainability), summary, full text, and an image → **Save**.

---

## 5. Publishing changes to the LIVE website (important)

With this approach, edits you make in the panel are **first saved only in your own browser**. To push them to the real, public website:

1. In the admin panel, click the orange **"⬇ Download data.json (Publish)"** button.
2. A file named `data.json` downloads.
3. **Replace** the old `data.json` on your web host with this new file (via FTP or your host's control panel / file manager).
4. Done — the live site updates for all visitors.

In practice, the site manager only needs to know how to upload one file to the host. If even that feels like too much, we can later upgrade to "Option B" (Strapi), where publishing is fully automatic with no file uploads.

---

## 6. Putting the site online (hosting)

Upload the entire `website` folder to your web host (e.g. ParsPack, ArvanCloud, or any provider). `index.html` becomes your home page. Make sure `data.json` and the `assets` folder are uploaded too, keeping the same folder structure.

---

## 7. Languages (Persian / English)

The FA / EN button in the top bar switches languages. All content has two versions in `data.json` (e.g. `titleFa` and `titleEn`), and the admin panel shows both fields side by side.

---

## 8. What's next

This is the overall skeleton. Next we refine each page in detail — real text, real machine photos, more product fields, colors, and anything else you need. Tell me which page to polish first.
