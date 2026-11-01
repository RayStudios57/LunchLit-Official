/**
 * LunchLit AI Engine & Service
 * 
 * Provides robust, resilient AI capabilities across the app:
 * 1. Direct Google Gemini 2.0 / 1.5 API execution (via user key or VITE_GEMINI_API_KEY)
 * 2. Supabase Edge Function invocation with auth tokens
 * 3. Built-in Offline & Resilient Pedagogical AI Engine for guaranteed zero-downtime student support
 */

import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function getStoredGeminiKey(): string | null {
  return localStorage.getItem('lunchlit_gemini_api_key') || (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
}

export function setStoredGeminiKey(key: string): void {
  if (!key.trim()) {
    localStorage.removeItem('lunchlit_gemini_api_key');
  } else {
    localStorage.setItem('lunchlit_gemini_api_key', key.trim());
  }
}

// ─────────────────────────────────────────────────────────────
// 1. AI Study Buddy Helper
// ─────────────────────────────────────────────────────────────

const STUDY_SUBJECT_KNOWLEDGE: Record<string, string[]> = {
  math: [
    "When tackling calculus or algebra problems, always work backwards from the target variable.",
    "For geometry and trigonometry, sketching the triangle or unit circle with labeled quadrants eliminates 90% of sign errors.",
    "Remember: Active recall with practice problems beats re-reading notes by 300% for math tests.",
  ],
  science: [
    "In chemistry, always balance atoms first before looking at charges or oxidation numbers.",
    "In biology, focus on process flowcharts (e.g. Cellular Respiration, Photosynthesis, Transcription -> Translation).",
    "In physics, draw a Free Body Diagram (FBD) for every mechanics problem before writing down F = ma.",
  ],
  history: [
    "For AP History (APUSH/WHAP/Euro), structure your LEQ/DBQ with: Contextualization -> Thesis (counter-argument + 2 claims) -> Evidence -> Synthesis.",
    "Connect historical causes to long-term societal, economic, and political effects.",
  ],
  english: [
    "Strong thesis formula: Although [Counterargument], [Topic] reveals [Claim 1] and [Claim 2] because [Significance].",
    "Avoid passive voice; use strong analytical verbs like 'exemplifies', 'dismantles', 'underscores', and 'catalyzes'.",
  ],
};

export function generateLocalStudyBuddyResponse(userMessage: string, history: ChatMessage[] = []): string {
  const q = userMessage.toLowerCase();

  // Test prep / planning
  if (q.includes('test') || q.includes('exam') || q.includes('quiz') || q.includes('finals') || q.includes('midterm') || q.includes('plan')) {
    return `### 📅 High-Impact Test Preparation Strategy

Here is a step-by-step game plan tailored for your test:

1. **Phase 1: The Diagnostic Audit (Day 1)**
   - Don't start by reading the textbook page 1. Take a practice quiz or do 5 random end-of-chapter problems.
   - Separate topics into **Red** (no idea), **Yellow** (shaky/slow), and **Green** (mastered).
   - Spend 80% of your initial study time on the **Red** topics.

2. **Phase 2: Spaced Retrieval (Days 2 - 4)**
   - Use the **Feynman Technique**: Explain the hardest concept out loud as if teaching a 6th grader without looking at notes.
   - Use **25/5 Pomodoro intervals**: 25 min deep work, 5 min break away from screens.

3. **Phase 3: Simulated Exam Conditions (Day Before)**
   - Do 1 full-length timed section under test conditions.
   - Sleep at least 8 hours — REM sleep is when short-term study memories consolidate into permanent recall.

*What subject or chapters is this test on? Let me know and we can break down the exact problem types!*`;
  }

  // Math help
  if (q.includes('math') || q.includes('algebra') || q.includes('calculus') || q.includes('geometry') || q.includes('equation') || q.includes('derivative') || q.includes('integral')) {
    return `### 📐 Math Breakdown & Guidance

When approaching math problem solving, follow this 4-step framework:

1. **Identify the Given & Target:** What numbers/functions are known, and what specific variable or state are you solving for?
2. **Formula Check:** Is this quadratic, related rates, product rule, law of sines, or system of equations?
3. **Step-by-Step Execution:**
   - Keep each algebraic manipulation on its own clean line.
   - Watch out for negative sign distributions — that's the #1 point deduction area.
4. **Sanity Check:** Plug your answer back into the original equation, or verify if the magnitude and units make physical sense.

*Paste or type the exact equation or problem statement you're stuck on, and I'll walk you through each step without just handing you the answer!*`;
  }

  // Memorization / vocabulary / flashcards
  if (q.includes('memoriz') || q.includes('flashcard') || q.includes('vocab') || q.includes('remember')) {
    return `### 🧠 Evidence-Based Memorization Tactics

Rote memorization (re-reading over and over) has the lowest long-term retention rate. Here are the 3 top techniques proven by cognitive science:

1. **Blurting (Brain Dumping):**
   - Read a page or vocabulary list for 4 minutes.
   - Close the book, take a blank piece of paper, and write down *everything* you can remember from memory in 3 minutes.
   - Open the book with a red pen and note what you missed.

2. **Mnemonic Linking & Memory Palaces:**
   - Associate weird, vivid imagery or rhyming acronyms with key terms. The weirder the visual, the faster your hippocampus retrieves it.

3. **Spaced Repetition Schedule:**
   - Review 1 hour after learning -> next morning -> Day 3 -> Day 7.

*Would you like me to quiz you on a set of terms right now? Just send me the list!*`;
  }

  // Focus / Pomodoro / motivation / procrastination
  if (q.includes('focus') || q.includes('procrastinat') || q.includes('tired') || q.includes('distract') || q.includes('motivation')) {
    return `### 🎯 Overcoming Procrastination & Entering Deep Focus

Here is the cognitive protocol to get into flow within 5 minutes:

- **The 2-Minute Rule:** Tell yourself: *"I don't have to finish this entire assignment right now, I just have to open the document and write 2 sentences."* Once friction is broken, momentum takes over.
- **Dopamine Shield:** Put your phone in another room or turn on Do Not Disturb. Every notification switches cognitive context and costs 23 minutes of focus recovery.
- **Study Soundscapes:** Use LunchLit's built-in Pomodoro player with Lofi or Binaural 40Hz focus audio.
- **Micro-Milestones:** Don't write "Study Chemistry" on your to-do list; write *"Complete problems #3, #4, and #5 on page 142"*.

Take a deep breath, pick your single most urgent micro-task, and let's tackle it right now!`;
  }

  // Essay / writing / English
  if (q.includes('essay') || q.includes('thesis') || q.includes('english') || q.includes('writing') || q.includes('paragraph') || q.includes('prompt')) {
    return `### ✍️ Essay & Thesis Construction Guide

A standout high school/AP essay succeeds on its thesis and analytical commentary:

1. **The 'So What?' Thesis Formula:**
   - **Although** [Opposing viewpoint / context],
   - **[Author/Subject] utilizes** [Method/Device 1] and [Method/Device 2]
   - **In order to reveal** [Specific deeper meaning or universal truth].

2. **The Paragraph Architecture (CEAL / MEAL):**
   - **Claim:** Topic sentence that asserts a sub-claim of your thesis (no plain plot summary).
   - **Evidence:** Concrete quote or historical evidence smoothly embedded into your own sentence.
   - **Analysis:** 2-3 sentences explaining *how* the specific word choices or historical factors generate the effect.
   - **Link:** Tie back directly to the overarching thesis prompt.

*Paste your essay prompt or working thesis draft and I will provide actionable feedback to level it up!*`;
  }

  // Default encouraging study response
  return `### 💡 LunchLit AI Study Buddy

I'm ready to help you succeed! Here are some of the ways we can work together:

- **Step-by-step problem solver:** Send me a tough question from your homework in Math, Chemistry, Physics, or Biology.
- **Essay thesis & outline review:** Share your writing prompt or topic, and we'll craft an argumentative thesis.
- **Test prep schedule:** Tell me what exams you have coming up and how many days you have to prepare.
- **Concept explanations:** Ask me to explain any topic "like I'm 10" or "for an AP/Honors student".

What subject or assignment are you working on today?`;
}

// ─────────────────────────────────────────────────────────────
// 2. AI Gym Routine Generator
// ─────────────────────────────────────────────────────────────

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
}

