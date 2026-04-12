# HR-One Donuts: AI Project Context

This document provides a high-density technical overview of the **HR-One Donuts** project. It is designed to help AI coding assistants understand the architecture, data models, and business logic of the codebase.

## 1. Project Identity
- **Name**: HR-One Donuts
- **Domain**: Premium Donut e-Commerce (Storefront + Admin Dashboard)
- **Primary Languages**: TypeScript, SQL (PostgreSQL)
- **Platform**: Next.js (Vercel) + Supabase

---

## 2. Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Backend-as-a-Service**: Supabase
    - **Auth**: Email/Password + Role-based access.
    - **Database**: PostgreSQL with Row Level Security (RLS).
    - **Functions**: Edge Functions (if used) or Server Actions.
- **Generative AI**: Google Gemini SDK (`@google/generative-ai`).
- **Icons**: Heroicons.
- **Charts**: Recharts (Admin statistics).
- **Notifications**: Telegram Bot API (`node-telegram-bot-api`).

---

## 3. Directory Structure (src/)
- `app/`: Next.js App Router folders.
    - `(auth)/`: Authentication routes (login, register).
    - `admin/`: Protected admin dashboard routes.
    - `api/`: API endpoints (Webhooks, Telegram integration).
    - `catalog/`: Product listing and category views.
    - `profile/`: User account management.
    - `vouchers/`: Discount code explorer.
- `components/`: Reusable UI components.
    - `ui/`: Atom-level components (Buttons, Inputs, Modals).
    - `cart/`, `checkout/`, `detail/`: Feature-specific components.
    - `admin/`: Admin-exclusive UI.
    - `ChatbotWidget.tsx`: The "Dona AI" interface.
- `lib/`: Utilities and core logic.
    - `supabase/`: Supabase client initialization (SSR & Client).
    - `device-fingerprint.ts`: ID generation logic for tracking.
- `context/`: React Context providers (Cart, Language, Theme).

---

## 4. Database Schema (Supabase)
### Core Tables:
- **`products`**:
    - `id` (PK, TEXT), `name`, `price`, `description`, `image`, `category`.
    - `is_active` (BOOLEAN): Controls visibility in storefront.
- **`orders`**:
    - `id` (PK, UUID), `items` (JSONB), `total_amount`, `total_items`.
    - `session_id` (TEXT): Linked to device fingerprint.
- **`vouchers`**:
    - `id`, `code` (Unique), `discount_type` ('percentage'|'fixed'), `discount_value`.
    - `min_purchase`, `usage_limit`, `status`.
- **`profiles`**:
    - Linked to `auth.users`. Contains `role` ('admin'|'user') and `full_name`.
- **`knowledge_base`**:
    - `question`, `answer`: Used by Dona AI for fallback responses.

### Key Policies (RLS):
- **Products**: Public read (if active), Admin write.
- **Orders**: Public insert (validation required), Admin read all.
- **Vouchers**: Public read (if active/valid), Admin manage.

---

## 5. Core Business Logic
### Order & Checkout Flow
1. Users add items to the cart (managed via `CartContext` and stored in `localStorage`).
2. At checkout, cart data is validated against the database.
3. If valid, the system generates a WhatsApp URL encoded with the order details.
4. The user is redirected to WhatsApp to complete the transaction (O2O - Online to Offline).

### Voucher System
- Vouchers are validated client-side and server-side.
- Logic includes `min_purchase` check, `start_date`/`end_date` validity, and `usage_limit`.

### Flash Sales (`FlashSaleSection.tsx`)
- Dynamic countdowns based on `end_date`.
- Pricing overrides logic implemented in the UI but should reflect DB prices.

---

## 6. Advanced Features
### Dona AI (Chatbot)
- Integrated in `ChatbotWidget.tsx`.
- **Logic Sequence**: 
    1. Keyword matching (Menu, WhatsApp, Bestsellers).
    2. Knowledge Base lookup (Supabase `knowledge_base` table).
    3. Gemini AI fallback (`askDonaAI` action).
    4. Implicitly forwards chats to Telegram for admin monitoring.

### Anti-Fraud & Analytics
- **Device Fingerprinting**: Generates a persistent UUID in `localStorage` to track sessions without mandatory login.
- **Visitors Table**: Tracks page paths and user agents for analytics.

---

## 7. Developer Guidelines
- **Naming**:
    - Components: `PascalCase.tsx`
    - Variables/Functions: `camelCase`
    - Folders: `kebab-case`
    - DB Tables/Columns: `snake_case`
- **UI Architecture**:
    - Atomic design principle for `src/components/ui`.
    - Mobile-first, responsive layouts using Tailwind CSS.
    - Use `lucide-react` or `heroicons` for iconography.
- **Security**:
    - Never expose service roles in client-side code.
    - Always use `lib/supabase/client.ts` for browser interactions.
    - Use Server Actions (`src/app/actions`) for sensitive DB mutations.

---

## 8. AI-Specific Context
When modifying this codebase:
- **Component Patterns**: Prefer functional components with `use client` only when necessary.
- **Data Fetching**: Use Server Components for initial page data to optimize SEO.
- **Styling**: Stick to the Tailwind 4 configuration; avoid inline styles.
- **Translation**: Use `LanguageContext` for multi-language support (ID/EN).
