export const STORY = {
  arrival: {
    image: './assets/scenes/arrival.jpg',
    chapter: 'Episode 1 · Scene 1',
    title: 'The Night Before',
    location: 'Hotel Bellavista · 11:47 PM',
    text: 'Mira came to surprise Rafael before their wedding. Through the rain-streaked window, she sees him hand a red envelope to a woman she has never met.',
    choices: [
      { id: 'confront', label: 'Walk in and confront them', next: 'confrontation', effects: { courage: 12, trust: -8 } },
      { id: 'follow', label: 'Follow the mysterious woman', next: 'alley', effects: { courage: 8, trust: -6 } },
      { id: 'wait', label: 'Stay hidden and keep watching', next: 'voicemail', effects: { heart: -5, trust: 4 } },
    ],
  },
  confrontation: {
    image: './assets/scenes/confrontation.jpg',
    chapter: 'Episode 1 · Scene 2',
    title: 'A Name From the Past',
    location: 'Bellavista Lounge · Midnight',
    text: 'Rafael goes pale. “Mira, this is Lucía.” The stranger turns, wearing the same pendant Mira’s mother left her years ago.',
    choices: [
      { id: 'ask_lucia', label: 'Ask Lucía about the pendant', next: 'sisters', effects: { courage: 5, trust: 3 } },
      { id: 'leave_rafael', label: 'Leave Rafael without a word', next: 'taxi', effects: { courage: 6, heart: -7 } },
    ],
  },
  alley: {
    image: './assets/scenes/alley.jpg',
    chapter: 'Episode 1 · Scene 2',
    title: 'The Woman in Red',
    location: 'Old Quarter · 12:06 AM',
    text: 'The woman slips into a waiting car. Before the door closes, she calls Mira by the childhood name only her missing sister knew.',
    choices: [
      { id: 'enter_car', label: 'Get into the car', next: 'sisters', effects: { courage: 10, heart: 5 } },
      { id: 'call_rafael', label: 'Call Rafael and demand the truth', next: 'voicemail', effects: { trust: -10, courage: 2 } },
    ],
  },
  voicemail: {
    image: './assets/scenes/voicemail.jpg',
    chapter: 'Episode 1 · Scene 2',
    title: 'The Unsent Message',
    location: 'Hotel Bellavista · 12:09 AM',
    text: 'Mira’s phone lights up with a scheduled voice message from her late mother: “If Lucía returns, do not trust the man beside her.”',
    choices: [
      { id: 'find_lucia', label: 'Find Lucía before Rafael does', next: 'sisters', effects: { courage: 8, heart: 4 } },
      { id: 'test_rafael', label: 'Pretend nothing happened and test Rafael', next: 'taxi', effects: { trust: -4, courage: 4 } },
    ],
  },
  sisters: {
    image: './assets/scenes/sisters.jpg',
    chapter: 'Episode 1 · Finale',
    title: 'Blood Recognizes Blood',
    location: 'The Coastal Road · 12:31 AM',
    text: 'Lucía reveals a faded photograph: two little girls, one pendant split between them. Mira has found her sister—but Rafael has been paying her to stay away.',
    ending: 'The Lost Sister',
    choices: [],
  },
  taxi: {
    image: './assets/scenes/taxi.jpg',
    chapter: 'Episode 1 · Finale',
    title: 'No Wedding Tomorrow',
    location: 'Somewhere after midnight',
    text: 'Mira removes her engagement ring as the city disappears behind her. Then the driver says, “Your sister told me where to take you.”',
    ending: 'The Runaway Bride',
    choices: [],
  },
};

const INITIAL = Object.freeze({
  sceneId: 'arrival',
  stats: Object.freeze({ courage: 50, trust: 50, heart: 50 }),
  history: Object.freeze([]),
});

export function createGame() {
  return {
    sceneId: INITIAL.sceneId,
    stats: { ...INITIAL.stats },
    history: [],
  };
}

export function getScene(game) {
  return STORY[game.sceneId];
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

export function choose(game, choiceId) {
  const scene = getScene(game);
  const choice = scene?.choices.find((item) => item.id === choiceId);
  if (!choice) return game;

  const stats = { ...game.stats };
  for (const [key, delta] of Object.entries(choice.effects ?? {})) {
    stats[key] = clamp((stats[key] ?? 0) + delta);
  }

  return {
    sceneId: choice.next,
    stats,
    history: [...game.history, { sceneId: game.sceneId, choiceId }],
  };
}

export function hydrateGame(serialized) {
  try {
    const parsed = JSON.parse(serialized);
    if (!STORY[parsed.sceneId] || !parsed.stats || !Array.isArray(parsed.history)) return createGame();
    return parsed;
  } catch {
    return createGame();
  }
}

export function resetGame() {
  return createGame();
}
