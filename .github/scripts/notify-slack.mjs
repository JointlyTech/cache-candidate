import { fileURLToPath } from 'node:url';

const TIMEOUT_MS = 10_000;

export async function notifySlack(webhookUrl, text, { timeoutMs = TIMEOUT_MS } = {}) {
  if (!webhookUrl) {
    console.warn('Slack notification skipped: no webhook URL');
    return false;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      console.warn(`Slack notification failed: HTTP ${response.status}`);
      return false;
    }
    console.log('Slack notification sent');
    return true;
  } catch (error) {
    console.warn(`Slack notification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    await notifySlack(process.env.SLACK_RELEASE_HOOK_URL, process.argv[2] ?? '');
  } catch (error) {
    console.warn(`Slack notification failed: ${error.message}`);
  }
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
