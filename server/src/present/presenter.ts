/* ============================================================================
   Optional AI formatting layer  (User → KB → Spoiler Filter → UI → [here])

   This is the LAST layer and it is deliberately the weakest: it may only
   RE-PRESENT content the Spoiler Shield has already approved. The invariant
   that makes "AI can't spoil you" a compile-time guarantee:

     every method takes a *Dto (already spoiler-filtered) — never a *Record.

   So a presenter is structurally incapable of seeing unreleased content, and
   must never originate a fact or decide a spoiler boundary. The default is the
   identity presenter (returns approved text verbatim). An AI implementation
   would implement this same interface and may ONLY reword the strings already
   present on the DTO.
   ============================================================================ */
import type { ArcDto, CharacterDto, MilestoneDto } from "@arcahead/shared";

export interface Presenter {
  arc(dto: ArcDto): ArcDto;
  character(dto: CharacterDto): CharacterDto;
  milestone(dto: MilestoneDto): MilestoneDto;
}

/** Identity presenter — the safe baseline. Returns KB-approved text unchanged. */
export const passthroughPresenter: Presenter = {
  arc: (d) => d,
  character: (d) => d,
  milestone: (d) => d,
};

/**
 * Selects the active presenter. Passthrough by default.
 *
 * To enable an AI presenter later, implement `Presenter` with a constrained
 * model call (a small Claude model such as `claude-haiku-4-5` is a good fit) and
 * return it here behind an env flag — e.g.:
 *
 *   if (process.env.AI_PRESENTER === "claude") return claudePresenter;
 *
 * The model prompt must be "rephrase ONLY the text provided; add nothing." It
 * receives the DTO, which already contains exclusively spoiler-safe content.
 */
export function getPresenter(): Presenter {
  return passthroughPresenter;
}
