# Issue Security Triage

Automatically triages new issues, identifying potential security concerns based on AI analysis of issue content.

## Free
```yaml
- uses: walshd1/issue-security-triage@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/issue-security-triage@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
