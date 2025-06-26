export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'pt') return text; // evita tradução se já for português

  const response = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'pt',
      target: targetLang,
      format: 'text',
    }),
  });

  const data = await response.json();
  return data.translatedText || text;
}
