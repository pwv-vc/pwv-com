import { testimonials } from "./testimonialData";

// using TailwindUI Testimonial Component Off-white grid
// https://tailwindui.com/components/marketing/sections/testimonials#component-aaf6f3d1eb2b456bed6e0fa9f48f42f1
export function renderTestimonials(): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "mx-auto flow-root max-w-2xl lg:mx-0 lg:max-w-none";
  const container2 = document.createElement("div");
  container2.className = "-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3";

  container.appendChild(container2);

  testimonials.testimonials.forEach((item) => {
    const card = document.createElement("div");
    card.className =
      "pt-8 sm:inline-block sm:w-full sm:px-4";         

    const figure = document.createElement("figure");
    figure.className =
      "rounded-2xl bg-gray-50 p-8 text-sm leading-6";

    const quote = document.createElement("blockquote");
    quote.className = "text-gray-900";
    quote.textContent = `"${item.quote}"`;

    const figcaption = document.createElement("figcaption");
    figcaption.className = "mt-6 flex items-center gap-x-4";    

    const authorInfo = document.createElement("div");
    authorInfo.className = "flex items-center";


    const nameAndTitle = document.createElement("div");

    const name = document.createElement("div");
    name.className = "font-semibold text-gray-900";
    name.textContent = item.name;

    const titleAndCompany = document.createElement("div");
    titleAndCompany.className = "text-gray-600";
    titleAndCompany.innerHTML = `${item.title}, <a href="${item.url}" target="_blank" class="text-neutral-600 underline hover:underline">${item.company}</a>`;

    card.appendChild(figure);

    figure.appendChild(quote);
    figure.appendChild(figcaption);

    figcaption.appendChild(nameAndTitle);

    nameAndTitle.appendChild(name);
    nameAndTitle.appendChild(titleAndCompany)

    container2.appendChild(card);
  });

  return container;
}

// Remove the renderBadge function as it's no longer needed
