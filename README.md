# 🧭 Split Sensei

> Split expenses with your crew. From mountain trails to city escapes — never lose track of who owes what.

🌐 **Live App:** [split-sensei.pages.dev](https://split-sensei.pages.dev)

---

## ✨ Features

- 🔐 **Authentication** — Email/password and Google OAuth
- 👥 **Groups** — Create groups for trips, adventures, and hangouts
- 💸 **Expenses** — Add expenses with custom splits, tags, and receipt photos
- 📊 **Summary** — See who owes whom with simplified debt calculation
- 📈 **Trends** — Spending charts by day and category
- 🕐 **Timeline** — Full activity log for every group
- ✅ **Settlements** — Record payments and mark debts as settled
- 🌍 **Auto Currency** — Currency auto-detected from group location
- 📱 **Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Cloudflare Pages |
| Auth | Supabase Auth (Email + Google OAuth) |
| Photos | Unsplash API |

---

## 🚀 Running Locally

### Prerequisites
- Node.js v22+
- A Supabase project
- An Unsplash developer account

### Setup

1. Clone the repo:
```bash
   git clone https://github.com/YOUR_USERNAME/split-sensei.git
   cd split-sensei
```

2. Install dependencies:
```bash
   npm install
```

3. Create a `.env` file in the root:
```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_UNSPLASH_KEY=your_unsplash_key
```

4. Start the dev server:
```bash
   npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure
```
src/
├── components/          # Shared components
│   ├── EditGroupModal.jsx
│   └── PageBackground.jsx
├── context/             # Auth context
│   └── AuthContext.jsx
├── lib/                 # Utilities
│   ├── supabase.js
│   └── countries.js
├── pages/               # App pages
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── CreateGroup.jsx
│   ├── GroupDetail.jsx
│   └── Profile.jsx
└── main.jsx
```

---

## 🗄️ Database

Built on Supabase PostgreSQL with the following tables:

- `profiles` — User accounts
- `groups` — Trip/expense groups
- `group_members` — Members per group
- `expenses` — Individual expenses
- `expense_payers` — Who paid for each expense
- `expense_splits` — How each expense is split
- `activity_log` — Timeline of all group actions
- `settlements` — Recorded debt settlements

---

## 🌐 Deployment

Deployed on **Cloudflare Pages** — free tier with unlimited bandwidth.

Backend on **Supabase** free tier.

**Total hosting cost: $0/month** 🎉

---

## 📸 Screenshots

> Dashboard, Group Detail, Expense Splits, Trends — coming soon

---

## 📄 License

MIT — feel free to use and modify for your own projects.