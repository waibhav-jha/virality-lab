"""
Transcript Analyzer parsing spoken dialogue for pacing, repeated phrases, and narrative cues.
"""

from collections import Counter
import re
from typing import List, Optional
from virality_lab.analyzer.schemas import TranscriptAnalysis


class TranscriptAnalyzer:
    """
    Extracts structural dialogue metrics, pacing, key topics, and repeated patterns from transcripts.
    """

    STOPWORDS = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "i", "you", "he", "she", "it", "we", "they", "this", "that"}

    def analyze(self, transcript_text: Optional[str], duration_sec: Optional[float] = None) -> TranscriptAnalysis:
        """
        Analyze transcript content and speech metrics.
        """
        if not transcript_text or not transcript_text.strip():
            return TranscriptAnalysis()

        text = transcript_text.strip()
        words = re.findall(r"\b\w+\b", text.lower())
        word_count = len(words)

        sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
        sentence_count = max(1, len(sentences))
        question_count = text.count("?")

        # Calculate speaking rate in words per minute (WPM)
        speaking_rate_wpm = None
        if duration_sec and duration_sec > 0:
            speaking_rate_wpm = round((word_count / duration_sec) * 60, 1)

        # Repeated phrases / n-grams (bigrams)
        repeated_phrases = self._find_repeated_phrases(words)

        # Key topics (most frequent non-stopwords)
        content_words = [w for w in words if w not in self.STOPWORDS and len(w) > 3]
        top_words = [w for w, _ in Counter(content_words).most_common(5)]

        # Payoff and CTA heuristics in speech
        has_payoff = bool(re.search(r"\b(result|ended up|learned|turned out|takeaway|solution|here it is)\b", text.lower()))
        has_cta = bool(re.search(r"\b(follow|subscribe|comment|link|save|share|try this)\b", text.lower()))

        hook_candidate = sentences[0] if sentences else None
        payoff_candidate = sentences[-1] if len(sentences) > 1 else None

        return TranscriptAnalysis(
            transcript_text=text,
            word_count=word_count,
            speaking_rate_wpm=speaking_rate_wpm,
            sentence_count=sentence_count,
            question_count=question_count,
            repeated_phrases=repeated_phrases,
            has_payoff=has_payoff,
            has_cta=has_cta,
            key_topics=top_words,
            hook_candidate=hook_candidate,
            payoff_candidate=payoff_candidate,
        )

    def _find_repeated_phrases(self, words: List[str]) -> List[str]:
        """Find repeated 2-word phrases in the text."""
        if len(words) < 4:
            return []
        bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
        counts = Counter(bigrams)
        return [phrase for phrase, count in counts.items() if count >= 2 and not any(w in self.STOPWORDS for w in phrase.split())][:5]
