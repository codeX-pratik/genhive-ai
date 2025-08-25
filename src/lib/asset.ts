import {
  Eraser,
  Hash,
  Image as ImageIcon,
  SquarePen,
  Scissors,
  FileText,
  Users,
} from "lucide-react";

import { StaticImageData } from "next/image";


// Tools data
export const tools = [
  {
    title: "AI Article Writer",
    description:
      "Generate high-quality articles in minutes with our AI-powered article writer.",
    Icon: SquarePen,
    path: "/ai/writearticle",
    bgColor: "bg-gradient-to-r from-blue-500 to-purple-500",
  },
  {
    title: "Blog Title Generator",
    description:
      "Get creative blog title ideas with our AI-powered blog title generator.",
    Icon: Hash,
    path: "/ai/blogtitles",
    bgColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
  {
    title: "AI Image Generator",
    description:
      "Create stunning images from text prompts using our AI image generator.",
    Icon: ImageIcon,
    path: "/ai/generateimage",
    bgColor: "bg-gradient-to-r from-green-400 to-cyan-500",
  },
  {
    title: "Background Removal",
    description:
      "Effortlessly remove backgrounds from your images with our AI-driven tool.",
    Icon: Eraser,
    path: "/ai/removebackground",
    bgColor: "bg-gradient-to-r from-pink-500 to-rose-500",
  },
  {
    title: "Object Removal",
    description:
      "Remove unwanted objects from your images seamlessly with our AI object removal tool.",
    Icon: Scissors,
    path: "/ai/removeobject",
    bgColor: "bg-gradient-to-r from-indigo-500 to-violet-500",
  },
  {
    title: "Resume Reviewer",
    description:
      "Get your resume reviewed by AI to improve your chances of landing your dream job.",
    Icon: FileText,
    path: "/ai/reviewresume",
    bgColor: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
  },
  {
    title: "Community",
    description:
      "Connect with other creators and share your AI-generated content.",
    Icon: Users,
    path: "/ai/community",
    bgColor: "bg-gradient-to-r from-teal-500 to-blue-500",
  },
];

// Testimonials data
export type TestimonialItem = {
  image: string;
  name: string;
  title: string;
  content: string;
  rating: number;
};

export const dummyTestimonialData: TestimonialItem[] = [
  {
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    name: "John Doe",
    title: "Marketing Director, TechCorp",
    content:
      "ContentAI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours of work every week.",
    rating: 4,
  },
  {
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    name: "Jane Smith",
    title: "Content Creator, TechCorp",
    content:
      "ContentAI has made our content creation process effortless. The AI tools have helped us produce high-quality content faster than ever before.",
    rating: 5,
  },
  {
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
    name: "David Lee",
    title: "Content Writer, TechCorp",
    content:
      "ContentAI has transformed our content creation process. The AI tools have helped us produce high-quality content faster than ever before.",
    rating: 4,
  },
];

// Creation data
export type Creation = {
  id: number;
  user_id: string;
  prompt: string;
  content: string;
  type: "blog-title" | "article" | "image";
  publish: boolean;
  likes: string[];
  created_at: string;
  updated_at: string;
};

export const dummyCreationData: Creation[] = [
  {
    id: 9,
    user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
    prompt: "Generate a blog title for the keyword blog in the category Technology.",
    content: "Here are a few blog title options for a technology blog, playing with different angles:\n\n**General & Broad:**\n\n*   The Tech Blog: News, Reviews, and Insights\n*   Technology Today: Your Daily Dose of Tech\n*   The Future is Now: Exploring the World of Technology\n*   Tech Talk: Unpacking the Latest Innovations\n\n**More Specific & Intriguing:**\n\n*   Decoding Tech: Making Sense of the Digital World\n*   Beyond the Gadgets: The",
    type: "blog-title",
    publish: false,
    likes: [],
    created_at: "2025-07-01T11:09:50.492Z",
    updated_at: "2025-07-01T11:09:50.492Z",
  },
  {
    id: 8,
    user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
    prompt: "Generate a blog title for the keyword blog in the category General.",
    content: "Here are a few blog title options for a blog about blogs in the General category, ranging from straightforward to a bit more creative:\n\n**Straightforward:**\n\n*   The Blog Blog: Everything You Need to Know About Blogging\n*   Blogging Insights: Tips, Tricks, and Trends\n*   Your Guide to the World of Blogging\n\n**More Creative:**\n\n*   Beyond the Post: Exploring the Art of Blogging\n*   Blogosphere Unlocked: Navigating the World of Online Writing",
    type: "blog-title",
    publish: false,
    likes: [],
    created_at: "2025-07-01T11:08:10.450Z",
    updated_at: "2025-07-01T11:08:10.450Z",
  },
  {
    id: 7,
    user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
    prompt: "Write an article about AI With Coding in Short (500-800 word).",
    content: "## AI and Coding: A Symbiotic Partnership Reshaping the Future\n\nArtificial intelligence (AI) and coding, once distinct disciplines, are now deeply intertwined, forging a powerful symbiotic relationship that's revolutionizing industries and accelerating innovation. Understanding this connection is crucial for anyone seeking to navigate the future of technology.\n\nAt its core, AI is the ability of a machine to mimic intelligent human behavior. This is achieved through algorithms, which are essentially sets of instructions meticulously crafted by programmers – coders. Coding, therefore, is the backbone of AI, providing the language and structure necessary to bring these algorithms to life.\n\n**Coding Fuels AI: Building the Foundation**\n\nAI models don't magically appear. They are built, trained, and deployed using code. Here's how:\n\n*   **Data Preprocessing:** Raw data, the lifeblood of AI, is often messy and unusable in its original form. Coders use programming languages like Python with libraries like Pandas and NumPy to clean, transform, and prepare this data for training. This involves handling missing values, removing inconsistencies, and formatting data into a suitable structure.\n*   **Model Development:** Coders utilize programming languages like Python and R, coupled with machine learning libraries like TensorFlow, PyTorch, and scikit-learn, to build and train AI models. These libraries provide pre-built functionalities and tools that simplify the process of creating complex algorithms.\n*   **Deployment and Integration:** Once trained, AI models need to be deployed and integrated into real-world applications. This involves writing code to connect the model to existing systems, handle user input, and present the results in a user-friendly manner.\n*   **Maintenance and Optimization:** AI models are not static entities. They require constant monitoring, maintenance, and optimization to ensure they remain accurate and effective. Coders play a vital role in identifying and addressing performance issues, retraining models with new data, and adapting them to changing requirements.\n\n**AI Empowers Coding: Revolutionizing Development**\n\nThe relationship isn't just one-way. AI is also transforming the way coding is done, making developers more efficient and productive.\n\n*   **Code Completion and Suggestion:** AI-powered tools like GitHub Copilot and Tabnine analyze code context and suggest code snippets, reducing repetitive tasks and accelerating development. These tools learn from vast code repositories and can predict what a developer is likely to write next, saving significant time and effort.\n*   **Automated Testing and Debugging:** AI can automate the process of testing code and identifying bugs. By analyzing code patterns and identifying potential vulnerabilities, AI tools can help developers catch errors early and improve code quality.\n*   **Code Generation:** AI is increasingly capable of generating code from natural language descriptions. This allows developers to focus on the higher-level aspects of software design and leave the more tedious coding tasks to AI.\n*   **Personalized Learning:** AI can personalize the learning experience for aspiring coders by tailoring educational content and providing individualized feedback. This can make learning to code more effective and engaging.\n\n**The Future: Collaboration and Specialization**\n\nThe future of AI and coding is one of increasing collaboration and specialization. As AI becomes more sophisticated, coders will need to focus on higher-level tasks such as designing AI architectures, managing data pipelines, and ensuring ethical considerations are addressed.\n\nThe demand for skilled professionals who understand both AI and coding is rapidly growing. Individuals with this skillset are well-positioned to lead the charge in developing innovative AI-powered solutions across a wide range of industries.\n\n**In conclusion,** AI and coding are not separate entities but rather two sides of the same coin. Coding provides the foundation for AI, while AI empowers coding, leading to a more efficient and innovative development process. Understanding this symbiotic relationship is essential for anyone seeking to thrive in the rapidly evolving landscape of technology. As AI continues to advance, the demand for skilled professionals who can bridge",
    type: "article",
    publish: false,
    likes: [],
    created_at: "2025-07-01T11:07:51.312Z",
    updated_at: "2025-07-01T11:07:51.312Z",
  },
];

// Sidebar links
export const sidebarlinks = [
  { name: "Dashboard", href: "/ai", Icon: Users }, // Using Users as placeholder, replace with appropriate icon
  { name: "Write Article", href: "/ai/writearticle", Icon: SquarePen },
  { name: "Blog Title", href: "/ai/blogtitles", Icon: Hash },
  { name: "Generate Images", href: "/ai/generateimage", Icon: ImageIcon },
  { name: "Remove Background", href: "/ai/removebackground", Icon: Eraser },
  { name: "Remove Object", href: "/ai/removeobject", Icon: Scissors },
  { name: "Review Resume", href: "/ai/reviewresume", Icon: FileText },
  { name: "Community", href: "/ai/community", Icon: Users },
];


export type PublishedCreation = Creation & {
  publish: true;
  content: string | StaticImageData;
};

// ✅ Published Creations
export const dummyPublishedCreationData: PublishedCreation[] = [
  {
    id: 1,
    user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
    prompt: "Generate an image of a boy fishing on a boat in anime style.",
    content: "/images/ai_gen_img_1.png",
    type: "image",
    publish: true,
    likes: [],
    created_at: "2025-06-19T09:02:25.035Z",
    updated_at: "2025-06-19T09:58:37.552Z",
  },
  {
    id: 2,
    user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
    prompt: "Generate an image of a boy riding a bicycle.",
    content: "/images/ai_gen_img_2.png",
    type: "image",
    publish: true,
    likes: [],
    created_at: "2025-06-19T08:16:54.614Z",
    updated_at: "2025-06-19T09:58:40.072Z",
  },
  {
    id: 3,
    user_id: "user_2yaW5EHzeDfQbXdAJWYFnZo2bje",
    prompt: "Generate an image of a boy riding a car in the sky.",
    content: "/images/ai_gen_img_3.png",
    type: "image",
    publish: true,
    likes: [],
    created_at: "2025-06-23T11:29:23.351Z",
    updated_at: "2025-06-23T11:29:44.434Z",
  },
];
