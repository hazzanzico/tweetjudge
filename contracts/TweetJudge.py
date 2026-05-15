# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json


class TweetJudge(gl.Contract):
    # Flat storage: key is "address:index" -> single JSON result
    analysis_data: TreeMap[str, str]
    # Flat count: key is Address -> count of analyses
    analysis_count: TreeMap[Address, u256]

    def __init__(self):
        pass

    @gl.public.write
    def analyze_tweet(self, tweet: str, user_address: str = "") -> str:

        # ── Phase 1: Score-only prompt (faster consensus on structured numbers) ──
        scoring_prompt = f"""
Analyze this tweet and return ONLY this JSON with no extra text:
"{tweet}"

{{
  "virality_score": integer between 0 and 100,
  "backlash_risk": integer between 0 and 100,
  "consensus_disagreement": integer between 0 and 100,
  "summary": "one sentence string",
  "audience_breakdown": {{
    "agree": "percentage e.g. 40%",
    "attack": "percentage e.g. 35%",
    "ignore": "percentage e.g. 25%"
  }},
  "reasoning_points": ["point 1", "point 2", "point 3"]
}}

Rules:
- audience_breakdown percentages must sum to exactly 100%.
- Return valid JSON only. No markdown. No code blocks. No extra text.
"""

        scores_raw = (
            gl.eq_principle.prompt_non_comparative(
                lambda: scoring_prompt,
                task="Score tweet performance with numeric metrics",
                criteria="Return valid JSON. virality_score, backlash_risk, and consensus_disagreement must be integers between 0 and 100. audience_breakdown percentages must sum to 100%."
            )
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # ── Phase 2: Text generation prompt seeded with agreed scores ──
        generation_prompt = f"""
Given this tweet: "{tweet}"
And these agreed metrics: {scores_raw}

Return ONLY this JSON with no extra text:
{{
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

Rules for improved_tweet and all variant tweets:
- Preserve the original length. If the original is long, the rewrite must also be long. If short, keep it short.
- Keep the exact same tone, voice, and writing style as the original.
- Do NOT add hashtags unless they already appear in the original.
- Do NOT add emojis unless they already appear in the original.
- Do NOT use em-dashes unless they already appear in the original.
- Only improve clarity, word choice, and flow. Nothing else.
- Return valid JSON only. No markdown. No code blocks. No extra text.
"""

        text_raw = (
            gl.eq_principle.prompt_non_comparative(
                lambda: generation_prompt,
                task="Generate tweet improvements and validator opinions",
                criteria="Return valid JSON with improved_tweet as a string and variants as an array of 3 objects each with type, description, and tweet fields."
            )
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # ── Merge both phases into one result object ──
        scores_data = json.loads(scores_raw)
        text_data = json.loads(text_raw)

        merged = {
            "virality_score": scores_data.get("virality_score", 0),
            "backlash_risk": scores_data.get("backlash_risk", 0),
            "consensus_disagreement": scores_data.get("consensus_disagreement", 0),
            "summary": scores_data.get("summary", ""),
            "audience_breakdown": scores_data.get("audience_breakdown", {
                "agree": "0%", "attack": "0%", "ignore": "0%"
            }),
            "reasoning_points": scores_data.get("reasoning_points", []),
            "validator_opinions": text_data.get("validator_opinions", []),
            "improved_tweet": text_data.get("improved_tweet", ""),
            "variants": text_data.get("variants", []),
        }

        # ── Determine target user ──
        target_user = Address(user_address) if user_address else gl.message.sender_address

        # ── Flat O(1) write ──
        count = int(self.analysis_count[target_user]) if target_user in self.analysis_count else 0
        key = f"{str(target_user)}:{count}"

        record = {
            "id": str(count),
            "tweet": tweet,
            "timestamp": "",  # timestamp not available in contract; set on frontend
            "data": merged
        }

        self.analysis_data[key] = json.dumps(record)
        self.analysis_count[target_user] = u256(count + 1)

        return json.dumps(record)

    @gl.public.view
    def get_history_count(self, user: str) -> str:
        addr = Address(user)
        if addr in self.analysis_count:
            return str(int(self.analysis_count[addr]))
        return "0"

    @gl.public.view
    def get_analysis_at(self, user: str, index: str) -> str:
        key = f"{user}:{index}"
        if key in self.analysis_data:
            return self.analysis_data[key]
        return ""

    @gl.public.view
    def get_latest_analysis(self, user: str) -> str:
        addr = Address(user)
        if addr not in self.analysis_count:
            return ""
        count = int(self.analysis_count[addr])
        if count == 0:
            return ""
        key = f"{user}:{count - 1}"
        if key in self.analysis_data:
            return self.analysis_data[key]
        return ""

    @gl.public.view
    def get_history(self, user: str) -> str:
        """Returns full history as a JSON array. Use sparingly for large histories."""
        addr = Address(user)
        if addr not in self.analysis_count:
            return "[]"
        count = int(self.analysis_count[addr])
        if count == 0:
            return "[]"
        history = []
        for i in range(count):
            key = f"{user}:{i}"
            if key in self.analysis_data:
                history.append(json.loads(self.analysis_data[key]))
        return json.dumps(history)
