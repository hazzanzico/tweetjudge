# v0.1.0
# { "Depends": "py-genlayer:latest" }
from genlayer_stub import *
from genlayer import *
import json


class TweetJudge(gl.Contract):
    user_histories: TreeMap[Address, str]

    def __init__(self):
        pass

    @gl.public.write
    def analyze_tweet(self, tweet: str) -> str:

        prompt = f"""
Analyze this tweet and return JSON:
"{tweet}"

Format:
{{
  "virality_score": number,
  "backlash_risk": number,
  "summary": "string"
}}
"""

        result = (
            gl.eq_principle.prompt_non_comparative(
                lambda: prompt,
                task="Analyze tweet performance",
                criteria="Return valid JSON only"
            )
            .replace("```json", "")
            .replace("```", "")
        )

        sender = gl.message.sender_address

        existing = "[]"
        if sender in self.user_histories:
            existing = self.user_histories[sender]

        history = json.loads(existing)

        history.append({
            "tweet": tweet,
            "analysis": json.loads(result)
        })

        updated = json.dumps(history)

        self.user_histories[sender] = updated

        return updated

    @gl.public.view
    def get_history(self, user: str) -> str:
        addr = Address(user)
        if addr in self.user_histories:
            return self.user_histories[addr]
        return "[]"