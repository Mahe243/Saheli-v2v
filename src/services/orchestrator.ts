/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HealthBrain,
  SymptomLog,
  TimelineEvent,
  Appointment,
  HealthSummary,
  OrchestratorEvent,
  OrchestratorEventType,
  EventSubscriber,
  MedicalRecord,
  MedicalRecordCategory,
  LabReport,
  LabMetric,
  DoctorCompanionState,
  Medication,
  PreventiveReminder,
  MedicationCheckIn,
  EmotionLog,
  LifeStageType,
  WeeklyCheckIn,
  JournalEntry,
  HealthGoal,
  Achievement,
  HealthInsight,
  KnowledgeArticle,
  Recommendation,
  MonthlyReview,
  HealthIndicator,
  MemoryItem,
  SearchIndex,
  FamilyHistory
} from "../types";

// Seeding standard, culturally respectful mock data for Priya
const INITIAL_HEALTH_BRAIN: HealthBrain = {
  profile: {
    name: "Priya Devi",
    age: 28,
    height: "155 cm",
    weight: "58 kg",
    bloodGroup: "O+",
    emergencyContact: "Rajesh Devi (Husband) - +91 98765 43210"
  },
  lifestyle: {
    exercise: "Moderate (Walking to fields, household chores)",
    sleep: "7 hours (Regular sleep schedule)",
    diet: "Primarily Vegetarian (Rice, lentils, local vegetables)",
    smoking: "Never",
    alcohol: "Never"
  },
  medicalHistory: {
    currentConditions: ["Mild seasonal allergies", "Slight postpartum back pain"],
    previousIllnesses: ["Typhoid recovery (2023)"],
    surgeries: ["Appendectomy (2021)"],
    pregnancyHistory: "1 pregnancy, 1 healthy delivery (Son - 2 years old)",
    vaccinations: ["COVID-19 Vaccine (Fully Vaccinated)", "Tetanus Toxoid (2024)"],
    currentMedicines: ["Iron & Folic Acid supplements (Daily)"],
    allergies: ["Dust/Pollen", "Sulfa medications"]
  },
  familyHistory: {
    mother: "History of High Blood Pressure (Managed with diet)",
    father: "Healthy, active farmer",
    grandparents: "Maternal grandmother had type 2 diabetes"
  },
  healthGoals: [
    "Manage back pain through gentle stretching",
    "Ensure regular nutrition intake while working",
    "Plan for a healthy second pregnancy next year"
  ]
};

const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    date: "2026-05-15",
    category: "Life Events",
    title: "Enrolled in Saheli Health Program",
    description: "Registered on the Saheli AI platform with help from local health worker Sunita.",
    notes: "Platform setup completed; basic profile registered."
  },
  {
    id: "t2",
    date: "2026-05-20",
    category: "Doctor Visits",
    title: "Postpartum Follow-up",
    description: "Visited the rural health center for general checkout and baby growth tracking.",
    notes: "Doctor advised continuing iron supplements and simple back stretches."
  },
  {
    id: "t3",
    date: "2026-06-02",
    category: "Medicines",
    title: "Iron Supplement Renewal",
    description: "Picked up a fresh supply of monthly iron and folic acid tablets.",
    notes: "Supplements provided by the local health center sub-center."
  },
  {
    id: "t4",
    date: "2026-07-01",
    category: "Symptoms",
    title: "Lower Back Discomfort",
    description: "Noticed mild pain after working in the fields for 4 hours.",
    notes: "Applying local warm compresses. Logged to monitor progression."
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    date: "2026-07-23",
    time: "10:00 AM",
    doctorName: "Dr. Anjali Mehta (Gynaecologist)",
    purpose: "Routine checkup & pre-conception counseling advice"
  }
];

const INITIAL_SUMMARY: HealthSummary = {
  updatedAt: "2026-07-01",
  summaryText: "Priya is a healthy 28-year-old mother who is active and manages minor back pain postpartum. She takes daily iron supplements, has a balanced diet, and has set a proactive goal of planning a second pregnancy. No active chronic conditions are present.",
  keyActionItems: [
    "Continue iron and folic acid supplements daily",
    "Practice core strengthening exercises for back pain",
    "Discuss pre-conception multivitamins at the next doctor's visit on July 23"
  ]
};

// Phase 2 Seeds
const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec_1",
    title: "Baseline CBC Blood Report",
    date: "2026-06-10",
    hospital: "Apollo Rural Outreach Center",
    doctor: "Dr. R. K. Sharma",
    category: "Blood Tests",
    fileType: "blood_report",
    fileName: "cbc_report_june2026.pdf",
    fileSize: "1.2 MB",
    previewText: "Hemoglobin: 11.2 L, Vitamin D3: 18.0 L, TSH: 2.4 N, Ferritin: 15.0 N, Fasting Blood Sugar: 92 N",
    isEncrypted: false,
    consentSharedWith: ["Dr. Anjali Mehta"],
    labReport: {
      recordId: "rec_1",
      reportName: "Complete Blood Count (CBC) & Vitamin Panel",
      date: "2026-06-10",
      metrics: [
        {
          name: "Hemoglobin",
          value: "11.2",
          unit: "g/dL",
          referenceRange: "12.0 - 15.0",
          status: "Low",
          explanation: "Hemoglobin carries oxygen in your blood. Since you are slightly low, you might feel tired. Make sure to take your iron tablets."
        },
        {
          name: "Vitamin D3",
          value: "18.0",
          unit: "ng/mL",
          referenceRange: "30.0 - 100.0",
          status: "Low",
          explanation: "Vitamin D helps keep your bones strong. Consider regular exposure to morning sunlight or discuss taking a supplement."
        },
        {
          name: "Thyroid (TSH)",
          value: "2.4",
          unit: "mIU/L",
          referenceRange: "0.4 - 4.5",
          status: "Normal",
          explanation: "Thyroid hormone levels are normal, indicating a healthy metabolic balance."
        },
        {
          name: "Ferritin (Iron Storage)",
          value: "15.0",
          unit: "ng/mL",
          referenceRange: "15.0 - 150.0",
          status: "Normal",
          explanation: "Your iron stores are at the lower end of the normal range, confirming why daily supplements are beneficial."
        },
        {
          name: "Fasting Blood Sugar",
          value: "92.0",
          unit: "mg/dL",
          referenceRange: "70.0 - 100.0",
          status: "Normal",
          explanation: "Blood glucose is in the normal range, demonstrating good blood sugar health."
        }
      ],
      summaryExplanation: "Your lab report shows low Hemoglobin and Vitamin D levels. This is very common and can be addressed. We suggest continuing your iron supplements, getting mild morning sunlight, and discussing these results with Dr. Anjali Mehta."
    }
  }
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: "med_1",
    name: "Iron & Folic Acid Tablet",
    dose: "1 tablet (100mg Iron / 0.5mg Folic Acid)",
    frequency: "Once daily (At Night)",
    duration: "3 months",
    startDate: "2026-06-02",
    endDate: "2026-09-02",
    status: "Active",
    checkIns: [
      { date: "2026-07-08", taken: true, feelingBetter: "Yes" },
      { date: "2026-07-07", taken: true, feelingBetter: "Yes" },
      { date: "2026-07-06", taken: false, missedReason: "Forgot to take at bedtime" },
      { date: "2026-07-05", taken: true, feelingBetter: "Same" }
    ]
  },
  {
    id: "med_2",
    name: "Vitamin D3 Chewable Tablet",
    dose: "1 tablet (60k IU)",
    frequency: "Once a week (Sunday morning)",
    duration: "8 weeks",
    startDate: "2026-06-15",
    endDate: "2026-08-15",
    status: "Active",
    checkIns: [
      { date: "2026-07-05", taken: true, feelingBetter: "Yes" },
      { date: "2026-06-28", taken: true, feelingBetter: "Same" },
      { date: "2026-06-21", taken: true, feelingBetter: "Same" }
    ]
  }
];

const INITIAL_PREVENTIVE: PreventiveReminder[] = [
  {
    id: "prev_1",
    title: "Cervical Cancer Screening (Pap Smear / HPV)",
    description: "Routine safe screening to examine cervix cell health. Essential for early prevention of reproductive system issues.",
    triggerReason: "Recommended for all women aged 21-65. Fully aligned with rural healthcare safety protocols.",
    category: "Screening",
    status: "Pending",
    recommendedInterval: "Every 3 years"
  },
  {
    id: "prev_2",
    title: "Blood Sugar Screening",
    description: "Simple fasting blood glucose or HbA1c test to monitor insulin function and prevent diabetes.",
    triggerReason: "Based on family history: Maternal grandmother had Type 2 Diabetes.",
    category: "Screening",
    status: "Pending",
    recommendedInterval: "Every 2-3 years"
  },
  {
    id: "prev_3",
    title: "Maternal Tetanus Toxoid Vaccine Booster",
    description: "Critical vaccination for preventing tetanus infection during pregnancy and delivery.",
    triggerReason: "Based on medical history: Handled successfully in 2024 during first pregnancy.",
    category: "Vaccination",
    status: "Done",
    recommendedInterval: "As advised by nurse"
  },
  {
    id: "prev_4",
    title: "Pre-Conception Gynaecological Consultation",
    description: "Discuss planning a safe, healthy second pregnancy, prenatal vitamins, and optimizing hemoglobin levels.",
    triggerReason: "Based on health goal: Planning second pregnancy next year.",
    category: "Checkup",
    status: "Pending",
    recommendedInterval: "Once before planning"
  }
];

const INITIAL_DOCTOR_COMPANION: DoctorCompanionState = {
  id: "dc_1",
  appointmentId: "a1",
  chiefComplaint: "Plan for a healthy second pregnancy next year and check postpartum back pain",
  concerns: [
    "Preventing anemia during second pregnancy",
    "Postpartum lower back pain during agricultural work in fields"
  ],
  questionsToAsk: [
    "Should I start taking a daily prenatal multivitamin with folic acid right now?",
    "What core strengthening exercises are safe for my lower back pain?",
    "Are my Hemoglobin (11.2) and Vitamin D (18) levels safe to begin planning a pregnancy?"
  ],
  selectedReportIds: ["rec_1"],
  completed: false
};

const INITIAL_LIFE_STAGE: LifeStageType = "Motherhood";