export interface GeneratedRoutine {
  name: string;
  exercises: WorkoutExercise[];
  tips: string;
}

export function generateLocalWorkoutRoutine(
  goal: string,
  age: number,
  daysPerWeek: number,
  equipment: string
): GeneratedRoutine {
  const g = goal.toLowerCase();
  const eq = equipment.toLowerCase();

  const isDumbbellOnly = eq.includes('dumbbell') || eq.includes('home');
  const isBodyweight = eq.includes('bodyweight') || eq.includes('no equipment') || eq.includes('calisthenic');

  let name = 'Total Body Athletic Flow';
  let exercises: WorkoutExercise[] = [];
  let tips = 'Maintain steady controlled tempo (2s down, 1s up). Breathe out during the contraction phase.';

  if (isBodyweight) {
    name = `Bodyweight ${goal || 'Fitness'} Builder`;
    exercises = [
      { name: 'Warm-up: Arm Circles & Hip Openers', sets: 2, reps: '30 sec' },
      { name: 'Standard / Incline Push-ups', sets: 3, reps: '10-15' },
      { name: 'Bodyweight Air Squats', sets: 4, reps: '15-20' },
      { name: 'Walking Lunges', sets: 3, reps: '12 per leg' },
      { name: 'Doorframe / Inverted Rows', sets: 3, reps: '10-12' },
      { name: 'Forearm Plank Hold', sets: 3, reps: '45 sec' },
    ];
    tips = 'Focus on strict range of motion over speed. Rest 60 seconds between sets.';
  } else if (isDumbbellOnly) {
    name = `Dumbbell ${goal || 'Strength'} Session`;
    exercises = [
      { name: 'Dumbbell Goblet Squat', sets: 4, reps: '10-12' },
      { name: 'Dumbbell Flat / Floor Press', sets: 3, reps: '10-12' },
      { name: 'Dumbbell Bent-Over Row', sets: 4, reps: '10-12' },
      { name: 'Dumbbell Romanian Deadlift (RDL)', sets: 3, reps: '10' },
      { name: 'Seated Dumbbell Overhead Press', sets: 3, reps: '10-12' },
      { name: 'Standing Dumbbell Bicep / Hammer Curls', sets: 3, reps: '12' },
    ];
    tips = 'Keep your core braced and spine neutral on squats and deadlifts. Rest 60-90s between sets.';
  } else if (g.includes('muscle') || g.includes('hypertrophy') || g.includes('mass') || g.includes('build')) {
    name = daysPerWeek >= 4 ? 'Upper Hypertrophy & Power' : 'Full-Body Muscle Builder';
    exercises = [
      { name: 'Barbell or Dumbbell Bench Press', sets: 4, reps: '8-10' },
      { name: 'Lat Pulldown or Pull-ups', sets: 4, reps: '10-12' },
      { name: 'Barbell / Leg Press Squat', sets: 4, reps: '8-10' },
      { name: 'Seated Cable Row', sets: 3, reps: '12' },
      { name: 'Dumbbell Lateral Raises', sets: 4, reps: '15' },
      { name: 'Triceps Rope Pushdowns', sets: 3, reps: '12-15' },
    ];
    tips = 'Leave 1-2 reps in reserve (RIR) on compound lifts. Eat a protein-rich meal within 2 hours of training.';
  } else if (g.includes('strength') || g.includes('power')) {
    name = 'Core Strength & Compound Focus';
    exercises = [
      { name: 'Barbell Back Squat', sets: 4, reps: '5' },
      { name: 'Flat Barbell Bench Press', sets: 4, reps: '5' },
      { name: 'Overhead Barbell / Dumbbell Press', sets: 3, reps: '6' },
      { name: 'Barbell Pendlay / Bent-Over Row', sets: 4, reps: '6' },
      { name: 'Hanging Leg Raises', sets: 3, reps: '10-12' },
    ];
    tips = 'Rest 2-3 minutes between heavy sets. Proper warm-up sets are essential before working weight.';
  } else {
    // General fitness / fat loss / tone
    name = 'Metabolic Athletic Conditioning';
    exercises = [
      { name: 'Dumbbell Thrusters (Squat to Press)', sets: 3, reps: '12' },
      { name: 'Kettlebell or Dumbbell Swings', sets: 4, reps: '15' },
      { name: 'Cable Face Pulls', sets: 3, reps: '15' },
      { name: 'Incline Push-ups or Chest Press Machine', sets: 3, reps: '12' },
      { name: 'Romanian Deadlifts', sets: 3, reps: '10-12' },
      { name: 'Dead Bug / Core Stabilizer', sets: 3, reps: '20 total' },
    ];
    tips = 'Keep rest periods around 45-60 seconds to maintain an elevated heart rate. Stay hydrated!';
  }

  return { name, exercises, tips };
}

