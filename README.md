# Clothes

**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

A mobile-first web app for uniform warehouses, clothing distribution, and garment packing/sorting scenarios.

> "Simple yet complete — scan and go."

---

## ✨ Highlights

- 📱 **Mobile-first** — optimized for on-site mobile use with large buttons and clear feedback.
- 🔍 **Scan or manual input** — supports QR-code scanning or manual entry of item codes like `ITEM-000001`.
- 🏷️ **Target location guidance** — auto-suggests sorting locations by size: M → `A-01`, L → `A-02`, XL → `A-03`.
- 💾 **Local data persistence** — stores data in `localStorage`; no database, backend, or network service required.
- 🧪 **Test coverage for critical paths** — uses Vitest to cover data generation, routing rules, exception states, and edge cases.

---

## 📥 Import Format

The current version generates demo data quickly via the **Initialize Sample Data** button.

Sample batch details:

```text
Batch: BATCH-20260704-BLUE
Quantity: 30
Type: Blue uniform tops
Status: Pending
Initial location: Pending sort area
```

---

## 🚀 Download & Usage

### 1. Get the app

```bash
git clone <repository-url>
cd Clothes
```

### 2. Install dependencies

```bash
npm install
```

If the official npm registry is slow, use a mirror:

```bash
npm install --registry=https://registry.npmmirror.com
```

### 3. Start the dev server

```bash
npm run dev
```

Default URL:

```text
http://localhost:3000
```

If port `3000` is in use, specify another:

```bash
npm run dev -- -p 3001
```

---

## 📋 Usage Flow

1. Open the homepage.
2. Click **Initialize Sample Data**.
3. Click **Start Sorting** to enter `/scan`.
4. Enter an item code, e.g. `ITEM-000001`.
5. Press Enter or click Search.
6. The page shows item info and target location.
7. Click **Confirm Place into Target Location**.
8. Re-scanning shows a duplicate-operation warning.

---

## 🗂️ Page Navigation

| Route | Description |
| :--- | :--- |
| `/` | Home stats, current batch, init/clear data, entry points |
| `/scan` | Sorting page: input code, confirm sort, mark exception, change target |
| `/items` | Item list: search and status filter |
| `/items/[itemCode]` | Item detail: edit name, department, status, location, notes |
| `/locations` | Location management: add/remove locations; in-use locations cannot be deleted |
| `/logs` | Scan and operation logs, newest first |

---

## 🛠️ Technical Details

- **Development mode**: Human-led, AI-assisted
- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: App Router
- **Testing**: Vitest + React Testing Library
- **Persistence**: `localStorage` (centralized in `lib/storage.ts`)
- **License**: MIT License

---

## 🧪 Test Coverage

Tests focus not only on the happy path but also on behaviors that are easy to fake or miss:

- Sample data must generate exactly 30 unique items.
- M / L / XL must route to `A-01` / `A-02` / `A-03` respectively.
- Uninitialized `localStorage` must return safe empty data.
- Sorted and exception statuses must correctly affect statistics.
- Exceptions must not count toward completion rate.
- Updating a non-existent item must not create ghost data.
- Duplicate scans and duplicate sort confirmations must be logged.
- Locations currently referenced by items cannot be deleted.
- Clear data must only remove this app’s own storage keys.
- Pages and components must not call `localStorage` directly; use `lib/storage.ts`.

---

## 💻 Common Commands

```bash
npm run dev      # Start dev server
npm run test     # Run tests
npm run build    # Build for production
npm run lint     # Run ESLint
```

---

## 📚 Documentation Navigation

- `app/` — Next.js App Router pages
- `components/` — React components
- `lib/` — Types, storage, utilities, demo data
- `tests/` — Vitest tests
