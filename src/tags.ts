export function renderBadge(tagName: string): HTMLSpanElement {
  const badge = document.createElement("span");
  badge.className =
    "inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-neutral-300";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 6 6");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("h-1.5", "w-1.5");

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("r", "3");
  circle.setAttribute("cx", "3");
  circle.setAttribute("cy", "3");

  svg.appendChild(circle);

  const text = document.createTextNode(tagName);

  badge.appendChild(svg);
  badge.appendChild(text);

  // Set colors based on tag name
  const [bgClass, textClass, fillClass] = getColorsForTag(tagName);
  badge.classList.add(bgClass, textClass);
  circle.classList.add(fillClass);

  return badge;
}

function getColorsForTag(tagName: string): [string, string, string] {
  switch (tagName.toLowerCase()) {
    case "ai":
      return ["bg-blue-50", "text-blue-800", "fill-blue-600"];
    case "dev tools":
      return ["bg-green-50", "text-green-800", "fill-green-600"];
    case "board seat":
      return ["bg-slate-50", "text-slate-800", "fill-slate-600"];
    case "saas":
      return ["bg-indigo-50", "text-indigo-800", "fill-indigo-600"];
    case "aerospace":
      return ["bg-sky-50", "text-sky-800", "fill-sky-600"];
    case "energy":
      return ["bg-amber-50", "text-amber-800", "fill-amber-600"];
    case "construction":
      return ["bg-orange-50", "text-orange-800", "fill-orange-600"];
    case "cad":
      return ["bg-red-50", "text-red-800", "fill-red-600"];
    case "hardware":
      return ["bg-yellow-50", "text-yellow-800", "fill-yellow-600"];
    case "av":
      return ["bg-teal-50", "text-teal-800", "fill-teal-600"];
    case "acquired":
      return ["bg-pink-50", "text-pink-800", "fill-pink-600"];
    case "food":
      return ["bg-violet-50", "text-violet-800", "fill-violet-600"];
    case "biotech":
      return ["bg-cyan-50", "text-cyan-800", "fill-cyan-600"];
    default:
      return ["bg-gray-50", "text-gray-800", "fill-gray-600"]; // Default neutral color
  }
}
