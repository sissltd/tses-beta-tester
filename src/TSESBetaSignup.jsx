import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  MessageSquare,
  Zap,
  Users,
  ShieldCheck,
  ArrowRight,
  Mail,
  User,
  Phone,
  Code2,
  Palette,
  LineChart,
  Megaphone,
  Bug,
  Plus,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Loader2,
} from "lucide-react";

// =====================================================================
//  GOOGLE FORMS BACKEND CONFIG
// ---------------------------------------------------------------------
//  Submissions POST to the existing Soludesks Beta Tester Signup form.
//  Responses land in the same Google Sheet the team already uses.
//
//  TO UPDATE ENTRY IDs (if the Google Form is ever edited):
//  1. Open the Google Form in edit mode
//  2. Three-dot menu → "Get pre-filled link"
//  3. Fill every field with placeholder text
//  4. Click "Get Link" → "Copy Link"
//  5. The URL contains entry.XXXXX=value pairs — match them below
// =====================================================================

const GOOGLE_FORM_ID = "1FAIpQLSfMjzFuk-hew67U2uVcUTVDJbJdljlSjRLs9FBHL8vzni-YHg";

const ENTRY_IDS = {
  fullName:     "entry.1805822406", // Full Name
  email:        "entry.60052219",   // Functional Email
  whatsapp:     "entry.104875544",  // WhatsApp number
  proficiency:  "entry.245685926",  // Technical proficiency 1–5
  priorTesting: "entry.497194368",  // Prior beta testing? (Yes/No)
  role:         "entry.1120719454", // Role in tech
  community:    "entry.697943342", // Community / how you heard (REQUIRED)
  frequency:    "entry.1352979949", // Testing frequency
  commitment:   "entry.418700178",  // Commitment (Yes/Not Sure)
  questions:    "entry.160298754",  // Optional questions
};

async function submitToGoogleForm(form) {
  const data = new FormData();
  data.append(ENTRY_IDS.fullName, form.fullName);
  data.append(ENTRY_IDS.email, form.email);
  data.append(ENTRY_IDS.whatsapp, form.whatsapp);
  data.append(ENTRY_IDS.proficiency, String(form.proficiency));
  data.append(ENTRY_IDS.priorTesting, form.priorTesting);

  // Google Forms quirk: "Other" radio sends the sentinel value __other_option__
  // and the typed text goes in a sibling field with the .other_option_response suffix.
  if (form.role === "Other") {
    data.append(ENTRY_IDS.role, "__other_option__");
    data.append(`${ENTRY_IDS.role}.other_option_response`, form.roleOther);
  } else {
    data.append(ENTRY_IDS.role, form.role);
  }

  data.append(ENTRY_IDS.community, form.community);
  data.append(ENTRY_IDS.frequency, form.frequency);
  data.append(ENTRY_IDS.commitment, form.commitment);
  data.append(ENTRY_IDS.questions, form.questions || "");

  // no-cors: Google Forms doesn't return CORS headers, but the POST is still
  // recorded. We can't read the response — so we trust it succeeded if no
  // network error was thrown.
  await fetch(
    `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`,
    { method: "POST", mode: "no-cors", body: data }
  );
}

