import OpenAI from "openai";
import { SalaryResults } from "../types";

export const openAiCall = async (salaryData: SalaryResults) => {
  const openai = new OpenAI({
    apiKey: process.env["REACT_APP_OPENAI_API_KEY"],
    dangerouslyAllowBrowser: true,
  });

  const prompt = `
    Analyze the following salary information in the Estonian context:
    - Gross Salary (Brutopalk): ${salaryData.gross} EUR
    - Net Salary (Netopalk): ${salaryData.net} EUR
    - Total Employer Cost: ${salaryData.employerCost} EUR
    
    Tax breakdown:
    - Income Tax: ${salaryData.incomeTax} EUR
    - Social Tax: ${salaryData.socialTax} EUR
    - Pension Contribution: ${salaryData.pensionContribution} EUR
    - Employee Unemployment Insurance: ${salaryData.unemploymentEmployee} EUR
    - Employer Unemployment Insurance: ${salaryData.unemploymentEmployer} EUR
    
    Please provide a brief assessment (2-3 sentences) about this salary level in Estonia. 
    Consider the standard of living, average salaries in Estonia, and what kind of lifestyle this salary might afford.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful financial advisor with expertise in Estonian salaries and living costs.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content;
};
