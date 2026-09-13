"use strict";

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));
const seconds = (value) => Number(value).toFixed(2).replace(/\.?0+$/, "") || "0";
const intervals = (values) => values.map(([start, end]) => `${seconds(start)}–${seconds(end)} s`).join("; ");
const datasetNames = {audio_grounding: "Audio Grounding", desed: "DESED", clotho_moment: "Clotho-Moment"};

function intervalTags(values) {
  return `<ul class="interval-tags">${values.map(([start, end]) => `<li><button type="button" class="time-tag" data-start="${start}" data-end="${end}" aria-label="Play interval ${seconds(start)} to ${seconds(end)} seconds">${seconds(start)}–${seconds(end)} s</button></li>`).join("")}</ul>`;
}

function playhead(x, height) {
  return `<line class="playhead" x1="${x}" x2="${x}" y1="0" y2="${height}" vector-effect="non-scaling-stroke"/>`;
}

function cardToggle(id, index, expanded) {
  return `<div class="sample-header"><span>Example: ${index + 1}</span><button type="button" class="card-toggle" aria-expanded="${expanded}" aria-controls="${id}">${expanded ? "Hide details" : "Show details"}<span aria-hidden="true">${expanded ? "−" : "+"}</span></button></div>`;
}

function icon(name) {
  const paths = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    timeline: '<path d="M4 5v14h16M8 9h5m-2 5h7"/><circle cx="8" cy="9" r="1"/><circle cx="18" cy="14" r="1"/>',
    explanation: '<path d="M20 15a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z"/><path d="M8 8h8m-8 5h5"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

function highlightTimes(text) {
  return escapeHTML(text).replace(/\b\d+(?:\.\d+)?(?:\s*(?:seconds?|s))?\s*(?:to|[–—-])\s*\d+(?:\.\d+)?\s*(?:seconds?|s)\b|\b\d+(?:\.\d+)?\s*(?:seconds?|s)\b|\[\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?\]/g,
    value => `<span class="time-value">${value}</span>`);
}

function waveform(item) {
  const bars = item.waveform.map((value, index) => {
    const height = Math.max(1, value * 38);
    return `<line x1="${index * 3 + 1}" x2="${index * 3 + 1}" y1="${22 - height / 2}" y2="${22 + height / 2}"/>`;
  }).join("");
  return `<svg class="waveform seek-surface" data-inset="0" viewBox="0 0 540 44" preserveAspectRatio="none" role="img" aria-label="Audio waveform"><g stroke="#83a99b" stroke-width="1.5">${bars}</g>${playhead(0, 44)}</svg>`;
}

function player(item) {
  return `<div class="audio-row"><audio controls preload="metadata" aria-label="Play audio ${escapeHTML(item.key || item.id)}"><source src="${escapeHTML(item.audio)}" type="audio/wav">Your browser does not support audio playback.</audio>${waveform(item)}<span class="duration">${seconds(item.duration)} s</span></div>`;
}

function timeline(duration, prediction, target) {
  const width = Math.min(920, Math.max(230, window.innerWidth - 132));
  const height = target ? 96 : 72;
  const x = (time) => 10 + Math.min(duration, Math.max(0, time)) / duration * (width - 20);
  const rects = (values, y, fill, stroke, label) => values.map(([a, b]) =>
    `<rect data-start="${a}" data-end="${b}" role="button" tabindex="0" aria-label="Play ${label} interval ${seconds(a)} to ${seconds(b)} seconds" x="${x(a)}" y="${y}" width="${Math.max(.5, x(b) - x(a))}" height="16" rx="3" fill="${fill}" stroke="${stroke}" stroke-width=".8"/>`
  ).join("");
  const tickCount = width < 420 ? 4 : 6;
  const ticks = Array.from({length: tickCount}, (_, index) => {
    const time = duration * index / (tickCount - 1);
    return `<line x1="${x(time)}" x2="${x(time)}" y1="6" y2="${height - 28}" stroke="#e7ece8"/><text x="${x(time)}" y="${height - 7}" text-anchor="${index === 0 ? "start" : index === tickCount - 1 ? "end" : "middle"}">${seconds(time)}</text>`;
  }).join("");
  const description = target ? `Ground truth: ${intervals(target)}. Prediction: ${intervals(prediction)}.` : `Grounding model intervals: ${intervals(prediction)}.`;
  return `<svg class="timeline seek-surface${target ? "" : " single-timeline"}" data-inset="10" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="group" aria-label="${escapeHTML(description)} Click an interval to listen to that segment."><g font-family="sans-serif" font-size="15" fill="#526764">${ticks}${target ? rects(target, 12, "#e4e9e6", "#7d908a", "ground truth") : ""}${rects(prediction, target ? 44 : 20, "var(--teal)", "var(--teal)", target ? "prediction" : "grounding model")}</g>${playhead(10, height - 26)}</svg>`;
}

function groundingCard(item, index) {
  const hasMultipleQueries = item.queries.length > 1;
  const panelIds = item.queries.map((_, i) => `query-${item.key}-${i}`);
  const queryOptions = hasMultipleQueries
    ? `<div class="grounding-query-options" role="group" aria-label="Grounding queries">${item.queries.map((query, i) => `<button type="button" class="grounding-query-option" aria-pressed="${i === 0}" aria-controls="${panelIds[i]}">${escapeHTML(query.query)}</button>`).join("")}</div>`
    : "";
  return `<article class="sample" id="example-${escapeHTML(item.key)}" data-duration="${item.duration}">
    <div class="sample-header"><span>Example: ${index + 1}</span></div>
    ${player(item)}
    ${queryOptions}
    ${item.queries.map((query, i) => `<div class="query-block grounding-query-panel" id="${panelIds[i]}" ${hasMultipleQueries && i > 0 ? "hidden" : ""}><div class="query-title"><span>${escapeHTML(query.query)}</span></div>
      ${timeline(item.duration, query.prediction, query.target)}
      <div class="interval-row reference-intervals" role="group" aria-label="Ground-truth intervals"><span class="interval-label">GT</span>${intervalTags(query.target)}</div>
      <div class="interval-row predicted-intervals" role="group" aria-label="Predicted intervals"><span class="interval-label">Pred.</span>${intervalTags(query.prediction)}</div>
      </div>`).join("")}
  </article>`;
}

function reasoningCard(item, index) {
  const expanded = index === 0;
  const detailId = `details-${item.id}`;
  return `<article class="sample reasoning-sample" data-duration="${item.duration}">
    ${cardToggle(`${detailId}-flow`, index, expanded)}
    <p class="category">${escapeHTML(item.category)}</p>
    <h3 class="question">${escapeHTML(item.question)}</h3>
    <div class="choices">${item.choices.map((choice, i) => `<span><b>${String.fromCharCode(65 + i)}.</b>${escapeHTML(choice)}</span>`).join("")}</div>
    ${player(item)}
    <ol class="reasoning-flow card-details" id="${detailId}-flow" ${expanded ? "" : "hidden"} aria-label="Grounding model-assisted reasoning sequence">
    ${item.calls.map((call, index) => `<li class="flow-step">
      <span class="step-marker">${icon("search")}</span>
      <div class="step-content query-step"><h4>LALM → Grounding model${item.calls.length > 1 ? ` · Call ${index + 1}` : ""}</h4>
        <div class="query-tags" aria-label="Queried events">${call.queries.map(query => `<span class="query-tag">${icon("search")}<span>${escapeHTML(query)}</span></span>`).join("")}</div>
        <p>${escapeHTML(call.reason)}</p>
      </div>
    </li><li class="flow-step">
      <span class="step-marker">${icon("timeline")}</span>
      <div class="step-content result-step"><h4>Grounding model → LALM</h4>
        ${call.events.map((event) => `<div class="event-block">
          <div class="event-name"><span class="event-dot" aria-hidden="true"></span><span class="event-query">${escapeHTML(event.query)}</span></div>
          ${timeline(item.duration, event.intervals)}
          ${intervalTags(event.intervals)}
        </div>`).join("")}
      </div>
    </li>`).join("")}
    <li class="flow-step"><span class="step-marker explanation-marker">${icon("explanation")}</span><div class="step-content explanation-step"><p>${highlightTimes(item.answer.explanation)}</p></div></li>
    </ol>
    <div class="answers"><div class="answer"><h4>Direct answer</h4><p>${escapeHTML(item.direct.replace(/^Answer:\s*/, ""))}</p></div><div class="answer grounded"><h4>With grounding</h4><p>${escapeHTML(item.answer.choice)}. ${escapeHTML(item.answer.answer)}</p></div></div>
  </article>`;
}

for (const dataset of ["audio_grounding", "desed", "TACOS", "UnAV-100", "clotho_moment"]) {
  const items = window.PAPER_DEMO.grounding
    .filter(item => item.dataset === dataset)
    .sort((a, b) => b.queries.length - a.queries.length);
  document.getElementById("grounding-examples").insertAdjacentHTML("beforeend",
    `<div class="dataset-group"><h3>${escapeHTML(datasetNames[dataset] || dataset)}</h3>${items.map(groundingCard).join("")}</div>`);
}
document.getElementById("reasoning-examples").innerHTML = window.PAPER_DEMO.reasoning.map(reasoningCard).join("");

document.querySelectorAll(".sample").forEach(setupCard);

const backToTop = document.querySelector(".back-to-top");
const updateBackToTop = () => { backToTop.hidden = window.scrollY < 600; };
backToTop.addEventListener("click", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({top: 0, behavior: reducedMotion ? "auto" : "smooth"});
});
window.addEventListener("scroll", updateBackToTop, {passive: true});
updateBackToTop();

