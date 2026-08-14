// The complete set of tracked interactions, per PLAN.md section 18.
//
// Every event carries at least one descriptive parameter so reports stay
// readable in GA4 without needing to cross-reference the codebase. Do not put
// personally identifying data here; mailing-list details belong in Kit.
export interface AnalyticsEventMap {
  /** Route view, sent manually because this is a single-page application. */
  page_view: { page_path: string; page_title: string }
  /** A release detail route was opened. */
  release_view: { release_slug: string; release_title: string }
  /** A track began playing. Fires once per track, not on pause/resume. */
  song_played: { track_slug: string; track_title: string }
  /** Outbound click to Spotify, Apple Music, or another streaming platform. */
  streaming_click: { platform: string; release_slug: string }
  /** Outbound click to YouTube or another video destination. */
  video_click: { platform: string; release_slug: string }
  /** Outbound click to an artist profile on a social platform. */
  social_click: { platform: string }
  /** Outbound click to a Fourthwall product or storefront. */
  merch_click: { provider_id: string; item_slug: string }
  /** Outbound click to a POSH or venue ticket page. */
  ticket_click: { provider_id: string; event_slug: string }
  /** Mailing-list signup confirmed inline. No submitted field values. */
  signup_success: { source: string }
  /** Tree Hugging game received its first hug of a run. */
  game_started: { target_score: number }
  /** Tree Hugging game reached the completed tree state. */
  game_completed: { final_score: number }
  /** Black Buddha surfaced a dialogue or the user opened him directly. */
  buddha_engaged: { dialogue_id: string; trigger: string }
}

export type AnalyticsEventName = keyof AnalyticsEventMap
