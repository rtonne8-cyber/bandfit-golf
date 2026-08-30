import type { Exercise, PhaseId, Prescription, SessionType, WorkoutTemplate } from "./types";

export const BAND_LEVELS = ["Light", "Medium", "Heavy", "X-heavy"];

export const PHASES: { id: PhaseId; weeks: string; name: string; intent: string }[] = [
  { id: "foundation", weeks: "1-2", name: "Foundation", intent: "Technique, control and movement quality" },
  { id: "build", weeks: "3-5", name: "Build", intent: "Add band tension or harder variations" },
  { id: "performance", weeks: "6-8", name: "Performance", intent: "Keep strength high and make power work faster" }
];

export const EXERCISES: Exercise[] = [
  ex("bw-squat", "Bodyweight squat", "Squat", "Bodyweight", "Free-standing", "Warm-up", "Knees track over toes; stand tall at the top."),
  ex("hip-hinge", "Hip hinge", "Hinge", "Bodyweight", "Free-standing", "Warm-up", "Push hips back and keep the spine long."),
  ex("lunge-rotation", "Reverse lunge with rotation", "Lunge / rotation", "Bodyweight", "Free-standing", "Warm-up", "Rotate toward the front leg without rushing."),
  ex("band-pull-apart", "Band pull-apart", "Posture pull", "Resistance band", "No anchor", "Warm-up", "Keep shoulders low and squeeze shoulder blades back."),
  ex("wgs", "World's greatest stretch", "Mobility", "Bodyweight", "Floor", "Mobility", "Long lunge, rotate through the upper back."),
  ex("t-spine-rotation", "Thoracic rotations", "T-spine mobility", "Bodyweight", "Floor", "Mobility", "Move through the ribs, not the lower back."),
  ex("fast-hip-rotation", "Fast hip rotations", "Hip speed", "Bodyweight", "Free-standing", "Power prep", "Turn the hips quickly while staying balanced."),
  ex("split-stance-rotation", "Split-stance torso rotations", "Rotation", "Bodyweight", "Free-standing", "Power prep", "Feet planted, tall posture, smooth turn."),
  ex("band-squat", "Banded squat", "Squat", "Resistance band", "Stand on band", "Strength", "Last reps should be hard while depth stays clean."),
  ex("band-row", "Door-anchor band row", "Pull", "Band + door anchor", "Anchor at chest height", "Strength", "Pull elbows back, pause tall, return slowly."),
  ex("band-rdl", "Banded Romanian deadlift", "Hinge", "Resistance band", "Stand on band", "Strength", "Hinge from the hips and finish with glutes."),
  ex("push-up", "Push-up", "Push", "Bodyweight", "Floor or incline", "Strength", "Use an incline if full reps break shape."),
  ex("bulgarian-split-squat", "Bulgarian split squat", "Single-leg squat", "Bodyweight or band", "Rear foot elevated", "Stability strength", "Lower under control and own the bottom."),
  ex("hk-band-press", "Half-kneeling single-arm band press", "Push / anti-rotation", "Band + door anchor", "Anchor at chest height", "Stability strength", "Glute on, ribs down, press without twisting."),
  ex("pallof-press", "Pallof press", "Anti-rotation", "Band + door anchor", "Anchor at chest height", "Core stability", "Press straight out and resist the band."),
  ex("single-leg-reach", "Single-leg balance with reach", "Balance", "Bodyweight", "Free-standing", "Stability", "Reach only as far as you can return cleanly."),
  ex("dead-bug", "Dead bug", "Anti-extension", "Bodyweight", "Floor", "Core stability", "Keep the lower back heavy and breathe."),
  ex("squat-calf-raise", "Squat to calf raise", "Conditioning", "Bodyweight", "Free-standing", "HIIT", "Move crisply and land softly."),
  ex("reverse-lunge", "Reverse lunge", "Single-leg squat", "Bodyweight or band", "Free-standing", "Strength / HIIT", "Step back softly; drive up through front leg."),
  ex("band-rotational-press", "Band rotational press", "Rotation", "Band + door anchor", "Anchor at chest height", "HIIT", "Turn from the ground up and return under control."),
  ex("mountain-climber", "Mountain climber", "Core conditioning", "Bodyweight", "High plank", "HIIT", "Fast legs, quiet hips."),
  ex("hip-9090", "90/90 hip switches", "Hip mobility", "Bodyweight", "Floor", "Mobility", "Rotate smoothly and use hands only as needed."),
  ex("hip-flexor-reach", "Hip flexor stretch with reach", "Hip mobility", "Bodyweight", "Half-kneeling", "Mobility", "Squeeze rear glute and breathe."),
  ex("hamstring-stretch", "Hamstring stretch", "Posterior mobility", "Bodyweight", "Floor or standing", "Mobility", "Ease into range without forcing it."),
  ex("open-book", "Open-book thoracic rotation", "T-spine mobility", "Bodyweight", "Floor", "Mobility", "Knees stacked; follow hand with eyes."),
  ex("childs-side-reach", "Child's pose with side reach", "Lat mobility", "Bodyweight", "Floor", "Mobility", "Reach long and breathe into the side body."),
  ex("doorway-chest-stretch", "Doorway chest stretch", "Shoulder mobility", "Bodyweight", "Doorway", "Mobility", "Step through gently with ribs down."),
  ex("deep-squat-hold", "Deep squat hold", "Hip / ankle mobility", "Bodyweight", "Free-standing", "Mobility", "Use support if needed; keep heels grounded where possible."),
  ex("band-deadlift", "Banded deadlift", "Hinge", "Resistance band", "Stand on band", "Strength", "Push the floor away and finish tall."),
  ex("band-lat-pulldown", "Door-anchor lat pulldown", "Pull", "Band + door anchor", "Anchor high", "Strength", "Pull elbows down to ribs and control the return."),
  ex("band-chest-press", "Banded chest press", "Push", "Band + door anchor", "Anchor behind at chest height", "Strength", "Press without flaring ribs."),
  ex("sl-rdl", "Single-leg Romanian deadlift", "Single-leg hinge", "Bodyweight or band", "Free-standing", "Strength / stability", "Hips square, soft knee, regain balance each rep."),
  ex("sa-band-row", "Single-arm band row", "Pull / anti-rotation", "Band + door anchor", "Anchor at chest height", "Strength / stability", "Row without rotating."),
  ex("fast-band-rotation", "Fast band rotation", "Rotation power", "Band + door anchor", "Anchor waist to chest height", "Golf power", "Rotate fast, stop clean, return slowly."),
  ex("rotational-band-punch", "Split-stance rotational band punch", "Rotation power", "Band + door anchor", "Anchor at chest height", "Golf power", "Drive ground to leg to hip to torso to arm."),
  ex("band-downswing", "Banded golf downswing", "Rotation power", "Band + door anchor", "Anchor high and behind", "Golf power", "Fast downswing pattern with a controlled return."),
  ex("lateral-bound-stick", "Lateral bound and stick", "Frontal power", "Bodyweight", "Free-standing", "Golf power", "Jump sideways, land softly, hold two seconds."),
  ex("side-plank", "Side plank", "Anti-lateral", "Bodyweight", "Floor", "Core stability", "Hips lifted and stacked."),
  ex("bird-dog", "Bird dog", "Anti-rotation", "Bodyweight", "Floor", "Core stability", "Reach opposite limbs without hip rotation."),
  ex("glute-bridge-march", "Glute bridge march", "Hinge / anti-rotation", "Bodyweight", "Floor", "Core stability", "Keep hips level as each knee lifts.")
];

