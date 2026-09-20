# DuplexPro - PDF Imposer & Note Optimizer

**DuplexPro** is a powerful, modern, and intuitive web application designed for students, educators, and professionals to optimize PDF documents for printing. By imposing pages efficiently, DuplexPro helps save paper, reduce printing costs, and create perfectly formatted booklets, lecture notes, and exam prep materials.

🌐 **Live Application**: [https://duplexpro.indocreonix.com/](https://duplexpro.indocreonix.com/)

---

## 🌟 Key Features

### 📄 Advanced PDF Imposition
- Optimize your PDFs with various n-up layouts to fit multiple pages onto a single sheet of paper.
- **Smart Presets**: 
  - **Lecture**: 4-up layout optimized for slide handouts (perfect for university students).
  - **Booklet**: 2-up layout for creating folded booklets and magazines.
  - **Gate & JEE**: High-density layouts designed specifically for mock exams, past papers, and extensive notes.
  - **Exam**: 6-up study notes configuration for ultimate paper saving.
  - **TwoUp**: Quick print 2-up standard layout for general reading.

### ⚙️ Customization Options
- Adjust margins and spacing to prevent text cut-offs during binding.
- Add custom watermarks to protect your intellectual property.
- Enable automatic page numbering.
- Configure duplex (double-sided) printing modes (Long-edge vs Short-edge binding).

### 💰 Cost Estimator
- Built-in dynamic calculator to estimate your printing costs based on your selected layout, page count, and local print rates.

### 🔐 Authentication, Roles & Subscriptions
- **Google OAuth Integration**: Secure and seamless sign-in process.
- **Role-Based Access Control (RBAC)**: Differentiates between standard users (students) and system administrators.
- **Subscription Tiers**: Support for Free and Pro tiers, managing user quotas and credit systems.
- **Voucher System**: Redeem discount vouchers for premium features.

### 🛡️ Admin Console
- Comprehensive dashboard for administrators to manage users, monitor subscriptions, adjust roles, and view platform analytics.

### 🤖 AI Integration (Gemini)
- Features AI Studio integration via the Gemini API for advanced document processing capabilities, summarizing notes, and intelligent layout suggestions.

---

## 🛠️ Technology Stack

DuplexPro is built using a modern, full-stack JavaScript/TypeScript ecosystem:

**Frontend:**
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4, clsx, tailwind-merge
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React
- **Markdown**: react-markdown

**Backend:**
- **Server**: Node.js with Express
- **Database ORM**: Prisma Client
- **Authentication**: Google Auth Library, jsonwebtoken (JWT), bcryptjs
- **Security**: Helmet, express-rate-limit, cors

**PDF Processing:**
- `pdf-lib`: For client-side and server-side PDF manipulation, imposition, and rendering.
- `pdfjs-dist`: For reading and parsing PDF structures.
- `cloudconvert`: For additional document conversion fallbacks.

**Testing:**
- **E2E Testing**: Playwright
- **Unit Testing**: Vitest

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A relational database (PostgreSQL is recommended, but Prisma supports SQLite/MySQL as well)
- Google Cloud Console account (for OAuth credentials)
- Google AI Studio account (for Gemini API Key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pdf-imposer-and-note-optimizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the `.env.example` file to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```
   *Required variables include `DATABASE_URL`, `GEMINI_API_KEY`, and Google OAuth client IDs.*

4. **Database Setup:**
   Run Prisma to generate the client and push the schema to your database:
   ```bash
   npm run postinstall
   npm run db:push
   ```
   *To seed the database with initial roles and plans, run:* `node seed.cjs` (if applicable).

5. **Start the Development Server:**
   This command starts both the Vite frontend and Express backend concurrently:
   ```bash
   npm run dev
   ```
   > **Note for Windows Users:** If your folder path contains an ampersand (`&`), `npm run dev` might fail because of a known `cmd.exe` bug. You can either rename the folder or run the server directly: `node "node_modules\tsx\dist\cli.mjs" server.ts`

---

## 👨‍💻 Important Developer Commands

- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Start Production Server**: `npm run start`
- **Prisma Studio (DB Viewer)**: `npx prisma studio` (Opens at http://localhost:5555)
- **Push Schema Changes**: `npx prisma db push`
- **Force Reset Database**: `npx prisma db push --force-reset`

### Promoting a User to Admin
By default, new users signing in via Google OAuth are assigned the `student` role. To promote an account to a full administrator to access the System Admin Console:
```bash
npx tsx make-admin.ts <your.email@gmail.com>
```
*(Remember to log out and log back in to refresh your JWT token after running this!)*

---

## 🧪 Testing

DuplexPro uses Playwright for End-to-End (E2E) testing to ensure core user flows remain stable.

- **Run all E2E tests headless**: 
  ```bash
  npm run test:e2e
  ```
- **Run E2E tests with Playwright UI**: 
  ```bash
  npm run test:e2e:ui
  ```
- **Run specific test suite**:
  ```bash
  npm run test:ultimate
  ```

---

## 📁 Project Structure

```text
pdf-imposer-and-note-optimizer/
├── src/                # React frontend source code
│   ├── components/     # Reusable UI components
│   ├── lib/            # Shared libraries and configurations
│   ├── utils/          # Utility functions for PDF processing, etc.
│   ├── App.tsx         # Main application component
│   └── main.tsx        # React DOM entry point
├── prisma/             # Prisma ORM schema and migrations
│   └── schema.prisma   # Database schema definition
├── public/             # Static assets (images, robots.txt, HTML)
├── tests/              # Playwright E2E test files
├── server.ts           # Express backend entry point
├── package.json        # Project dependencies and scripts
└── developer_commands.md # Internal developer cheat sheet
```

---

## 📄 License

This project is licensed under the Apache License 2.0.
SPDX-License-Identifier: Apache-2.0
