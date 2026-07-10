# 🌸 Saheli – Your Personal Women's Healthcare Companion

**Saheli is an AI-powered women's healthcare companion designed to empower women by providing personalized health insights, wellness guidance, menstrual health tracking, pregnancy support, mental well-being resources, and easy access to healthcare information—all in one intuitive platform.**

---

# 🔗 Important Links

- **🌐 Live Website:** https://saheli-948686771797.asia-southeast1.run.app
- **🎥 Demo Video:** https://drive.google.com/file/d/1y5KPdUTjDgfxdUppAqOzfBRIOU0zDhjg/view?usp=drivesdk

---

# 🌟 The Idea

Women's healthcare is often fragmented across multiple applications, making it difficult to access reliable information, track personal health, and receive timely guidance. Many women also face challenges in understanding symptoms, maintaining health records, and finding trustworthy wellness resources.

**Saheli** aims to bridge this gap by providing a comprehensive digital healthcare companion that supports women throughout every stage of life. The platform combines health tracking,  AI-assisted guidance, and personalized recommendations to promote preventive healthcare and informed decision-making.

Our vision is to make healthcare more accessible, organized, and personalized while encouraging women to take proactive control of their physical and mental well-being.

---

# 🎯 Objectives

- Promote women's health awareness.
- Encourage preventive healthcare.
- Simplify health tracking.
- Provide trustworthy healthcare information.
- Offer AI-powered personalized wellness support.
- Improve accessibility to healthcare resources.
- Create a secure and user-friendly healthcare ecosystem.

---

# ✨ Features

## 🩺 Personalized Health Dashboard

- Personalized health overview
- Daily wellness insights
- Health reminders
- Activity summary

---

## 🌸 Menstrual Health Tracking

- Period tracking
- Cycle prediction
- Ovulation estimation
- Symptom logging
- Personalized insights

---

## 🤰 Pregnancy Companion

- Weekly pregnancy guidance
- Nutrition recommendations
- Appointment reminders
- Health milestones

---

## 🧠 Mental Wellness

- Mood tracking
- Stress management resources
- Guided wellness activities
- Mental health education

---

## 🍎 Nutrition & Fitness

- Healthy lifestyle recommendations
- Nutrition guidance
- Exercise suggestions

---

## 💊 Medication & Appointment Management

- Medicine reminders
- Appointment scheduling
- Health record organization
- Prescription tracking

---

## 🤖 AI Health Assistant

- AI-powered healthcare guidance
- Symptom-related information
- Frequently asked questions
- Personalized recommendations

---

# 🏗️ System Architecture

- Saheli leverages a modern serverless, offline-first approach built on Google Cloud Platform to maintain strict privacy standards and fluid user performance.

                              [ User / Client Browser ]
                                          │
                                   (HTTPS Traffic)
                                          ▼
                         [ Google Cloud Load Balancer ]
                                          │
                                          ▼
                       [ Google Cloud Run (Next.js Node App) ]
                              │           │            │
     ┌────────────────────────┘           │            └────────────────────────┐
     ▼                                    ▼                                     ▼
[ Cloud SQL (PostgreSQL) ]           [ Google AI Studio ]                  [ Cloud Storage ]
(Users, Profiles, Audit Logs)         (Gemini API / Orchestrator)           (Encrypted Exports, PDFs)
│
▼
[ LocalStorage (Browser Cache) ]
(Offline fallback, Vitals Cache)

---

# 🤖 AI Tools Used

- ChatGPT – Content refinement
- Google AI Studio / Gemini – Prompt engineering and cloud deployment

---

# 🚀 Future Enhancements

- Integration with wearable devices
- AI-based health risk prediction
- Telemedicine consultation
- Voice-enabled healthcare assistant
- Multilingual support
- Recorded doctor-patient communication
- Community support groups
