export type CourseSlug = "mpc" | "bipc" | "mpc-iit-jee" | "bipc-neet" | "mpc-eamcet";

export type CourseHighlight = {
  label: string;
  value: string;
  description: string;
};

export type CourseReason = {
  title: string;
  description: string;
};

export type CourseSyllabus = {
  subject: string;
  topics: string[];
};

export type CourseSeed = {
  slug: CourseSlug;
  name: string;
  displayOrder: number;
  durationLabel: string;
  modeLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryActionLabel: string;
  primaryActionUrl: string;
  secondaryActionLabel: string;
  secondaryActionUrl: string;
  highlights: CourseHighlight[];
  whyChoose: CourseReason[];
  overviewText: string;
  programGoals: string[];
  idealProfileTitle: string;
  idealProfileDescription: string;
  idealProfileIndicators: string[];
  syllabus: CourseSyllabus[];
};

export const COURSE_SEEDS: CourseSeed[] = [
  {
    slug: "mpc",
    name: "MPC (Maths, Physics, Chemistry)",
    displayOrder: 1,
    durationLabel: "2 Years",
    modeLabel: "Offline",
    heroEyebrow: "Science pathway · MPC",
    heroTitle: "Build a strong foundation in mathematics and science.",
    heroDescription:
      "MPC brings Mathematics, Physics, and Chemistry together for students who enjoy working with ideas, evidence, and structured problem-solving.",
    primaryActionLabel: "Explore admissions",
    primaryActionUrl: "/contact",
    secondaryActionLabel: "View Curriculum",
    secondaryActionUrl: "#course-curriculum-heading",
    highlights: [
      { label: "Core subjects", value: "Mathematics · Physics · Chemistry", description: "Three connected disciplines in one pathway." },
      { label: "Learning lens", value: "Concepts first", description: "Build understanding before moving to harder applications." },
      { label: "Practice focus", value: "Reasoning and accuracy", description: "Work through ideas methodically and check each step." },
      { label: "Good fit for", value: "Curious problem-solvers", description: "Students who like patterns, models, and quantitative questions." },
    ],
    whyChoose: [
      { title: "See how the subjects connect", description: "Mathematics gives students tools for describing patterns, while Physics and Chemistry put those tools to work in scientific settings." },
      { title: "Strengthen step-by-step reasoning", description: "Regular work with equations, diagrams, and evidence helps students explain how they reached an answer." },
      { title: "Keep future study choices open", description: "A broad science foundation can support several further-study directions; students can explore options with a counsellor." },
    ],
    overviewText:
      "The MPC pathway centres on Mathematics, Physics, and Chemistry. Students build subject knowledge while learning to move between abstract ideas, numerical work, and scientific explanations.",
    programGoals: [
      "Develop dependable algebraic and mathematical reasoning.",
      "Explain physical situations with models, diagrams, and measurements.",
      "Connect chemical structure, reactions, and quantitative relationships.",
    ],
    idealProfileTitle: "A good match for students who ask how things work",
    idealProfileDescription:
      "MPC may suit learners who enjoy numbers, scientific questions, and working through a problem until the reasoning is clear.",
    idealProfileIndicators: [
      "Enjoys mathematics or logical puzzles",
      "Is curious about physical systems and experiments",
      "Is ready to practise multi-step questions",
    ],
    syllabus: [
      { subject: "Mathematics", topics: ["Algebraic expressions", "Equations and functions", "Trigonometric identities", "Coordinate geometry", "Sequences and series", "Differential calculus"] },
      { subject: "Physics", topics: ["Units and measurement", "Motion and kinematics", "Newton's laws", "Work and energy", "Waves and sound", "Electricity and magnetism"] },
      { subject: "Chemistry", topics: ["Atomic structure", "Periodic properties", "Chemical bonding", "Stoichiometry", "States of matter", "Organic chemistry foundations"] },
    ],
  },
  {
    slug: "bipc",
    name: "BiPC (Biology, Physics, Chemistry)",
    displayOrder: 2,
    durationLabel: "2 Years",
    modeLabel: "Offline",
    heroEyebrow: "Life sciences pathway · BiPC",
    heroTitle: "Study living systems through biology and science.",
    heroDescription:
      "BiPC combines Biology with Physics and Chemistry for students drawn to living systems, careful observation, and the science behind health and the natural world.",
    primaryActionLabel: "Explore admissions",
    primaryActionUrl: "/contact",
    secondaryActionLabel: "View Curriculum",
    secondaryActionUrl: "#course-curriculum-heading",
    highlights: [
      { label: "Core subjects", value: "Biology · Physics · Chemistry", description: "Life science supported by physical and chemical principles." },
      { label: "Learning lens", value: "Observe and explain", description: "Connect structures and processes with clear scientific language." },
      { label: "Practice focus", value: "Recall with understanding", description: "Organise detail while linking it to larger concepts." },
      { label: "Good fit for", value: "Life-science explorers", description: "Students interested in organisms, health, and the environment." },
    ],
    whyChoose: [
      { title: "Put living systems at the centre", description: "Biology explores how organisms are built, how they function, and how they relate to their environment." },
      { title: "Use Physics and Chemistry as supporting lenses", description: "The companion subjects help explain processes such as movement, energy transfer, and molecular interaction." },
      { title: "Build careful observation habits", description: "Diagrams, classification, and cause-and-effect explanations help students organise detailed material." },
    ],
    overviewText:
      "BiPC gives Biology the central role while keeping Physics and Chemistry in the picture. The combination helps students relate the scale of cells and organisms to the principles that shape them.",
    programGoals: [
      "Describe biological structures and processes with accurate terminology.",
      "Relate chemical principles to substances and reactions in living systems.",
      "Use physical ideas to reason about movement, energy, and measurement.",
    ],
    idealProfileTitle: "A good match for students who notice the details of life",
    idealProfileDescription:
      "BiPC may suit learners who are interested in organisms and health, and who are comfortable learning detailed concepts alongside scientific problem-solving.",
    idealProfileIndicators: [
      "Enjoys biology, nature, or health-related questions",
      "Likes diagrams, classification, and observation",
      "Can build a steady routine for revisiting detailed topics",
    ],
    syllabus: [
      { subject: "Biology", topics: ["Cell structure and function", "Plant physiology", "Human physiology", "Reproduction", "Genetics and evolution", "Ecology and environment"] },
      { subject: "Physics", topics: ["Measurement and vectors", "Motion and forces", "Properties of matter", "Waves and optics", "Electricity", "Modern physics foundations"] },
      { subject: "Chemistry", topics: ["Atomic structure", "Chemical bonding", "Solutions", "Chemical equilibrium", "Biomolecules", "Organic chemistry foundations"] },
    ],
  },
  {
    slug: "mpc-iit-jee",
    name: "MPC + IIT-JEE",
    displayOrder: 3,
    durationLabel: "2 Years",
    modeLabel: "Offline",
    heroEyebrow: "Entrance preparation · IIT-JEE",
    heroTitle: "Pair PCM foundations with focused IIT-JEE preparation.",
    heroDescription:
      "This pathway combines Mathematics, Physics, and Chemistry with IIT-JEE-oriented preparation for students ready to apply concepts to challenging entrance-style problems.",
    primaryActionLabel: "Explore admissions",
    primaryActionUrl: "/contact",
    secondaryActionLabel: "View Curriculum",
    secondaryActionUrl: "#course-curriculum-heading",
    highlights: [
      { label: "Core subjects", value: "Mathematics · Physics · Chemistry", description: "The PCM base remains central to the pathway." },
      { label: "Preparation lens", value: "IIT-JEE focused", description: "Connect subject learning with entrance-style applications." },
      { label: "Practice focus", value: "Multi-step problems", description: "Build a method for unfamiliar and layered questions." },
      { label: "Good fit for", value: "Challenge-seeking learners", description: "Students who are willing to analyse, practise, and review." },
    ],
    whyChoose: [
      { title: "Connect classroom ideas to entrance questions", description: "JEE-focused work asks students to recognise which concepts apply and how they fit together." },
      { title: "Practise depth, not only speed", description: "Working through a difficult problem carefully can reveal gaps in the underlying Mathematics, Physics, or Chemistry." },
      { title: "Review errors as part of preparation", description: "A deliberate review habit helps students understand the reason behind an incorrect step and choose a better method next time." },
    ],
    overviewText:
      "MPC + IIT-JEE is a combined PCM and entrance-preparation pathway. Subject learning is paired with JEE-focused problem practice so students can work on conceptual depth and application together.",
    programGoals: [
      "Apply PCM concepts to unfamiliar, multi-step questions.",
      "Choose and justify an efficient method without skipping core reasoning.",
      "Use practice review to identify recurring strengths and gaps.",
    ],
    idealProfileTitle: "A good match for students who enjoy difficult questions",
    idealProfileDescription:
      "This option may suit students with a strong interest in Mathematics and the physical sciences who want a structured route to IIT-JEE preparation.",
    idealProfileIndicators: [
      "Is prepared to revisit core PCM concepts regularly",
      "Enjoys comparing more than one solution approach",
      "Can treat practice and error review as part of learning",
    ],
    syllabus: [
      { subject: "Mathematics · JEE focus", topics: ["Functions and graphs", "Complex numbers", "Coordinate geometry", "Permutations and combinations", "Limits and derivatives", "Integral calculus"] },
      { subject: "Physics · JEE focus", topics: ["Kinematics and relative motion", "Laws of motion", "Rotational dynamics", "Thermodynamics", "Electrostatics", "Ray and wave optics"] },
      { subject: "Chemistry · JEE focus", topics: ["Mole concept and stoichiometry", "Chemical and ionic equilibrium", "Chemical bonding", "Coordination compounds", "Reaction mechanisms", "Electrochemistry"] },
    ],
  },
  {
    slug: "bipc-neet",
    name: "BiPC + NEET",
    displayOrder: 4,
    durationLabel: "2 Years",
    modeLabel: "Offline",
    heroEyebrow: "Entrance preparation · NEET",
    heroTitle: "Bring Biology, Physics, and Chemistry into NEET preparation.",
    heroDescription:
      "BiPC + NEET pairs the life-science pathway with NEET-oriented preparation, balancing detailed Biology learning with the Physics and Chemistry needed for entrance questions.",
    primaryActionLabel: "Explore admissions",
    primaryActionUrl: "/contact",
    secondaryActionLabel: "View Curriculum",
    secondaryActionUrl: "#course-curriculum-heading",
    highlights: [
      { label: "Core subjects", value: "Biology · Physics · Chemistry", description: "The three science subjects used throughout the preparation path." },
      { label: "Preparation lens", value: "NEET focused", description: "Relate subject knowledge to medical entrance-style questions." },
      { label: "Practice focus", value: "Accuracy with detail", description: "Balance close reading, recall, and numerical reasoning." },
      { label: "Good fit for", value: "Health-science aspirants", description: "Students interested in life science and sustained preparation." },
    ],
    whyChoose: [
      { title: "Give Biology room for depth", description: "NEET-focused BiPC preparation asks students to understand detailed biological ideas and recall them accurately." },
      { title: "Keep Physics and Chemistry in balance", description: "Regular attention to all three subjects helps learners practise both conceptual and numerical questions." },
      { title: "Build a consistent revision cycle", description: "Short, planned reviews make it easier to revisit diagrams, terminology, formulas, and common question patterns." },
    ],
    overviewText:
      "BiPC + NEET brings the Biology, Physics, and Chemistry combination together with focused medical-entrance preparation. The pathway is designed around subject understanding, regular revision, and application to NEET-style questions.",
    programGoals: [
      "Recall biological detail while explaining the concept behind it.",
      "Solve Physics and Chemistry questions with clear units and working.",
      "Use topic review and question practice to reinforce long-term retention.",
    ],
    idealProfileTitle: "A good match for students focused on life and health sciences",
    idealProfileDescription:
      "This pathway may suit students with a sustained interest in Biology who are also ready to practise the Physics and Chemistry components of a medical entrance examination.",
    idealProfileIndicators: [
      "Is curious about living systems and human biology",
      "Can combine detailed reading with regular question practice",
      "Wants to prepare specifically for NEET alongside BiPC",
    ],
    syllabus: [
      { subject: "Biology · NEET focus", topics: ["Cell biology", "Human physiology", "Plant physiology", "Reproduction and development", "Molecular genetics", "Biodiversity and ecology"] },
      { subject: "Physics · NEET focus", topics: ["Units and dimensions", "Motion and laws of motion", "Work, energy, and power", "Thermal physics", "Current electricity", "Optics and modern physics"] },
      { subject: "Chemistry · NEET focus", topics: ["Basic concepts and mole calculations", "Chemical bonding", "Equilibrium", "Organic functional groups", "Coordination chemistry", "Biomolecules"] },
    ],
  },
  {
    slug: "mpc-eamcet",
    name: "MPC + EAMCET",
    displayOrder: 5,
    durationLabel: "2 Years",
    modeLabel: "Offline",
    heroEyebrow: "Entrance preparation · EAMCET",
    heroTitle: "Prepare in PCM with an EAMCET-focused study path.",
    heroDescription:
      "MPC + EAMCET combines Mathematics, Physics, and Chemistry with entrance-focused preparation for students who want to practise applying their subject knowledge in a timed format.",
    primaryActionLabel: "Explore admissions",
    primaryActionUrl: "/contact",
    secondaryActionLabel: "View Curriculum",
    secondaryActionUrl: "#course-curriculum-heading",
    highlights: [
      { label: "Core subjects", value: "Mathematics · Physics · Chemistry", description: "Build the PCM knowledge needed for the pathway." },
      { label: "Preparation lens", value: "EAMCET focused", description: "Pair subject review with entrance-style practice." },
      { label: "Practice focus", value: "Method and pacing", description: "Learn to select a sound approach under time constraints." },
      { label: "Good fit for", value: "Practical planners", description: "Students who value clear goals and a repeatable study routine." },
    ],
    whyChoose: [
      { title: "Keep the PCM syllabus connected", description: "Revisiting related ideas across Mathematics, Physics, and Chemistry makes practice more purposeful than treating each chapter in isolation." },
      { title: "Practise for a timed setting", description: "Entrance-style sets let students work on reading carefully, selecting a method, and keeping track of time." },
      { title: "Use a steady revision rhythm", description: "Returning to earlier topics helps reinforce formulas, definitions, and problem-solving methods as new material is introduced." },
    ],
    overviewText:
      "MPC + EAMCET is a PCM pathway with EAMCET-focused preparation. Learners work on subject fundamentals and practise applying them to entrance-style questions with attention to accuracy and pacing.",
    programGoals: [
      "Strengthen core Mathematics, Physics, and Chemistry concepts.",
      "Practise selecting a suitable method for a timed question.",
      "Plan review sessions that bring earlier topics back into rotation.",
    ],
    idealProfileTitle: "A good match for students who like structured preparation",
    idealProfileDescription:
      "This path may suit students choosing MPC who want to include EAMCET-oriented practice in their study plan and are comfortable following a regular revision routine.",
    idealProfileIndicators: [
      "Wants to combine PCM study with EAMCET preparation",
      "Benefits from clear weekly practice and review goals",
      "Is ready to improve pacing without sacrificing accuracy",
    ],
    syllabus: [
      { subject: "Mathematics · EAMCET focus", topics: ["Algebra and functions", "Trigonometry", "Vector algebra", "Coordinate geometry", "Probability", "Differential and integral calculus"] },
      { subject: "Physics · EAMCET focus", topics: ["Motion and vectors", "Work and energy", "Oscillations and waves", "Thermal properties", "Electric circuits", "Magnetism and optics"] },
      { subject: "Chemistry · EAMCET focus", topics: ["Atomic structure and periodicity", "Bonding and molecular structure", "Solutions and equilibrium", "Chemical kinetics", "Organic reactions", "Applied chemistry concepts"] },
    ],
  },
];

export const COURSE_SUBJECTS: Record<CourseSlug, string[]> = {
  mpc: ["Mathematics", "Physics", "Chemistry"],
  bipc: ["Biology", "Physics", "Chemistry"],
  "mpc-iit-jee": ["Mathematics", "Physics", "Chemistry", "IIT-JEE"],
  "bipc-neet": ["Biology", "Physics", "Chemistry", "NEET"],
  "mpc-eamcet": ["Mathematics", "Physics", "Chemistry", "EAMCET"],
};

export const TEACHING_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "IIT-JEE",
  "NEET",
  "EAMCET",
] as const;

const SUBJECT_ALIASES: Record<string, string> = {
  math: "mathematics",
  maths: "mathematics",
  bio: "biology",
  iitjee: "iitjee",
  jee: "iitjee",
};

export function normalizeTeachingSubject(subject: string): string {
  const normalized = subject.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return SUBJECT_ALIASES[normalized] ?? normalized;
}