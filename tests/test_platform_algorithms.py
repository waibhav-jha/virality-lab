"""
Unit tests for platform-specific recommendation algorithm simulation engine.
"""

from virality_lab.scoring.platform_algorithms import PlatformAlgorithmSimulator


def test_tiktok_monolith_algorithm():
    sim = PlatformAlgorithmSimulator()
    caption = "Stop scrolling! 3 AI tools that will save you 10 hours. Watch again to master all three."
    result = sim.evaluate_platform_algorithm("tiktok", caption=caption, hook_pct=80.0, retention_pct=75.0, share_pct=60.0)

    assert result.platform == "tiktok"
    assert result.codename == "TT-MONOLITH-V25"
    assert len(result.cohort_stages) == 3
    assert result.cohort_stages[0].passed is True
    assert any("Pattern Interrupt" in b.label for b in result.detected_boosts)
    assert result.overall_compatibility_score > 60.0


def test_instagram_reels_algorithm_and_watermark_penalty():
    sim = PlatformAlgorithmSimulator()
    caption = "Send to a friend who needs this cheat sheet! Reposted from TikTok watermark"
    result = sim.evaluate_platform_algorithm("instagram", caption=caption, hook_pct=70.0, retention_pct=60.0, share_pct=65.0)

    assert result.platform == "instagram"
    assert result.codename == "IG-EXPLORE-GRAPH-V4"
    assert any("Direct Message" in b.label for b in result.detected_boosts)
    assert any("Watermark" in p.label for p in result.detected_penalties)


def test_youtube_shorts_algorithm():
    sim = PlatformAlgorithmSimulator()
    caption = "The secret reason why AI is changing everything. Subscribe for daily breakdowns!"
    result = sim.evaluate_platform_algorithm("youtube", caption=caption, hook_pct=78.0, retention_pct=82.0, share_pct=50.0)

    assert result.platform == "youtube"
    assert result.codename == "YT-SHORTS-SHELF-V2"
    assert len(result.cohort_stages) == 3
    assert any("Subscriber Conversion" in b.label for b in result.detected_boosts)


def test_x_heavy_ranker_algorithm_and_link_penalty():
    sim = PlatformAlgorithmSimulator()
    caption = "Agree or disagree? Here are 3 counter-intuitive facts: https://example.com/blog"
    result = sim.evaluate_platform_algorithm("x", caption=caption, hook_pct=65.0, retention_pct=55.0, share_pct=50.0, engagement_pct=70.0)

    assert result.platform == "x"
    assert result.codename == "X-HEAVY-RANK-2025"
    assert any("Heavy Ranker" in b.multiplier_factor for b in result.detected_boosts)
    assert any("Outbound Link" in p.label for p in result.detected_penalties)


def test_linkedin_dwell_algorithm():
    sim = PlatformAlgorithmSimulator()
    caption = "Here is the exact playbook and framework we used to scale to $1M ARR with 4 key lessons."
    result = sim.evaluate_platform_algorithm("linkedin", caption=caption, hook_pct=70.0, retention_pct=78.0, share_pct=55.0, engagement_pct=65.0)

    assert result.platform == "linkedin"
    assert result.codename == "LI-KNOWLEDGE-FEED-V2"
    assert any("Dwell Time" in b.label for b in result.detected_boosts)
    assert result.cohort_stages[0].passed is True


if __name__ == "__main__":
    test_tiktok_monolith_algorithm()
    test_instagram_reels_algorithm_and_watermark_penalty()
    test_youtube_shorts_algorithm()
    test_x_heavy_ranker_algorithm_and_link_penalty()
    test_linkedin_dwell_algorithm()
    print("ALL 5 PLATFORM ALGORITHM TESTS PASSED 100%!")