export const WORKOUTS: WorkoutTemplate[] = [
  workout("A", "Workout A", "Strength + stability", "40-45 min", "Moderate", {
    foundation: [
      ...warmupA(),
      rx("a-band-squat", "band-squat", "Strength", 2, "10-15 reps", 15, "reps", "6-7", 60),
      rx("a-band-row", "band-row", "Strength", 2, "10-15 reps", 15, "reps", "6-7", 60),
      rx("a-band-rdl", "band-rdl", "Strength", 2, "10-15 reps", 15, "reps", "6-7", 60),
      rx("a-push-up", "push-up", "Strength", 2, "8-15 reps", 15, "reps", "6-7", 60),
      rx("a-bulgarian", "bulgarian-split-squat", "Strength", 2, "8-12 each leg", 12, "reps", "7", 75),
      rx("a-hk-press", "hk-band-press", "Strength", 2, "8-12 each arm", 12, "reps", "7", 75),
      ...stabilityA(2)
    ],
    build: [
      ...warmupA(),
      rx("a-band-squat", "band-squat", "Strength", 3, "10-15 reps", 15, "reps", "7-8", 60),
      rx("a-band-row", "band-row", "Strength", 3, "10-15 reps", 15, "reps", "7-8", 60),
      rx("a-band-rdl", "band-rdl", "Strength", 3, "10-15 reps", 15, "reps", "7-8", 60),
      rx("a-push-up", "push-up", "Strength", 3, "8-15 reps", 15, "reps", "7-8", 60),
      rx("a-bulgarian", "bulgarian-split-squat", "Strength", 3, "8-12 each leg", 12, "reps", "7-8", 75),
      rx("a-hk-press", "hk-band-press", "Strength", 3, "8-12 each arm", 12, "reps", "7-8", 75),
      ...stabilityA(3)
    ],
    performance: [
      ...warmupA(),
      rx("a-band-squat", "band-squat", "Strength", 4, "8-12 reps", 12, "reps", "8", 75, "Use a stronger band before chasing high reps."),
      rx("a-band-row", "band-row", "Strength", 4, "8-12 reps", 12, "reps", "8", 75),
      rx("a-band-rdl", "band-rdl", "Strength", 4, "8-12 reps", 12, "reps", "8", 75),
      rx("a-push-up", "push-up", "Strength", 3, "8-15 reps", 15, "reps", "8", 60),
      rx("a-bulgarian", "bulgarian-split-squat", "Strength", 3, "8-12 each leg", 12, "reps", "8", 75),
      rx("a-hk-press", "hk-band-press", "Strength", 3, "8-12 each arm", 12, "reps", "8", 75),
      ...stabilityA(3)
    ]
  }),
  workout("B", "Workout B", "Full-body HIIT + mobility", "30-35 min", "High", {
    foundation: [...hiit("30 sec work / 30 sec rest", 3, 30), ...mobility()],
    build: [...hiit("30 sec work / 30 sec rest", 4, 30), ...mobility()],
    performance: [...hiit("35 sec work / 25 sec rest", 4, 35), ...mobility()]
  }),
  workout("C", "Workout C", "Strength, rotation + golf power", "40-45 min", "Moderate", {
    foundation: [...warmupC(), ...strengthC(2, "10-15 reps", "6-7"), ...powerC(2), ...finisherC(2)],
    build: [...warmupC(), ...strengthC(3, "8-12 reps", "7-8"), ...powerC(3), ...finisherC(2)],
    performance: [...warmupC(), ...strengthC(3, "8-12 reps", "8"), ...powerC(3), ...finisherC(2)]
  })
];

