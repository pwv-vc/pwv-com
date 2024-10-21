import { type PortfolioItem, portfolioData } from "./portfolioData";
import { renderBadge } from "../tags";
// New function to sort portfolio items by name
function sortPortfolioItems(items: PortfolioItem[]): PortfolioItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function renderRollingFundPortfolio(): HTMLUListElement {
  const rollingFundData = sortPortfolioItems(
    portfolioData.rollingFund.portfolioItems
  );

  return renderPortfolioList(rollingFundData);
}

export function renderAngelPortfolio(): HTMLUListElement {
  const angelData = sortPortfolioItems(portfolioData.angel.portfolioItems);

  return renderPortfolioList(angelData);
}

function renderPortfolioList(data: PortfolioItem[]): HTMLUListElement {
  const ul = document.createElement("ul");
  ul.className =
    "font-mono list-disc list-inside text-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2";

  data.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.url;
    a.target = "_blank";
    a.className = "font-mono";
    a.textContent = item.name;
    li.appendChild(a);

    if (item.tags.length > 0) {
      const tagsContainer = document.createElement("span");
      tagsContainer.className = "ml-2 inline-flex gap-1";
      item.tags.forEach((tag) => {
        tagsContainer.appendChild(renderBadge(tag));
      });
      li.appendChild(tagsContainer);
    }

    ul.appendChild(li);
  });

  return ul;
}
