# 📚 Online Course Platform (LMS)

> A bilingual classroom in Cascais: Mux video uploads, a player that tracks progress, a quiz on every lesson, a PDF certificate at the end, and Stripe for a single course or a monthly pass, painted in the ividi.dev palette (black, burnt orange, amber).

[![CI](https://github.com/VidiPT89/OnlineCoursePlatform-LMS-/actions/workflows/ci.yml/badge.svg)](https://github.com/VidiPT89/OnlineCoursePlatform-LMS-/actions/workflows/ci.yml)

[🐞 Report Bug](https://github.com/VidiPT89/OnlineCoursePlatform-LMS-/issues) · [✨ Request Feature](https://github.com/VidiPT89/OnlineCoursePlatform-LMS-/issues)

AULA is a Next.js learning desk. The catalogue has an open course, a paid street course and a darkroom course that only opens with the monthly pass. Lessons play through Mux (a public demo reel when keys are empty). Watch time is stored as percent complete. Each lesson has a quiz. Finish every lesson and pass every quiz to download a PDF certificate. The UI is European Portuguese / English, with the language toggle remembered in `localStorage`.

## ✨ Main Features

- 🎬 **Mux upload** — direct upload when token keys are set, demo reel otherwise
- 📈 **Progress tracking** — player ticks write percent complete per lesson
- ❓ **Quiz per lesson** — bilingual prompt, stored attempts
- 📄 **PDF certificate** — issued when the course is complete
- 💳 **Stripe** — single course or AULA pass (local complete without keys)
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🎓 **Studio** — instructor identity prepares Mux uploads
- 🎬 **Motion** — grain, ember glow and staggered course cards

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Mux](https://img.shields.io/badge/Mux-video-000000?style=flat&logo=mux&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-test-635BFF?style=flat&logo=stripe&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Campus, studio, player and API |
| **Data** | Prisma + PostgreSQL | Courses, lessons, progress, quizzes, billing |
| **Video** | Mux | Direct upload and playback |
| **Payments** | Stripe Checkout (test) | Course or subscription |
| **Motion** | Framer Motion | Hero and card reveal |

## 🧱 Project Structure

```text
OnlineCoursePlatform(LMS)/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/                # routes and API
│   ├── components/
│   ├── i18n/
│   └── lib/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- **Docker** (PostgreSQL 16 on port 55436)

### Installation

```bash
git clone https://github.com/VidiPT89/OnlineCoursePlatform-LMS-.git
cd OnlineCoursePlatform-LMS-
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Campus: [http://localhost:3000/campus](http://localhost:3000/campus). Studio (David): [http://localhost:3000/studio](http://localhost:3000/studio).

Mux and Stripe are optional. Leave those keys empty to play the demo reel and complete purchase locally. For a real test card payment, create a Stripe test secret key and use card `4242 4242 4242 4242`.

## 📖 Usage

1. Toggle **PT** or **EN** in the header.
2. Open **Enter class** and pick a demo identity (David is the instructor).
3. Watch a free lesson, answer the quiz, keep the progress bar moving.
4. Buy **Street at night** or subscribe to the AULA pass for the darkroom.
5. Download the PDF when every lesson is complete.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST / DELETE | `/api/session` | Demo identity |
| GET | `/api/courses/[slug]` | Course, lessons and access |
| GET | `/api/lessons/[id]` | Lesson room |
| POST | `/api/lessons/[id]/progress` | Watch tracking |
| POST | `/api/lessons/[id]/quiz` | Quiz attempt |
| POST | `/api/lessons/[id]/upload` | Mux direct upload |
| POST | `/api/checkout` | Course or subscription |
| POST | `/api/webhooks/stripe` | Mark purchase or pass paid |
| POST | `/api/mux/webhook` | Attach playback id |
| GET | `/api/certificates/[courseId]` | PDF certificate |

## 🧪 Testing

```bash
npm test
```

`node:test` checks progress math, access rules and certificate readiness.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
