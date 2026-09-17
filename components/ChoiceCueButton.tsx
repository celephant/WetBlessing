"use client";

type ChoiceCueButtonFaceProps = {
  choice: string;
  cue: string | null;
};

/** Inner face of one Option: Decision › Promise. Never a second button. */
export function ChoiceCueFace({ choice, cue }: ChoiceCueButtonFaceProps) {
  return (
    <span className={`choice-cue-row choice-chain-row${cue ? "" : " is-solo"}`}>
      <span className="choice-bark font-ui" data-choice-bark="">
        {choice}
      </span>
      {cue ? (
        <>
          <span
            className="choice-connector"
            data-choice-connector=""
            aria-hidden="true"
          >
            ›
          </span>
          <span
            className="choice-cue choice-hint"
            data-choice-cue=""
            data-choice-hint=""
          >
            {cue}
          </span>
        </>
      ) : null}
    </span>
  );
}