function setupCard(card) {
  const audio = card.querySelector("audio");
  const duration = Number(card.dataset.duration);
  const surfaces = [...card.querySelectorAll(".seek-surface")];
  const toggle = card.querySelector(".card-toggle");
  let segmentEnd = null;
  let internalSeek = null;
  let animation = 0;

  if (toggle) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.innerHTML = `${expanded ? "Hide details" : "Show details"}<span aria-hidden="true">${expanded ? "−" : "+"}</span>`;
      card.querySelectorAll(".card-details").forEach(detail => { detail.hidden = !expanded; });
      update();
    });
  }

  const queryOptions = [...card.querySelectorAll(".grounding-query-option")];
  queryOptions.forEach(option => {
    option.addEventListener("click", () => {
      const panelId = option.getAttribute("aria-controls");
      queryOptions.forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === option)));
      card.querySelectorAll(".grounding-query-panel").forEach(panel => { panel.hidden = panel.id !== panelId; });
      update();
    });
  });

  function seek(time) {
    const limit = Number.isFinite(audio.duration) ? Math.min(duration, audio.duration) : duration;
    internalSeek = Math.max(0, Math.min(limit, time));
    audio.currentTime = internalSeek;
    update();
  }

  function update() {
    const fraction = Math.max(0, Math.min(1, audio.currentTime / duration));
    surfaces.forEach(surface => {
      const inset = Number(surface.dataset.inset);
      const x = inset + fraction * (surface.viewBox.baseVal.width - 2 * inset);
      const cursor = surface.querySelector(".playhead");
      cursor.setAttribute("x1", x);
      cursor.setAttribute("x2", x);
    });
  }

  function checkEnd() {
    if (segmentEnd !== null && audio.currentTime >= segmentEnd) {
      const end = segmentEnd;
      segmentEnd = null;
      audio.pause();
      seek(end);
    }
    update();
  }

  function tick() {
    checkEnd();
    if (!audio.paused) animation = requestAnimationFrame(tick);
  }

  function playAt(start, end = null) {
    segmentEnd = end;
    seek(start);
    audio.play().catch(() => { segmentEnd = null; });
  }

  audio.addEventListener("play", () => {
    document.querySelectorAll("audio").forEach(other => { if (other !== audio) other.pause(); });
    cancelAnimationFrame(animation);
    animation = requestAnimationFrame(tick);
  });
  audio.addEventListener("pause", () => { cancelAnimationFrame(animation); update(); });
  audio.addEventListener("timeupdate", checkEnd);
  audio.addEventListener("loadedmetadata", update);
  audio.addEventListener("ended", () => { segmentEnd = null; update(); });
  audio.addEventListener("seeking", () => {
    if (internalSeek === null || Math.abs(audio.currentTime - internalSeek) > 0.05) segmentEnd = null;
    internalSeek = null;
    update();
  });
  // Native control interactions cancel a previous interval preview.
  for (const event of ["pointerdown", "keydown"]) audio.addEventListener(event, () => { segmentEnd = null; });

  card.querySelectorAll("[data-start]").forEach(interval => {
    const activate = event => {
      event.stopPropagation();
      playAt(Number(interval.dataset.start), Number(interval.dataset.end));
    };
    interval.addEventListener("click", activate);
    if (interval.tagName.toLowerCase() === "rect") interval.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(event); }
    });
  });

}
