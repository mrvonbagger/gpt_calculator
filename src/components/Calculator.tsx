import React, { useState, FormEvent, useEffect } from "react";
import { InputType, PensionRate, SalaryResults } from "../types";
import { calculateSalary } from "../utils/calculations";
import { openAiCall } from "../utils/openAiCall";

const Calculator: React.FC = () => {
  const [inputType, setInputType] = useState<InputType>("gross");
  const [inputValue, setInputValue] = useState<string>("");
  const [pensionPillar, setPensionPillar] = useState<PensionRate>("6");
  const [includeUnemployment, setIncludeUnemployment] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SalaryResults | null>(null);
  const [openAiResult, setOpenAiResult] = useState<string | null>("");

  // call OpenAI API
  useEffect(() => {
    const fetchOpenAiResult = async () => {
      if (results) {
        try {
          setLoading(true);
          const result = await openAiCall(results);
          setOpenAiResult(result);
        } catch (error) {
          console.error("Error fetching OpenAI result:", error);
          setOpenAiResult(
            "There was an error while rating. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOpenAiResult();
  }, [results]);

  const handleCalculate = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!inputValue || isNaN(Number(inputValue)) || Number(inputValue) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const calculatedResults = calculateSalary(
      inputValue,
      inputType,
      pensionPillar,
      includeUnemployment
    );
    setResults(calculatedResults);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center text-blue-600">
        Estonian Salary Calculator
      </h1>

      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left column */}
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Enter:</label>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="gross"
                    checked={inputType === "gross"}
                    onChange={() => setInputType("gross")}
                    className="mr-1"
                  />
                  <span className="text-sm">Gross Salary</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="net"
                    checked={inputType === "net"}
                    onChange={() => setInputType("net")}
                    className="mr-1"
                  />
                  <span className="text-sm">Net Salary</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="employer"
                    checked={inputType === "employer"}
                    onChange={() => setInputType("employer")}
                    className="mr-1"
                  />
                  <span className="text-sm">Employer Cost</span>
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Amount (EUR):
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                2nd Pension Pillar:
              </label>
              <select
                value={pensionPillar}
                onChange={(e) =>
                  setPensionPillar(e.target.value as PensionRate)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="0">Not joined (0%)</option>
                <option value="2">Joined (2%)</option>
                <option value="4">Joined (4%)</option>
                <option value="6">Joined (6%)</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={includeUnemployment}
                  onChange={(e) => setIncludeUnemployment(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-sm">Include unemployment insurance</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Calculate
            </button>
          </div>
        </div>
      </form>

      {results && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium mb-3 text-blue-600">Results</h2>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-white rounded shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">
                Gross Salary
              </h3>
              <p className="text-lg font-bold text-blue-600">
                {results.gross} €
              </p>
            </div>
            <div className="p-2 bg-white rounded shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">Net Salary</h3>
              <p className="text-lg font-bold text-green-600">
                {results.net} €
              </p>
            </div>
            <div className="p-2 bg-white rounded shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">
                Employer Cost
              </h3>
              <p className="text-lg font-bold text-red-600">
                {results.employerCost} €
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-2 text-gray-700">
                Tax Breakdown:
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Income Tax:</span>
                  <span className="font-medium">{results.incomeTax} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Social Tax (33%):</span>
                  <span className="font-medium">{results.socialTax} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Pension Contribution ({pensionPillar}%):</span>
                  <span className="font-medium">
                    {results.pensionContribution} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Unemployment Insurance (employee 1.6%):</span>
                  <span className="font-medium">
                    {results.unemploymentEmployee} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Unemployment Insurance (employer 0.8%):</span>
                  <span className="font-medium">
                    {results.unemploymentEmployer} €
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-2 bg-blue-50 rounded">
              <h3 className="text-sm font-medium mb-1 text-gray-700">
                Assessment:
              </h3>
              {loading ? (
                <p className="text-xs text-gray-600 italic">
                  Generating assessment...
                </p>
              ) : (
                <p className="text-xs text-gray-800">{openAiResult}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
