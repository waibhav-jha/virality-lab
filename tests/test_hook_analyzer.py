"""
Unit tests for HookAnalyzer module.
"""

from virality_lab.analyzer.hook_analyzer import HookAnalyzer
from virality_lab.analyzer.schemas import HookType


def test_hook_analyzer_empty_and_fallback():
    """Verify fallback behavior for empty text."""
    analyzer = HookAnalyzer()
    res = analyzer.analyze(transcript=None, caption=None)

    assert res.hook_text == ""
    assert res.hook_type == HookType.GENERIC
    assert 0.0 <= res.hook_strength <= 1.0


def test_hook_analyzer_pattern_classification():
    """Verify classification of different opening hook patterns."""
    analyzer = HookAnalyzer()

    # Pattern Interrupt
    res_pi = analyzer.analyze(caption="Stop scrolling and look at this right now.")
    assert res_pi.hook_type == HookType.PATTERN_INTERRUPT
    assert res_pi.hook_strength > 0.6

    # Contrarian Statement
    res_cs = analyzer.analyze(transcript="Stop doing your homework manually. Unpopular opinion: AI will replace search.")
    assert res_cs.hook_type == HookType.CONTRARIAN_STATEMENT

    # Curiosity Gap
    res_cg = analyzer.analyze(caption="The secret reason why nobody talks about this method.")
    assert res_cg.hook_type == HookType.CURIOSITY_GAP
    assert res_cg.curiosity > 0.7

    # Value Promise with Numbers (high specificity)
    res_vp = analyzer.analyze(caption="Here are 5 AI tools to save 10 hours this week.")
    assert res_vp.hook_type == HookType.VALUE_PROMISE
    assert res_vp.specificity > 0.7

    # Question Hook
    res_q = analyzer.analyze(caption="Did you know 90% of students make this mistake?")
    assert res_q.hook_type == HookType.QUESTION


def test_hook_analyzer_duration_and_scoring_bounds():
    """Verify configurable hook duration and that all scores remain in [0.0, 1.0]."""
    analyzer = HookAnalyzer(default_hook_duration_sec=3.0)
    res = analyzer.analyze(
        caption="I replaced 3 hours of college work with AI in 2026.",
        hook_duration_sec=2.5,
    )

    assert res.hook_duration_sec == 2.5
    assert 0.0 <= res.hook_strength <= 1.0
    assert 0.0 <= res.curiosity <= 1.0
    assert 0.0 <= res.clarity <= 1.0
    assert 0.0 <= res.novelty <= 1.0
    assert 0.0 <= res.emotional_intensity <= 1.0
    assert 0.0 <= res.specificity <= 1.0
