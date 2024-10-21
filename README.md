# PWV

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
