import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export interface Resume {
  content: string;
  html: string;
}

const resumePath = path.join(process.cwd(), "content/about/resume.md");

export async function getResume(): Promise<Resume | null> {
  try {
    const fileContents = await fs.readFile(resumePath, "utf8");
    const { content } = matter(fileContents);
    const html = await marked(content);

    return {
      content,
      html,
    };
  } catch (error) {
    console.error("Error reading resume:", error);
    return null;
  }
}
