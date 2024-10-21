import fal from "@fal-ai/serverless-client";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { teamData } from "./teamData.js";
// Load environment variables from .env file
dotenv.config();

fal.config({
  credentials: process.env.FAL_API_KEY,
});

function generatePrompt(person) {
  return `Generate an abstract image for a web app that reflects hobbies, interests, and preferences, avoiding any human-like forms. Visualize the activities of ${person.hobbies.join(
    " and "
  )}, incorporating interests in ${person.interests.join(
    " and "
  )}. Use the color scheme: ${person.colors.join(", ")} and follow the ${
    person.style
  } design style. Emphasize minimalist, imaginative elements using abstract shapes and patterns to convey personality. STRICTLY no human figures, faces, or humanoid shapes.`;
}

async function generateImage(prompt, outputPath) {
  const response = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: prompt,
      image_size: "square",
      num_images: 1,
    },
  });

  const url = response.images[0].url;
  const imageData = await fetch(url).then((res) => res.arrayBuffer());
  const buffer = Buffer.from(imageData, "base64");
  // save the url
  fs.writeFileSync(outputPath + ".url", url);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Image saved: ${outputPath}`);
}

async function generateTeamImages() {
  for (const person of teamData) {
    const dirPath = path.join(
      "public",
      "images",
      "team",
      person.name.toLowerCase()
    );
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const existingFiles = fs.readdirSync(dirPath);
    const maxNumber = existingFiles.reduce((max, file) => {
      const match = file.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0])) : max;
    }, 0);

    const newNumber = maxNumber + 1;
    const outputPath = path.join(
      dirPath,
      `${person.name.toLowerCase()}-${newNumber}.png`
    );

    const prompt = generatePrompt(person);
    await generateImage(prompt, outputPath);
  }
}

async function main(iterations = 1) {
  console.log(
    `Starting team image generation for ${iterations} iteration(s)...`
  );
  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1} of ${iterations}`);
    await generateTeamImages();
  }
  console.log("Team image generation completed.");
}

// Get the number of iterations from command line arguments
const iterations = parseInt(process.argv[2]) || 1;
await main(iterations);
