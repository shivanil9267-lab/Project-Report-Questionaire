export interface SurveyData {
  id: string;
  timestamp: string;
  demographics: {
    name: string;
    email: string;
    age: string;
    gender: string;
    education: string;
    occupation: string;
    income: string;
  };
  behavior: {
    littering: number;
    spitting: number;
    trafficViolations: number;
    encroachment: number;
    propertyDamage: number;
  };
  economic: {
    medicalExpenses: string;
    trafficDelay: number; // minutes
    extraHouseholdCost: string;
    tourismImpact: number;
  };
  awareness: {
    swachhBharat: string;
    knowledgeOfFines: string;
    reportWillingness: string;
    payForBetter: string;
  };
}

export type SurveySection = 'demographics' | 'behavior' | 'economic' | 'awareness';

export interface ChartDataPoint {
  name: string;
  value: number;
}