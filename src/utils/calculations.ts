import { InputType, PensionRate, SalaryResults, TaxRates } from "../types";

export const ESTONIAN_TAX_RATES: TaxRates = {
  incomeTax: 0.22,
  socialTax: 0.33,
  unemploymentEmployee: 0.016,
  unemploymentEmployer: 0.008,
  pensionRates: {
    "0": 0,
    "2": 0.02,
    "4": 0.04,
    "6": 0.06,
  },
};

export const calculateSalary = (
  value: string,
  type: InputType,
  pensionPillar: PensionRate,
  includeUnemployment: boolean
): SalaryResults => {
  const pensionRate = ESTONIAN_TAX_RATES.pensionRates[pensionPillar];
  const unemploymentEmployeeRate = includeUnemployment
    ? ESTONIAN_TAX_RATES.unemploymentEmployee
    : 0;
  const unemploymentEmployerRate = includeUnemployment
    ? ESTONIAN_TAX_RATES.unemploymentEmployer
    : 0;

  let gross = 0;
  let net = 0;
  let employerCost = 0;

  const numericValue = parseFloat(value);

  // Calculate based on input type
  if (type === "gross") {
    gross = numericValue;
    net = calculateNetFromGross(gross, pensionRate, unemploymentEmployeeRate);
    employerCost = calculateEmployerCostFromGross(
      gross,
      unemploymentEmployerRate
    );
  } else if (type === "net") {
    net = numericValue;
    gross = findGrossFromNet(net, pensionRate, unemploymentEmployeeRate);
    employerCost = calculateEmployerCostFromGross(
      gross,
      unemploymentEmployerRate
    );
  } else if (type === "employer") {
    employerCost = numericValue;
    gross = findGrossFromEmployerCost(employerCost, unemploymentEmployerRate);
    net = calculateNetFromGross(gross, pensionRate, unemploymentEmployeeRate);
  }

  return formatResults(
    gross,
    net,
    employerCost,
    pensionRate,
    unemploymentEmployeeRate,
    unemploymentEmployerRate
  );
};

const calculateNetFromGross = (
  gross: number,
  pensionRate: number,
  unemploymentEmployeeRate: number
): number => {
  const pensionContribution = gross * pensionRate;
  const unemploymentContribution = gross * unemploymentEmployeeRate;
  const incomeTaxBase = gross - pensionContribution - unemploymentContribution;
  const incomeTax = incomeTaxBase * ESTONIAN_TAX_RATES.incomeTax;

  return gross - pensionContribution - unemploymentContribution - incomeTax;
};

const calculateEmployerCostFromGross = (
  gross: number,
  unemploymentEmployerRate: number
): number => {
  const socialTax = gross * ESTONIAN_TAX_RATES.socialTax;
  const employerUnemployment = gross * unemploymentEmployerRate;

  return gross + socialTax + employerUnemployment;
};

const findGrossFromNet = (
  net: number,
  pensionRate: number,
  unemploymentEmployeeRate: number
): number => {
  let min = net;
  let max = net * 3;

  while (max - min > 0.01) {
    const estimatedGross = (min + max) / 2;
    const calculatedNet = calculateNetFromGross(
      estimatedGross,
      pensionRate,
      unemploymentEmployeeRate
    );

    if (calculatedNet < net) {
      min = estimatedGross;
    } else {
      max = estimatedGross;
    }
  }

  return (min + max) / 2;
};

const findGrossFromEmployerCost = (
  employerCost: number,
  unemploymentEmployerRate: number
): number => {
  let min = employerCost * 0.5;
  let max = employerCost;

  while (max - min > 0.01) {
    const estimatedGross = (min + max) / 2;
    const calculatedEmployerCost = calculateEmployerCostFromGross(
      estimatedGross,
      unemploymentEmployerRate
    );

    if (calculatedEmployerCost < employerCost) {
      min = estimatedGross;
    } else {
      max = estimatedGross;
    }
  }

  return (min + max) / 2;
};

const formatResults = (
  gross: number,
  net: number,
  employerCost: number,
  pensionRate: number,
  unemploymentEmployeeRate: number,
  unemploymentEmployerRate: number
): SalaryResults => {
  const incomeTaxBase = gross * (1 - pensionRate - unemploymentEmployeeRate);

  return {
    gross: gross.toFixed(2),
    net: net.toFixed(2),
    employerCost: employerCost.toFixed(2),
    incomeTax: (incomeTaxBase * ESTONIAN_TAX_RATES.incomeTax).toFixed(2),
    socialTax: (gross * ESTONIAN_TAX_RATES.socialTax).toFixed(2),
    pensionContribution: (gross * pensionRate).toFixed(2),
    unemploymentEmployee: (gross * unemploymentEmployeeRate).toFixed(2),
    unemploymentEmployer: (gross * unemploymentEmployerRate).toFixed(2),
  };
};