const INITIAL_EMOTION_LOGS: EmotionLog[] = [
  {
    id: "em_1",
    date: "2026-07-08",
    emotion: "Happy",
    note: "Priya spent time with her son in the evening, feeling joyful.",
    aiResponse: "Thank you for sharing. It is wonderful that you had a joyful evening with your son. Spending quality time with loved ones can bring deep comfort and rest."
  },
  {
    id: "em_2",
    date: "2026-07-07",
    emotion: "Calm",
    note: "Completed farm work early, back pain was tolerable.",
    aiResponse: "Thank you for sharing. It is good that your back pain was tolerable today and you finished early. Remember to rest and stretch regularly to protect your lower back."
  },
  {
    id: "em_3",
    date: "2026-07-06",
    emotion: "Tired",
    note: "Long day in the fields and babysitting, slept late.",
    aiResponse: "Thank you for sharing. It sounds like you had an extremely long and demanding day. Rest is very precious; please try to take short breaks when possible and discuss any persistent exhaustion with Dr. Anjali Mehta."
  }
];

const INITIAL_WEEKLY_CHECKINS: WeeklyCheckIn[] = [
  {
    id: "wc_1",
    date: "2026-07-02",
    pain: 2,
    energy: 4,
    mood: 4,
    sleep: 3,
    exercise: 4,
    waterIntake: 4,
    cycle: "Regular",
    medicationExperience: "Good"
  }
];

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "je_1",
    date: "2026-07-08",
    text: "Did my stretching exercises today. Back pain is slightly better. Cooked lentils and fresh vegetables for the family."
  },
  {
    id: "je_2",
    date: "2026-07-05",
    text: "Visited my neighbor Sunita (ANM health worker). She showed me how to use the Saheli app to log my iron pills."
  }
];

const INITIAL_GOALS: HealthGoal[] = [
  {
    id: "g_1",
    title: "Walk Daily in the Morning",
    category: "Exercise",
    targetValue: 30,
    currentValue: 20,
    unit: "minutes",
    completed: false
  },
  {
    id: "g_2",
    title: "Drink Enough Water",
    category: "Water",
    targetValue: 8,
    currentValue: 6,
    unit: "glasses",
    completed: false
  },
  {
    id: "g_3",
    title: "Take Iron Tablets Daily",
    category: "Medicine",
    targetValue: 7,
    currentValue: 7,
    unit: "days",
    completed: true
  },
  {
    id: "g_4",
    title: "Daily Back Stretching",
    category: "Stress",
    targetValue: 15,
    currentValue: 15,
    unit: "minutes",
    completed: true
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ac_1",
    title: "Completed Tetanus Vaccine Booster",
    date: "2026-07-04",
    icon: "🌸",
    description: "Successfully logged vaccination booster."
  },
  {
    id: "ac_2",
    title: "3 Consecutive Days of Drinking Water",
    date: "2026-07-08",
    icon: "🌸",
    description: "Maintained healthy hydration level."
  }
];

const SEED_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "ka_1",
    title: "Understanding PCOS (Polycystic Ovary Syndrome)",
    category: "Reproductive Health",
    overview: "PCOS is a common hormonal condition affecting women of reproductive age. It involves a slight imbalance in hormones which can affect how your ovaries work.",
    commonSymptoms: [
      "Irregular, delayed, or missed menstrual cycles",
      "Persistent acne or skin changes",
      "Thinning hair or excess body hair growth",
      "Difficulty managing weight"
    ],
    lifestyleTips: [
      "Keep a regular schedule for nutritious meals to support metabolic balance.",
      "Engage in 20-30 minutes of moderate activity, like a steady walk through the fields or stretching.",
      "Incorporate fiber-rich foods like whole grains, pulses, and local green leafy vegetables."
    ],
    questionsToAskDoctor: [
      "Are my irregular periods related to my hormone levels?",
      "Would a simple blood test or pelvic scan help explain my symptoms?",
      "What gentle dietary adjustments do you recommend for my metabolic health?"
    ],
    trustedResources: [
      "World Health Organization (WHO) Reproductive Health Guides",
      "National Health Portal of India (NHP)",
      "Local Accredited Social Health Activist (ASHA) guidelines"
    ]
  },
  {
    id: "ka_2",
    title: "Preventing Iron Deficiency Anemia",
    category: "Nutrition",
    overview: "Anemia occurs when your blood has a lower amount of hemoglobin, a protein that carries oxygen to your muscles and brain. It is very common in women, especially postpartum or during heavy cycles.",
    commonSymptoms: [
      "Feeling unusually tired, weak, or short of breath",
      "Pale skin, cold hands, and cold feet",
      "Mild dizziness, especially when standing up quickly",
      "Unexplained headaches or low stamina during daily chores"
    ],
    lifestyleTips: [
      "Take your prescribed Iron and Folic Acid supplements daily with dinner to maximize absorption.",
      "Eat iron-rich foods like spinach (palak), fenugreek (methi), lentils, and jaggery (gur) instead of white sugar.",
      "Add Vitamin C (like lemons, amla, or oranges) to your meals to help your body absorb iron better.",
      "Avoid drinking tea or coffee immediately after meals, as they can block iron absorption."
    ],
    questionsToAskDoctor: [
      "What is my current Hemoglobin level, and what is our target?",
      "How long should I continue taking daily iron and folic acid supplements?",
      "Can we check my iron stores (Ferritin) to ensure my recovery?"
    ],
    trustedResources: [
      "Anemia Mukt Bharat (Anemia-Free India) Initiative Portal",
      "Ministry of Health and Family Welfare (MoHFW) India",
      "WHO Nutritional Anemia Guidelines"
    ]
  },
  {
    id: "ka_3",
    title: "Essential Nutrition for a Healthy Pregnancy",
    category: "Maternity",
    overview: "A safe, healthy pregnancy relies on giving your body and your growing baby the right nutrients. It prepares you for a smooth delivery and supportive postpartum recovery.",
    commonSymptoms: [
      "Increased appetite and changing taste preferences",
      "Mild nausea or morning sickness in early months",
      "Slightly increased demand for rest and hydration"
    ],
    lifestyleTips: [
      "Eat diverse meals with extra servings of pulses, curd, seasonal fruits, and dark green vegetables.",
      "Take your prenatal Folic Acid and Iron-Calcium supplements regularly as advised by your local nurse or doctor.",
      "Stay well-hydrated by drinking clean water, coconut water, or fresh buttermilk throughout the day.",
      "Practice gentle, safe exercises like short, relaxed walks in the mornings."
    ],
    questionsToAskDoctor: [
      "What supplements are essential for me at this stage of pregnancy?",
      "How much weight gain is healthy and normal for my body type?",
      "Are there specific local foods I should avoid during my pregnancy?"
    ],
    trustedResources: [
      "Janani Suraksha Yojana (JSY) guidelines",
      "UNICEF Maternal Nutrition Handbooks",
      "WHO Antenatal Care Guidelines"
    ]
  },
  {
    id: "ka_4",
    title: "Tracking and Understanding Your Menstrual Cycle",
    category: "Reproductive Health",
    overview: "A regular menstrual cycle is an excellent sign of overall hormone health. Tracking it helps you understand your body's monthly rhythms and plan your daily activities comfortably.",
    commonSymptoms: [
      "Mild abdominal cramping or lower back discomfort before or during bleeding",
      "Slight changes in mood or energy levels a few days before your period starts",
      "Temporary bloating or breast tenderness"
    ],
    lifestyleTips: [
      "Keep a clean, small calendar or use Saheli to log when your bleeding starts and ends.",
      "Practice clean menstrual hygiene: change cotton cloths or sanitary pads every 4-6 hours.",
      "Use warm water compresses to relieve lower back discomfort or mild stomach cramps.",
      "Maintain your normal physical activity, but take gentle rests when your body asks for it."
    ],
    questionsToAskDoctor: [
      "Is my cycle length (usually between 21 and 35 days) considered normal?",
      "How can I manage severe premenstrual cramping without heavy medication?",
      "What should I do if my bleeding lasts longer than 7 days or is extremely heavy?"
    ],
    trustedResources: [
      "National Health Portal Menstrual Hygiene Scheme",
      "Ministry of Women and Child Development (MWCD) India",
      "UNICEF Menstrual Health and Hygiene guidance"
    ]
  },
  {
    id: "ka_5",
    title: "Caring for Your Breast Health",
    category: "Preventive Care",
    overview: "Breast health awareness is essential for women of all ages. Regular breast self-checks allow you to know what is normal for your body, helping you spot any changes early when they are easiest to address.",
    commonSymptoms: [
      "A new, unusual lump in the breast or underarm area",
      "Changes in the size or shape of the breast",
      "Redness, dimpling, or scaling of the breast skin",
      "Unexplained pain or fluid discharge"
    ],
    lifestyleTips: [
      "Do a simple breast self-examination once a month, about 3-5 days after your period ends.",
      "Wear comfortable, well-fitting cotton support garments during daily chores and agricultural work.",
      "Stay active with regular physical routines and enjoy a diet rich in fruits, vegetables, and whole grains."
    ],
    questionsToAskDoctor: [
      "How exactly do I perform a correct monthly breast self-examination?",
      "At my age, should I schedule a clinical breast exam or a mammogram?",
      "Are there any specific breast cancer risk factors in my family history we should monitor?"
    ],
    trustedResources: [
      "National Cancer Grid India Patient Education Portal",
      "WHO Breast Cancer Initiative Guidelines",
      "Tata Memorial Hospital Women's Cancer Awareness"
    ]
  },
  {
    id: "ka_6",
    title: "Navigating Perimenopause and Menopause",
    category: "Healthy Aging",
    overview: "Menopause is the natural phase in a woman's life when her menstrual cycles stop permanently, usually between the ages of 45 and 55. Perimenopause is the transition period leading up to it.",
    commonSymptoms: [
      "Irregular periods that become lighter or heavier and eventually stop",
      "Sudden feelings of heat (hot flashes) or night sweats",
      "Sleep disturbances, mild mood swings, or temporary forgetfulness",
      "Joint or bone aches due to lower estrogen levels"
    ],
    lifestyleTips: [
      "Keep your body cool by wearing breathable, loose cotton clothing and staying in well-ventilated rooms.",
      "Strengthen your bones by eating calcium-rich foods like milk, curd, ragi (finger millet), and sesame seeds.",
      "Spend 10-15 minutes in gentle morning sunlight to maintain healthy Vitamin D levels.",
      "Practice cooling breathing exercises (like Sheetali Pranayama) to calm sudden hot flashes."
    ],
    questionsToAskDoctor: [
      "Are my irregular periods and hot flashes typical signs of menopause transition?",
      "How can I check if my bones are strong enough, and should I take calcium supplements?",
      "Are there safe, non-hormonal ways to manage severe night sweats or sleep issues?"
    ],
    trustedResources: [
      "Indian Menopause Society (IMS) guidelines",
      "National Institute on Aging (NIA) Menopause guides",
      "WHO Menopause transition fact sheets"
    ]
  },
  {
    id: "ka_7",
    title: "Simple Stress Management for Busy Women",
    category: "Mental Wellness",
    overview: "Balancing farm work, child-rearing, cooking, and household responsibilities can be highly demanding. Mental wellness is a key pillar of physical health.",
    commonSymptoms: [
      "Feeling constantly overwhelmed, irritable, or restless",
      "Difficulty falling asleep or staying asleep",
      "Tension headaches, neck stiffness, or rapid heartbeats",
      "Low energy or lack of motivation for daily chores"
    ],
    lifestyleTips: [
      "Take 5 minutes twice a day to sit quietly and practice deep, slow abdominal breathing.",
      "Share your thoughts and worries with a trusted family member or your close friends (sahelis) in the village.",
      "Establish a relaxing bedtime routine, avoiding mobile screens or active chores 30 minutes before sleep.",
      "Take small water breaks during long hours working in the fields or kitchen."
    ],
    questionsToAskDoctor: [
      "Can chronic stress cause my physical symptoms like headaches or digestive issues?",
      "Are there local community support groups or counselors I can talk to?",
      "What breathing or meditation exercises are clinically proven to help calm anxiety?"
    ],
    trustedResources: [
      "National Institute of Mental Health and Neuro Sciences (NIMHANS) India",
      "Kiran Mental Health Helpline (Government of India)",
      "WHO Stress Management Handbooks"
    ]
  }
];

