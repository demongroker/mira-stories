export const SHARE_URL = 'https://t.me/MiraStoriesGameBot/play';

export function buildSharePayload(endingTitle) {
  const ending = String(endingTitle || 'My Ending');
  return {
    title: 'Mira Stories',
    text: `I reached “${ending}” in Mira Stories. What ending will you get?`,
    url: SHARE_URL,
  };
}
