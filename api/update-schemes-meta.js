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

    // Step 2: Deep merge — preserve existing non-null fields when new run returns null.
    // Shallow spread ({ ...currentData, ...results }) would replace entire entries,
    // e.g. a Tier-2 run that finds nothing (isActive:null, httpStatus:null) would
    // wipe out good Tier-1 data (isActive:true, httpStatus:200) already stored.
    //
    // Fix 4 exception — lastDate: when Tier 2 ran it always sends a `lastDate` key,
    // even as `null`, to mean "I checked the page and there's no deadline now".
    // For this field only, an explicit null CLEARS the stored value (instead of
    // being ignored like other null fields), so stale "Apply Closed" dates don't
    // linger forever once a scheme becomes ongoing/perpetual.
    const merged = { ...currentData };
    for (const [id, newEntry] of Object.entries(results)) {
      const existing = currentData[id] || {};
      const entry    = { ...existing };
      for (const [k, v] of Object.entries(newEntry)) {
        if (k === 'lastVerified') {
          // Always update the timestamp so freshness row stays accurate
          entry[k] = v;
        } else if (k === 'lastDate') {
          // Fix 4: explicit null clears a stale deadline; a real date overwrites.
          if (v == null) delete entry[k];
          else entry[k] = v;
        } else if (v != null) {
          // Only overwrite with a real value — never clobber good data with null
          entry[k] = v;
        }
        // v === null (other fields) → keep whatever was already stored for this field
      }
      merged[id] = entry;
    }
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