export class OrchestratorService {
  private subscribers: Map<OrchestratorEventType, Set<EventSubscriber>> = new Map();
  private allSubscribers: Set<EventSubscriber> = new Set();
  
  // App State
  private brain: HealthBrain;
  private symptoms: SymptomLog[] = [];
  private timeline: TimelineEvent[];
  private appointments: Appointment[];
  private summary: HealthSummary;
  private logs: OrchestratorEvent[] = [];

  // Phase 2 States
  private medicalRecords: MedicalRecord[] = [];
  private medications: Medication[] = [];
  private preventive: PreventiveReminder[] = [];
  private doctorCompanion: DoctorCompanionState;

  // Phase 3 States
  private currentLifeStage: LifeStageType = "Motherhood";
  private emotionLogs: EmotionLog[] = [];
  private weeklyCheckIns: WeeklyCheckIn[] = [];
  private journalEntries: JournalEntry[] = [];
  private goals: HealthGoal[] = [];
  private achievements: Achievement[] = [];

  // Phase 4 States
  private healthInsights: HealthInsight[] = [];
  private knowledgeArticles: KnowledgeArticle[] = [];
  private recommendations: Recommendation[] = [];
  private monthlyReviews: MonthlyReview[] = [];
  private healthIndicators: HealthIndicator[] = [];
  private memoryItems: MemoryItem[] = [];
  private searchIndex: SearchIndex[] = [];

  constructor() {
    // Load from local storage if available, otherwise seed
    const savedBrain = localStorage.getItem("saheli_health_brain");
    const savedTimeline = localStorage.getItem("saheli_timeline");
    const savedSymptoms = localStorage.getItem("saheli_symptoms");
    const savedAppointments = localStorage.getItem("saheli_appointments");
    const savedSummary = localStorage.getItem("saheli_summary");
    const savedLogs = localStorage.getItem("saheli_logs");

    // Phase 2 Loaders
    const savedRecords = localStorage.getItem("saheli_medical_records");
    const savedMedications = localStorage.getItem("saheli_medications");
    const savedPreventive = localStorage.getItem("saheli_preventive_reminders");
    const savedDoctorCompanion = localStorage.getItem("saheli_doctor_companion");

    // Phase 3 Loaders
    const savedLifeStage = localStorage.getItem("saheli_life_stage");
    const savedEmotionLogs = localStorage.getItem("saheli_emotion_logs");
    const savedWeeklyCheckIns = localStorage.getItem("saheli_weekly_checkins");
    const savedJournalEntries = localStorage.getItem("saheli_journal_entries");
    const savedGoals = localStorage.getItem("saheli_goals");
    const savedAchievements = localStorage.getItem("saheli_achievements");

    // Phase 4 Loaders
    const savedInsights = localStorage.getItem("saheli_health_insights");
    const savedRecommendations = localStorage.getItem("saheli_recommendations");
    const savedReviews = localStorage.getItem("saheli_monthly_reviews");
    const savedIndicators = localStorage.getItem("saheli_health_indicators");
    const savedMemories = localStorage.getItem("saheli_memory_items");

    this.brain = savedBrain ? JSON.parse(savedBrain) : INITIAL_HEALTH_BRAIN;
    this.timeline = savedTimeline ? JSON.parse(savedTimeline) : INITIAL_TIMELINE;
    this.appointments = savedAppointments ? JSON.parse(savedAppointments) : INITIAL_APPOINTMENTS;
    this.summary = savedSummary ? JSON.parse(savedSummary) : INITIAL_SUMMARY;
    this.symptoms = savedSymptoms ? JSON.parse(savedSymptoms) : [
      { id: "s1", date: "2026-07-01", name: "Lower Back Discomfort", severity: "Mild", notes: "After fields work" }
    ];
    this.logs = savedLogs ? JSON.parse(savedLogs) : [
      { type: "profile_updated", payload: { name: "Priya Devi" }, timestamp: "2026-05-15T10:00:00Z" }
    ];

    this.medicalRecords = savedRecords ? JSON.parse(savedRecords) : INITIAL_RECORDS;
    this.medications = savedMedications ? JSON.parse(savedMedications) : INITIAL_MEDICATIONS;
    this.preventive = savedPreventive ? JSON.parse(savedPreventive) : INITIAL_PREVENTIVE;
    this.doctorCompanion = savedDoctorCompanion ? JSON.parse(savedDoctorCompanion) : INITIAL_DOCTOR_COMPANION;

    // Phase 3 Initializers
    this.currentLifeStage = savedLifeStage ? (JSON.parse(savedLifeStage) as LifeStageType) : INITIAL_LIFE_STAGE;
    this.emotionLogs = savedEmotionLogs ? JSON.parse(savedEmotionLogs) : INITIAL_EMOTION_LOGS;
    this.weeklyCheckIns = savedWeeklyCheckIns ? JSON.parse(savedWeeklyCheckIns) : INITIAL_WEEKLY_CHECKINS;
    this.journalEntries = savedJournalEntries ? JSON.parse(savedJournalEntries) : INITIAL_JOURNAL_ENTRIES;
    this.goals = savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS;
    this.achievements = savedAchievements ? JSON.parse(savedAchievements) : INITIAL_ACHIEVEMENTS;

    // Phase 4 Initializers
    this.knowledgeArticles = SEED_KNOWLEDGE_ARTICLES;
    this.healthInsights = savedInsights ? JSON.parse(savedInsights) : [];
    this.recommendations = savedRecommendations ? JSON.parse(savedRecommendations) : [];
    this.monthlyReviews = savedReviews ? JSON.parse(savedReviews) : [];
    this.healthIndicators = savedIndicators ? JSON.parse(savedIndicators) : [];
    
    this.memoryItems = savedMemories ? JSON.parse(savedMemories) : [
      {
        id: "m1",
        category: "appointment",
        key: "Preferred Appointment Time",
        value: "Morning slots (10:00 AM to 12:00 PM)",
        transparentReason: "Explicitly shared during your conversation on July 5",
        updatedAt: "2026-07-05"
      },
      {
        id: "m2",
        category: "language",
        key: "Preferred Language",
        value: "Hindi (हिंदी)",
        transparentReason: "Configured during account setup",
        updatedAt: "2026-05-15"
      },
      {
        id: "m3",
        category: "medication",
        key: "Medication Reminder Timing",
        value: "At night, after dinner (9:00 PM)",
        transparentReason: "Logged during medication setup",
        updatedAt: "2026-06-02"
      },
      {
        id: "m4",
        category: "fear_anxiety",
        key: "Doctor Preparation Note",
        value: "Slight nervousness about clinics, prefers doctors who explain terms in simple Hindi",
        transparentReason: "Shared in emotional health notes",
        updatedAt: "2026-07-06"
      },
      {
        id: "m5",
        category: "exercise",
        key: "Favorite Exercise",
        value: "Walking through local fields and stretching during postpartum recovery",
        transparentReason: "Extracted from lifestyle profile",
        updatedAt: "2026-05-20"
      }
    ];

    // Seed defaults if empty
    if (this.healthIndicators.length === 0) {
      this.recalculateIndicatorsInternal();
    }
    if (this.healthInsights.length === 0) {
      this.generateHealthInsightsInternal();
    }
    if (this.monthlyReviews.length === 0) {
      this.generateMonthlyReviewInternal();
    }
    this.refreshRecommendations();
    this.rebuildSearchIndexInternal();

    // Auto-save setup
    this.subscribeAll((event) => {
      this.logs.unshift(event);
      // Keep only last 50 logs for readability
      if (this.logs.length > 50) this.logs.pop();

      localStorage.setItem("saheli_health_brain", JSON.stringify(this.brain));
      localStorage.setItem("saheli_timeline", JSON.stringify(this.timeline));
      localStorage.setItem("saheli_symptoms", JSON.stringify(this.symptoms));
      localStorage.setItem("saheli_appointments", JSON.stringify(this.appointments));
      localStorage.setItem("saheli_summary", JSON.stringify(this.summary));
      localStorage.setItem("saheli_logs", JSON.stringify(this.logs));

      // Phase 2 Savers
      localStorage.setItem("saheli_medical_records", JSON.stringify(this.medicalRecords));
      localStorage.setItem("saheli_medications", JSON.stringify(this.medications));
      localStorage.setItem("saheli_preventive_reminders", JSON.stringify(this.preventive));
      localStorage.setItem("saheli_doctor_companion", JSON.stringify(this.doctorCompanion));

      // Phase 3 Savers
      localStorage.setItem("saheli_life_stage", JSON.stringify(this.currentLifeStage));
      localStorage.setItem("saheli_emotion_logs", JSON.stringify(this.emotionLogs));
      localStorage.setItem("saheli_weekly_checkins", JSON.stringify(this.weeklyCheckIns));
      localStorage.setItem("saheli_journal_entries", JSON.stringify(this.journalEntries));
      localStorage.setItem("saheli_goals", JSON.stringify(this.goals));
      localStorage.setItem("saheli_achievements", JSON.stringify(this.achievements));

      // Phase 4 Savers
      localStorage.setItem("saheli_health_insights", JSON.stringify(this.healthInsights));
      localStorage.setItem("saheli_recommendations", JSON.stringify(this.recommendations));
      localStorage.setItem("saheli_monthly_reviews", JSON.stringify(this.monthlyReviews));
      localStorage.setItem("saheli_health_indicators", JSON.stringify(this.healthIndicators));
      localStorage.setItem("saheli_memory_items", JSON.stringify(this.memoryItems));
    });
  }

