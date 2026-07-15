export type Design = {
  slug: string;
  title: string;
  creator: string;
  handle: string;
  avatar: string;
  category: string;
  tool: string;
  tags: string[];
  coverImage: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  likes: number;
  views: number;
  postedAt: string;
  color: string;
  featured?: boolean;
  ownerId?: string;
  createdAt?: string;
};

export const categories = [
  { name: "UI/UX", icon: "✦", tone: "bg-[#ffe5f0]" },
  { name: "Branding", icon: "◈", tone: "bg-[#e5f4ff]" },
  { name: "Illustration", icon: "✎", tone: "bg-[#fff1d9]" },
  { name: "Mobile apps", icon: "▣", tone: "bg-[#e8e4ff]" },
  { name: "Web design", icon: "⌁", tone: "bg-[#dff8ef]" },
  { name: "Motion design", icon: "◒", tone: "bg-[#f0e6ff]" },
  { name: "3D design", icon: "◉", tone: "bg-[#e8f4f5]" },
  { name: "Typography", icon: "Aa", tone: "bg-[#fff0e8]" },
];

export const tools = [
  "Figma",
  "Photoshop",
  "Illustrator",
  "Spline",
  "Framer",
  "After Effects",
];

export const resources = [
  {
    type: "Community",
    title: "Read the community guidelines",
    readTime: "About Loome",
    href: "/about#guidelines",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
  },
  {
    type: "Publish",
    title: "Share your first design project",
    readTime: "Creator studio",
    href: "/items/add",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
  },
  {
    type: "Discover",
    title: "Browse work from Loome creators",
    readTime: "Explore designs",
    href: "/explore",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85",
  },
];

export const faqs = [
  {
    question: "What can I share on Loome?",
    answer:
      "Share finished projects, work-in-progress explorations, process notes, or a small visual experiment. Every post can include images, tools, tags, and a short story.",
  },
  {
    question: "Is Loome free to use?",
    answer:
      "Yes. Exploring, saving inspiration, and sharing your first projects are free. Loome is built to make thoughtful design discovery accessible.",
  },
  {
    question: "Can I edit a project after publishing?",
    answer:
      "Yes. Your Studio keeps every project you publish in one place, where you can update details or remove a project at any time.",
  },
  {
    question: "How do I report something?",
    answer:
      "Use the report action on a project or comment. Our moderation team reviews reports against the community guidelines.",
  },
];
