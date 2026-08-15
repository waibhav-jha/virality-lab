"""
Platform-Specific Algorithm Simulation Engine.

Accurately mimics the real-world recommendation algorithm mechanics and multi-stage
cohort distribution pipelines for:
  1. TikTok (Monolith Batch-Testing Pipeline)
  2. Instagram (Reels Explore Graph & DM Multiplier)
  3. YouTube Shorts (2-Tower Candidate Generation & Satisfaction Index)
  4. X / Twitter (Open-Source Neural Heavy Ranker)
  5. LinkedIn (Professional Dwell Time & Knowledge Graph)
"""

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CohortStage(BaseModel):
    """A distinct testing stage in the platform's distribution algorithm."""

    stage_number: int = Field(..., ge=1, le=4, description="Stage sequence number (1, 2, 3).")
    stage_name: str = Field(..., description="Stage title (e.g. 'Initial Seed Cohort').")
    impressions_range: str = Field(..., description="Impressions volume range (e.g. '250 - 500').")
    gate_metric_name: str = Field(..., description="Primary metric gating promotion to next tier.")
    gate_target_threshold: float = Field(..., description="Minimum benchmark needed to pass.")
    gate_actual_value: float = Field(..., description="Evaluated performance value.")
    unit: str = Field(default="%", description="Metric unit (% or pts).")
    passed: bool = Field(..., description="Whether the specimen passed this gate.")
    verdict_reason: str = Field(..., description="Explanation of algorithmic decision.")


class AlgorithmBoost(BaseModel):
    """A positive ranking boost identified by the platform ranker."""

    boost_id: str
    label: str
    multiplier_factor: str
    rationale: str


class AlgorithmPenalty(BaseModel):
    """A ranking downranking or throttle triggered by platform heuristics."""

    penalty_id: str
    label: str
    severity: str  # 'critical', 'moderate', 'minor'
    impact: str
    rationale: str


class PlatformAlgorithmEvaluation(BaseModel):
    """Complete simulation of a platform's recommendation algorithm."""

    platform: str = Field(..., description="Platform identifier (tiktok, instagram, youtube, x, linkedin).")
    algorithm_name: str = Field(..., description="Formal algorithm engine name.")
    codename: str = Field(..., description="Algorithmic release code.")
    archetype: str = Field(..., description="Core optimization objective of the algorithm.")
    overall_compatibility_score: float = Field(..., ge=0.0, le=100.0, description="0-100 fit score.")
    predicted_reach_tier: str = Field(..., description="Reach classification tier.")
    projected_impressions_estimate: str = Field(..., description="Simulated impressions potential.")
    cohort_stages: List[CohortStage] = Field(default_factory=list, description="Multi-stage cohort progression.")
    ranking_weights: Dict[str, float] = Field(default_factory=dict, description="Active neural ranker weights.")
    detected_boosts: List[AlgorithmBoost] = Field(default_factory=list, description="Positive multiplier boosts.")
    detected_penalties: List[AlgorithmPenalty] = Field(default_factory=list, description="Active downranking penalties.")
    primary_actionable_fix: str = Field(..., description="Highest-leverage recommendation to survive the algorithm.")