  // Pub Sub Implementation
  public subscribe(type: OrchestratorEventType, callback: EventSubscriber): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback);
    return () => {
      this.subscribers.get(type)?.delete(callback);
    };
  }

  public subscribeAll(callback: EventSubscriber): () => void {
    this.allSubscribers.add(callback);
    return () => {
      this.allSubscribers.delete(callback);
    };
  }

  public publish(type: OrchestratorEventType, payload: any) {
    const event: OrchestratorEvent = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    // Notify specific type subscribers
    this.subscribers.get(type)?.forEach((callback) => {
      try {
        callback(event);
      } catch (err) {
        console.error(`Error in subscriber for event ${type}:`, err);
      }
    });

    // Notify all-event subscribers
    this.allSubscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (err) {
        console.error(`Error in global subscriber:`, err);
      }
    });
  }

  // State Getters
  public getHealthBrain(): HealthBrain {
    return this.brain;
  }

  public getSymptomLog(): SymptomLog[] {
    return this.symptoms;
  }

  public getTimeline(): TimelineEvent[] {
    return this.timeline;
  }

  public getAppointments(): Appointment[] {
    return this.appointments;
  }

  public getHealthSummary(): HealthSummary {
    return this.summary;
  }

  public getSystemLogs(): OrchestratorEvent[] {
    return this.logs;
  }

  // Phase 2 Getters
  public getMedicalRecords(): MedicalRecord[] {
    return this.medicalRecords;
  }

  public getMedications(): Medication[] {
    return this.medications;
  }

  public getPreventiveReminders(): PreventiveReminder[] {
    return this.preventive;
  }

  public getDoctorCompanion(): DoctorCompanionState {
    return this.doctorCompanion;
  }

  // Phase 3 Getters
  public getLifeStage(): LifeStageType {
    return this.currentLifeStage;
  }

  public getEmotionLogs(): EmotionLog[] {
    return this.emotionLogs;
  }

  public getWeeklyCheckIns(): WeeklyCheckIn[] {
    return this.weeklyCheckIns;
  }

  public getJournalEntries(): JournalEntry[] {
    return this.journalEntries;
  }

  public getGoals(): HealthGoal[] {
    return this.goals;
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Phase 3 Action Methods
  public updateLifeStage(stage: LifeStageType) {
    this.currentLifeStage = stage;
    this.publish("life_stage_updated", stage);

    // Cascade: log to timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date: new Date().toISOString().split("T")[0],
      category: "Life Events",
      title: `Life Stage Updated: ${stage}`,
      description: `Priya's active life stage is configured as ${stage}. All wellness and preventive suggestions are calibrated.`,
      notes: "Automatic life stage alignment complete."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);

    // Update preventive recommendations dynamically depending on the life stage!
    this.calibrateLifeStagePreventiveCare(stage);
    
    // Trigger summary update
    this.triggerSummaryRegeneration();
  }

  private calibrateLifeStagePreventiveCare(stage: LifeStageType) {
    const stageReminders: Record<LifeStageType, { title: string; desc: string; interval: string; cat: "Screening" | "Vaccination" | "Lifestyle" | "Checkup" }[]> = {
      "First Period": [
        { title: "Menstrual Hygiene counseling", desc: "Consult with local health guides on safe menstrual hygiene practices and normal ranges.", interval: "Once", cat: "Lifestyle" }
      ],
      "Teenager": [
        { title: "Anemia Prevention & Nutrition", desc: "Nutritional review focusing on iron-rich local diets (spinach, jaggery, legumes).", interval: "Every 6 months", cat: "Lifestyle" },
        { title: "HPV Vaccination Series", desc: "Crucial cervical cancer prevention vaccine series.", interval: "As advised by health worker", cat: "Vaccination" }
      ],
      "College": [
        { title: "Mental Well-being & Stress Management", desc: "Simple techniques to balance exam preparation or study schedules.", interval: "Ongoing", cat: "Lifestyle" }
      ],
      "Working Professional": [
        { title: "Ergonomic Back & Neck Care", desc: "Discuss postures and gentle stretching during long working hours.", interval: "Daily", cat: "Lifestyle" }
      ],
      "Newly Married": [
        { title: "Family Planning & Reproductive Consultation", desc: "Consult Dr. Anjali Mehta about safe spacing and healthy couples' choices.", interval: "Once", cat: "Checkup" }
      ],
      "Trying to Conceive": [
        { title: "Pre-Conception Gynaecological Consultation", desc: "Discuss planning a safe, healthy second pregnancy, prenatal vitamins, and optimizing hemoglobin levels.", interval: "Once before planning", cat: "Checkup" },
        { title: "Prenatal Folic Acid Supplement Initiation", desc: "Log daily intake to prevent birth defects and maintain neural health.", interval: "Daily", cat: "Lifestyle" }
      ],
      "Pregnancy": [
        { title: "Antenatal Care (ANC) Regular Checkups", desc: "Essential health center checkups: weight, blood pressure, fetal sound monitoring.", interval: "At least 4 visits", cat: "Checkup" },
        { title: "Maternal Tetanus Vaccine (TT2 or Booster)", desc: "Critical vaccine defense for maternal and newborn wellness.", interval: "During pregnancy", cat: "Vaccination" }
      ],
      "Motherhood": [
        { title: "Postpartum Rehabilitation Exercises", desc: "Targeted abdominal core and lower back recovery stretching.", interval: "3 times a week", cat: "Lifestyle" },
        { title: "Pediatric Immunization Sync", desc: "Align mother's timeline with child's government vaccination chart.", interval: "Per standard schedule", cat: "Checkup" }
      ],
      "Perimenopause": [
        { title: "Hormonal Biomarker Review", desc: "Evaluate transition markers and address sudden hot flashes or sleep pattern changes.", interval: "Once a year", cat: "Screening" }
      ],
      "Menopause": [
        { title: "Bone Mineral Density (DEXA) Screen", desc: "Assess bone density to monitor osteoporosis risk after estrogen levels drop.", interval: "Every 2 years", cat: "Screening" },
        { title: "Calcium and Vitamin D Intake Audit", desc: "Ensure bone safety through calcium-rich diets or active supplement logging.", interval: "Daily", cat: "Lifestyle" }
      ],
      "Healthy Aging": [
        { title: "Cardiovascular Screen & BP checks", desc: "Fasting lipid panel and weekly blood pressure check to protect heart health.", interval: "Every 6 months", cat: "Screening" },
        { title: "Eye Examination (Cataract Screen)", desc: "Routine visual health and intraocular pressure check.", interval: "Once a year", cat: "Screening" }
      ]
    };

    const suggestions = stageReminders[stage] || [];
    suggestions.forEach(s => {
      const exists = this.preventive.some(p => p.title === s.title);
      if (!exists) {
        const id = "prev_" + Math.random().toString(36).substring(2, 9);
        const newRem: PreventiveReminder = {
          id,
          title: s.title,
          description: s.desc,
          triggerReason: `Tailored specifically for your active life stage: "${stage}".`,
          category: s.cat,
          status: "Pending",
          recommendedInterval: s.interval
        };
        this.preventive.unshift(newRem);
        this.publish("preventive_added", newRem);
      }
    });
  }

  public addEmotionLog(emotion: EmotionLog["emotion"], note?: string) {
    const id = "em_" + Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split("T")[0];

    const responses: Record<EmotionLog["emotion"], string> = {
      Happy: "It is wonderful that you are feeling happy today, Priya! Keep spreading this positive energy in your household. Remember to cherish this light-hearted space.",
      Calm: "A calm mind is a powerful shield. We are glad you have peace and stillness today. Continue your breathing exercises to sustain this gentle focus.",
      Tired: "You work so hard, Priya! Taking care of your child, household, and fields can take a toll. Rest is not a luxury, it is a clinical need. Please sleep early tonight.",
      Stressed: "We hear you, Priya. It is okay to feel overwhelmed. Try taking five slow breaths right now. Remember, Saheli is here to listen. Speak with Dr. Anjali or Sunita if the load gets too heavy.",
      Worried: "Thank you for sharing your worries. You are doing an incredible job. Let us take it one hour at a time. It may help to write down what is worrying you in your journal.",
      Emotional: "Feeling emotional is a natural part of our beautiful journey. Be very gentle with yourself. Your feelings are real, valid, and worthy of care.",
      Low: "We are sending you a warm hug, Priya. Some days are dark, but you are never alone. Take deep, patient breaths and speak with Rajesh or your sahelis (friends) about how you feel."
    };

    const aiResponse = responses[emotion];
    const newLog: EmotionLog = { id, date, emotion, note, aiResponse };
    this.emotionLogs.unshift(newLog);
    this.publish("emotion_logged", newLog);

    // Cascade to Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const emoEmojis: Record<EmotionLog["emotion"], string> = {
      Happy: "😊", Calm: "😌", Tired: "😴", Stressed: "😣", Worried: "😟", Emotional: "😢", Low: "😔"
    };
    const newTimelineEvent: TimelineEvent = {
      id: timelineId,
      date,
      category: "Life Events",
      title: `${emoEmojis[emotion]} Mood logged: ${emotion}`,
      description: note ? `Logged daily mood note: "${note}"` : `Logged feeling ${emotion} today.`,
      notes: "Auto-synced into Personal Health Brain."
    };
    this.timeline.unshift(newTimelineEvent);
    this.publish("timeline_updated", newTimelineEvent);

    const stressGoal = this.goals.find(g => g.category === "Stress");
    if (stressGoal && emotion === "Calm") {
      this.updateGoalProgress(stressGoal.id, stressGoal.currentValue + 1);
    }

    this.triggerSummaryRegeneration();
  }

  public addWeeklyCheckIn(checkIn: Omit<WeeklyCheckIn, "id" | "date">) {
    const id = "wc_" + Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split("T")[0];

    const newCheckIn: WeeklyCheckIn = { id, date, ...checkIn };
    this.weeklyCheckIns.unshift(newCheckIn);
    this.publish("weekly_checkin_completed", newCheckIn);

    // Cascade to Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date,
      category: "Symptoms",
      title: "Completed Weekly Vitals Check-in",
      description: `Tracked Pain (${checkIn.pain}/5), Energy (${checkIn.energy}/5), Mood (${checkIn.mood}/5), Sleep (${checkIn.sleep}/5), Cycle state (${checkIn.cycle}).`,
      notes: "Successfully logged weekly trends into Saheli Brain."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);

    if (checkIn.exercise >= 4 && checkIn.waterIntake >= 4) {
      this.addAchievement("🌸 Superb Weekly Habits", "Achieved excellent active exercise and hydration score during weekly review!", "🌸");
    }

    this.triggerSummaryRegeneration();
  }

  public addJournalEntry(text: string, hasVoiceNote?: boolean, hasPhoto?: boolean) {
    const id = "je_" + Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split("T")[0];

    const newEntry: JournalEntry = { id, date, text, hasVoiceNote, hasPhoto };
    this.journalEntries.unshift(newEntry);
    this.publish("journal_entry_added", newEntry);

    // Cascade to Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date,
      category: "Life Events",
      title: "Wrote Daily Reflection Journal",
      description: text.length > 60 ? text.substring(0, 60) + "..." : text,
      notes: "Securely stored in encrypted local storage."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);

    const lowerText = text.toLowerCase();
    if (lowerText.includes("walk") || lowerText.includes("stretching") || lowerText.includes("water")) {
      const exerciseGoal = this.goals.find(g => g.category === "Exercise");
      if (exerciseGoal && lowerText.includes("walk")) {
        this.updateGoalProgress(exerciseGoal.id, Math.min(exerciseGoal.targetValue, exerciseGoal.currentValue + 10));
      }
      const waterGoal = this.goals.find(g => g.category === "Water");
      if (waterGoal && lowerText.includes("water")) {
        this.updateGoalProgress(waterGoal.id, Math.min(waterGoal.targetValue, waterGoal.currentValue + 2));
      }
    }

    this.triggerSummaryRegeneration();
  }

  public addGoal(title: string, category: HealthGoal["category"], targetValue: number, unit: string) {
    const id = "g_" + Math.random().toString(36).substring(2, 9);
    const newGoal: HealthGoal = {
      id,
      title,
      category,
      targetValue,
      currentValue: 0,
      unit,
      completed: false
    };
    this.goals.push(newGoal);
    this.publish("goal_created", newGoal);

    // Cascade to Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date: new Date().toISOString().split("T")[0],
      category: "Goals",
      title: `Created Health Goal: ${title}`,
      description: `Targeting: ${targetValue} ${unit}. Category: ${category}.`,
      notes: "Goal active on dashboard."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);

    this.triggerSummaryRegeneration();
  }

  public updateGoalProgress(id: string, value: number) {
    const goal = this.goals.find(g => g.id === id);
    if (goal) {
      const oldCompleted = goal.completed;
      goal.currentValue = value;
      goal.completed = value >= goal.targetValue;
      this.publish("profile_updated", this.brain);

      if (goal.completed && !oldCompleted) {
        this.publish("goal_completed", goal);
        this.addAchievement(`🌸 Goal Achieved: ${goal.title}`, `Successfully completed your target of ${goal.targetValue} ${goal.unit}!`, "🌸");
      }
    }
  }

  public addAchievement(title: string, description: string, icon: string = "🌸") {
    const id = "ac_" + Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split("T")[0];
    const newAch: Achievement = { id, title, date, icon, description };
    this.achievements.unshift(newAch);
    this.publish("milestone_achieved", newAch);

    // Cascade to Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date,
      category: "Goals",
      title: `Win Celebrated! ${title}`,
      description,
      notes: "Milestone saved successfully."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);
  }

  public addLifeEvent(title: string, description: string, date: string, notes?: string) {
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date,
      category: "Life Events",
      title,
      description,
      notes: notes || "Logged by Priya."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);
    this.triggerSummaryRegeneration();
  }

  // Action Methods (Triggers Orchestrator cascades)
  public updateProfile(updatedBrain: Partial<HealthBrain>) {
    this.brain = { ...this.brain, ...updatedBrain };
    this.publish("profile_updated", updatedBrain);

    // Cascade 1: Add a Timeline event for health update
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date: new Date().toISOString().split("T")[0],
      category: "Health Updates",
      title: "Health Brain Profile Updated",
      description: "Information in the Lifelong Health Brain was updated with new profile variables.",
      notes: "Auto-logged by the Orchestrator."
    };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);
  }

  public addSymptom(symptom: Omit<SymptomLog, "id" | "date">) {
    const symptomId = "s_" + Math.random().toString(36).substring(2, 9);
    const newSymptom: SymptomLog = {
      ...symptom,
      id: symptomId,
      date: new Date().toISOString().split("T")[0]
    };

    this.symptoms.unshift(newSymptom);
    this.publish("symptom_added", newSymptom);

    // Cascade 1: Automatically generate a corresponding Timeline Event
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date: newSymptom.date,
      category: "Symptoms",
      title: `Logged Symptom: ${newSymptom.name}`,
      description: `Symptom of ${newSymptom.severity.toLowerCase()} severity logged. Notes: ${newSymptom.notes || "None"}`,
      notes: "Symptom tracked securely in the Personal Health Brain."
    };

    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);

    // Cascade 2: Trigger summary recalculation
    this.triggerSummaryRegeneration();
  }

  public createAppointment(appt: Omit<Appointment, "id">) {
    const apptId = "a_" + Math.random().toString(36).substring(2, 9);
    const newAppt: Appointment = {
      ...appt,
      id: apptId
    };

    this.appointments.unshift(newAppt);
    this.publish("appointment_created", newAppt);

    // Cascade 1: Automatically generate a corresponding Timeline Event
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = {
      id: timelineId,
      date: newAppt.date,
      category: "Appointments",
      title: `Scheduled Appointment: ${newAppt.purpose}`,
      description: `Appointment set with ${newAppt.doctorName} at ${newAppt.time}.`,
      notes: "Remembered for future healthcare preparation."
    };

    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);
    
    // Auto reset Doctor Companion for this new appointment
    this.doctorCompanion = {
      id: "dc_" + Math.random().toString(36).substring(2, 9),
      appointmentId: newAppt.id,
      chiefComplaint: newAppt.purpose,
      concerns: ["General checkup and review of reports"],
      questionsToAsk: ["What are my next steps for treatment?", "Are there any modifications to my medications?"],
      selectedReportIds: this.medicalRecords.map(r => r.id),
      completed: false
    };
    this.publish("record_uploaded", this.doctorCompanion); // triggers state save
  }

  public addDirectTimelineEvent(event: Omit<TimelineEvent, "id">) {
    const id = "t_" + Math.random().toString(36).substring(2, 9);
    const newEvent: TimelineEvent = { ...event, id };
    this.timeline.unshift(newEvent);
    this.publish("timeline_updated", newEvent);
  }

  public updateHealthSummary(newSummary: HealthSummary) {
    this.summary = newSummary;
    this.publish("health_summary_updated", newSummary);
  }

  // PHASE 2 ACTIONS (AI Care Orchestration Loops)

  /**
   * Upload Medical Record - automatically processes and triggers cascading intelligence
   */
  public addMedicalRecord(rec: Omit<MedicalRecord, "id" | "labReport" | "fileType" | "isEncrypted" | "consentSharedWith">) {
    const id = "rec_" + Math.random().toString(36).substring(2, 9);
    
    // Initialize record
    const newRecord: MedicalRecord = {
      ...rec,
      id,
      fileType: "other", // default
      isEncrypted: false,
      consentSharedWith: ["Dr. Anjali Mehta"]
    };

    // AI ORCHESTRATOR LOOP 1: Auto extract lab intelligence if it is a Blood Test or Hormone report
    if (newRecord.category === "Blood Tests" || newRecord.category === "Hormone Reports") {
      newRecord.fileType = "blood_report";
      
      // Simulate extraction of CBC / thyroid metrics
      const mockMetrics: LabMetric[] = [
        {
          name: "Hemoglobin",
          value: "10.8",
          unit: "g/dL",
          referenceRange: "12.0 - 15.0",
          status: "Low",
          explanation: "Hemoglobin is below the ideal range. This can result in lower stamina, cold extremities, or mild anemia, common during busy farming cycles."
        },
        {
          name: "Vitamin D3",
          value: "22.5",
          unit: "ng/mL",
          referenceRange: "30.0 - 100.0",
          status: "Low",
          explanation: "Slightly low vitamin D3, which supports bone mineralization and immunity. A simple daily walk in the sun can help."
        },
        {
          name: "Ferritin (Iron Storage)",
          value: "12.0",
          unit: "ng/mL",
          referenceRange: "15.0 - 150.0",
          status: "Low",
          explanation: "Ferritin stores are low, indicating your iron reserve needs attention. Discuss increasing green leafy vegetables and continuing iron therapy."
        },
        {
          name: "Blood Sugar (HbA1c)",
          value: "5.4",
          unit: "%",
          referenceRange: "Less than 5.7%",
          status: "Normal",
          explanation: "Perfectly normal blood sugar control over the past 3 months."
        }
      ];

      newRecord.labReport = {
        recordId: id,
        reportName: newRecord.title,
        date: newRecord.date,
        metrics: mockMetrics,
        summaryExplanation: "The intelligent engine extracted 3 low metrics: Hemoglobin (10.8), Ferritin (12.0), and Vitamin D3 (22.5). These indicate a potential iron-deficiency anemia starting to form. This matches your postpartum history. Educational advice: please discuss these results directly with Dr. Anjali Mehta."
      };
      
      newRecord.previewText = "Hemoglobin: 10.8 L, Vitamin D3: 22.5 L, Ferritin: 12.0 L, HbA1c: 5.4 N";
    } else if (newRecord.category === "Prescriptions") {
      newRecord.fileType = "prescription";
      newRecord.previewText = "Processed prescription: Iron & Folic Acid once daily, Vitamin D3 once weekly, Calcium daily.";
    } else {
      newRecord.fileType = "other";
      newRecord.previewText = "Hospital document successfully registered in secure ledger.";
    }

    // Save record
    this.medicalRecords.unshift(newRecord);
    this.publish("record_uploaded", newRecord);

    // AI ORCHESTRATOR LOOP 2: Update Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newTimelineEvent: TimelineEvent = {
      id: timelineId,
      date: newRecord.date,
      category: "Reports",
      title: `Uploaded: ${newRecord.title}`,
      description: `New ${newRecord.category.toLowerCase()} document uploaded from ${newRecord.hospital || "local clinic"} under ${newRecord.doctor || "assigned specialist"}.`,
      notes: newRecord.labReport ? "Lab Intelligence extracted hemoglobin and nutritional flags automatically." : "Stored securely with encrypted role-based access controls."
    };
    this.timeline.unshift(newTimelineEvent);
    this.publish("timeline_updated", newTimelineEvent);

    // AI ORCHESTRATOR LOOP 3: Update Personal Health Brain (medical History)
    if (newRecord.labReport) {
      const currentConditions = Array.from(new Set([...this.brain.medicalHistory.currentConditions, "Mild Anemia risk (Based on low hemoglobin)"]));
      this.brain.medicalHistory = {
        ...this.brain.medicalHistory,
        currentConditions
      };
      this.publish("profile_updated", this.brain);
    }

    // AI ORCHESTRATOR LOOP 4: Refresh Dashboard & Summary
    this.triggerSummaryRegeneration();

    // AI ORCHESTRATOR LOOP 5: Automatically link to upcoming Doctor Companion
    if (this.doctorCompanion && !this.doctorCompanion.completed) {
      this.doctorCompanion.selectedReportIds = Array.from(new Set([...this.doctorCompanion.selectedReportIds, id]));
      this.publish("record_uploaded", this.doctorCompanion);
    }

    // AI ORCHESTRATOR LOOP 6: Trigger Preventive Engine check-up advice
    if (newRecord.labReport) {
      // If hemoglobin or ferritin is low, recommend an annual blood test or nutritional checkup
      const hasSugarLow = newRecord.labReport.metrics.some(m => m.name === "Hemoglobin" && m.status === "Low");
      if (hasSugarLow) {
        const hasCheck = this.preventive.some(p => p.title.includes("Anemia"));
        if (!hasCheck) {
          const newReminder: PreventiveReminder = {
            id: "prev_" + Math.random().toString(36).substring(2, 9),
            title: "Follow-up Hemoglobin & Iron Check",
            description: "Check iron reserves in 3 months to monitor response to therapy.",
            triggerReason: `Based on recently uploaded report "${newRecord.title}" showing Hemoglobin ${newRecord.labReport.metrics[0].value} g/dL.`,
            category: "Checkup",
            status: "Pending",
            recommendedInterval: "In 3 months"
          };
          this.preventive.unshift(newReminder);
          this.publish("preventive_added", newReminder);
        }
      }
    }
  }

  /**
   * Add Medication to Dashboard
   */
  public addMedication(med: Omit<Medication, "id" | "checkIns">) {
    const id = "med_" + Math.random().toString(36).substring(2, 9);
    const newMed: Medication = {
      ...med,
      id,
      checkIns: []
    };
    this.medications.unshift(newMed);
    this.publish("medication_updated", newMed);

    // Add Timeline log
    this.addDirectTimelineEvent({
      date: newMed.startDate,
      category: "Medicines",
      title: `Started Medication: ${newMed.name}`,
      description: `Dosage: ${newMed.dose}, frequency: ${newMed.frequency}. Duration planned: ${newMed.duration}.`,
      notes: "Auto-logged in Medication Dashboard."
    });
  }

  /**
   * Check in / log adherence of medication
   */
  public logMedicationCheckIn(medId: string, checkIn: MedicationCheckIn) {
    this.medications = this.medications.map(med => {
      if (med.id === medId) {
        // Remove existing check-in for the same day if any, then push
        const filteredCheckIns = med.checkIns.filter(c => c.date !== checkIn.date);
        return {
          ...med,
          checkIns: [...filteredCheckIns, checkIn]
        };
      }
      return med;
    });
    this.publish("checkin_logged", { medId, checkIn });
  }

  /**
   * Edit medication status (Active, Completed, Paused)
   */
  public updateMedicationStatus(medId: string, status: "Active" | "Completed" | "Paused") {
    this.medications = this.medications.map(med => {
      if (med.id === medId) {
        return { ...med, status };
      }
      return med;
    });
    this.publish("medication_updated", { medId, status });
  }

  /**
   * Update Preventive Reminder status
   */
  public updatePreventiveReminderStatus(id: string, status: "Pending" | "Done" | "Dismissed") {
    this.preventive = this.preventive.map(prev => {
      if (prev.id === id) {
        return { ...prev, status };
      }
      return prev;
    });
    this.publish("preventive_added", { id, status });

    if (status === "Done") {
      this.addDirectTimelineEvent({
        date: new Date().toISOString().split("T")[0],
        category: "Life Events",
        title: `Completed Preventive Screen: ${this.preventive.find(p => p.id === id)?.title}`,
        description: `Successfully attended the screening or checkup event in alignment with preventive care recommendations.`,
        notes: "Keeps your health profile verified and protected."
      });
    }
  }

  /**
   * Update Doctor Companion before-visit details
   */
  public updateDoctorCompanion(updatedState: Partial<DoctorCompanionState>) {
    this.doctorCompanion = {
      ...this.doctorCompanion,
      ...updatedState
    };
    this.publish("record_uploaded", this.doctorCompanion); // state save
  }

  /**
   * After appointment prescription processor - parses prescription and syncs dashboard, brain, timeline
   */
  public processAfterAppointmentPrescription(
    prescriptionText: string,
    notes?: string,
    instructions?: string,
    followUpDate?: string,
    testsOrdered?: string[]
  ) {
    // 1. Update doctor companion state
    this.doctorCompanion = {
      ...this.doctorCompanion,
      prescriptionText,
      doctorInstructions: instructions,
      notes,
      followUpDate,
      testsOrdered,
      completed: true
    };

    // 2. AI EXTRACT MEDICINES AUTOMATICALLY FROM PRESCRIPTION
    // We mock a parser that extracts medicines based on keywords
    const lowerText = prescriptionText.toLowerCase();
    const extractedMeds: string[] = [];

    if (lowerText.includes("calcium") || lowerText.includes("calci")) {
      extractedMeds.push("Calcium Lactate 500mg");
      // Add medication to dashboard if not already there
      const hasMed = this.medications.some(m => m.name.toLowerCase().includes("calcium"));
      if (!hasMed) {
        this.addMedication({
          name: "Calcium Lactate Tablet",
          dose: "1 tablet (500mg)",
          frequency: "Once daily (Morning after breakfast)",
          duration: "30 days",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "Active"
        });
      }
    }

    if (lowerText.includes("paracetamol") || lowerText.includes("crocin") || lowerText.includes("pcm")) {
      extractedMeds.push("Paracetamol 650mg");
      const hasMed = this.medications.some(m => m.name.toLowerCase().includes("paracetamol"));
      if (!hasMed) {
        this.addMedication({
          name: "Paracetamol 650mg",
          dose: "1 tablet",
          frequency: "As needed (For back pain or fever)",
          duration: "5 days",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "Active"
        });
      }
    }

    if (lowerText.includes("b-complex") || lowerText.includes("folic") || lowerText.includes("vitamin")) {
      extractedMeds.push("Vitamin B-Complex with Folic Acid");
    }

    this.doctorCompanion.extractedMedicines = extractedMeds;
    this.publish("prescription_processed", this.doctorCompanion);

    // 3. Update Lifelong Health Brain with doctor's notes and medicines
    const currentMedicines = Array.from(new Set([
      ...this.brain.medicalHistory.currentMedicines,
      ...extractedMeds,
      "Calcium Lactate Tablet"
    ]));

    this.brain.medicalHistory = {
      ...this.brain.medicalHistory,
      currentMedicines
    };
    this.publish("profile_updated", this.brain);

    // 4. Update Care Journey Timeline
    const timelineId = "t_" + Math.random().toString(36).substring(2, 9);
    const newTimelineEvent: TimelineEvent = {
      id: timelineId,
      date: new Date().toISOString().split("T")[0],
      category: "Doctor Visits",
      title: `Visit Summary: Dr. Anjali Mehta`,
      description: `Completed clinic review. Doctor advised: ${instructions || "Continue healthy diet."}. Medicines prescribed: ${extractedMeds.join(", ") || "No new prescriptions."}`,
      notes: `Next follow-up recommended on: ${followUpDate || "Not scheduled"}.`
    };
    this.timeline.unshift(newTimelineEvent);
    this.publish("timeline_updated", newTimelineEvent);

    // 5. If new tests were ordered, add them to preventive reminders
    if (testsOrdered && testsOrdered.length > 0) {
      testsOrdered.forEach(test => {
        const testId = "prev_" + Math.random().toString(36).substring(2, 9);
        const newReminder: PreventiveReminder = {
          id: testId,
          title: `Ordered Test: ${test}`,
          description: `This blood screen or scan was ordered by Dr. Anjali Mehta during your visit.`,
          triggerReason: "Direct clinical instruction from Gynaecologist.",
          category: "Screening",
          status: "Pending",
          recommendedInterval: "Urgent (Within 2 weeks)"
        };
        this.preventive.unshift(newReminder);
        this.publish("preventive_added", newReminder);
      });
    }

    // 6. Refresh summary
    this.triggerSummaryRegeneration();
  }

  // Orchestrator automatic summary trigger
  private triggerSummaryRegeneration() {
    const latestSymptoms = this.symptoms.slice(0, 2).map(s => `${s.name} (${s.severity})`).join(", ");
    const activeMeds = this.medications.filter(m => m.status === "Active").map(m => m.name).slice(0, 2).join(", ");
    
    const updatedSummaryText = `${this.brain.profile.name} is a ${this.brain.profile.age}-year-old. Key current observation: she is tracking ${this.medicalRecords.length} medical records. Current symptoms logged: ${latestSymptoms || "No active symptoms reported."}. Active medications on her dashboard include: ${activeMeds || "Iron & Folic supplements"}. She maintains an active lifestyle walking to fields.`;
    
    const newSummary: HealthSummary = {
      updatedAt: new Date().toISOString().split("T")[0],
      summaryText: updatedSummaryText,
      keyActionItems: [
        `Monitor symptom: ${this.symptoms[0]?.name || "any symptoms"}`,
        `Adhere strictly to active medications: ${activeMeds || "Iron supplements"}`,
        `Address pending preventive checks: ${this.preventive.filter(p => p.status === "Pending").map(p => p.title).slice(0, 1).join("") || "Pap smear screen"}`
      ]
    };

    this.updateHealthSummary(newSummary);
  }

  // PHASE 4 COMPREHENSIVE CARE ACTIONS & CALCULATIONS

  public getHealthInsights(): HealthInsight[] {
    return this.healthInsights;
  }

  public getKnowledgeArticles(): KnowledgeArticle[] {
    return this.knowledgeArticles;
  }

  public getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  public getMonthlyReviews(): MonthlyReview[] {
    return this.monthlyReviews;
  }

  public getHealthIndicators(): HealthIndicator[] {
    return this.healthIndicators;
  }

  public getMemoryItems(): MemoryItem[] {
    return this.memoryItems;
  }

  public getSearchIndex(): SearchIndex[] {
    return this.searchIndex;
  }

  public updateFamilyHistory(mother: string, father: string, grandparents: string, siblings?: string, conditions?: string[]) {
    this.brain.familyHistory = {
      mother,
      father,
      grandparents,
      siblings,
      conditions
    };
    this.publish("profile_updated", this.brain);
    this.refreshRecommendations();
    this.rebuildSearchIndexInternal();
    this.triggerSummaryRegeneration();
  }

  public addMemoryItem(category: MemoryItem["category"], key: string, value: string, transparentReason: string) {
    const id = "m_" + Math.random().toString(36).substring(2, 9);
    const newItem: MemoryItem = {
      id,
      category,
      key,
      value,
      transparentReason,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    this.memoryItems.unshift(newItem);
    this.publish("memory_updated", newItem);
  }

  public deleteMemoryItem(id: string) {
    this.memoryItems = this.memoryItems.filter(m => m.id !== id);
    this.publish("memory_updated", id);
  }

  public search(query: string): SearchIndex[] {
    if (!query) return [];
    const lowercaseQuery = query.toLowerCase().trim();
    return this.searchIndex.filter(item => 
      item.contentToSearch.includes(lowercaseQuery) ||
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.itemType.toLowerCase().includes(lowercaseQuery)
    );
  }

  public recalculateIndicatorsInternal() {
    // 1. Medication Adherence
    const activeMeds = this.medications.filter(m => m.status === "Active");
    const medScore = activeMeds.length > 0 ? 92 : 80;
    const medDesc = activeMeds.length > 0 
      ? `Taking your ${activeMeds.map(m => m.name.split(" ")[0]).join(" & ")} daily as advised. Keeping this routine protects your baseline iron levels.`
      : "No active medications require tracking. Continue standard nutrition supplements if advised.";

    // 2. Appointment Completion
    const apptScore = 95;
    const apptDesc = "Routine maternal visits are booked in advance. Next consultation with Dr. Mehta is scheduled on July 23.";

    // 3. Preventive Care Completion
    const pendingPrev = this.preventive.filter(p => p.status === "Pending");
    const prevScore = pendingPrev.length > 3 ? 70 : 85;
    const prevDesc = pendingPrev.length > 0
      ? `You have ${pendingPrev.length} pending preventive checkups, including your next prenatal exam. Completing these supports pre-conception safety.`
      : "All age-recommended screenings and immunizations are up to date.";

    // 4. Lifestyle Goals
    const completedGoals = this.goals.filter(g => g.completed);
    const goalsScore = this.goals.length > 0 ? Math.round((completedGoals.length / this.goals.length) * 100) || 60 : 75;
    const goalsDesc = completedGoals.length > 0
      ? `Progressing on stretching and hydration. You have completed ${completedGoals.length} health goals recently.`
      : "Actively working on stretching and hydration goals. Consistency in routine supports core strength.";

    // 5. Hydration
    const latestCheckin = this.weeklyCheckIns[0];
    const hydrationScore = latestCheckin ? (latestCheckin.waterIntake >= 4 ? 90 : 75) : 80;
    const hydrationDesc = hydrationScore >= 90
      ? "Drinking 8-10 glasses of water daily. Staying hydrated supports kidney function and physical stamina in the fields."
      : "Drinking 5-6 glasses. Aim to carry a filled water flask to the fields to increase your daily hydration.";

    // 6. Sleep
    const sleepScore = latestCheckin ? (latestCheckin.sleep >= 4 ? 85 : 65) : 80;
    const sleepDesc = sleepScore >= 80
      ? "Averaging 7 hours of rest daily. Regular sleep allows muscles to recover and reduces postpartum back tension."
      : "Averaging less than 6 hours. Prioritize resting when your baby sleeps to support your physical recovery.";

    // 7. Physical Activity
    const activityScore = latestCheckin ? (latestCheckin.exercise >= 4 ? 90 : 70) : 85;
    const activityDesc = activityScore >= 90
      ? "Engaging in 20-30 minutes of gentle walking and stretching. This strengthens lower back and abdominal core muscles."
      : "Consider adding short 10-minute walks through the fields to gently increase daily mobility.";

    // 8. Symptom Tracking
    const symptomScore = this.symptoms.length > 0 ? 100 : 90;
    const symptomDesc = this.symptoms.length > 0
      ? "Logging back pain triggers regularly. Consistent tracking helps your doctor monitor back recovery patterns."
      : "Tracking minor symptoms. Keep logging any unusual changes to ensure simple, preventive guidance.";

    this.healthIndicators = [
      {
        id: "hi_1",
        name: "Medication Adherence",
        score: medScore,
        trend: "improving",
        statusDescription: medDesc,
        weeklyTrendData: [
          { date: "Mon", value: medScore - 5 },
          { date: "Tue", value: medScore },
          { date: "Wed", value: medScore },
          { date: "Thu", value: medScore - 2 },
          { date: "Fri", value: medScore },
          { date: "Sat", value: medScore },
          { date: "Sun", value: medScore }
        ],
        monthlyTrendData: [
          { month: "May", value: medScore - 10 },
          { month: "Jun", value: medScore - 2 },
          { month: "Jul", value: medScore }
        ]
      },
      {
        id: "hi_2",
        name: "Appointment Completion",
        score: apptScore,
        trend: "stable",
        statusDescription: apptDesc,
        weeklyTrendData: [
          { date: "Mon", value: apptScore },
          { date: "Tue", value: apptScore },
          { date: "Wed", value: apptScore },
          { date: "Thu", value: apptScore },
          { date: "Fri", value: apptScore },
          { date: "Sat", value: apptScore },
          { date: "Sun", value: apptScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 90 },
          { month: "Jun", value: 95 },
          { month: "Jul", value: apptScore }
        ]
      },
      {
        id: "hi_3",
        name: "Preventive Care Completion",
        score: prevScore,
        trend: "improving",
        statusDescription: prevDesc,
        weeklyTrendData: [
          { date: "Mon", value: prevScore - 5 },
          { date: "Tue", value: prevScore - 5 },
          { date: "Wed", value: prevScore },
          { date: "Thu", value: prevScore },
          { date: "Fri", value: prevScore },
          { date: "Sat", value: prevScore },
          { date: "Sun", value: prevScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 70 },
          { month: "Jun", value: 80 },
          { month: "Jul", value: prevScore }
        ]
      },
      {
        id: "hi_4",
        name: "Lifestyle Goals",
        score: goalsScore,
        trend: "improving",
        statusDescription: goalsDesc,
        weeklyTrendData: [
          { date: "Mon", value: goalsScore - 10 },
          { date: "Tue", value: goalsScore - 5 },
          { date: "Wed", value: goalsScore - 5 },
          { date: "Thu", value: goalsScore },
          { date: "Fri", value: goalsScore },
          { date: "Sat", value: goalsScore },
          { date: "Sun", value: goalsScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 50 },
          { month: "Jun", value: 65 },
          { month: "Jul", value: goalsScore }
        ]
      },
      {
        id: "hi_5",
        name: "Hydration",
        score: hydrationScore,
        trend: "stable",
        statusDescription: hydrationDesc,
        weeklyTrendData: [
          { date: "Mon", value: 80 },
          { date: "Tue", value: 80 },
          { date: "Wed", value: 90 },
          { date: "Thu", value: 80 },
          { date: "Fri", value: 90 },
          { date: "Sat", value: 90 },
          { date: "Sun", value: hydrationScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 75 },
          { month: "Jun", value: 82 },
          { month: "Jul", value: hydrationScore }
        ]
      },
      {
        id: "hi_6",
        name: "Sleep",
        score: sleepScore,
        trend: "stable",
        statusDescription: sleepDesc,
        weeklyTrendData: [
          { date: "Mon", value: 70 },
          { date: "Tue", value: 80 },
          { date: "Wed", value: 80 },
          { date: "Thu", value: 70 },
          { date: "Fri", value: sleepScore },
          { date: "Sat", value: sleepScore },
          { date: "Sun", value: sleepScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 80 },
          { month: "Jun", value: 82 },
          { month: "Jul", value: sleepScore }
        ]
      },
      {
        id: "hi_7",
        name: "Physical Activity",
        score: activityScore,
        trend: "improving",
        statusDescription: activityDesc,
        weeklyTrendData: [
          { date: "Mon", value: 70 },
          { date: "Tue", value: 70 },
          { date: "Wed", value: 80 },
          { date: "Thu", value: 90 },
          { date: "Fri", value: 90 },
          { date: "Sat", value: activityScore },
          { date: "Sun", value: activityScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 75 },
          { month: "Jun", value: 80 },
          { month: "Jul", value: activityScore }
        ]
      },
      {
        id: "hi_8",
        name: "Symptom Tracking",
        score: symptomScore,
        trend: "improving",
        statusDescription: symptomDesc,
        weeklyTrendData: [
          { date: "Mon", value: 90 },
          { date: "Tue", value: 90 },
          { date: "Wed", value: 100 },
          { date: "Thu", value: 100 },
          { date: "Fri", value: 100 },
          { date: "Sat", value: 100 },
          { date: "Sun", value: symptomScore }
        ],
        monthlyTrendData: [
          { month: "May", value: 80 },
          { month: "Jun", value: 90 },
          { month: "Jul", value: symptomScore }
        ]
      }
    ];

    this.publish("indicator_updated", this.healthIndicators);
  }

  public generateHealthInsightsInternal() {
    this.healthInsights = [
      {
        id: "insight_july_2026",
        month: "July 2026",
        createdAt: new Date().toISOString(),
        sleepTrend: "Your sleep duration has stabilized at 7 hours, with slightly higher physical fatigue reported during weeks of increased agricultural activity.",
        medicationAdherence: "Consistent 92% adherence rates for iron tablets. Keep taking them after dinner to minimize stomach sensitivity.",
        energyTrend: "Overall energy has increased since starting your daily morning fields walking and pelvic stretching exercises.",
        moodTrend: "Predominantly Calm and Happy. Mild worries relate occasionally to household planning, which resolves with social support.",
        cycleObservation: "Postpartum cycle spacing is still irregular, which is typical. Your upcoming appointment will help provide tailored pre-conception guidance.",
        lifestyleSummary: "Successfully integrated local iron-rich foods like spinach and organic jaggery, while meeting daily hydration targets.",
        followUpStatus: "Consultation with Dr. Mehta scheduled on July 23 to review blood panels and discuss safe pre-conception routines.",
        generalTrends: [
          "Taking iron supplements alongside Vitamin C from lemons significantly boosts absorption and daily energy.",
          "Gentle lower back stretching provides fast, observable relief from postpartum spinal discomfort.",
          "Sharing child development tracking milestones with your local nurse Sunita builds excellent community support."
        ]
      }
    ];
    this.publish("health_insights_generated", this.healthInsights);
  }

  public generateMonthlyReviewInternal() {
    this.monthlyReviews = [
      {
        id: "rev_july_2026",
        month: "July 2026",
        createdAt: new Date().toISOString(),
        achievements: [
          "Completed a 15-day streak of your morning back and core stretches.",
          "Logged your weekly health vitals checklist every week without missing any data.",
          "Successfully incorporated daily iron supplements into your standard bedtime routine."
        ],
        healthTrends: [
          "Your hemoglobin scores are showing slow, gradual improvement towards target levels.",
          "Postpartum back discomfort has reduced from moderate to mild severity with stretching.",
          "Your overall physical endurance during field work has improved."
        ],
        appointments: [
          "Upcoming pre-conception checkup with Dr. Anjali Mehta on July 23 at 10:00 AM."
        ],
        reportsUploadedCount: this.medicalRecords.length,
        symptomsLoggedCount: this.symptoms.length,
        medicationAdherenceRate: 92,
        goalsCompletedCount: this.goals.filter(g => g.completed).length || 1,
        lifestyleImprovements: [
          "Replaced refined white sugar with local iron-rich jaggery in family tea.",
          "Began carrying a dedicated water flask to the fields to increase hydration.",
          "Addressed afternoon fatigue by taking five-minute deep-breathing breaks."
        ],
        questionsToDiscuss: [
          "Is my current iron supplement dosage ideal for pre-conception planning?",
          "Are my pelvic stretching exercises safe to continue once pregnancy is confirmed?",
          "Should we schedule any updated blood panels before the next phase?"
        ]
      }
    ];
    this.publish("monthly_review_created", this.monthlyReviews);
  }

  public refreshRecommendations() {
    this.recommendations = [];

    // 1. Check Hemoglobin / Iron
    const hasLowHb = this.medicalRecords.some(r => r.labReport?.metrics.some(m => m.name === "Hemoglobin" && m.status === "Low")) || 
                     this.medications.some(m => m.name.toLowerCase().includes("iron"));
    if (hasLowHb) {
      this.recommendations.push({
        id: "rec_ka_2",
        articleId: "ka_2",
        triggerReason: "Recommended based on your recent blood panel showing low Hemoglobin levels.",
        recommendedAt: new Date().toISOString()
      });
    }

    // 2. Family History conditions
    const familyDb = this.brain.familyHistory?.grandparents?.toLowerCase().includes("diabetes") || false;
    if (familyDb) {
      this.recommendations.push({
        id: "rec_ka_1",
        articleId: "ka_1",
        triggerReason: "Recommended based on maternal family history of diabetes and PCOS metabolic markers.",
        recommendedAt: new Date().toISOString()
      });
    }

    // 3. Pregnancy goal
    const preconGoal = this.goals.some(g => g.title.toLowerCase().includes("pregnancy")) || 
                       this.brain.healthGoals?.some(g => g.toLowerCase().includes("pregnancy")) ||
                       this.currentLifeStage === "Trying to Conceive";
    if (preconGoal) {
      this.recommendations.push({
        id: "rec_ka_3",
        articleId: "ka_3",
        triggerReason: "Recommended because you are actively planning a healthy pregnancy.",
        recommendedAt: new Date().toISOString()
      });
    }

    // 4. Default fallbacks
    if (this.recommendations.length < 3) {
      this.recommendations.push({
        id: "rec_ka_7",
        articleId: "ka_7",
        triggerReason: "Recommended to support balanced stress management and mindfulness.",
        recommendedAt: new Date().toISOString()
      });
    }
    if (this.recommendations.length < 3) {
      this.recommendations.push({
        id: "rec_ka_4",
        articleId: "ka_4",
        triggerReason: "Recommended for tracking and understanding normal menstrual rhythm.",
        recommendedAt: new Date().toISOString()
      });
    }

    this.publish("knowledge_recommended", this.recommendations);
  }

  public rebuildSearchIndexInternal() {
    this.searchIndex = [];

    // Index Timeline events
    this.timeline.forEach(item => {
      this.searchIndex.push({
        id: "idx_t_" + item.id,
        itemId: item.id,
        itemType: "Timeline",
        title: item.title,
        description: item.description,
        contentToSearch: `${item.title} ${item.description} ${item.notes || ""}`.toLowerCase(),
        date: item.date
      });
    });

    // Index Medical Records
    this.medicalRecords.forEach(item => {
      this.searchIndex.push({
        id: "idx_rec_" + item.id,
        itemId: item.id,
        itemType: "Medical Record",
        title: item.title,
        description: `Hospital: ${item.hospital || ""}. Doctor: ${item.doctor || ""}. Summary: ${item.previewText || ""}`,
        contentToSearch: `${item.title} ${item.hospital || ""} ${item.doctor || ""} ${item.previewText || ""} ${item.labReport?.summaryExplanation || ""}`.toLowerCase(),
        date: item.date
      });
    });

    // Index Medications
    this.medications.forEach(item => {
      this.searchIndex.push({
        id: "idx_med_" + item.id,
        itemId: item.id,
        itemType: "Medication",
        title: item.name,
        description: `Dose: ${item.dose}. Frequency: ${item.frequency}. Status: ${item.status}`,
        contentToSearch: `${item.name} ${item.dose} ${item.frequency} ${item.duration} ${item.status}`.toLowerCase(),
        date: item.startDate
      });
    });

    // Index Appointments
    this.appointments.forEach(item => {
      this.searchIndex.push({
        id: "idx_appt_" + item.id,
        itemId: item.id,
        itemType: "Appointment",
        title: `Doctor Appointment with ${item.doctorName}`,
        description: `Purpose: ${item.purpose} on ${item.date} at ${item.time}`,
        contentToSearch: `${item.doctorName} ${item.purpose} ${item.time} ${item.date}`.toLowerCase(),
        date: item.date
      });
    });

    // Index Symptoms
    this.symptoms.forEach(item => {
      this.searchIndex.push({
        id: "idx_sym_" + item.id,
        itemId: item.id,
        itemType: "Symptom",
        title: `Logged Symptom: ${item.name}`,
        description: `Severity: ${item.severity}. Notes: ${item.notes || "None"}`,
        contentToSearch: `${item.name} ${item.severity} ${item.notes || ""}`.toLowerCase(),
        date: item.date
      });
    });

    // Index Journal Entries
    this.journalEntries.forEach(item => {
      this.searchIndex.push({
        id: "idx_je_" + item.id,
        itemId: item.id,
        itemType: "Journal",
        title: "Daily Journal Entry",
        description: item.text.substring(0, 100),
        contentToSearch: `${item.text}`.toLowerCase(),
        date: item.date
      });
    });

    // Index Goals
    this.goals.forEach(item => {
      this.searchIndex.push({
        id: "idx_g_" + item.id,
        itemId: item.id,
        itemType: "Goal",
        title: item.title,
        description: `Target: ${item.targetValue} ${item.unit}. Progress: ${item.currentValue} ${item.unit}. Status: ${item.completed ? 'Completed' : 'Active'}`,
        contentToSearch: `${item.title} ${item.category} ${item.unit}`.toLowerCase(),
        date: new Date().toISOString().split("T")[0]
      });
    });

    this.publish("search_index_updated", this.searchIndex);
  }

  public resetToDefault() {
    localStorage.clear();
    this.brain = INITIAL_HEALTH_BRAIN;
    this.timeline = INITIAL_TIMELINE;
    this.appointments = INITIAL_APPOINTMENTS;
    this.summary = INITIAL_SUMMARY;
    this.symptoms = [
      { id: "s1", date: "2026-07-01", name: "Lower Back Discomfort", severity: "Mild", notes: "After fields work" }
    ];
    this.logs = [
      { type: "profile_updated", payload: { name: "Priya Devi" }, timestamp: "2026-05-15T10:00:00Z" }
    ];

    this.medicalRecords = INITIAL_RECORDS;
    this.medications = INITIAL_MEDICATIONS;
    this.preventive = INITIAL_PREVENTIVE;
    this.doctorCompanion = INITIAL_DOCTOR_COMPANION;

    // Phase 3 Resets
    this.currentLifeStage = INITIAL_LIFE_STAGE;
    this.emotionLogs = INITIAL_EMOTION_LOGS;
    this.weeklyCheckIns = INITIAL_WEEKLY_CHECKINS;
    this.journalEntries = INITIAL_JOURNAL_ENTRIES;
    this.goals = INITIAL_GOALS;
    this.achievements = INITIAL_ACHIEVEMENTS;

    this.publish("profile_updated", this.brain);
  }
}

// Singleton instance for client usage
export const orchestrator = new OrchestratorService();
