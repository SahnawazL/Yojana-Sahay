export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { results } = req.body;
  if (!results || typeof results !== 'object') {
    return res.status(400).json({ error: 'Invalid results payload' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const filePath = 'src/schemes-meta.json';
  const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  try {
    // Step 1: Get current file + SHA
    const getRes = await fetch(apiBase, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    let currentData = {};
    let sha = null;

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
      const decoded = Buffer.from(fileInfo.content, 'base64').toString('utf8');
      currentData = JSON.parse(decoded);
    }

    // Step 2: Merge new results
    const merged = { ...currentData, ...results };
    const encoded = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');

    // Step 3: Commit back to GitHub
    const putBody = {
      message: `chore: update schemes-meta [${new Date().toISOString()}]`,
      content: encoded,
      ...(sha && { sha }),
    };

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: 'GitHub commit failed', detail: err });
    }

    return res.status(200).json({ success: true, updated: Object.keys(results).length });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
