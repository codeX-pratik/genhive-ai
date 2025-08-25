# GenHive AI 🚀

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)

GenHive AI is a **comprehensive, AI-powered content creation platform** designed for writers, designers, and marketers. It leverages artificial intelligence to help you generate high-quality content quickly and efficiently.

---

## 🔗 Table of Contents
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🌐 Demo
You can try the platform locally after running the project. If hosted, replace with your live demo link:  
[Live Demo](#)

---

## ✨ Features
- **AI Article Writer**: Generate full-length articles with adjustable length.  
- **AI Blog Title Generator**: Generate SEO-friendly blog titles using a keyword and category.  
- **AI Image Generator**: Create stunning images from text prompts in multiple styles (Realistic, Ghibli, Anime, etc.).  
- **AI Background Remover**: Remove image backgrounds instantly.  
- **AI Object Remover**: Remove unwanted objects seamlessly from images.  
- **AI Resume Reviewer**: Upload your resume and receive instant feedback.  
- **Community Creations**: Browse creations from other users, like them, and see the prompts used.  
- **User Authentication**: Secure account management with Clerk.  
- **Dashboard**: Overview of all user activity and AI outputs.  
- **Dark Mode**: Comfortable light/dark mode switch.

---

## 🛠 Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS  
- **UI Components**: ShadCN UI, Radix UI  
- **Authentication**: Clerk  
- **Icons**: Lucide React  
- **State Management**: React Hooks  

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x  
- npm >= 9.x  

### Installation
Clone the repository:
git clone https://github.com/codeX-pratik/genhive-ai.git
cd genhive-ai

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
/src
├── /app
│   ├── /ai                 # Main application pages for AI tools
│   │   ├── /blogtitles
│   │   ├── /community
│   │   ├── /dashboard
│   │   ├── /generateimage
│   │   ├── /removebackground
│   │   ├── /removeobject
│   │   ├── /reviewresume
│   │   └── /writearticle
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── /components
│   ├── /Landingpage        # Components for the landing page
│   ├── /ui                 # Reusable UI components (from shadcn/ui)
│   └── CreationItem.tsx    # Component for displaying a single creation
├── /lib
│   ├── asset.ts            # Asset definitions and dummy data
│   └── utils.ts            # Utility functions
/public                     # Static assets (images, icons, etc.)
```