export function phaseForWeek(week: number): PhaseId {
  if (week <= 2) return "foundation";
  if (week <= 5) return "build";
  return "performance";
}

export function nextSessionType(completed: SessionType[]): SessionType {
  const order: SessionType[] = ["A", "B", "C"];
  if (completed.length === 0) return "A";
  return order[(order.indexOf(completed[completed.length - 1]) + 1) % order.length];
}

function ex(id: string, name: string, pattern: string, equipment: string, setup: string, focus: string, cues: string): Exercise {
  return {
    id,
    name,
    pattern,
    equipment,
    setup,
    focus,
    cues,
    description: `${name} supports the ${focus.toLowerCase()} part of the programme. Use it to build ${pattern.toLowerCase()} capacity that carries into a stronger, more stable golf swing.`,
    safety: equipment.includes("door anchor")
      ? "Check the anchor, close the door fully, and set the pull so the band draws the door into the frame where possible."
      : "Work through pain-free range only and stop the set when control or balance breaks.",
    substitution: equipment.includes("Band")
      ? "Use a lighter band, step closer to the anchor, or reduce range until the final reps are controlled."
      : "Use support, reduce range, or slow the tempo before choosing a harder variation.",
    videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} exercise form`)}`
  };
}

function workout(
  id: SessionType,
  title: string,
  emphasis: string,
  duration: string,
  intensity: "Moderate" | "High",
  prescriptions: Record<PhaseId, Prescription[]>
): WorkoutTemplate {
  return { id, title, emphasis, duration, intensity, prescriptions };
}

function rx(
  id: string,
  exerciseId: string,
  section: Prescription["section"],
  sets: number,
  target: string,
  targetMax: number | undefined,
  tracking: Prescription["tracking"],
  rpe: string | undefined,
  restSec: number,
  note?: string
): Prescription {
  return { id, exerciseId, section, sets, target, targetMax, tracking, rpe, restSec, note };
}

function warmupA(): Prescription[] {
  return [
    rx("wu-squat", "bw-squat", "Warm-up", 2, "10 reps", 10, "reps", undefined, 15),
    rx("wu-hinge", "hip-hinge", "Warm-up", 2, "10 reps", 10, "reps", undefined, 15),
    rx("wu-lunge-rotation", "lunge-rotation", "Warm-up", 2, "5 each side", 5, "reps", undefined, 15),
    rx("wu-pull-apart", "band-pull-apart", "Warm-up", 2, "12 reps", 12, "reps", undefined, 15),
    rx("wu-wgs", "wgs", "Warm-up", 2, "3 each side", 3, "reps", undefined, 15),
    rx("wu-tspine", "t-spine-rotation", "Warm-up", 2, "5 each side", 5, "reps", undefined, 15)
  ];
}

function warmupC(): Prescription[] {
  return [
    ...warmupA(),
    rx("wu-fast-hip", "fast-hip-rotation", "Warm-up", 1, "10 reps", 10, "reps", undefined, 15),
    rx("wu-split-rotation", "split-stance-rotation", "Warm-up", 1, "5 each side", 5, "reps", undefined, 15)
  ];
}

