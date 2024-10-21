export interface PortfolioItem {
  name: string;
  url: string;
  tags: string[];
}

export interface Portfolio {
  rollingFund: {
    description: string;
    portfolioItems: PortfolioItem[];
  };
  angel: {
    description: string;
    portfolioItems: PortfolioItem[];
  };
}

export const portfolioData: Portfolio = {
  rollingFund: {
    description: "Rolling Fund",
    portfolioItems: [
      { name: "Astranis", url: "https://www.astranis.com/", tags: ["hardware", "aerospace"] },
      { name: "Cursor", url: "https://www.cursor.com/", tags: ["ai", "dev tools"] },
      { name: "fal", url: "https://www.fal.ai/", tags: ["ai", "dev tools"] },
      { name: "Elicit", url: "https://elicit.com", tags: ["ai", "saas"] },
      { name: "GitPod", url: "https://www.gitpod.io/", tags: ["dev tools", "board seat"] },
      {
        name: "Aerodome",
        url: "https://www.aerodome.com",
        tags: ["hardware", "av", "acquired" ],
      },
      { name: "Liquid AI", url: "https://www.liquid.ai", tags: ["ai"] },
      { name: "Zoo", url: "https://zoo.dev", tags: ["ai", "cad"] },
      { name: "Val Town", url: "https://www.val.town/", tags: ["dev tools"] },
      {
        name: "Unkey",
        url: "https://www.unkey.com/",
        tags: ["dev tools"],
      },
      {
        name: "Langbase",
        url: "https://www.langbase.com/",
        tags: ["ai", "dev tools"],
      },
      {
        name: "Inngest",
        url: "https://www.inngest.com/",
        tags: ["dev tools"],
      },
      { name: "Aalo Atomics", url: "https://www.aalo.com", tags: ["hardware", "energy"] },
      {
        name: "Cleanlab",
        url: "https://www.cleanlab.ai/",
        tags: ["ai", "dev tools"],
      },
      { name: "Clerk", url: "https://clerk.com/", tags: ["dev tools"] },
      {
        name: "GitButler",
        url: "https://www.gitbutler.com/",
        tags: ["dev tools"],
      },
      { name: "QuantPi", url: "https://www.quantpi.com/", tags: ["ai"] },
      { name: "tldraw", url: "https://www.tldraw.com/", tags: ["dev tools"] },
      { name: "VoidZero", url: "https://voidzero.dev/", tags: ["dev tools"] },
      { name: "ReSim", url: "https://www.resim.ai/", tags: ["ai", "av"] },
      { name: "Tuist", url: "https://tuist.io/", tags: ["dev tools"] },
      {
        name: "BuildPass",
        url: "https://www.buildpass.com.au/",
        tags: ["saas", "construction"],
      },
      { name: "Poolside", url: "https://www.poolside.ai/", tags: ["ai"] },
      { name: "Turso", url: "https://turso.tech", tags: ["dev tools"] },
      { name: "Flux", url: "https://www.flux.ai/p", tags: ["hardware", "saas"] },
    ],
  },
  angel: {
    description: "Angel",
    portfolioItems: [
      { name: "Beta", url: "https://beta.team/", tags: ["hardware", "aerospace"] },
      { name: "Upside Foods", url: "https://upsidefoods.com", tags: ["biotech", "food"] },
      {
        name: "Impossible",
        url: "https://impossiblefoods.com Foods",
        tags: ["biotech", "food"],
      },
      { name: "Stripe", url: "https://stripe.com/", tags: ["dev tools"] },
      { name: "Supabase", url: "https://supabase.com/", tags: ["dev tools"] },
      { name: "Weights & Biases", url: "https://www.wandb.ai/", tags: ["ai"] },
      { name: "Snyk", url: "https://snyk.io/", tags: ["dev tools"] },
      { name: "Prisma", url: "https://www.prisma.io/", tags: ["dev tools"] },
      {
        name: "Netlify",
        url: "https://www.netlify.com/",
        tags: ["dev tools", "board seat"],
      },
      {
        name: "PATH Water",
        url: "https://drinkpathwater.com",
        tags: ["food"],
      },
      {
        name: "Graphite",
        url: "https://www.graphite.dev/",
        tags: ["dev tools"],
      },
      { name: "Retool", url: "https://retool.com/", tags: ["dev tools"] },
      { name: "Tito", url: "https://ti.to/", tags: ["saas"] },
      { name: "Zed", url: "https://zed.dev/", tags: ["dev tools"] },
      {
        name: "PlanetScale",
        url: "https://planetscale.com/",
        tags: ["dev tools"],
      },
      {
        name: "Railway",
        url: "https://railway.app/",
        tags: ["dev tools"],
      },
      {
        name: "Replicated",
        url: "https://www.replicated.com/",
        tags: ["dev tools"],
      },
    ],
  },
};
