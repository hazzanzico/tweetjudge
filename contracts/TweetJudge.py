# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json


class TweetJudge(gl.Contract):
    user_histories: TreeMap[Address, str]

    def __init__(self):
        pass

    @gl.public.write
    def analyze_tweet(self, tweet: str, user_address: str = "") -> str:
        prompt = f"""
Analyze this tweet and return JSON:
"{tweet}"

RULES for improved_tweet and all variant tweets:
- Preserve the original length. If the original is long, the rewrite must also be long. If short, keep it short. Do NOT summarize, condense, or cut out any points, steps, or details.
- Keep the exact same tone, voice, and writing style as the original. It must feel like the same person wrote it.
- Do NOT add hashtags unless they already appear in the original.
- Do NOT add emojis unless they already appear in the original.
- Do NOT use em-dashes (— or -) unless they already appear in the original.
- Do NOT add symbols, formatting, or punctuation not present in the original.
- Only improve clarity, word choice, and flow. Nothing else.

Format:
{{
  "virality_score": number between 0-100,
  "backlash_risk": number between 0-100,
  "consensus_disagreement": number between 0-100,
  "summary": "string",
  "audience_breakdown": {{
    "agree": "percentage string e.g. 40%",
    "attack": "percentage string e.g. 35%",
    "ignore": "percentage string e.g. 25%"
  }},
  "reasoning_points": ["point 1", "point 2", "point 3"],
  "validator_opinions": [
    {{"name": "Risk Analyst", "opinion": "string", "detail": "string"}},
    {{"name": "Engagement Expert", "opinion": "string", "detail": "string"}},
    {{"name": "Audience Strategist", "opinion": "string", "detail": "string"}}
  ],
  "improved_tweet": "string",
  "variants": [
    {{"type": "safer", "description": "string", "tweet": "string"}},
    {{"type": "bolder", "description": "string", "tweet": "string"}},
    {{"type": "viral", "description": "string", "tweet": "string"}}
  ]
}}
"""
        result = (
            gl.eq_principle.prompt_non_comparative(
                lambda: prompt,
                task="Analyze tweet performance and return structured JSON",
                criteria="Return valid JSON only with all required fields"
            )
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # Use provided user_address if given (for sponsored transactions), otherwise use sender
        target_user = Address(user_address) if user_address else gl.message.sender_address

        existing = "[]"
        if target_user in self.user_histories:
            existing = self.user_histories[target_user]

        history = json.loads(existing)
        history.append({
            "id": str(len(history)),
            "tweet": tweet,
            "data": json.loads(result)
        })

        updated = json.dumps(history)
        self.user_histories[target_user] = updated
        return updated

    @gl.public.view
    def get_history(self, user: str) -> str:
        addr = Address(user)
        if addr in self.user_histories:
            return self.user_histories[addr]
        return "[]"

    @gl.public.view
    def get_history_count(self, user: str) -> str:
        addr = Address(user)
        if addr in self.user_histories:
            history = json.loads(self.user_histories[addr])
            return str(len(history))
        return "0"

    @gl.public.view
    def get_analysis_at(self, user: str, index: str) -> str:
        addr = Address(user)
        idx = int(index)
        if addr in self.user_histories:
            history = json.loads(self.user_histories[addr])
            if idx < len(history):
                return json.dumps(history[idx])
        return ""