function stabilityA(rounds: number): Prescription[] {
  return [
    rx("a-pallof", "pallof-press", "Stability", rounds, "10 each side + 2 sec hold", 10, "reps", "7", 45),
    rx("a-balance-reach", "single-leg-reach", "Stability", rounds, "6 each side", 6, "reps", "6-7", 30),
    rx("a-dead-bug", "dead-bug", "Stability", rounds, "8 each side", 8, "reps", "6-7", 30)
  ];
}

function hiit(interval: string, rounds: number, seconds: number): Prescription[] {
  const note = `${rounds} rounds, ${interval}. Quality first.`;
  return [
    rx("b-squat-calf", "squat-calf-raise", "HIIT", rounds, `${seconds} sec`, seconds, "seconds", "8", 30, note),
    rx("b-row", "band-row", "HIIT", rounds, `${seconds} sec`, seconds, "seconds", "8", 30, note),
    rx("b-lunge", "reverse-lunge", "HIIT", rounds, `${seconds} sec`, seconds, "seconds", "8", 30, note),
    rx("b-push-up", "push-up", "HIIT", rounds, `${seconds} sec`, seconds, "seconds", "8", 30, note),
    rx("b-rotational-press", "band-rotational-press", "HIIT", rounds, `${seconds} sec alternating`, seconds, "seconds", "8", 30, note),
    rx("b-mountain", "mountain-climber", "HIIT", rounds, `${seconds} sec`, seconds, "seconds", "8", 30, note)
  ];
}

function mobility(): Prescription[] {
  return [
    rx("mob-9090", "hip-9090", "Mobility", 1, "8 each side", 8, "reps", undefined, 15),
    rx("mob-hip-flexor", "hip-flexor-reach", "Mobility", 1, "30 sec each side", 30, "seconds", undefined, 15),
    rx("mob-hamstring", "hamstring-stretch", "Mobility", 1, "30 sec each side", 30, "seconds", undefined, 15),
    rx("mob-open-book", "open-book", "Mobility", 1, "6 each side", 6, "reps", undefined, 15),
    rx("mob-childs", "childs-side-reach", "Mobility", 1, "30 sec each side", 30, "seconds", undefined, 15),
    rx("mob-doorway", "doorway-chest-stretch", "Mobility", 1, "30 sec each side", 30, "seconds", undefined, 15),
    rx("mob-squat-hold", "deep-squat-hold", "Mobility", 1, "30-45 sec", 45, "seconds", undefined, 15)
  ];
}

function strengthC(sets: number, repText: string, rpe: string): Prescription[] {
  const max = repText.includes("15") ? 15 : 12;
  return [
    rx("c-deadlift", "band-deadlift", "Strength", sets, repText, max, "reps", rpe, 75),
    rx("c-lat-pulldown", "band-lat-pulldown", "Strength", sets, "10-15 reps", 15, "reps", rpe, 75),
    rx("c-reverse-lunge", "reverse-lunge", "Strength", sets, "8-12 each leg", 12, "reps", rpe, 60),
    rx("c-chest-press", "band-chest-press", "Strength", sets, "10-15 reps", 15, "reps", rpe, 60),
    rx("c-sl-rdl", "sl-rdl", "Strength", sets, "8-10 each leg", 10, "reps", rpe, 60),
    rx("c-sa-row", "sa-band-row", "Strength", sets, "10-12 each side", 12, "reps", rpe, 60)
  ];
}

function powerC(sets: number): Prescription[] {
  return [
    rx("c-fast-rotation", "fast-band-rotation", "Power", sets, "6 each direction", 6, "reps", "fast, clean", 90, "Speed matters more than fatigue."),
    rx("c-rotational-punch", "rotational-band-punch", "Power", sets, "6 each side", 6, "reps", "fast, clean", 90),
    rx("c-downswing", "band-downswing", "Power", sets, "5 each side", 5, "reps", "fast, clean", 90),
    rx("c-lateral-bound", "lateral-bound-stick", "Power", sets, "5 each direction + 2 sec stick", 5, "reps", "clean landings", 90)
  ];
}

function finisherC(rounds: number): Prescription[] {
  return [
    rx("c-side-plank", "side-plank", "Finisher", rounds, "30 sec each side", 30, "seconds", undefined, 30),
    rx("c-pallof", "pallof-press", "Finisher", rounds, "10 each side", 10, "reps", "7", 30),
    rx("c-bird-dog", "bird-dog", "Finisher", rounds, "8 each side", 8, "reps", undefined, 30),
    rx("c-bridge-march", "glute-bridge-march", "Finisher", rounds, "10 each side", 10, "reps", undefined, 30)
  ];
}
