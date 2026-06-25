# Aura — Full-Stack AI Therapist Agent Web Application

Aura is a professional, calming, and safe Full-Stack AI Therapist Agent web application built using **Next.js (App Router)** and **TypeScript**. It offers users a private space to reflect, converse with an AI active-listener, follow interactive grounding breathing exercises, and receive structured emotional summaries with recommended coping strategies.

## Live Demo
👉 **[Launch Aura (Vercel Live Demo)](https://therapist-liart-nine.vercel.app/)**

---

## Key Features

1. **🔒 Secure User Authentication**:
   - **Sign In / Register**: Secure profiles to retain and password-protect session history transcripts.
   - **Anonymous Guest**: Start chat sessions instantly with a guest profile without credentials.
2. **💬 Empathetic Conversation Space**:
   - Context-aware active listening powered by the Gemini API (`gemini-1.5-flash`).
   - High-fidelity simulated therapist fallback mode that runs offline when no API key is set.
3. **🧘 Interactive Grounding Box Breathing**:
   - A visual, real-time expanding/contracting box-breathing cycle (Inhale, Hold, Exhale, Hold) to help calm user anxiety directly inside the chat layout.
4. **🛡️ Active Safety & Indian Helplines**:
   - Scanner checks user messages for self-harm or distress.
   - Surfaces toll-free local Indian helplines: **Kiran Helpline (1800-599-0019)** and **Tele-MANAS (14416)** instantly.
   - Pinned directory page listing Indian support organizations (AASRA, Vandrevala Foundation).
5. **📋 Session Reflection & Coping Summaries**:
   - Close a session to automatically generate structural summaries including: main themes, emotional trajectory pathways, **3 personalized coping steps**, and custom self-care grounding guides.
   - View detailed records and full transcripts anytime in the **Reflection History** dashboard.

---

## Tech Stack & Architecture

- **Frontend & Logic**: Next.js App Router (React, TypeScript), Vanilla CSS variables (professional light theme).
- **Database / Storage**: Standard browser `localStorage` to store user session histories and transcripts locally and privately.
- **AI Integration**: Direct Google Gemini API integration (runs in the browser using the user's settings-provided API key, or falls back to an offline simulated therapist mode if no key is configured).

---

## Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/Joseph-Francis42/therapist.git
   cd therapist
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Configuring the Gemini API
- **Option A (UI Settings)**: Click the **Gear Icon** in the top navigation bar of the web app to paste your `GEMINI_API_KEY` (saved securely in your local browser state).
- **Option B (Server Config)**: Create a `.env.local` file in the root directory and add:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
