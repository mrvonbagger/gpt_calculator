export type InputType = "gross" | "net" | "employer";
export type PensionRate = "0" | "2" | "4" | "6";

export interface TaxRates {
  incomeTax: number;
  socialTax: number;
  unemploymentEmployee: number;
  unemploymentEmployer: number;
  pensionRates: {
    [key in PensionRate]: number;
  };
}

export interface SalaryResults {
  gross: string;
  net: string;
  employerCost: string;
  incomeTax: string;
  socialTax: string;
  pensionContribution: string;
  unemploymentEmployee: string;
  unemploymentEmployer: string;
}
