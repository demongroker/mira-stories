import { choose, createGame, getScene, hydrateGame, resetGame } from './src/story-engine.js';
import { buildSharePayload } from './src/share.js';

const SAVE_KEY = 'mira-stories-progress-v1';
const telegram = window.Telegram?.WebApp;

telegram?.ready();
telegram?.expand();
telegram?.setHeaderColor?.('#160e11');
telegram?.setBackgroundColor?.('#160e11');

const elements = {
  chapter: document.querySelector('#chapterLabel'),
  title: document.querySelector('#sceneTitle'),
  location: document.querySelector('#locationLabel'),
  image: document.querySelector('#storyImage'),
  text: document.querySelector('#sceneText'),
  choices: document.querySelector('#choiceList'),
  endingPanel: document.querySelector('#endingPanel'),
  endingTitle: document.querySelector('#endingTitle'),
  reset: document.querySelector('#resetButton'),
  replay: document.querySelector('#replayButton'),
  share: document.querySelector('#shareButton'),
  toast: document.querySelector('#toast'),
};

let game = hydrateGame(localStorage.getItem(SAVE_KEY) ?? '');
let toastTimer;

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function updateStat(name, value) {
  document.querySelector(`#${name}Value`).textContent = value;
  document.querySelector(`#${name}Bar`).style.width = `${value}%`;
}

function renderChoices(scene) {
  elements.choices.replaceChildren();
  scene.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.dataset.choice = choice.id;
    button.innerHTML = `<span class="choice-number">${index + 1}</span><span>${choice.label}</span><span class="choice-arrow">›</span>`;
    button.addEventListener('click', () => {
      telegram?.HapticFeedback?.impactOccurred('light');
      game = choose(game, choice.id);
      save();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    elements.choices.append(button);
  });
}

function render() {
  const scene = getScene(game);
  elements.chapter.textContent = scene.chapter;
  elements.title.textContent = scene.title;
  elements.location.textContent = scene.location;
  elements.image.src = scene.image;
  elements.image.alt = `Mira Stories artwork for ${scene.title}`;
  elements.text.textContent = scene.text;
  updateStat('courage', game.stats.courage);
  updateStat('trust', game.stats.trust);
  updateStat('heart', game.stats.heart);
  renderChoices(scene);

  const finished = Boolean(scene.ending);
  elements.endingPanel.hidden = !finished;
  if (finished) {
    elements.endingTitle.textContent = scene.ending;
    telegram?.HapticFeedback?.notificationOccurred('success');
  }
}

function restart() {
  game = resetGame(game);
  save();
  render();
  showToast('Episode restarted');
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2200);
}

async function shareEnding() {
  const scene = getScene(game);
  const payload = buildSharePayload(scene.ending);
  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  await navigator.clipboard?.writeText(`${payload.text} ${payload.url}`);
  showToast('Ending copied to clipboard');
}

elements.reset.addEventListener('click', restart);
elements.replay.addEventListener('click', restart);
elements.share.addEventListener('click', shareEnding);

render();
