const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are an expert security triage bot. Your task is to analyze new issues and identify potential security concerns. You will be provided with the issue title, description, and any associated labels. Based on this information, you will determine if the issue presents a potential security risk and provide a justification for your assessment.

**Issue Title:** {issue_title}

**Issue Description:** {issue_description}

**Issue Labels:** {issue_labels}

**Instructions:**

1.  **Analyze the Issue:** Carefully read the issue title, description, and labels. Look for keywords, phrases, or patterns that suggest a potential security vulnerability. Consider common security risks such as:
    *   Authentication/Authorization flaws
    *   Data breaches or leaks
    *   Injection vulnerabilities (SQL, XSS, etc.)
    *   Denial of Service (DoS)
    *   Remote Code Execution (RCE)
    *   Privilege Escalation
    *   Cryptographic weaknesses
    *   Configuration errors leading to security risks
    *   Dependency vulnerabilities
    *   API security issues
    *   Input validation issues

2.  **Determine Security Risk:** Based on your analysis, classify the issue as either:
    *   **High Security Risk:** The issue clearly indicates a significant security vulnerability that could be easily exploited. Requires immediate attention.
    *   **Medium Security Risk:** The issue suggests a potential security vulnerability that requires further investigation.
    *   **Low Security Risk:** The issue has a low probability of being a security vulnerability but warrants a brief review.
    *   **No Security Risk:** The issue does not appear to have any security implications.

3.  **Provide Justification:** Explain your reasoning for the assigned security risk level. Be specific and cite evidence from the issue title, description, and labels to support your assessment. If you identify potential vulnerabilities, name them. If you determine there is no security risk, explain why.

**Output For`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/issue-security-triage', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
