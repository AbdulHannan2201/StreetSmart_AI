import { useState } from "react";
import API from "../utils/api";

export default function AgreementAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("agreement", file);

    try {
      const res = await API.post("/agreements/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze agreement. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Rental Agreement Analyzer
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Upload your rental agreement (PDF) to extract text and identify potential risks.
      </p>

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />

          <button
            onClick={handleUpload}
            disabled={!file || analyzing}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition ${!file || analyzing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {analyzing ? "Analyzing..." : "Analyze Agreement"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-500 text-center font-medium">{error}</p>
        )}
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Analysis Summary */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h2 className="text-xl font-bold text-green-800 mb-2">Analysis Result</h2>
            <p className="text-gray-700">{result.analysis.summary}</p>

            <div className="mt-4 flex gap-4">
              <div className="bg-white px-4 py-2 rounded shadow-sm">
                <span className="block text-xs text-gray-500 uppercase">Risk Score</span>
                <span className="text-xl font-bold text-gray-800">{result.analysis.risk_score}/100</span>
              </div>
              <div className="bg-white px-4 py-2 rounded shadow-sm">
                <span className="block text-xs text-gray-500 uppercase">Characters</span>
                <span className="text-xl font-bold text-gray-800">{result.analysis.text_length}</span>
              </div>
            </div>
          </div>

          {/* Flagged Clauses */}
          {result.analysis.flagged_clauses.length > 0 && (
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h2 className="text-xl font-bold text-yellow-800 mb-3">⚠️ Potential Risks / Flagged Clauses</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {result.analysis.flagged_clauses.map((clause, index) => (
                  <li key={index}>{clause}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extracted Text Preview */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Extracted Text Preview</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-white p-4 rounded border h-64 overflow-y-auto">
              {result.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
