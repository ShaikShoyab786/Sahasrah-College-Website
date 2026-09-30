export const EXAM_UPDATES_MENU_DESCRIPTION =
  "Official exam notices, important dates, and preparation guidance for students and families.";

export const EXAM_UPDATES_OVERVIEW_COPY = {
  description: "Find published exam notifications and important dates for JEE, NEET, Intermediate, EAMCET, and more.",
  statusText: "Browse verified notices and upcoming exam milestones.",
  badgeLabel: null,
  ctaLabel: "View Exam Updates",
} as const;

export const DEFAULT_KNOWLEDGE_HUB_MEGA_MENU = {
  cards: [
    {
      id: "articles",
      category: "articles",
      description: "In-depth study strategies, subject guides, exam tips and more.",
      ctaLabel: "Explore Articles",
      displayOrder: 1,
      isVisible: true,
    },
    {
      id: "video-hub",
      category: "video-hub",
      description: "Watch expert lectures, motivational sessions and concept videos.",
      ctaLabel: "Watch Videos",
      displayOrder: 2,
      isVisible: true,
    },
    {
      id: "study-resources",
      category: "study-resources",
      description: "Notes, PDFs, formulas, previous papers and important downloads.",
      ctaLabel: "Browse Resources",
      displayOrder: 3,
      isVisible: true,
    },
    {
      id: "exam-updates",
      category: "exam-updates",
      description: EXAM_UPDATES_MENU_DESCRIPTION,
      ctaLabel: "View Updates",
      displayOrder: 4,
      isVisible: true,
    },
  ],
  panel: {
    eyebrow: "Sahsrah Knowledge Hub",
    title: "Learn. Prepare. Grow.",
    description: "Curated resources to help you excel in your academics and competitive exams.",
    imageUrl: null,
    imageAltText: "",
    ctaLabel: "Explore Knowledge Hub",
  },
  trendingItems: [],
  mainPage: {
    heroPanelTitle: "A quieter place to find your next useful step.",
    heroPanelDescription: "Built around the questions that shape confident study.",
    introEyebrow: "A clear path through the noise",
    introTitle: "Four ways to make study feel more manageable.",
    introDescription: "Explore articles, video sessions, study resources, and verified exam notices and dates in one place.",
    sections: [
      {
        category: "articles",
        eyebrow: "Knowledge Hub",
        title: "Articles",
        description: "Clear guidance for the questions students and families ask most often.",
        statusText: "Browse published articles for students and families.",
        badgeLabel: null,
        ctaLabel: "Explore Articles",
      },
      {
        category: "video-hub",
        eyebrow: "Knowledge Hub",
        title: "Video Hub",
        description: "A future home for focused explanations and practical learning sessions.",
        statusText: "This section is being prepared for students and families.",
        badgeLabel: "Coming Soon",
        ctaLabel: null,
      },
      {
        category: "study-resources",
        eyebrow: "Knowledge Hub",
        title: "Study Resources",
        description: "A carefully organised shelf for notes, papers, and useful downloads.",
        statusText: "This section is being prepared for students and families.",
        badgeLabel: "Coming Soon",
        ctaLabel: null,
      },
      {
        category: "exam-updates",
        eyebrow: "Knowledge Hub",
        title: "Exam Updates",
        ...EXAM_UPDATES_OVERVIEW_COPY,
      },
    ],
  },
};