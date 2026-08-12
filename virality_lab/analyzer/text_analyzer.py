"""
Deterministic and heuristic Text and Caption Analyzer.
Extracts objective stats, readability, hashtags, mentions, URLs, CTAs, and stylistic signals.
"""

import re
from typing import List, Optional, Tuple
from virality_lab.analyzer.schemas import TextAnalysis


class TextAnalyzer:
    """
    Analyzes captions and text posts using deterministic rules and linguistic heuristics.
    """

    CTA_PATTERNS = {
        "save": [r"\bsave (this|for later|post)\b", r"\bbookmark\b", r"\bsave it\b"],
        "share": [r"\bshare (this|with|to)\b", r"\btag a friend\b", r"\bsend this to\b"],
        "follow": [r"\bfollow for more\b", r"\bfollow me\b", r"\bhit follow\b", r"\bsubscribe\b"],
        "comment": [r"\bcomment (below|your|what)\b", r"\bdrop a comment\b", r"\blet me know in the comments\b", r"\bwhat do you think\b"],
        "link_in_bio": [r"\blink in bio\b", r"\bcheck the link\b", r"\bclick the link\b"],
    }

    EDUCATIONAL_KEYWORDS = {"how to", "tutorial", "guide", "learn", "step 1", "tips", "hacks", "tools", "framework", "strategy", "lesson", "insights", "key", "research", "breakdown"}
    INFORMATIONAL_KEYWORDS = {"insights", "why", "report", "data", "analysis", "team", "study", "engineering", "system", "trends"}
    INSTRUCTIONAL_KEYWORDS = {"step", "first", "next", "then", "finally", "instructions", "do this", "don't do", "make sure to"}
    HUMOR_KEYWORDS = {"pov", "when you", "me trying to", "literally me", "nobody:", "lmao", "lol", "wait for it", "meme"}
    CONTROVERSIAL_KEYWORDS = {"unpopular opinion", "hot take", "stop doing", "is dead", "is wrong", "the truth about", "myth", "scam", "worst"}
    PROMOTIONAL_KEYWORDS = {"discount", "buy", "sale", "limited time", "promo", "affiliate", "use code", "shop now"}
    STORYTELLING_KEYWORDS = {"story time", "so yesterday", "a year ago", "it all started", "i never thought", "back in", "when i was"}
    PERSONAL_KEYWORDS = {"i replaced", "my favorite", "i tried", "i built", "i failed", "my daily", "i spent"}

    def analyze(self, text: Optional[str]) -> TextAnalysis:
        """
        Analyze text/caption and return a populated TextAnalysis model.
        """
        if not text or not text.strip():
            return TextAnalysis()

        cleaned = text.strip()
        char_count = len(cleaned)
        words = re.findall(r"\b\w+\b", cleaned)
        word_count = len(words)

        # Remove hashtags and mentions before sentence splitting
        text_for_sentences = re.sub(r"[#@]\w+", "", cleaned).strip()
        sentences = [s.strip() for s in re.split(r"[.!?]+", text_for_sentences) if len(s.strip()) > 1]
        sentence_count = max(1, len(sentences))

        # Question and exclamation counts
        question_count = cleaned.count("?")
        exclamation_count = cleaned.count("!")

        # Hashtags and mentions
        hashtags = re.findall(r"#\w+", cleaned)
        mentions = re.findall(r"@\w+", cleaned)

        # URL presence
        has_url = bool(re.search(r"https?://\S+|www\.\S+", cleaned))

        # List-based detection (1., 2., 3., bullet points)
        list_matches = re.findall(r"(?:^|\n|\s)(?:\d+[\.\)]|[-•*])\s+\w+", cleaned)
        is_list = min(1.0, len(list_matches) * 0.4) if list_matches else 0.0

        # Readability estimate (Flesch Reading Ease approximation)
        readability = self._estimate_readability(words, sentence_count)

        # CTA Detection
        cta_present, cta_type = self._detect_cta(cleaned)

        # Stylistic indicators
        low_text = cleaned.lower()
        is_edu = self._score_keywords(low_text, self.EDUCATIONAL_KEYWORDS)
        is_inf_raw = self._score_keywords(low_text, self.INFORMATIONAL_KEYWORDS)
        is_ins = self._score_keywords(low_text, self.INSTRUCTIONAL_KEYWORDS)
        is_hum = self._score_keywords(low_text, self.HUMOR_KEYWORDS)
        is_con = self._score_keywords(low_text, self.CONTROVERSIAL_KEYWORDS)
        is_pro = self._score_keywords(low_text, self.PROMOTIONAL_KEYWORDS)
        is_sto = self._score_keywords(low_text, self.STORYTELLING_KEYWORDS)
        is_per = self._score_keywords(low_text, self.PERSONAL_KEYWORDS)
        is_inf = min(1.0, max(is_inf_raw, is_edu * 0.7 + (0.5 if word_count > 30 else 0.2)))
        is_que = min(1.0, question_count * 0.4)
        is_opn = min(1.0, is_con * 0.6 + (0.4 if "think" in low_text or "believe" in low_text else 0.0))
        is_emo = min(1.0, (exclamation_count * 0.2) + (0.3 if is_hum > 0.5 or is_con > 0.5 else 0.0))

        return TextAnalysis(
            char_count=char_count,
            word_count=word_count,
            sentence_count=sentence_count,
            readability_score=round(readability, 1),
            question_count=question_count,
            exclamation_count=exclamation_count,
            hashtags=hashtags,
            mentions=mentions,
            has_url=has_url,
            cta_present=cta_present,
            cta_type=cta_type,
            is_informational=round(is_inf, 2),
            is_educational=round(is_edu, 2),
            is_instructional=round(is_ins, 2),
            is_list_based=round(is_list, 2),
            is_humorous=round(is_hum, 2),
            is_emotional=round(is_emo, 2),
            is_controversial=round(is_con, 2),
            is_promotional=round(is_pro, 2),
            is_storytelling=round(is_sto, 2),
            is_personal=round(is_per, 2),
            is_opinion_based=round(is_opn, 2),
            is_question_based=round(is_que, 2),
        )

    def _estimate_readability(self, words: List[str], sentence_count: int) -> float:
        """Estimate Flesch Reading Ease score (0 to 100). Higher = easier to read."""
        if not words or sentence_count == 0:
            return 70.0

        num_words = len(words)
        total_syllables = sum(self._count_syllables(w) for w in words)

        asl = num_words / sentence_count  # Average sentence length
        asw = total_syllables / num_words  # Average syllables per word

        flesch = 206.835 - (1.015 * asl) - (84.6 * asw)
        return max(0.0, min(100.0, flesch))

    def _count_syllables(self, word: str) -> int:
        """Count approximate syllables in a word."""
        word = word.lower()
        if len(word) <= 3:
            return 1
        count = len(re.findall(r"[aeiouy]+", word))
        if word.endswith("e") and not word.endswith("le"):
            count = max(1, count - 1)
        return max(1, count)

    def _detect_cta(self, text: str) -> Tuple[bool, Optional[str]]:
        """Detect presence and type of call to action."""
        low = text.lower()
        for cta_type, patterns in self.CTA_PATTERNS.items():
            for p in patterns:
                if re.search(p, low):
                    return True, cta_type
        return False, None

    def _score_keywords(self, text: str, keywords: set) -> float:
        """Calculate a match signal (0.0 to 1.0) based on keyword frequency."""
        matches = sum(1 for kw in keywords if kw in text)
        if matches == 0:
            return 0.0
        elif matches == 1:
            return 0.65
        else:
            return min(1.0, 0.65 + (matches * 0.15))
