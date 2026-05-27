# ProteoBio — proteobio.io

> **ProteoAgent** — Multi-agent AI platform for proteomics research.

## 🌐 Live Site
[proteobio.io](https://proteobio.io) *(coming soon)*

## 📁 Project Structure

```
proteobio.io/
├── index.html          # Main landing page
├── css/
│   └── style.css       # Global styles (dark futuristic theme)
├── js/
│   └── main.js         # Interactivity, canvas animation, forms
├── assets/
│   └── images/         # Favicon, logos, images
├── .gitignore
└── README.md
```

## 🚀 Development

No build step needed. Open `index.html` in any browser, or use a local dev server:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .

# VS Code: use the "Live Server" extension
```

## 📧 Email Setup

| Address | Purpose |
|---------|---------|
| hello@proteobio.io | General inquiries |
| research@proteobio.io | Academic collaborations |
| pilot@proteobio.io | Early access program |

Email provider: *to be configured (Zoho / Google Workspace)*

## 📬 Contact Form

Powered by [Formspree](https://formspree.io).  
Update the `action` URL in `index.html` → `#contact` section after registering your form.

## 📰 Newsletter

Mailing list powered by [Mailchimp](https://mailchimp.com).  
Update the form submission handler in `js/main.js` with your Mailchimp audience URL.

## 🌍 Hosting

Hosted on **GitHub Pages** with a custom domain.

### DNS Setup (after buying the domain)
Add these records at your registrar:
```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  <your-github-username>.github.io
```

### Enable GitHub Pages
1. Push to `main` branch
2. Go to repo **Settings → Pages**
3. Source: **Deploy from branch → main → / (root)**
4. Custom domain: `proteobio.io`
5. Check **Enforce HTTPS**

## 🗺️ Roadmap

- [x] Landing page v1
- [ ] Custom domain DNS
- [ ] Email addresses live
- [ ] Formspree contact form connected
- [ ] Mailchimp newsletter connected
- [ ] Blog / Research page
- [ ] ProteoAgent demo / interactive visualization
- [ ] Publications page

## 📄 License

© 2026 ProteoBio. All rights reserved.
