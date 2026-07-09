# 🧠 Learneb (Gamified Numeracy, Logic & Memory Trainer)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**Learneb** is a modern, gamified learning platform built with React, Vite, and Tailwind CSS, designed to train three core cognitive faculties — **Numeracy**, **Logic**, and **Memory** — through fast, timed, endlessly-replayable drills. Every question is generated algorithmically on the client side, so no two rounds are ever the same.

🔗 **Live Demo:** [learneb.vercel.app](https://learneb.vercel.app/)
📦 **Repository:** [github.com/BenTimothyM/Learneb](https://github.com/BenTimothyM/Learneb)

## 📖 Project Description

Most math/logic trainers online rely on a fixed pool of pre-written questions, which means players eventually memorize the answers instead of the skill. **Learneb** takes a different approach: every problem — from chained mental-math flashes to alpha-numeric cryptarithms — is procedurally generated at runtime by pure JavaScript functions, so practice sessions stay fresh indefinitely.

Players can either jump straight into a level of their choice, hit **Random Game** for a mixed drill, or take a 10-question placement test that recommends a starting level based on their numeracy, logic, and spatial-reasoning scores.

## ✨ Key Features

- ⚡ **Fully procedural questions** — math, logic, and spatial puzzles are generated algorithmically, never hardcoded.
- 🎯 **Placement test** — a 10-question diagnostic suggests the right starting level (Easy / Medium / Hard).
- 🎮 **Adjustable difficulty** — most games support Easy, Medium, Hard, and a fully customizable mode (timer, question count, looping, digit/letter range).
- 🏆 **Progress tracking** — XP, streaks, and run history are saved locally so progress persists between sessions.
- 🌗 **Dark / light theme** toggle with a distinct cyber-minimalist design system.
- 📱 **Responsive UI** built entirely with Tailwind CSS utility classes.

## 🕹️ Games

| Level | Game | Faculty | Description |
|---|---|---|---|
| 1 (Easy) | Speed Math Flash | Numeracy | Rapid chained calculations flashed one step at a time — track the running total in your head. |
| 1 (Easy) | Double Speed Math Flash | Numeracy | Two independent chains flash in alternation across a split screen — split your attention and solve both. |
| 1 (Easy) | Syllogism Safari | Logic | Classic categorical syllogisms judged by a genuine logic-solving engine, not a fixed answer key. |
| 2 (Medium) | Derivative Dash | Numeracy | Match a polynomial function to the correct graph of its derivative. |
| 2 (Medium) | Memory Matrix | Memory | Memorize a triangle's coordinates, then click where a vertex lands after a rotation + translation. |
| 3 (Hard) | Cryptarithm Arena | Logic | Solve alpha-numeric equations like `SEND + MORE = MONEY` against a strict countdown. |
| 3 (Hard) | AlphaMath Codebreaker | Numeracy | Decode chained arithmetic expressions where letters stand in for numbers (a=1, b=2, ... z=26). |

## 💻 Tech Stack

- **Framework:** React 18 (functional components + hooks)
- **Build tool:** Vite 5
- **Styling:** Tailwind CSS (utility-first, custom design tokens)
- **Routing:** React Router (`HashRouter`, for static-host compatibility)
- **Icons:** lucide-react
- **Deployment:** Vercel

## 🚀 Installation

```bash
# 1. Clone the repository
git clone https://github.com/BenTimothyM/Learneb.git
cd Learneb

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

Then open the local URL printed in your terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## 🌐 Deployment

This project is pre-configured for zero-config deployment:

- **Vercel** — import the repo at [vercel.com](https://vercel.com), keep the default Vite build settings (`npm run build`, output directory `dist`), and deploy. The live demo above is hosted this way.
- **GitHub Pages** — a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the `dist` folder automatically on every push to `main`.

## 🤝 Contributing

Contributions are welcome! Whether it's adding a new game, expanding a question generator's variety, or improving the design system:

1. Fork this repository.
2. Create your feature branch (`git checkout -b feature-new-game`).
3. Commit your changes (`git commit -m 'Add new memory game'`).
4. Push to your branch (`git push origin feature-new-game`).
5. Open a Pull Request.

## 👨‍💻 Credits

This project is developed and maintained by:

* **Ben Timothy** - [@BenTimothyM](https://github.com/BenTimothyM) / [NNeb.dev](https://nneb.is-a.dev)

## 📜 License

This project is distributed under the **MIT License**. See the `LICENSE` file for more details.
