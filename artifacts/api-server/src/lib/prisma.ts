import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function initializeDatabase() {
  await prisma.$connect();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      collegeName: "Your College Name",
      tagline: "Your College Tagline",
      logoUrl: null,
      email: "info@yourcollege.com",
      phone: "+91 XXXXX XXXXX",
      address: "Your College Address",
      primaryColor: "#12365D",
      accentColor: "#D5A63A",
      footerText: "Building confident futures through focused learning.",
    },
  });

  const heroSlides = [
    {
      displayOrder: 1,
      eyebrowText: "A focused start to a bright future",
      heading: "Learn with purpose.",
      highlightedHeadingText: "Grow with confidence.",
      description:
        "A welcoming academic environment where students build strong foundations, discover their strengths, and prepare for what comes next.",
      primaryButtonLabel: "Explore admissions",
      primaryButtonUrl: "#contact",
      secondaryButtonLabel: "Discover our approach",
       secondaryButtonUrl: "#about-preview",
      heroImageUrl: null,
      heroImageAltText: "Sahasara students learning together",
    },
    {
      displayOrder: 2,
      eyebrowText: "Make room for possibility",
      heading: "Ask better",
      highlightedHeadingText: "questions.",
      description:
        "At Sahasara, curiosity is not a detour from learning. It is where confidence, creativity, and clarity begin.",
      primaryButtonLabel: "See how we learn",
       primaryButtonUrl: "#about-preview",
      secondaryButtonLabel: "Meet Sahasara",
      secondaryButtonUrl: "#contact",
      heroImageUrl: null,
      heroImageAltText: "Students collaborating in a Sahasara classroom",
    },
    {
      displayOrder: 3,
      eyebrowText: "Your next chapter starts here",
      heading: "Find your",
      highlightedHeadingText: "direction.",
      description:
        "Choose a path that fits your strengths, then give yourself the space to discover what it can become.",
      primaryButtonLabel: "Start a conversation",
      primaryButtonUrl: "#contact",
      secondaryButtonLabel: "Explore next steps",
       secondaryButtonUrl: "#contact",
      heroImageUrl: null,
      heroImageAltText: "Sahasara students looking toward their future",
    },
  ];

  for (const slide of heroSlides) {
    await prisma.homepageHero.upsert({
      where: { displayOrder: slide.displayOrder },
      update: {},
      create: { ...slide, isPublished: true },
    });
  }

  await prisma.homepageAboutPreview.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "About Sahasara",
      heading: "Building Strong Foundations for a Brighter Future",
      description:
        "Sahasara Junior College is committed to helping students grow through academic guidance, personal attention, and a supportive learning environment.",
      body:
        "Our approach combines focused preparation, experienced guidance, and values that help students move confidently toward higher education and future opportunities.",
      buttonLabel: "Explore Our Philosophy",
      buttonHref: "/about",
      primaryImage:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
      primaryImageAltText: "Students collaborating together on a college campus",
      secondaryImage:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=85",
      secondaryImageAltText: "Students walking together outside a college building",
      isVisible: true,
      sortOrder: 2,
    },
  });

  await prisma.aboutHero.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "ABOUT SAHASARA",
      heading: "Growing with Purpose, Learning for Tomorrow.",
      description:
        "Sahasara Junior College is committed to helping students build strong academic foundations through focused learning, personal guidance, and a supportive environment.",
      mainImageUrl:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
      mainImageAltText: "Students learning together in a bright classroom",
      floatingLabel: "Admissions Open",
      floatingAcademicYear: "2026–27",
      floatingAvailabilityText: "Limited Seats Available",
      floatingSupportingText: "Join a growing community of successful students.",
      floatingImageUrl: null,
      floatingImageAltText: "Sahasara students",
      primaryButtonLabel: "Apply for Admission",
      primaryButtonUrl: "#contact",
      primaryButtonVisible: true,
      secondaryButtonLabel: "Schedule a Campus Visit",
      secondaryButtonUrl: "#contact",
      secondaryButtonVisible: true,
      isVisible: true,
      sortOrder: 1,
    },
  });
  if ((await prisma.aboutHeroStat.count({ where: { aboutHeroId: "singleton" } })) === 0) {
    await prisma.aboutHeroStat.createMany({
      data: [
        { aboutHeroId: "singleton", value: "30+", label: "Years of Excellence", displayOrder: 1, isVisible: true },
        { aboutHeroId: "singleton", value: "5000+", label: "Students Guided", displayOrder: 2, isVisible: true },
        { aboutHeroId: "singleton", value: "100+", label: "Academic Achievements", displayOrder: 3, isVisible: true },
        { aboutHeroId: "singleton", value: "500+", label: "Successful Admissions", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.aboutStory.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "OUR STORY",
      heading: "A Journey Built on Learning and Purpose",
      description:
        "Sahasara Junior College continues to grow through a commitment to academic discipline, student guidance, and a learning environment that prepares students for the next stage of their journey.",
      buttonLabel: "Explore Our Journey",
      buttonHref: "#our-story-timeline",
      mainImage:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1100&q=85",
      mainImageAltText: "Students walking together outside a college building",
      secondaryImage:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=85",
      secondaryImageAltText: "Students collaborating in a classroom",
      thirdImage:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=85",
      thirdImageAltText: "Open books and notes on a study table",
      isVisible: true,
      sortOrder: 2,
    },
  });
  if ((await prisma.aboutTimelineItem.count({ where: { aboutStoryId: "singleton" } })) === 0) {
    await prisma.aboutTimelineItem.createMany({
      data: [
        { aboutStoryId: "singleton", period: "20XX", title: "The Beginning", description: "Sahasara Junior College begins its journey with a commitment to focused learning.", displayOrder: 1, isVisible: true },
        { aboutStoryId: "singleton", period: "20XX", title: "Growing Horizons", description: "The college expands its academic guidance and student support initiatives.", displayOrder: 2, isVisible: true },
        { aboutStoryId: "singleton", period: "20XX", title: "A Stronger Community", description: "More students and families become part of the Sahasara learning community.", displayOrder: 3, isVisible: true },
        { aboutStoryId: "singleton", period: "Today", title: "Looking Ahead", description: "Sahasara continues preparing students for higher education and future opportunities.", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.aboutChairmanMessage.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "CHAIRMAN'S MESSAGE",
      heading: "Education is the foundation of every meaningful future.",
      message:
        "At Sahasara Junior College, we believe every student deserves the guidance, encouragement, and learning environment needed to grow with confidence. Our responsibility is to support every learner with purpose and care.",
      signatureName: "Sahasara Leadership",
      role: "Chairman",
      portraitImage:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85",
      portraitAltText: "Portrait placeholder for Sahasara leadership",
      buttonLabel: "Read the Full Message",
      buttonHref: "#contact",
      buttonVisible: false,
      isVisible: true,
      sortOrder: 3,
    },
  });

  await prisma.aboutGuidingPrinciples.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Our Guiding Principles",
      description: "The principles that shape how Sahasara teaches, supports, and prepares every student.",
      visionIcon: "eye",
      visionTitle: "Our Vision",
      visionDescription: "To create a learning environment that helps students build knowledge, confidence, discipline, and a clear direction for the future.",
      missionIcon: "target",
      missionTitle: "Our Mission",
      missionDescription: "To provide focused academic guidance, concept-based learning, and personalized mentorship that helps every student progress with confidence.",
      valuesIcon: "star",
      valuesTitle: "Our Values",
      isVisible: true,
      sortOrder: 4,
    },
  });
  if ((await prisma.aboutGuidingPrincipleValue.count({ where: { aboutGuidingPrinciplesId: "singleton" } })) === 0) {
    await prisma.aboutGuidingPrincipleValue.createMany({
      data: [
        { aboutGuidingPrinciplesId: "singleton", value: "Integrity in all we do", displayOrder: 1, isVisible: true },
        { aboutGuidingPrinciplesId: "singleton", value: "Excellence in education", displayOrder: 2, isVisible: true },
        { aboutGuidingPrinciplesId: "singleton", value: "Care for every student", displayOrder: 3, isVisible: true },
        { aboutGuidingPrinciplesId: "singleton", value: "Commitment to progress", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.aboutWhyParentsChoose.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Why Parents Choose Sahasara",
      description: "A focused, supportive approach that helps students build strong foundations and steady momentum.",
      isVisible: true,
      sortOrder: 5,
    },
  });
  if ((await prisma.aboutParentChoiceBenefit.count({ where: { aboutWhyParentsChooseId: "singleton" } })) === 0) {
    await prisma.aboutParentChoiceBenefit.createMany({
      data: [
        { aboutWhyParentsChooseId: "singleton", icon: "users", title: "Experienced Faculty", description: "Guidance from educators who know how to make complex ideas clear.", displayOrder: 1, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "graduation-cap", title: "Strong Academic Preparation", description: "Structured support for the next stage of every learner’s journey.", displayOrder: 2, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "book-open", title: "Concept-Based Learning", description: "Learning that builds understanding instead of relying on memorization alone.", displayOrder: 3, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "check-circle", title: "Regular Tests and Practice", description: "Consistent feedback helps students notice progress and close gaps.", displayOrder: 4, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "heart-handshake", title: "Personalized Mentorship", description: "A caring environment where students can ask questions and grow in confidence.", displayOrder: 5, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "badge-check", title: "A Commitment to Student Progress", description: "Shared attention to habits, outcomes, and long-term direction.", displayOrder: 6, isVisible: true },
      ],
    });
  }

  await prisma.aboutLeadership.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Our Leadership",
      description: "Meet the people who help Sahasara stay focused on thoughtful teaching, student care, and meaningful progress.",
      isVisible: true,
      sortOrder: 6,
    },
  });
  if ((await prisma.aboutLeadershipMember.count({ where: { aboutLeadershipId: "singleton" } })) === 0) {
    await prisma.aboutLeadershipMember.createMany({
      data: [
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahasara chairperson", name: "Chairperson Placeholder", designation: "Chairperson", qualification: "Qualification placeholder", biography: "Provides strategic oversight and long-term guidance for the institution.", displayOrder: 1, isVisible: true },
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahasara academic director", name: "Academic Director Placeholder", designation: "Academic Director", qualification: "Qualification placeholder", biography: "Supports academic direction, curriculum planning, and a strong learning culture.", displayOrder: 2, isVisible: true },
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahasara director", name: "Director Placeholder", designation: "Director", qualification: "Qualification placeholder", biography: "Helps connect institutional priorities with a welcoming student experience.", displayOrder: 3, isVisible: true },
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahasara dean", name: "Dean Placeholder", designation: "Dean", qualification: "Qualification placeholder", biography: "Coordinates student support and keeps care, discipline, and progress at the center.", displayOrder: 4, isVisible: true },
      ],
    });
  }

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (!existing) {
      const { hashPassword } = await import("./security");
      await prisma.admin.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          displayName: "College Administrator",
        },
      });
    }
  }
}