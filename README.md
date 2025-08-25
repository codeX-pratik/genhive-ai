# GenHive AI

GenHive AI is a powerful, all-in-one content creation platform that leverages artificial intelligence to streamline your workflow. Whether you're a writer, designer, or marketer, GenHive AI provides the tools you need to generate high-quality content with ease.

## Features

- **AI Article Writer**: Generate full-length articles on any topic.
- **AI Blog Title Generator**: Create catchy and SEO-friendly blog titles.
- **AI Image Generator**: Produce stunning images from text descriptions.
- **AI Background Remover**: Instantly remove backgrounds from your images.
- **AI Object Remover**: Seamlessly erase unwanted objects from your photos.
- **AI Resume Reviewer**: Get instant feedback and suggestions to improve your resume.
- **Community Section**: Connect with other creators, share your work, and get inspired.
- **User Authentication**: Securely manage your account and content.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building server-side rendered and static web applications.
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript that compiles to plain JavaScript.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- [Clerk](https://clerk.com/) - User authentication and management.
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for building high-quality design systems.
- [Lucide React](https://lucide.dev/) - A simply beautiful and consistent icon toolkit.

## Project File Structure

```
d:\GitHub\Projects\genhive-ai\
├───.gitignore
├───components.json
├───eslint.config.mjs
├───middleware.ts
├───next.config.ts
├───package-lock.json
├───package.json
├───postcss.config.mjs
├───README.md
├───tailwind.config.ts
├───tsconfig.json
├───.git\
├───.next\
├───node_modules\
├───public\
│   ├───favicon.ico
│   ├───file.svg
│   ├───globe.svg
│   ├───gradientBackground.png
│   ├───logo.svg
│   ├───next.svg
│   ├───user_group.png
│   ├───vercel.svg
│   └───window.svg
└───src\
    ├───app\
    │   ├───globals.css
    │   ├───layout.tsx
    │   ├───page.tsx
    │   └───ai\
    │       ├───layout.tsx
    │       ├───page.tsx
    │       ├───blogtitles\
    │       │   └───page.tsx
    │       ├───community\
    │       │   └───page.tsx
    │       ├───dashboard\
    │       │   └───page.tsx
    │       ├───generateimage\
    │       │   └───page.tsx
    │       ├───removebackground\
    │       │   └───page.tsx
    │       ├───removeobject\
    │       │   └───page.tsx
    │       ├───reviewresume\
    │       │   └───page.tsx
    │       └───writearticle\
    │           └───page.tsx
    ├───assets\
    │   ├───ai_gen_img_1.png
    │   ├───ai_gen_img_2.png
    │   ├───ai_gen_img_3.png
    │   ├───arrow_icon.svg
    │   ├───assets.js
    │   ├───assets.ts
    │   ├───favicon.svg
    │   ├───gradientBackground.png
    │   ├───logo.svg
    │   ├───profile_img_1.png
    │   ├───star_dull_icon.svg
    │   ├───star_icon.svg
    │   └───user_group.png
    ├───components\
    │   ├───CreationItem.tsx
    │   ├───Landingpage\
    │   │   ├───AITools.tsx
    │   │   ├───Footer.tsx
    │   │   ├───Hero.tsx
    │   │   ├───Logo.tsx
    │   │   ├───Navbar.tsx
    │   │   ├───plan.tsx
    │   │   ├───Sidebar.tsx
    │   │   ├───Testimonial.tsx
    │   │   └───ThemeToggle.tsx
    │   └───ui\
    │       ├───button.tsx
    │       ├───input.tsx
    │       └───sheet.tsx
    └───lib\
        ├───asset.ts
        └───utils.ts
```