class PlatformAlgorithmSimulator:
    """Evaluates content against real-world platform recommendation algorithm rules."""

    def evaluate_platform_algorithm(
        self,
        platform: str,
        caption: str,
        transcript: str = "",
        hook_pct: float = 70.0,
        retention_pct: float = 60.0,
        share_pct: float = 40.0,
        engagement_pct: float = 50.0,
    ) -> PlatformAlgorithmEvaluation:
        """Evaluate content against the specific platform algorithm."""
        plat = platform.lower()
        if plat == "tiktok":
            return self._evaluate_tiktok(caption, transcript, hook_pct, retention_pct, share_pct, engagement_pct)
        elif plat == "instagram":
            return self._evaluate_instagram(caption, transcript, hook_pct, retention_pct, share_pct, engagement_pct)
        elif plat == "youtube":
            return self._evaluate_youtube(caption, transcript, hook_pct, retention_pct, share_pct, engagement_pct)
        elif plat in ("x", "twitter"):
            return self._evaluate_x(caption, transcript, hook_pct, retention_pct, share_pct, engagement_pct)
        elif plat == "linkedin":
            return self._evaluate_linkedin(caption, transcript, hook_pct, retention_pct, share_pct, engagement_pct)
        else:
            return self._evaluate_tiktok(caption, transcript, hook_pct, retention_pct, share_pct, engagement_pct)

    # -------------------------------------------------------------------------
    # 1. TIKTOK MONOLITH BATCH ENGINE
    # -------------------------------------------------------------------------
    def _evaluate_tiktok(
        self,
        caption: str,
        transcript: str,
        hook_pct: float,
        retention_pct: float,
        share_pct: float,
        engagement_pct: float,
    ) -> PlatformAlgorithmEvaluation:
        full_text = f"{caption} {transcript}".lower()
        boosts: List[AlgorithmBoost] = []
        penalties: List[AlgorithmPenalty] = []

        # Signal checks
        has_pattern_interrupt = any(kw in full_text for kw in ["stop scrolling", "wait", "don't swipe", "warning", "secret", "never"])
        has_loop_prompt = any(kw in full_text for kw in ["watch again", "did you catch", "loop", "wait for the end", "part 2"])
        has_slow_intro = any(kw in full_text for kw in ["hey guys", "welcome back", "in this video today", "so basically"])

        if has_pattern_interrupt:
            boosts.append(
                AlgorithmBoost(
                    boost_id="tt_hook_interrupt",
                    label="0-1.5s Pattern Interrupt Detected",
                    multiplier_factor="+25% Stage 1 Seed Retention",
                    rationale="Opening hook breaks habitual thumb scroll pattern, passing the Monolith 0-3s gate.",
                )
            )
            hook_pct = min(100.0, hook_pct + 12.0)

        if has_loop_prompt:
            boosts.append(
                AlgorithmBoost(
                    boost_id="tt_loop_multiplier",
                    label="Re-watch & Loop Structure",
                    multiplier_factor="12.0x Monolith Rank Weight",
                    rationale="High completion and repeated re-watching provides TikTok's strongest viral propagation signal.",
                )
            )
            retention_pct = min(100.0, retention_pct + 15.0)

        if has_slow_intro:
            penalties.append(
                AlgorithmPenalty(
                    penalty_id="tt_slow_intro",
                    label="Slow Conversational Intro Fluff",
                    severity="critical",
                    impact="-35% Stop-Scroll Rate",
                    rationale="TikTok viewers swipe within 0.8s if value is not instantly obvious in the first frame.",
                )
            )
            hook_pct = max(10.0, hook_pct - 20.0)

        # Stage 1: Cold Start Gate (250-500 Impressions)
        stage1_pass = hook_pct >= 62.0
        stage1 = CohortStage(
            stage_number=1,
            stage_name="Stage 1: Cold Start Seed Cohort",
            impressions_range="250 – 500 Test Impressions",
            gate_metric_name="0–3s Stop-Scroll Hook Rate",
            gate_target_threshold=62.0,
            gate_actual_value=round(hook_pct, 1),
            passed=stage1_pass,
            verdict_reason="Passed initial test cohort with immediate hook velocity."
            if stage1_pass
            else "Failed 0-3s hook threshold (<62%). Monolith engine terminates rollout at seed level.",
        )

        # Stage 2: Sub-Network Loop & Share Wave (1k-10k Impressions)
        stage2_val = round((retention_pct * 0.6) + (share_pct * 0.4), 1)
        stage2_pass = stage1_pass and stage2_val >= 58.0
        stage2 = CohortStage(
            stage_number=2,
            stage_name="Stage 2: Sub-Network Propagation",
            impressions_range="1,000 – 15,000 Impressions",
            gate_metric_name="Loop & Share Velocity Index",
            gate_target_threshold=58.0,
            gate_actual_value=stage2_val,
            passed=stage2_pass,
            verdict_reason="Sufficient watch-through and peer-forwarding to breach interest cluster."
            if stage2_pass
            else "Drop-off during middle 50% of video halted cohort propagation.",
        )

        # Stage 3: Macro FYP Wave (100k+ Impressions)
        stage3_val = round((retention_pct * 0.4) + (share_pct * 0.35) + (engagement_pct * 0.25), 1)
        stage3_pass = stage2_pass and stage3_val >= 68.0
        stage3 = CohortStage(
            stage_number=3,
            stage_name="Stage 3: Broad FYP Macro Wave",
            impressions_range="100,000 – 1,000,000+ FYP Feed",
            gate_metric_name="Cross-Cohort Virality Quotient",
            gate_target_threshold=68.0,
            gate_actual_value=stage3_val,
            passed=stage3_pass,
            verdict_reason="Universal resonance breached niche boundaries into main algorithmic FYP."
            if stage3_pass
            else "Audience agreement tapered off before reaching macro-scale FYP syndication.",
        )

        score = round((hook_pct * 0.40) + (retention_pct * 0.30) + (share_pct * 0.20) + (engagement_pct * 0.10), 1)
        score = max(5.0, min(100.0, score))

        if stage3_pass:
            reach = "Macro-Viral FYP Breakout"
            impressions = "250,000 – 1,200,000+ Views"
        elif stage2_pass:
            reach = "Sub-Network Propagation"
            impressions = "15,000 – 75,000 Views"
        elif stage1_pass:
            reach = "Initial Seed Distribution"
            impressions = "800 – 3,500 Views"
        else:
            reach = "Cold-Start Drop (<500 Views)"
            impressions = "150 – 450 Views (Halting Triggered)"

        return PlatformAlgorithmEvaluation(
            platform="tiktok",
            algorithm_name="TikTok For You Algorithm (Monolith Engine)",
            codename="TT-MONOLITH-V25",
            archetype="Sub-second Pattern Interrupt & Loop Multiplier",
            overall_compatibility_score=score,
            predicted_reach_tier=reach,
            projected_impressions_estimate=impressions,
            cohort_stages=[stage1, stage2, stage3],
            ranking_weights={
                "0-3s_hook": 0.40,
                "watch_through_loop": 0.30,
                "share_dm_velocity": 0.20,
                "comment_dwell": 0.10,
            },
            detected_boosts=boosts,
            detected_penalties=penalties,
            primary_actionable_fix="Front-load bold visual contrast in the first 1.2 seconds and build a cyclical re-watch hook.",
        )

    # -------------------------------------------------------------------------
    # 2. INSTAGRAM REELS GRAPH ENGINE
    # -------------------------------------------------------------------------
    def _evaluate_instagram(
        self,
        caption: str,
        transcript: str,
        hook_pct: float,
        retention_pct: float,
        share_pct: float,
        engagement_pct: float,
    ) -> PlatformAlgorithmEvaluation:
        full_text = f"{caption} {transcript}".lower()
        boosts: List[AlgorithmBoost] = []
        penalties: List[AlgorithmPenalty] = []

        has_save_cta = any(kw in full_text for kw in ["save this", "bookmark", "save for later", "cheat sheet", "template"])
        has_share_relatability = any(kw in full_text for kw in ["send to a friend", "tag someone", "share this with", "who else does this"])
        has_watermark_mention = any(kw in full_text for kw in ["tiktok", "capcut", "watermark", "reposted from"])

        if has_share_relatability:
            boosts.append(
                AlgorithmBoost(
                    boost_id="ig_dm_sends",
                    label="Direct Message (DM) Share Magnetism",
                    multiplier_factor="Highest Algorithmic Weight (#1 Signal)",
                    rationale="Instagram engineering prioritizes Sends-per-Reach via DM as the primary catalyst for Explore distribution.",
                )
            )
            share_pct = min(100.0, share_pct + 18.0)

        if has_save_cta:
            boosts.append(
                AlgorithmBoost(
                    boost_id="ig_save_utility",
                    label="Save & Bookmark High Utility",
                    multiplier_factor="+20% Explore Cluster Affinity",
                    rationale="Saves signal enduring reference value, triggering broader recommendation outside followers.",
                )
            )
            engagement_pct = min(100.0, engagement_pct + 12.0)

        if has_watermark_mention:
            penalties.append(
                AlgorithmPenalty(
                    penalty_id="ig_watermark_penalty",
                    label="Third-Party Watermark / Cross-Post Artifacts",
                    severity="critical",
                    impact="-70% Non-Follower Reach Suppression",
                    rationale="Instagram Reels explicitly demotes videos containing third-party watermarks or logos.",
                )
            )
            share_pct = max(10.0, share_pct - 30.0)

        # Stage 1: Warm Follower & Close Network Seed (100-300 Views)
        stage1_val = round((share_pct * 0.5) + (engagement_pct * 0.5), 1)
        stage1_pass = stage1_val >= 50.0
        stage1 = CohortStage(
            stage_number=1,
            stage_name="Stage 1: Warm Graph & DM Velocity",
            impressions_range="100 – 400 Seed Viewers",
            gate_metric_name="DM Send & Save Ratio",
            gate_target_threshold=50.0,
            gate_actual_value=stage1_val,
            passed=stage1_pass,
            verdict_reason="Strong DM forwarding ratio among initial viewers unlocked Explore testing."
            if stage1_pass
            else "Low DM shares confined specimen strictly to immediate followers.",
        )

        # Stage 2: Explore Tab Vector Clustering (1k-20k Views)
        stage2_val = round((share_pct * 0.45) + (retention_pct * 0.35) + (hook_pct * 0.20), 1)
        stage2_pass = stage1_pass and stage2_val >= 58.0
        stage2 = CohortStage(
            stage_number=2,
            stage_name="Stage 2: Explore Page Affinity Clusters",
            impressions_range="2,000 – 25,000 Explore Impressions",
            gate_metric_name="Topic Cluster Engagement Velocity",
            gate_target_threshold=58.0,
            gate_actual_value=stage2_val,
            passed=stage2_pass,
            verdict_reason="Algorithm successfully mapped content to targeted topic interest graphs."
            if stage2_pass
            else "Insufficient watch retention to breach secondary topic clusters.",
        )

        # Stage 3: Non-Follower Reels Feed Breakout (50k-500k+ Views)
        stage3_val = round((share_pct * 0.5) + (retention_pct * 0.3) + (engagement_pct * 0.2), 1)
        stage3_pass = stage2_pass and stage3_val >= 68.0
        stage3 = CohortStage(
            stage_number=3,
            stage_name="Stage 3: Macro Reels Feed Syndication",
            impressions_range="50,000 – 500,000+ Non-Follower Feed",
            gate_metric_name="Non-Follower Affinity Multiplier",
            gate_target_threshold=68.0,
            gate_actual_value=stage3_val,
            passed=stage3_pass,
            verdict_reason="High Sends-to-Reach ratio triggered sitewide Reels feed injection."
            if stage3_pass
            else "Growth plateaued within initial topic clusters.",
        )

        score = round((share_pct * 0.45) + (engagement_pct * 0.25) + (retention_pct * 0.20) + (hook_pct * 0.10), 1)
        score = max(5.0, min(100.0, score))

        if stage3_pass:
            reach = "Explore & Reels Viral Breakout"
            impressions = "120,000 – 600,000+ Views"
        elif stage2_pass:
            reach = "Explore Cluster Promotion"
            impressions = "10,000 – 45,000 Views"
        elif stage1_pass:
            reach = "Follower + Early Explore Seed"
            impressions = "800 – 3,000 Views"
        else:
            reach = "Follower-Confined Reach (<500)"
            impressions = "150 – 500 Views"

        return PlatformAlgorithmEvaluation(
            platform="instagram",
            algorithm_name="Instagram Reels Explore Graph",
            codename="IG-EXPLORE-GRAPH-V4",
            archetype="Sends-per-Reach & Bookmark Utility Architecture",
            overall_compatibility_score=score,
            predicted_reach_tier=reach,
            projected_impressions_estimate=impressions,
            cohort_stages=[stage1, stage2, stage3],
            ranking_weights={
                "direct_message_shares": 0.45,
                "saves_bookmarks": 0.25,
                "watch_retention": 0.20,
                "likes_follows": 0.10,
            },
            detected_boosts=boosts,
            detected_penalties=penalties,
            primary_actionable_fix="Frame actionable insight as a 'sendable' reference sheet that peers DM to each other.",
        )

    # -------------------------------------------------------------------------
    # 3. YOUTUBE SHORTS 2-TOWER ENGINE
    # -------------------------------------------------------------------------
    def _evaluate_youtube(
        self,
        caption: str,
        transcript: str,
        hook_pct: float,
        retention_pct: float,
        share_pct: float,
        engagement_pct: float,
    ) -> PlatformAlgorithmEvaluation:
        full_text = f"{caption} {transcript}".lower()
        boosts: List[AlgorithmBoost] = []
        penalties: List[AlgorithmPenalty] = []

        has_seamless_loop = any(kw in full_text for kw in ["how to", "secret", "reveal", "loop", "reason why", "part 1"])
        has_sub_hook = any(kw in full_text for kw in ["subscribe", "follow for more", "daily tips", "join"])

        if has_seamless_loop:
            boosts.append(
                AlgorithmBoost(
                    boost_id="yt_apv_loop",
                    label="High APV (>100% Loop Potential)",
                    multiplier_factor="+30% Browse Shelf Rank",
                    rationale="YouTube Short shelf algorithms promote videos with Average Percentage Viewed (APV) exceeding 90-100%.",
                )
            )
            retention_pct = min(100.0, retention_pct + 14.0)

        if has_sub_hook:
            boosts.append(
                AlgorithmBoost(
                    boost_id="yt_sub_conversion",
                    label="Subscriber Conversion Trigger",
                    multiplier_factor="3.5x Suggested Shelf Multiplier",
                    rationale="In-player subscriber additions signal extreme satisfaction, boosting YouTube recommendation velocity.",
                )
            )
            engagement_pct = min(100.0, engagement_pct + 10.0)

        # Stage 1: Shelf Impression Test (500-1,000 Impressions)
        vvsa_val = round(hook_pct * 1.05, 1)  # Viewed vs Swiped Away
        stage1_pass = vvsa_val >= 72.0
        stage1 = CohortStage(
            stage_number=1,
            stage_name="Stage 1: Shorts Shelf Swipe-Away Test",
            impressions_range="500 – 1,000 Initial Shelf Tests",
            gate_metric_name="Viewed vs Swiped Away (VVSA)",
            gate_target_threshold=72.0,
            gate_actual_value=min(100.0, vvsa_val),
            passed=stage1_pass,
            verdict_reason="Surpassed 72% VVSA threshold; viewers stopped swiping to watch."
            if stage1_pass
            else "VVSA fell below 72%. High swipe-away rate halted recommendation to Shorts shelf.",
        )

        # Stage 2: APV & Re-Watch Depth Gate (5k-50k Views)
        apv_val = round(retention_pct * 1.15, 1)
        stage2_pass = stage1_pass and apv_val >= 85.0
        stage2 = CohortStage(
            stage_number=2,
            stage_name="Stage 2: Average % Viewed & Satisfaction",
            impressions_range="5,000 – 50,000 Browse Impressions",
            gate_metric_name="Average Percentage Viewed (APV)",
            gate_target_threshold=85.0,
            gate_actual_value=min(130.0, apv_val),
            passed=stage2_pass,
            verdict_reason="APV exceeded 85%, indicating high retention and repeat viewing."
            if stage2_pass
            else "Audience drop-off midway through Short reduced satisfaction index.",
        )

        # Stage 3: Long-Tail Browse & Suggested Feed (100k+ Views)
        stage3_val = round((retention_pct * 0.45) + (engagement_pct * 0.35) + (share_pct * 0.20), 1)
        stage3_pass = stage2_pass and stage3_val >= 68.0
        stage3 = CohortStage(
            stage_number=3,
            stage_name="Stage 3: Long-Tail Suggested Shelf Syndication",
            impressions_range="100,000 – 1,000,000+ Evergreen Shelf",
            gate_metric_name="Long-Tail Satisfaction Index",
            gate_target_threshold=68.0,
            gate_actual_value=stage3_val,
            passed=stage3_pass,
            verdict_reason="High subscriber conversion and like ratio unlocked persistent evergreen recommendation."
            if stage3_pass
            else "Satisfied initial cohort but failed to convert into evergreen suggested video.",
        )

        score = round((hook_pct * 0.40) + (retention_pct * 0.35) + (engagement_pct * 0.15) + (share_pct * 0.10), 1)
        score = max(5.0, min(100.0, score))

        if stage3_pass:
            reach = "Evergreen Shorts Shelf Breakout"
            impressions = "200,000 – 1,500,000+ Views"
        elif stage2_pass:
            reach = "Browse & Suggested Promotion"
            impressions = "15,000 – 80,000 Views"
        elif stage1_pass:
            reach = "Initial Shelf Sampling"
            impressions = "1,200 – 6,000 Views"
        else:
            reach = "Early Shelf Drop (<600)"
            impressions = "200 – 600 Views (Swiped Away)"

        return PlatformAlgorithmEvaluation(
            platform="youtube",
            algorithm_name="YouTube Shorts 2-Tower & Satisfaction Engine",
            codename="YT-SHORTS-SHELF-V2",
            archetype="Viewed vs Swiped (VVSA) & Loop APV Maximizer",
            overall_compatibility_score=score,
            predicted_reach_tier=reach,
            projected_impressions_estimate=impressions,
            cohort_stages=[stage1, stage2, stage3],
            ranking_weights={
                "viewed_vs_swiped": 0.40,
                "average_pct_viewed": 0.35,
                "subscriber_conversion": 0.15,
                "engagement_likes": 0.10,
            },
            detected_boosts=boosts,
            detected_penalties=penalties,
            primary_actionable_fix="Eliminate any opening preamble; craft a seamless transition between the ending and opening hook.",
        )

    # -------------------------------------------------------------------------
    # 4. X (TWITTER) OPEN-SOURCE HEAVY RANKER
    # -------------------------------------------------------------------------
    def _evaluate_x(
        self,
        caption: str,
        transcript: str,
        hook_pct: float,
        retention_pct: float,
        share_pct: float,
        engagement_pct: float,
    ) -> PlatformAlgorithmEvaluation:
        full_text = f"{caption} {transcript}".lower()
        boosts: List[AlgorithmBoost] = []
        penalties: List[AlgorithmPenalty] = []

        has_outbound_link = bool(re.search(r"https?://|www\.|\.com|\.ai|\.io", full_text))
        has_question_prompt = "?" in full_text or any(kw in full_text for kw in ["what do you think", "agree or disagree", "hot take", "unpopular opinion"])
        has_numbered_breakdown = bool(re.search(r"\b[1-9]\b|\b[1-9]\.", full_text)) or "thread" in full_text

        if has_question_prompt:
            boosts.append(
                AlgorithmBoost(
                    boost_id="x_author_reply",
                    label="High Reply & Conversation Velocity",
                    multiplier_factor="+75.0x Open-Source Heavy Ranker Boost",
                    rationale="X's open-source algorithm awards its massive +75.0 to +150.0 score weight to tweets prompting active author-audience replies.",
                )
            )
            engagement_pct = min(100.0, engagement_pct + 22.0)

        if has_numbered_breakdown:
            boosts.append(
                AlgorithmBoost(
                    boost_id="x_bookmark_rate",
                    label="High Bookmark / Save Density",
                    multiplier_factor="+10.0x Heavy Ranker Weight",
                    rationale="Structured frameworks and insights drive bookmarks, which X weights 10x higher than standard likes.",
                )
            )
            share_pct = min(100.0, share_pct + 12.0)

        if has_outbound_link:
            penalties.append(
                AlgorithmPenalty(
                    penalty_id="x_outbound_link",
                    label="Outbound Link in Main Post Body",
                    severity="critical",
                    impact="-50% Algorithmic Distribution Throttle",
                    rationale="X demotes posts driving traffic off-platform unless posted as a self-reply or accompanied by high native dwell time.",
                )
            )
            share_pct = max(10.0, share_pct - 25.0)

        # Stage 1: In-Network Affinity Test (Followers & Close Graph)
        stage1_val = round((engagement_pct * 0.5) + (share_pct * 0.5), 1)
        stage1_pass = stage1_val >= 50.0
        stage1 = CohortStage(
            stage_number=1,
            stage_name="Stage 1: In-Network Graph Sampling",
            impressions_range="200 – 1,500 In-Network Impressions",
            gate_metric_name="Reply Density & Conversation Index",
            gate_target_threshold=50.0,
            gate_actual_value=stage1_val,
            passed=stage1_pass,
            verdict_reason="Generated immediate conversation and repost activity in primary network."
            if stage1_pass
            else "Low initial reply rate confined post to existing immediate circle.",
        )

        # Stage 2: Out-of-Network Heavy Ranker Scoring (5k-50k Impressions)
        stage2_val = round((engagement_pct * 0.45) + (share_pct * 0.35) + (hook_pct * 0.20), 1)
        stage2_pass = stage1_pass and stage2_val >= 58.0
        stage2 = CohortStage(
            stage_number=2,
            stage_name="Stage 2: Out-of-Network 'For You' Feed",
            impressions_range="5,000 – 50,000 For You Impressions",
            gate_metric_name="Heavy Ranker Composite Probability",
            gate_target_threshold=58.0,
            gate_actual_value=stage2_val,
            passed=stage2_pass,
            verdict_reason="Passed Heavy Ranker threshold, expanding out-of-network to related interest clusters."
            if stage2_pass
            else "Insufficient quote or bookmark velocity to sustain out-of-network recommendation.",
        )

        # Stage 3: Sitewide Topic & Trend Broadcast (100k+ Impressions)
        stage3_val = round((share_pct * 0.50) + (engagement_pct * 0.30) + (retention_pct * 0.20), 1)
        stage3_pass = stage2_pass and stage3_val >= 68.0
        stage3 = CohortStage(
            stage_number=3,
            stage_name="Stage 3: Trending Topic & Macro Syndication",
            impressions_range="100,000 – 1,000,000+ Macro Impressions",
            gate_metric_name="Viral Network Diffusion Coefficient",
            gate_target_threshold=68.0,
            gate_actual_value=stage3_val,
            passed=stage3_pass,
            verdict_reason="Cascading quote-tweets and bookmark cascades triggered widespread viral distribution."
            if stage3_pass
            else "Thread debate reached natural plateau without triggering global timeline breakout.",
        )

        score = round((engagement_pct * 0.40) + (share_pct * 0.30) + (hook_pct * 0.20) + (retention_pct * 0.10), 1)
        score = max(5.0, min(100.0, score))

        if stage3_pass:
            reach = "Macro 'For You' Timeline Breakout"
            impressions = "150,000 – 850,000+ Impressions"
        elif stage2_pass:
            reach = "Out-of-Network For You Feed"
            impressions = "12,000 – 60,000 Impressions"
        elif stage1_pass:
            reach = "In-Network Follower Propagation"
            impressions = "1,500 – 6,000 Impressions"
        else:
            reach = "Low-Engagement Containment (<500)"
            impressions = "200 – 500 Impressions"

        return PlatformAlgorithmEvaluation(
            platform="x",
            algorithm_name="X (Twitter) For You Neural Heavy Ranker",
            codename="X-HEAVY-RANK-2025",
            archetype="Conversation Multiplier & Open-Source Heavy Ranker",
            overall_compatibility_score=score,
            predicted_reach_tier=reach,
            projected_impressions_estimate=impressions,
            cohort_stages=[stage1, stage2, stage3],
            ranking_weights={
                "reply_conversation_density": 0.40,
                "reposts_quote_velocity": 0.30,
                "bookmark_save_rate": 0.20,
                "dwell_media_expand": 0.10,
            },
            detected_boosts=boosts,
            detected_penalties=penalties,
            primary_actionable_fix="Frame a strong, debatable thesis question that invites opinionated public replies and author discussion.",
        )

    # -------------------------------------------------------------------------
    # 5. LINKEDIN DWELL & KNOWLEDGE ENGINE
    # -------------------------------------------------------------------------
    def _evaluate_linkedin(
        self,
        caption: str,
        transcript: str,
        hook_pct: float,
        retention_pct: float,
        share_pct: float,
        engagement_pct: float,
    ) -> PlatformAlgorithmEvaluation:
        full_text = f"{caption} {transcript}".lower()
        boosts: List[AlgorithmBoost] = []
        penalties: List[AlgorithmPenalty] = []

        has_outbound_link = bool(re.search(r"https?://|www\.|\.com|\.ai|\.io", full_text))
        has_framework = any(kw in full_text for kw in ["framework", "playbook", "system", "lessons", "step 1", "key takeaways", "breakdown"])
        has_excessive_hashtags = len(re.findall(r"#\w+", full_text)) > 5

        if has_framework:
            boosts.append(
                AlgorithmBoost(
                    boost_id="li_dwell_framework",
                    label="High Dwell Time Framework Structure",
                    multiplier_factor="+35% Knowledge Feed Distribution",
                    rationale="LinkedIn's dwell-time algorithm measures seconds spent reading; structured lists increase dwell time over 12s.",
                )
            )
            retention_pct = min(100.0, retention_pct + 18.0)

        if has_outbound_link:
            penalties.append(
                AlgorithmPenalty(
                    penalty_id="li_link_in_post",
                    label="Outbound Link in Main Post Body",
                    severity="critical",
                    impact="-40% Organic Feed Downranking",
                    rationale="LinkedIn severely downranks posts with external links in the body to keep professionals on-platform (use 'Link in comments').",
                )
            )
            share_pct = max(10.0, share_pct - 25.0)

        if has_excessive_hashtags:
            penalties.append(
                AlgorithmPenalty(
                    penalty_id="li_hashtag_spam",
                    label="Excessive Hashtags (>5 Detected)",
                    severity="moderate",
                    impact="-15% Quality Score Penalty",
                    rationale="LinkedIn's spam classifier downranks posts stuffing more than 3-5 hashtags.",
                )
            )
            engagement_pct = max(10.0, engagement_pct - 15.0)

        # Stage 1: Golden Hour 1st-Degree Network Test (60 mins)
        stage1_val = round((engagement_pct * 0.5) + (retention_pct * 0.5), 1)
        stage1_pass = stage1_val >= 52.0
        stage1 = CohortStage(
            stage_number=1,
            stage_name="Stage 1: Golden Hour 1st-Degree Test",
            impressions_range="300 – 1,000 1st-Degree Connections",
            gate_metric_name="Meaningful Commentary Velocity (>15 words)",
            gate_target_threshold=52.0,
            gate_actual_value=stage1_val,
            passed=stage1_pass,
            verdict_reason="Substantive comments in the first 60 minutes unlocked 2nd-degree syndication."
            if stage1_pass
            else "Slow initial response or shallow comments restricted post to immediate connections.",
        )

        # Stage 2: 2nd & 3rd-Degree Industry Feed Rollout (5k-25k Impressions)
        stage2_val = round((retention_pct * 0.45) + (share_pct * 0.35) + (engagement_pct * 0.20), 1)
        stage2_pass = stage1_pass and stage2_val >= 58.0
        stage2 = CohortStage(
            stage_number=2,
            stage_name="Stage 2: 2nd/3rd-Degree Industry Feed",
            impressions_range="3,000 – 25,000 Industry Professionals",
            gate_metric_name="Professional Dwell & Repost Multiplier",
            gate_target_threshold=58.0,
            gate_actual_value=stage2_val,
            passed=stage2_pass,
            verdict_reason="High reading dwell time triggered cross-company industry broadcast."
            if stage2_pass
            else "Dwell time fell below 8-second threshold, slowing wider distribution.",
        )

        # Stage 3: Knowledge Feed & Top Voice Feature (50k-250k+ Impressions)
        stage3_val = round((retention_pct * 0.45) + (share_pct * 0.35) + (hook_pct * 0.20), 1)
        stage3_pass = stage2_pass and stage3_val >= 68.0
        stage3 = CohortStage(
            stage_number=3,
            stage_name="Stage 3: Editorial Knowledge Feed Syndication",
            impressions_range="50,000 – 300,000+ Sitewide Feed",
            gate_metric_name="High-Value Creator Knowledge Score",
            gate_target_threshold=68.0,
            gate_actual_value=stage3_val,
            passed=stage3_pass,
            verdict_reason="Flagged as high-signal professional knowledge, earning broad timeline distribution."
            if stage3_pass
            else "Reached solid industry engagement without triggering platform-wide editorial promotion.",
        )

        score = round((engagement_pct * 0.45) + (retention_pct * 0.30) + (share_pct * 0.15) + (hook_pct * 0.10), 1)
        score = max(5.0, min(100.0, score))

        if stage3_pass:
            reach = "Knowledge Feed Sitewide Breakout"
            impressions = "60,000 – 350,000+ Impressions"
        elif stage2_pass:
            reach = "2nd & 3rd-Degree Network Syndication"
            impressions = "8,000 – 35,000 Impressions"
        elif stage1_pass:
            reach = "1st-Degree Connection Promotion"
            impressions = "1,000 – 4,500 Impressions"
        else:
            reach = "Limited Feed Sampling (<500)"
            impressions = "250 – 600 Impressions"

        return PlatformAlgorithmEvaluation(
            platform="linkedin",
            algorithm_name="LinkedIn Professional Knowledge & Dwell Engine",
            codename="LI-KNOWLEDGE-FEED-V2",
            archetype="Dwell-Time Maximization & Substantive Dialogue Graph",
            overall_compatibility_score=score,
            predicted_reach_tier=reach,
            projected_impressions_estimate=impressions,
            cohort_stages=[stage1, stage2, stage3],
            ranking_weights={
                "meaningful_commentary": 0.45,
                "reading_dwell_time": 0.30,
                "repost_with_thought": 0.15,
                "profile_connections": 0.10,
            },
            detected_boosts=boosts,
            detected_penalties=penalties,
            primary_actionable_fix="Remove any outbound link from the main text into comments; format as clear bullet points with concrete metrics.",
        )