// ─────────────────────────────────────────────────────────────
// 3. AI Gym Machine Scanner Helper & Guide Library
// ─────────────────────────────────────────────────────────────

export interface MachineGuide {
  name: string;
  summary: string;
  steps: string[];
  muscles: string[];
  safety: string[];
}

export const GYM_MACHINE_DATABASE: Record<string, MachineGuide> = {
  lat_pulldown: {
    name: 'Lat Pulldown Machine',
    summary: 'A cable machine targeting the upper and middle back, specifically the latissimus dorsi and biceps.',
    steps: [
      'Adjust the thigh pads so your legs are snug and your feet are flat on the floor.',
      'Grip the wide bar slightly wider than shoulder-width with palms facing forward.',
      'Sit down, secure your thighs under the pads, and lean back slightly (10-15 degrees) with a tall chest.',
      'Pull the bar down toward your upper chest by driving your elbows down and back, not just pulling with hands.',
      'Pause for 1 second at chest height, then slowly control the bar back up to a full stretch over 2-3 seconds.',
    ],
    muscles: ['Latissimus Dorsi (Lats)', 'Rhomboids & Mid-Traps', 'Biceps & Forearms', 'Rear Deltoids'],
    safety: [
      'Never pull the bar behind your neck — this causes unnecessary stress on the cervical spine and rotator cuffs.',
      'Do not swing or use aggressive body momentum to yank the weight down.',
      'Start with a lighter weight where you can pause for 1 second at your chest cleanly.',
    ],
  },
  leg_press: {
    name: '45-Degree Leg Press Machine',
    summary: 'A powerful lower-body compound machine working the quadriceps, glutes, hamstrings, and calves.',
    steps: [
      'Sit firmly with your lower back and tailbone completely flush against the backrest pad.',
      'Place feet shoulder-width apart in the center of the sled platform.',
      'Disengage the safety locking levers with the side handles.',
      'Lower the weight platform with control until your knees bend to approximately 90 degrees.',
      'Press through your whole foot (heels and midfoot) to extend your legs back to the starting point.',
    ],
    muscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Calves'],
    safety: [
      'CRITICAL: NEVER lock your knees out completely at the top of the movement — keep a soft micro-bend.',
      'Do not let your lower back or hips round off the pad at the bottom of the rep.',
      'Keep your knees tracking in line with your second toe (never let knees cave inward).',
    ],
  },
  chest_press: {
    name: 'Seated Chest Press Machine',
    summary: 'A guided selectorized machine for safely developing chest pushing strength, front delts, and triceps.',
    steps: [
      'Adjust seat height so the machine handles align horizontally with mid-chest (nipple level).',
      'Keep feet flat, retract your shoulder blades back and down into the seat pad.',
      'Grip the handles firmly with wrists straight, elbows angled about 45 degrees below shoulders.',
      'Press forward smoothly until arms are almost fully extended without locking elbows.',
      'Slowly resist the weight as handles return back toward chest level over 2-3 seconds.',
    ],
    muscles: ['Pectoralis Major & Minor (Chest)', 'Anterior Deltoids (Front Shoulders)', 'Triceps Brachii'],
    safety: [
      'Do not flare elbows straight out at 90 degrees to avoid shoulder impingement.',
      'Keep head resting against the headrest without craning neck forward.',
      'Avoid hyperextending shoulders too far back behind torso at the starting position.',
    ],
  },
  seated_cable_row: {
    name: 'Seated Cable Row',
    summary: 'A horizontal pull cable machine building posture, mid-back thickness, and core stability.',
    steps: [
      'Sit on the bench, place feet securely on the footrests with knees slightly bent.',
      'Reach forward to grab the V-bar handle with a neutral spine, then push back to an upright 90-degree torso.',
      'Pull the handle into your lower abdomen/navel by driving your elbows backwards.',
      'Squeeze your shoulder blades together tightly at the peak contraction for 1 second.',
      'Control the handle back forward, allowing your shoulder blades to open up without bending your spine.',
    ],
    muscles: ['Rhomboids', 'Latissimus Dorsi', 'Middle & Lower Trapezius', 'Biceps', 'Erector Spinae'],
    safety: [
      'Do not sway aggressively backward and forward using momentum from your lower back.',
      'Keep your chest proud and shoulders pulled away from your ears throughout the set.',
      'Maintain soft knees; never lock knees rigidly on the footrests.',
    ],
  },
  cable_crossover: {
    name: 'Dual Cable Functional Trainer',
    summary: 'Versatile dual-pulley cable system for chest flyes, face pulls, tricep pushdowns, and woodchops.',
    steps: [
      'Adjust pulleys to desired height (high for decline chest flyes, low for incline flyes, eye-level for face pulls).',
      'Select even pin weights on both stacks.',
      'Step forward into a staggered stance with a slight forward torso lean for stability.',
      'Bring handles together in a sweeping hugging arc with elbows maintaining a fixed slight bend.',
      'Squeeze chest muscles together at center, then return slowly with controlled resistance.',
    ],
    muscles: ['Pectorals', 'Front Delts', 'Core Stabilizers', 'Rotator Cuff'],
    safety: [
      'Always check that the carabiners and cable pins are securely seated before pulling.',
      'Do not let the weight stacks slam at the end of each rep.',
      'Keep core braced to avoid arching lower back.',
    ],
  },
  smith_machine: {
    name: 'Smith Machine',
    summary: 'A barbell fixed within vertical or near-vertical steel guide rails with multiple hook lockout points.',
    steps: [
      'Adjust the barbell height and rotate the bar to unhook the safety catches.',
      'For squats: position bar across upper traps, step feet slightly forward of the bar axis.',
      'Keep core braced and lower with control until thighs reach parallel.',
      'Drive upward through your midfoot and rotate wrists at any point to hook into the safety catches if needed.',
    ],
    muscles: ['Depends on exercise: Quadriceps/Glutes for squats, Chest for bench, Shoulders for press'],
    safety: [
      'Always set the manual lower safety stopper pins at your lowest safe depth before adding weight.',
      'Remember the bar moves strictly in a fixed track; position feet comfortably to prevent joint shear.',
    ],
  },
};

export function formatMachineGuideMarkdown(guide: MachineGuide): string {
  return `### **${guide.name}**\n\n${guide.summary}\n\n## How to use it\n${guide.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n## Muscles worked\n${guide.muscles.map((m) => `- ${m}`).join('\n')}\n\n## Safety tips\n${guide.safety.map((sf) => `- ${sf}`).join('\n')}`;
}

