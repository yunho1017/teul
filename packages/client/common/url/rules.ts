type URLParams = Record<string, string | number>;

export class URLPattern {
  protected pattern: string;

  constructor(pattern: string) {
    this.pattern = pattern;
  }

  toString(params?: URLParams): string {
    if (!params) return this.pattern;

    let url = this.pattern;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
    return url;
  }

  toPattern(): string {
    return this.pattern;
  }
}

export const Home = new URLPattern("/");

export const About = new URLPattern("/about");

export const Posts = new URLPattern("/posts");
