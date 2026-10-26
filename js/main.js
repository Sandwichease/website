/* ==========================================================
   Sandwichease — personal site
   1. Age (updates every January)
   2. Registry
   3. Catalogue (live from GitHub, with an offline snapshot)
   ========================================================== */

const GITHUB_USER = "Sandwichease";
const BIRTH_YEAR = 2009;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/* ---------- 1. Age ---------- */
// Changes on 1 January of each year.
$("age").textContent = new Date().getFullYear() - BIRTH_YEAR;

/* ---------- 2. Registry ---------- */
// Add new entries at the top: [date (YYYY-MM-DD), badge or "", text]
const REGISTRY = [
  ["2026-10-26", "NEW", "Updates the Website :D!"],
  ["2026-09-29", "NEW", "Portfolio is open!"],
];

const daysAgo = (iso) => Math.round((Date.now() - new Date(iso)) / 864e5);

$("registry").innerHTML = REGISTRY.map(([date, badge, text]) => `
  <li>
    <time>[${formatDate(date)}]</time>
    <a href="#">${badge ? `<span class="tag-new">!!! ${badge} !!!</span> ` : ""}${text}</a>
    <em>${daysAgo(date)} days ago</em>
  </li>`).join("");

/* ---------- 3. Catalogue ---------- */
// Used if GitHub can't be reached (offline, rate limit, or preview sandboxes).
const SNAPSHOT = [
  {
    name: "Memory-Kludge",
    description: "Tiny C++ tool for Linux that attaches to a running process (PID), lists readable memory regions, reads/writes int values, and scans for a specific integer.",
    date: null,
    url: "https://github.com/Sandwichease/Memory-Kludge",
  },
  {
    name: "SmileC",
    description: "Small C compiler and editor.",
    date: null,
    url: "https://github.com/Sandwichease/SmileC",
  },
];

const MIN_TILES = 12;
const MAX_TILES = 24;

async function loadProjects() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(res.status);
    const repos = await res.json();
    const projects = repos
      .filter((r) => !r.fork && r.name.toLowerCase() !== GITHUB_USER.toLowerCase())
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .map((r) => ({
        name: r.name,
        description: r.description || "No description yet.",
        date: r.pushed_at,
        url: r.html_url,
      }));
    return projects.length ? projects : SNAPSHOT;
  } catch {
    return SNAPSHOT;
  }
}

function renderCatalogue(projects) {
  const tiles = $("tiles");
  let current = -1;

  const select = (i) => {
    current = i;
    const p = projects[i];
    $("screen-name").textContent = p.name;
    $("screen-description").textContent = p.description;
    $("screen-date").textContent = p.date ? formatDate(p.date) : "";
    $("screen").href = p.url;
    [...tiles.children].forEach((t, k) => t.classList.toggle("is-active", k === i));
  };

  projects.slice(0, MAX_TILES).forEach((p, i) => {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = p.url;
    tile.target = "_blank";
    tile.rel = "noopener";
    tile.innerHTML = "<span></span>";
    tile.firstChild.textContent = p.name;
    tile.addEventListener("pointerenter", () => select(i));
    tile.addEventListener("focus", () => select(i));
    // On touch screens the first tap previews, the second opens.
    tile.addEventListener("click", (e) => {
      if (current !== i) { e.preventDefault(); select(i); }
    });
    tiles.appendChild(tile);
  });

  for (let k = projects.length; k < MIN_TILES; k++) {
    const empty = document.createElement("span");
    empty.className = "tile is-empty";
    empty.textContent = "···";
    tiles.appendChild(empty);
  }

  select(0);
}

loadProjects().then(renderCatalogue);
