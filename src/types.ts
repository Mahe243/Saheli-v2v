/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HealthProfile {
  name: string;
  age: number;
  height: string;
  weight: string;
  bloodGroup: string;
  emergencyContact: string;
}

export interface Lifestyle {
  exercise: string; // e.g., "Active", "Sedentary"
  sleep: string;    // e.g., "7-8 hours", "Less than 6 hours"
  diet: string;     // e.g., "Balanced", "Vegetarian", "High Protein"
  smoking: string;  // e.g., "Never", "Former", "Active"
  alcohol: string;  // e.g., "None", "Occasional", "Regular"
}

export interface MedicalHistory {
  currentConditions: string[];
  previousIllnesses: string[];
  surgeries: string[];
  pregnancyHistory: string; // e.g., "2 pregnancies, 2 live births" or "None"
  vaccinations: string[];
  currentMedicines: string[];
  allergies: string[];
}

export interface FamilyHistory {
  mother: string;
  father: string;
  grandparents: string;
}

export interface HealthBrain {
  profile: HealthProfile;
  lifestyle: Lifestyle;
  medicalHistory: MedicalHistory;
  familyHistory: FamilyHistory;
  healthGoals: string[];
}

export interface SymptomLog {
  id: string;
  date: string;
  name: string;
  severity: "Mild" | "Moderate" | "Severe";
  notes?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  purpose: string;
}

export interface TimelineEvent {
  id: string;
  date: string; // e.g., "2026-07-09" or "July 9, 2026"
  category: "Symptoms" | "Doctor Visits" | "Reports" | "Medicines" | "Appointments" | "Goals" | "Life Events" | "Health Updates";
  title: string;
  description: string;
  notes?: string;
}

export interface HealthSummary {
  updatedAt: string;
  summaryText: string;
  keyActionItems: string[];
}

// Conversation states
export interface InterviewQuestion {
  id: string;
  text: string;
  field: string; // what field in the state we are filling
  placeholder?: string;
  suggestions?: string[];
}

export interface InterviewSummary {
  chiefComplaint: string;
  symptoms: string[];
  timeline: string;
  questionsForDoctor: string[];
  severity: "Mild" | "Moderate" | "Severe";
}

// Orchestrator Events
export type OrchestratorEventType =
  | "profile_updated"
  | "symptom_added"
  | "timeline_updated"
  | "conversation_completed"
  | "health_summary_updated"
  | "appointment_created"
  | "record_uploaded"
  | "medication_updated"
  | "checkin_logged"
  | "preventive_added"
  | "prescription_processed"
  | "emotion_logged"
  | "goal_created"
  | "goal_completed"
  | "journal_entry_added"
  | "life_stage_updated"
  | "weekly_checkin_completed"
  | "milestone_achieved";

export interface OrchestratorEvent {
  type: OrchestratorEventType;
  payload: any;
  timestamp: string;
}

export type EventSubscriber = (event: OrchestratorEvent) => void;

// PHASE 2 DATA MODELS

export type MedicalRecordCategory =
  | "Blood Tests"
  | "Hormone Reports"
  | "Scans"
  | "Prescriptions"
  | "Doctor Notes"
  | "Vaccinations"
  | "Other";

export interface LabMetric {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "Normal" | "Low" | "High";
  explanation: string;
}

export interface LabReport {
  recordId: string;
  reportName: string;
  date: string;
  metrics: LabMetric[];
  summaryExplanation: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  hospital: string;
  doctor: string;
  category: MedicalRecordCategory;
  fileType: "pdf" | "image" | "blood_report" | "prescription" | "other";
  fileName: string;
  fileSize: string;
  previewText?: string;
  isEncrypted: boolean;
  consentSharedWith: string[]; // doctor names or IDs
  labReport?: LabReport;
}

export interface DoctorCompanionState {
  id: string;
  appointmentId: string;
  chiefComplaint: string;
  concerns: string[];
  questionsToAsk: string[];
  selectedReportIds: string[];
  // After visit
  prescriptionText?: string;
  extractedMedicines?: string[];
  followUpDate?: string;
  testsOrdered?: string[];
  doctorInstructions?: string;
  notes?: string;
  completed: boolean;
}

export interface MedicationCheckIn {
  date: string; // YYYY-MM-DD
  taken: boolean;
  sideEffects?: string;
  feelingBetter?: "Yes" | "No" | "Same";
  missedReason?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string; // e.g. "500mg" or "1 tablet"
  frequency: string; // e.g. "Once daily", "Twice daily", "Before food"
  duration: string; // e.g. "5 days", "Chronic"
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Paused";
  checkIns: MedicationCheckIn[];
}

export interface PreventiveReminder {
  id: string;
  title: string;
  description: string;
  triggerReason: string; // e.g., "Based on age (28)", "Based on family history of Diabetes"
  category: "Screening" | "Vaccination" | "Lifestyle" | "Checkup";
  status: "Pending" | "Done" | "Dismissed";
  recommendedInterval: string;
}

// PHASE 3 DATA MODELS

export interface EmotionLog {
  id: string;
  date: string; // YYYY-MM-DD
  emotion: "Happy" | "Calm" | "Tired" | "Stressed" | "Worried" | "Emotional" | "Low";
  note?: string;
  aiResponse?: string;
}

export type LifeStageType =
  | "First Period"
  | "Teenager"
  | "College"
  | "Working Professional"
  | "Newly Married"
  | "Trying to Conceive"
  | "Pregnancy"
  | "Motherhood"
  | "Perimenopause"
  | "Menopause"
  | "Healthy Aging";

export interface WeeklyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  pain: number; // 1 to 5
  energy: number; // 1 to 5
  mood: number; // 1 to 5
  sleep: number; // 1 to 5
  exercise: number; // 1 to 5
  waterIntake: number; // 1 to 5
  cycle: string; // "Regular", "Delayed", "Heavy", "Light", "N/A"
  medicationExperience: string; // "Good", "Side effects", "N/A"
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  hasVoiceNote?: boolean;
  hasPhoto?: boolean;
}

export interface HealthGoal {
  id: string;
  title: string;
  category: "Sleep" | "Exercise" | "Water" | "Stress" | "Medicine" | "Weight" | "Nutrition";
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  icon: string; // Emoji
  description: string;
}


