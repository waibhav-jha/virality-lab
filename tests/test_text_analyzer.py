"""
Unit tests for TextAnalyzer module.
"""

from virality_lab.analyzer.text_analyzer import TextAnalyzer


def test_text_analyzer_metrics():
    """Verify character, word, sentence, question, exclamation, hashtag, and mention counts."""
    analyzer = TextAnalyzer()
    caption = "Stop wasting time! Here are 3 AI tools for students in 2026. What do you think? #ai #study @mit"

    result = analyzer.analyze(caption)

    assert result.word_count >= 15
    assert result.sentence_count == 3
    assert result.question_count == 1
    assert result.exclamation_count == 1
    assert "#ai" in result.hashtags
    assert "#study" in result.hashtags
    assert "@mit" in result.mentions
    assert 0.0 <= result.readability_score <= 100.0


def test_text_analyzer_empty_and_whitespace():
    """Verify graceful handling of empty or whitespace text."""
    analyzer = TextAnalyzer()

    r1 = analyzer.analyze(None)
    assert r1.char_count == 0
    assert r1.word_count == 0
    assert r1.cta_present is False

    r2 = analyzer.analyze("   \n\t  ")
    assert r2.char_count == 0
    assert r2.word_count == 0


def test_text_analyzer_cta_detection():
    """Verify accurate detection of various CTA types."""
    analyzer = TextAnalyzer()

    # Save CTA
    res_save = analyzer.analyze("Make sure to save this for your semester finals.")
    assert res_save.cta_present is True
    assert res_save.cta_type == "save"

    # Share CTA
    res_share = analyzer.analyze("Share this with a friend who needs it.")
    assert res_share.cta_present is True
    assert res_share.cta_type == "share"

    # Follow CTA
    res_follow = analyzer.analyze("Follow for more daily coding tips and tutorials.")
    assert res_follow.cta_present is True
    assert res_follow.cta_type == "follow"

    # Comment CTA
    res_comment = analyzer.analyze("Comment below which tool is your favorite!")
    assert res_comment.cta_present is True
    assert res_comment.cta_type == "comment"

    # Link in bio CTA
    res_link = analyzer.analyze("Check the link in bio to download the full cheat sheet.")
    assert res_link.cta_present is True
    assert res_link.cta_type == "link_in_bio"

    # No CTA
    res_none = analyzer.analyze("The sky was unusually clear this morning.")
    assert res_none.cta_present is False
    assert res_none.cta_type is None


def test_text_analyzer_stylistic_signals():
    """Verify classification of educational, controversial, and humorous style indicators."""
    analyzer = TextAnalyzer()

    edu_text = "Here is a complete tutorial guide with 5 tips and tools to learn Python."
    edu_res = analyzer.analyze(edu_text)
    assert edu_res.is_educational > 0.5

    con_text = "Unpopular opinion: Traditional coding bootcamps are a scam in 2026."
    con_res = analyzer.analyze(con_text)
    assert con_res.is_controversial > 0.5

    hum_text = "POV: Me trying to debug code at 3am lmao nobody:"
    hum_res = analyzer.analyze(hum_text)
    assert hum_res.is_humorous > 0.5


def test_text_analyzer_url_and_list_signals():
    """Verify URL detection, list detection, instructional signals, and properties."""
    analyzer = TextAnalyzer()

    text = "Check out our guide at https://viralitylab.ai:\n1. First step\n2. Next step\n3. Final step #guide @team"
    res = analyzer.analyze(text)

    assert res.has_url is True
    assert res.is_list_based > 0.5
    assert res.is_instructional > 0.5
    assert res.hashtag_count == 1
    assert res.mention_count == 1

