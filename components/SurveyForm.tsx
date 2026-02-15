import React, { useState } from 'react';
import { SurveyData } from '../types';
import { Button } from './Button';
import { CheckCircle2, ChevronRight, ChevronLeft, Share2, AlertCircle } from 'lucide-react';
import { saveResponse, emailExists } from '../services/storageService';

interface SurveyFormProps {
  onComplete: () => void;
  onClose: () => void;
}

const INITIAL_DATA: SurveyData = {
  id: '',
  timestamp: '',
  demographics: { name: '', email: '', age: '', gender: '', education: '', occupation: '', income: '' },
  behavior: { littering: 1, spitting: 1, trafficViolations: 1, encroachment: 1, propertyDamage: 1 },
  economic: { medicalExpenses: 'None', trafficDelay: 0, extraHouseholdCost: 'None', tourismImpact: 3 },
  awareness: { swachhBharat: '', knowledgeOfFines: '', reportWillingness: '', payForBetter: '' }
};

export const SurveyForm: React.FC<SurveyFormProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(0); // 0: Identity/Demographics, 1: Behavior, 2: Cost, 3: Awareness, 4: Done
  const [formData, setFormData] = useState<SurveyData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (section: keyof SurveyData, field: string, value: any) => {
    setError(null); // Clear errors on input
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as any],
        [field]: value
      }
    }));
  };

  const validateStep0 = (): boolean => {
    const { name, email, age, income, gender, education } = formData.demographics;
    
    if (!name.trim()) {
      setError("Please enter your name.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (emailExists(email)) {
      setError("This email has already been used to submit a response. Multiple submissions are not allowed.");
      return false;
    }

    if (!age || !income || !gender || !education) {
      setError("Please complete all demographic fields.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!validateStep0()) return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const finalData = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    
    saveResponse(finalData);
    setStep(4);
    setIsSubmitting(false);
    onComplete();
  };

  const steps = [
    { title: "Identity & Demographics", description: "Verification & background info" },
    { title: "Civic Behaviour", description: "Self-assessment (1-5 Scale)" },
    { title: "Economic Impact", description: "Direct and indirect costs" },
    { title: "Awareness", description: "Policy knowledge & willingness" }
  ];

  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((s, idx) => (
          <div key={idx} className={`text-xs font-semibold ${idx <= step ? 'text-india-saffron' : 'text-gray-400'}`}>
            Step {idx + 1}
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-india-saffron to-india-green transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>
      <h3 className="text-xl font-bold mt-4 text-gray-800 dark:text-white">{steps[step]?.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{steps[step]?.description}</p>
    </div>
  );

  // Success Screen
  if (step === 4) {
    return (
      <div className="text-center py-12 px-4 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10 text-india-green" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Thank You!</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Your response has been recorded. This data contributes significantly to estimating the economic impact of civic behavior in Indian cities.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
           <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Check out this research on the Economic Cost of Poor Civic Sense in India: " + window.location.href)}`, '_blank')} className="flex items-center justify-center bg-green-500 hover:bg-green-600">
             <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
           </Button>
           <Button variant="outline" onClick={onClose}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-10 max-w-3xl mx-auto border border-gray-100 dark:border-slate-700">
      {renderProgress()}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-6 min-h-[300px]">
        {/* Step 1: Identity & Demographics */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block md:col-span-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Full Name</span>
              <input 
                type="text"
                placeholder="Enter your full name"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.name}
                onChange={(e) => updateField('demographics', 'name', e.target.value)}
              />
            </label>

            <label className="block md:col-span-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Email Address</span>
              <input 
                type="email"
                placeholder="name@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.email}
                onChange={(e) => updateField('demographics', 'email', e.target.value)}
              />
            </label>

            <div className="md:col-span-2 border-t border-gray-100 dark:border-slate-700 my-2"></div>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Age Group</span>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.age}
                onChange={(e) => updateField('demographics', 'age', e.target.value)}
              >
                <option value="">Select Age</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-50">35-50</option>
                <option value="50+">50+</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Gender</span>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.gender}
                onChange={(e) => updateField('demographics', 'gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Highest Education</span>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.education}
                onChange={(e) => updateField('demographics', 'education', e.target.value)}
              >
                <option value="">Select Education</option>
                <option value="High School">High School</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Income Level (Annual INR)</span>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.income}
                onChange={(e) => updateField('demographics', 'income', e.target.value)}
              >
                <option value="">Select Range</option>
                <option value="<3L">Below 3 Lakhs</option>
                <option value="3L-8L">3 Lakhs - 8 Lakhs</option>
                <option value="8L-15L">8 Lakhs - 15 Lakhs</option>
                <option value=">15L">Above 15 Lakhs</option>
              </select>
            </label>
             <label className="block md:col-span-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Occupation</span>
              <input 
                type="text"
                placeholder="e.g. Student, Engineer, Business"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-india-saffron focus:ring focus:ring-india-saffron/20 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.demographics.occupation}
                onChange={(e) => updateField('demographics', 'occupation', e.target.value)}
              />
            </label>
          </div>
        )}

        {/* Step 2: Behavior (Likert) */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 italic">Rate frequency (1 = Never, 5 = Frequently)</p>
            {[
              { key: 'littering', label: 'Littering in public spaces' },
              { key: 'spitting', label: 'Spitting in public' },
              { key: 'trafficViolations', label: 'Minor traffic violations (e.g. skipping red light)' },
              { key: 'encroachment', label: 'Encroaching footpaths (e.g. parking, stalls)' },
              { key: 'propertyDamage', label: 'Damaging public property (e.g. parks, transport)' }
            ].map((item) => (
              <div key={item.key} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-2">{item.label}</label>
                <div className="flex justify-between max-w-md">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateField('behavior', item.key, val)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        (formData.behavior as any)[item.key] === val
                          ? 'bg-india-saffron text-white scale-110'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-orange-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Economic */}
        {step === 2 && (
          <div className="space-y-6">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Daily traffic delay due to congestion/violations (Minutes)</span>
              <input 
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.economic.trafficDelay}
                onChange={(e) => updateField('economic', 'trafficDelay', parseInt(e.target.value) || 0)}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Annual medical expenses due to poor sanitation/pollution</span>
               <select 
                className="mt-1 block w-full rounded-md border-gray-300 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.economic.medicalExpenses}
                onChange={(e) => updateField('economic', 'medicalExpenses', e.target.value)}
              >
                <option value="None">None</option>
                <option value="<5000">Less than ₹5,000</option>
                <option value="5000-20000">₹5,000 - ₹20,000</option>
                <option value=">20000">More than ₹20,000</option>
              </select>
            </label>
            
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Annual extra household costs (RO, Pest Control, Cleaning)</span>
               <select 
                className="mt-1 block w-full rounded-md border-gray-300 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.economic.extraHouseholdCost}
                onChange={(e) => updateField('economic', 'extraHouseholdCost', e.target.value)}
              >
                <option value="None">None</option>
                <option value="<5000">Less than ₹5,000</option>
                <option value="5000-15000">₹5,000 - ₹15,000</option>
                <option value=">15000">More than ₹15,000</option>
              </select>
            </label>

            <div className="block bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
               <span className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Perceived impact of poor civic sense on local tourism (1=Low, 5=Severe)</span>
               <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map(val => (
                   <button
                      key={val}
                      onClick={() => updateField('economic', 'tourismImpact', val)}
                      className={`flex-1 py-2 rounded-md font-bold transition-colors ${
                        formData.economic.tourismImpact === val
                          ? 'bg-india-blue text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100'
                      }`}
                    >
                      {val}
                    </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Step 4: Awareness */}
        {step === 3 && (
          <div className="space-y-6">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Are you aware of the Swachh Bharat Mission guidelines?</span>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.awareness.swachhBharat}
                onChange={(e) => updateField('awareness', 'swachhBharat', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Fully Aware">Fully Aware</option>
                <option value="Partially Aware">Partially Aware</option>
                <option value="Not Aware">Not Aware</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Are you aware of specific fines for littering/spitting in your city?</span>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 p-2 dark:bg-slate-700 dark:border-slate-600"
                value={formData.awareness.knowledgeOfFines}
                onChange={(e) => updateField('awareness', 'knowledgeOfFines', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Vaguely">Vaguely</option>
              </select>
            </label>

            <div className="block">
               <span className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Are you willing to report civic violations via Apps/Helplines?</span>
               <div className="flex gap-4">
                 {['Yes', 'No', 'Maybe'].map(opt => (
                   <label key={opt} className="flex items-center space-x-2 cursor-pointer bg-gray-50 dark:bg-slate-700 px-4 py-2 rounded-md border border-transparent hover:border-india-green/30">
                     <input 
                        type="radio" 
                        name="reportWillingness"
                        checked={formData.awareness.reportWillingness === opt}
                        onChange={() => updateField('awareness', 'reportWillingness', opt)}
                        className="text-india-saffron focus:ring-india-saffron"
                     />
                     <span>{opt}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div className="block">
               <span className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Would you pay higher taxes for guaranteed clean streets?</span>
               <div className="flex gap-4">
                 {['Yes', 'No', 'Maybe'].map(opt => (
                   <label key={opt} className="flex items-center space-x-2 cursor-pointer bg-gray-50 dark:bg-slate-700 px-4 py-2 rounded-md border border-transparent hover:border-india-green/30">
                     <input 
                        type="radio" 
                        name="payForBetter"
                        checked={formData.awareness.payForBetter === opt}
                        onChange={() => updateField('awareness', 'payForBetter', opt)}
                        className="text-india-saffron focus:ring-india-saffron"
                     />
                     <span>{opt}</span>
                   </label>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
        <Button 
          variant="outline" 
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0 || isSubmitting}
          className={step === 0 ? 'invisible' : ''}
        >
          <ChevronLeft className="w-4 h-4 mr-2 inline" /> Back
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNext}>
            Next <ChevronRight className="w-4 h-4 ml-2 inline" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} variant="secondary">
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        )}
      </div>
    </div>
  );
};