export default function TSESBetaSignup() {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [step, setStep] = useState(1); // 1, 2, 3 = form steps; 4 = success
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    role: "",
    roleOther: "",
    proficiency: 3,
    priorTesting: "",
    community: "",
    frequency: "",
    commitment: "",
    questions: "",
  });

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "We'd love to know your name";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "That doesn't look like a valid email";
      if (!form.whatsapp.trim()) e.whatsapp = "WhatsApp number is required";
    }
    if (step === 2) {
      if (!form.role) e.role = "Pick the option closest to your role";
      if (form.role === "Other" && !form.roleOther.trim())
        e.roleOther = "Tell us a bit about what you do";
      if (!form.priorTesting) e.priorTesting = "Please choose one";
    }
    if (step === 3) {
      if (!form.community.trim()) e.community = "Help us know how you found us";
      if (!form.frequency) e.frequency = "Pick a cadence";
      if (!form.commitment) e.commitment = "Please confirm your commitment";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Final step → submit to Google Forms
    setSubmitError("");
    setSubmitting(true);
    try {
      await submitToGoogleForm(form);
      setStep(4);
    } catch (err) {
      setSubmitError(
        "We couldn't reach the server. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const proficiencyLabels = ["Novice", "Beginner", "Comfortable", "Proficient", "Expert"];

  const roles = [
    { value: "Developer", icon: Code2 },
    { value: "Designer", icon: Palette },
    { value: "Product Manager", icon: LineChart },
    { value: "Marketer", icon: Megaphone },
    { value: "Software Tester/QA", icon: Bug },
    { value: "Other", icon: Plus },
  ];

  const frequencies = [
    { value: "Daily", icon: CalendarCheck, hint: "Power user" },
    { value: "A few times a week", icon: CalendarDays, hint: "Most popular" },
    { value: "Once a week", icon: Calendar, hint: "Light touch" },
  ];

  return (
    <div className="min-h-screen bg-stone-100" style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-italic-serif { font-family: 'Instrument Serif', serif; font-style: italic; }
        .grain { background-image: radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px); background-size: 3px 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .step-enter { animation: fadeUp 0.4s ease-out; }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-runnable-track { height: 4px; background: #E5DFD5; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; background: #0E1414; border-radius: 50%; margin-top: -9px; cursor: pointer; border: 3px solid #F5F1EA; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.15s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.1); }
        input[type="range"]::-moz-range-track { height: 4px; background: #E5DFD5; border-radius: 2px; }
        input[type="range"]::-moz-range-thumb { width: 22px; height: 22px; background: #0E1414; border-radius: 50%; cursor: pointer; border: 3px solid #F5F1EA; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
      `}</style>

      <div className="min-h-screen grain" style={{ backgroundColor: "#F5F1EA" }}>
        {/* Top bar */}
        <header className="border-b border-stone-300/60 bg-stone-100/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#C04F2A" }} />
              </div>
              <span className="font-display font-semibold tracking-tight text-stone-900">TSES Beta Tester Signup</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="hidden sm:inline">Beta program</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-14">
          {step !== 4 && (
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
              {/* LEFT: Pitch / value prop */}
              <aside className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 bg-white/60 text-xs tracking-wide text-stone-700 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#C04F2A" }} />
                  Beta · Onboarding now
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-tight text-stone-900 mb-5">
                  Help shape{" "}
                  <span className="font-italic-serif font-normal" style={{ color: "#C04F2A" }}>
                    TSES products
                  </span>{" "}
                  before the world sees them.
                </h1>

                <p className="text-stone-700 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                  Join the TSES Beta Testers community and get early access to the products we're building —
                  Soludesks, Stayafrika, Feexeet, Pssps, TDAR, and more.
                </p>

                <div className="space-y-3.5 mb-8">
                  {[
                    { icon: Sparkles, text: "Early access before public launch" },
                    { icon: MessageSquare, text: "Direct line to the founding team" },
                    { icon: Zap, text: "Your feedback shapes the roadmap" },
                    { icon: Users, text: "Recognition as a founding tester" },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-md bg-stone-900 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-stone-100" strokeWidth={2} />
                      </div>
                      <span className="text-stone-800 text-[0.95rem] leading-relaxed">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block pt-6 border-t border-stone-300/70">
                  <p className="font-italic-serif text-stone-600 text-lg leading-snug">
                    "The best products are built with the people who'll use them — not for them."
                  </p>
                </div>
              </aside>

              {/* RIGHT: Form */}
              <section className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                  {/* Progress */}
                  <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-stone-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium tracking-wider text-stone-500 uppercase">
                        Step {step} of 3
                      </span>
                      <span className="text-xs text-stone-500">~ 2 minutes</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className="h-1 flex-1 rounded-full transition-all duration-500"
                          style={{ backgroundColor: s <= step ? "#0E1414" : "#E5DFD5" }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="px-6 sm:px-8 py-8">
                    {/* Step 1: About you */}
                    {step === 1 && (
                      <div className="step-enter space-y-6">
                        <div>
                          <h2 className="font-display text-2xl sm:text-[1.7rem] text-stone-900 leading-tight mb-1.5">
                            First, who are we talking to?
                          </h2>
                          <p className="text-stone-600 text-sm">
                            We'll only use these to reach out about the beta program.
                          </p>
                        </div>

                        <Field
                          label="Full name"
                          icon={User}
                          required
                          error={errors.fullName}
                        >
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => update("fullName", e.target.value)}
                            placeholder="Ada Lovelace"
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
                          />
                        </Field>

                        <Field
                          label="Functional email"
                          icon={Mail}
                          required
                          error={errors.email}
                          hint="An inbox you actually check"
                        >
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="ada@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
                          />
                        </Field>

                        <Field
                          label="WhatsApp number"
                          icon={Phone}
                          required
                          error={errors.whatsapp}
                          hint="Include country code e.g. +234"
                        >
                          <input
                            type="tel"
                            value={form.whatsapp}
                            onChange={(e) => update("whatsapp", e.target.value)}
                            placeholder="+234 800 000 0000"
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
                          />
                        </Field>
                      </div>
                    )}

                    {/* Step 2: Background */}
                    {step === 2 && (
                      <div className="step-enter space-y-7">
                        <div>
                          <h2 className="font-display text-2xl sm:text-[1.7rem] text-stone-900 leading-tight mb-1.5">
                            Tell us about your background.
                          </h2>
                          <p className="text-stone-600 text-sm">
                            This helps us match you with the right testing scenarios.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-900 mb-3">
                            What do you do in tech? <span style={{ color: "#C04F2A" }}>*</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {roles.map(({ value, icon: Icon }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => update("role", value)}
                                className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm text-left transition ${
                                  form.role === value
                                    ? "border-stone-900 bg-stone-900 text-white"
                                    : "border-stone-300 bg-stone-50/50 text-stone-700 hover:border-stone-500"
                                }`}
                              >
                                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                                <span className="leading-tight">{value}</span>
                              </button>
                            ))}
                          </div>
                          {errors.role && <p className="text-xs mt-2" style={{ color: "#C04F2A" }}>{errors.role}</p>}
                          {form.role === "Other" && (
                            <input
                              type="text"
                              value={form.roleOther}
                              onChange={(e) => update("roleOther", e.target.value)}
                              placeholder="Tell us what you do"
                              className="mt-3 w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
                            />
                          )}
                          {errors.roleOther && (
                            <p className="text-xs mt-2" style={{ color: "#C04F2A" }}>{errors.roleOther}</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between mb-3">
                            <label className="block text-sm font-medium text-stone-900">
                              Technical proficiency
                            </label>
                            <span className="font-display text-base text-stone-900">
                              {proficiencyLabels[form.proficiency - 1]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={form.proficiency}
                            onChange={(e) => update("proficiency", parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2 text-xs text-stone-500">
                            <span>Novice</span>
                            <span>Expert</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-900 mb-3">
                            Have you tested a product in beta before?{" "}
                            <span style={{ color: "#C04F2A" }}>*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Yes", "No"].map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => update("priorTesting", v)}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition ${
                                  form.priorTesting === v
                                    ? "border-stone-900 bg-stone-900 text-white"
                                    : "border-stone-300 bg-stone-50/50 text-stone-700 hover:border-stone-500"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          {errors.priorTesting && (
                            <p className="text-xs mt-2" style={{ color: "#C04F2A" }}>{errors.priorTesting}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Commitment */}
                    {step === 3 && (
                      <div className="step-enter space-y-7">
                        <div>
                          <h2 className="font-display text-2xl sm:text-[1.7rem] text-stone-900 leading-tight mb-1.5">
                            Last bit — your commitment.
                          </h2>
                          <p className="text-stone-600 text-sm">
                            Beta testing only works when testers show up. Be honest with yourself here.
                          </p>
                        </div>

                        <Field
                          label="How did you hear about TSES products?"
                          required
                          error={errors.community}
                          hint="Soludesks, Stayafrika, Feexeet, Pssps, TDAR, and more — e.g. Product Hub Africa, a friend, a WhatsApp group, email"
                        >
                          <input
                            type="text"
                            value={form.community}
                            onChange={(e) => update("community", e.target.value)}
                            placeholder="Product Hub Africa, friend, etc."
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
                          />
                        </Field>

                        <div>
                          <label className="block text-sm font-medium text-stone-900 mb-3">
                            How often can you test and share feedback?{" "}
                            <span style={{ color: "#C04F2A" }}>*</span>
                          </label>
                          <div className="space-y-2">
                            {frequencies.map(({ value, icon: Icon, hint }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => update("frequency", value)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition ${
                                  form.frequency === value
                                    ? "border-stone-900 bg-stone-900 text-white"
                                    : "border-stone-300 bg-stone-50/50 text-stone-700 hover:border-stone-500"
                                }`}
                              >
                                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.6} />
                                <span className="font-medium text-sm flex-1">{value}</span>
                                <span
                                  className={`text-xs ${
                                    form.frequency === value ? "text-stone-300" : "text-stone-500"
                                  }`}
                                >
                                  {hint}
                                </span>
                              </button>
                            ))}
                          </div>
                          {errors.frequency && (
                            <p className="text-xs mt-2" style={{ color: "#C04F2A" }}>{errors.frequency}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-900 mb-2">
                            Can you commit to the cadence above?{" "}
                            <span style={{ color: "#C04F2A" }}>*</span>
                          </label>
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 mb-3">
                            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-700" strokeWidth={2} />
                            <p className="text-xs text-amber-900 leading-relaxed">
                              We're picking a small cohort, so consistent testers help us most. If life gets in
                              the way, just tell us — no penalty. Repeated no-shows mean we'll free your spot for
                              someone else.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { v: "Yes, I'm in", val: "Yes" },
                              { v: "Not sure yet", val: "Not Sure" },
                            ].map(({ v, val }) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => update("commitment", val)}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition ${
                                  form.commitment === val
                                    ? "border-stone-900 bg-stone-900 text-white"
                                    : "border-stone-300 bg-stone-50/50 text-stone-700 hover:border-stone-500"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          {errors.commitment && (
                            <p className="text-xs mt-2" style={{ color: "#C04F2A" }}>{errors.commitment}</p>
                          )}
                        </div>

                        <Field
                          label="Anything you'd like to ask us?"
                          hint="Optional — this is a real human reading"
                        >
                          <textarea
                            value={form.questions}
                            onChange={(e) => update("questions", e.target.value)}
                            rows={3}
                            placeholder="A question, a worry, a hello — anything goes."
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition resize-none"
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  {/* Footer nav */}
                  <div className="px-6 sm:px-8 py-5 border-t border-stone-200/80 bg-stone-50/40">
                    {submitError && (
                      <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                        {submitError}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={step === 1 || submitting}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition ${
                          step === 1 || submitting
                            ? "text-stone-300 cursor-not-allowed"
                            : "text-stone-700 hover:bg-stone-200/60"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition shadow-sm"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting…
                          </>
                        ) : step < 3 ? (
                          <>
                            Continue
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Submit application
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-500 mt-4 px-2 leading-relaxed">
                  Your details stay with the TSES team. We won't share, sell, or spam — promise.
                </p>
              </section>
            </div>
          )}

          {/* Success */}
          {step === 4 && (
            <div className="max-w-2xl mx-auto text-center py-12 sm:py-20">
              <div className="scale-in inline-flex w-16 h-16 rounded-full bg-stone-900 items-center justify-center mb-7">
                <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-stone-900 leading-tight mb-4">
                You're on the list,{" "}
                <span className="font-italic-serif font-normal" style={{ color: "#C04F2A" }}>
                  {form.fullName.split(" ")[0] || "tester"}
                </span>
                .
              </h1>
              <p className="text-stone-700 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
                Thanks for raising your hand. We review every application personally — expect to hear from us
                on WhatsApp or email within <strong className="text-stone-900">3–5 days</strong>.
              </p>

              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 text-left max-w-md mx-auto">
                <p className="text-xs font-medium tracking-wider text-stone-500 uppercase mb-4">What happens next</p>
                <ol className="space-y-3.5">
                  {[
                    "We review your application against the cohort we're building.",
                    "If it's a fit, we'll send a short onboarding call invite.",
                    "You get access, a dedicated channel, and your testing kicks off.",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-display text-sm w-6 h-6 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-stone-800 leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="font-italic-serif text-stone-500 text-base mt-10">
                We're excited to build with you.
              </p>
            </div>
          )}
        </main>

        <footer className="border-t border-stone-300/60 mt-10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
            <span>© TSES Beta Testers</span>
            <span>Built for operators, by operators.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-900 mb-1.5">
        {Icon && <Icon className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 text-stone-500" strokeWidth={1.8} />}
        {label} {required && <span style={{ color: "#C04F2A" }}>*</span>}
      </label>
      {hint && !error && <p className="text-xs text-stone-500 mb-2">{hint}</p>}
      {children}
      {error && <p className="text-xs mt-1.5" style={{ color: "#C04F2A" }}>{error}</p>}
    </div>
  );
}
