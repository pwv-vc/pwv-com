import {
  renderRollingFundPortfolio,
  renderAngelPortfolio,
} from "./portfolio/renderPortfolio";
import { renderTestimonials } from "./testimonials/renderTestimonials";

// Render the list when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(
    "#portfolio-rolling-fund-list-container"
  );
  if (container) {
    container.appendChild(renderRollingFundPortfolio());
  }
  const angelContainer = document.querySelector(
    "#portfolio-angel-list-container"
  );
  if (angelContainer) {
    angelContainer.appendChild(renderAngelPortfolio());
  }

  // Add testimonials
  const testimonialContainer = document.querySelector(
    "#testimonial-list-container"
  );

  if (testimonialContainer) {
    testimonialContainer.appendChild(renderTestimonials());
  } else {
    console.error("Testimonial container not found");
  }

  // Rename this function
  // cycleTeamAvatars();

  // Initial load of team images
  // loadAllTeamImages(5);
});

async function loadRandomTeamImage(name: string, maxNumber: number) {
  const randomNumber = Math.floor(Math.random() * maxNumber) + 1;

  try {
    const file = `/images/team/${name}/${name}-${randomNumber}.png`;
    const imgUrl = new URL(file, import.meta.url).href;

    const img = document.getElementById(`${name}-image`) as HTMLImageElement;
    if (img) {
      img.src = imgUrl;
      img.alt = `${name} team member`;
    } else {
      console.error(`Image element for ${name} not found`);
    }
  } catch (error) {
    console.error(`Failed to load image for ${name}:`, error);
  }
}

export async function loadAllTeamImages(maxNumber: number) {
  await loadRandomTeamImage("tom", maxNumber);
  await loadRandomTeamImage("dp", maxNumber);
  await loadRandomTeamImage("dt", maxNumber);
}

// Rename this function
// function cycleTeamAvatars() {
//   const cycleButton = document.getElementById("cycle-team-avatars");
//   if (cycleButton) {
//     cycleButton.addEventListener("click", () => {
//       loadAllTeamImages(5);
//     });
//   } else {
//     console.error("Cycle team avatars button not found");
//   }
// }
