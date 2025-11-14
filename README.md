# MindDump

A simple, personal AI tool that helps you organize your thoughts, clear mental clutter, and gain clarity after a long workday.

## Features

- 🎙️ **Voice-to-Text**: Speak naturally for 2-5 minutes about what's on your mind
- 🤖 **AI Organization**: Automatically categorizes thoughts into:
  - 📋 Actions Needed
  - 🤔 Decisions Pending
  - 😰 Worries to Release
  - 🎉 Wins to Celebrate
- 💾 **Local Storage**: All sessions saved locally on your device (no cloud)
- 📱 **PWA Ready**: Install on iPhone as a native-like app
- 🎨 **Beautiful UI**: Modern, calming design optimized for mobile

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add `OPENAI_API_KEY` in Vercel environment variables
4. Deploy!

## Install on iPhone

1. Deploy to Vercel (or your hosting)
2. Open the site in Safari on your iPhone
3. Tap the Share button → "Add to Home Screen"
4. The app will appear like a native app!

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI API** - Thought categorization (using gpt-4o-mini)
- **Web Speech API** - Voice recognition
- **localStorage** - Session storage (no database needed)

## Architecture

Simplified architecture for personal use:

```
Client (Next.js)
  ↓
Voice Recording (Web Speech API)
  ↓
API Route (/api/process)
  ↓
OpenAI API (gpt-4o-mini)
  ↓
Results Display
  ↓
localStorage (sessions saved locally)
```

No database, no authentication - just you and your thoughts.

## Cost Estimate

Using `gpt-4o-mini`:
- ~$0.01-0.02 per brain dump
- ~$3-6/month for daily use

## License

Personal use only.

