# PWV

[PWV](https://pwv.com) invests in early-stage technology companies.

PWV is a team of three entrepreneurs and technologists: Tom Preston-Werner (GitHub cofounder), David S. Price, and A. David Thyresson.

Beyond capital, we leverage our unparalleled network and expertise to provide ongoing support, helping startups achieve product-market fit faster and scale effectively with the right growth partners.

## Our Values

We are committed to a vision of a future where technological progress and human flourishing go hand in hand. And we invest to help make this future possible.

> Made with ❤️ using Cursor, fal, Vite, Netlify, and GitHub

## Development

Uses [pnpm](https://pnpm.io/), [Vite](https://vitejs.dev/),
[Netlify](https://www.netlify.com/) for hosting,
[Typescript](https://www.typescriptlang.org/),
[TailwindCSS](https://tailwindcss.com/), and
[Plausible](https://plausible.io/) for analytics.

Deployed on [Netlify](https://www.netlify.com/).

### Install

- Install `pnpm`
- `pnpm install`

### Build

- `pnpm build`

### Run

- `pnpm dev`

### Generate Team Images

- `pnpm images`

## AI

- `pnpm images`

Note: You need to have a `.env` file with `FAL_API_KEY` set to your fal.ai API key.

Image generated prompt:

```js
function generatePrompt(person) {
  return `Generate an abstract image for a web app that reflects hobbies, interests, and preferences, avoiding any human-like forms. Visualize the activities of ${person.hobbies.join(
    " and "
  )}, incorporating interests in ${person.interests.join(
    " and "
  )}. Use the color scheme: ${person.colors.join(", ")} and follow the ${
    person.style
  } design style. Emphasize minimalist, imaginative elements using abstract shapes and patterns to convey personality. STRICTLY no human figures, faces, or humanoid shapes.`;
}
```
