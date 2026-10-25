import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Cpu,
  Terminal,
  Server,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Code2,
  FileCode,
  Layers,
  Zap,
} from 'lucide-react';

interface PythonMLViewProps {
  language: Language;
  isPythonEngineActive: boolean;
  onTogglePythonEngine: (active: boolean) => void;
  pythonEndpoint: string;
  onEndpointChange: (url: string) => void;
}

export const PythonMLView: React.FC<PythonMLViewProps> = ({
  language,
  isPythonEngineActive,
  onTogglePythonEngine,
  pythonEndpoint,
  onEndpointChange,
}) => {
  const t = TRANSLATIONS[language];
  const [activeCodeTab, setActiveCodeTab] = useState<'main' | 'pipeline' | 'train' | 'docker' | 'req'>('main');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(`${pythonEndpoint}/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setTestStatus('success');
        setTestMessage(`Connected! Status: ${data.status}, Active Models: ${data.trained_models_count ?? 0}`);
      } else {
        setTestStatus('failed');
        setTestMessage(`Service returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(
        language === 'ta'
          ? `இணைக்க முடியவில்லை (${pythonEndpoint}). பைதான் சேவை இயக்கத்தில் உள்ளதா என சரிபார்க்கவும்.`
          : `Cannot reach ${pythonEndpoint}. Ensure 'uvicorn main:app --port 8000' or Docker container is running.`
      );
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    main: `# ml_service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from model_pipeline import AgriculturalPricePredictor

app = FastAPI(title="FutureCrop ML Engine")
predictors = {}

@app.get("/health")
def health():
    return {"status": "healthy", "trained_models_count": len(predictors)}

@app.post("/api/predict")
def predict(payload: dict):
    df = pd.DataFrame(payload.get("records", []))
    predictor = AgriculturalPricePredictor()
    metrics = predictor.train_and_evaluate(df)
    if metrics.get("status") != "trained":
        raise HTTPException(status_code=422, detail=metrics.get("error"))
    return predictor.generate_forecast(df, horizon_days=payload.get("horizon_days", 14))`,

    pipeline: `# ml_service/model_pipeline.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

class AgriculturalPricePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)

    def create_features(self, df):
        data = df.copy()
        for lag in [1, 3, 7, 14, 30]:
            data[f'lag_{lag}'] = data['modal_price'].shift(lag)
        data['rolling_7_mean'] = data['modal_price'].shift(1).rolling(7).mean()
        data['rolling_14_mean'] = data['modal_price'].shift(1).rolling(14).mean()
        data['day_of_week'] = data['date'].dt.dayofweek
        return data.dropna()

    def train_and_evaluate(self, df):
        # Strict 80/20 Chronological Split
        feats = self.create_features(df)
        split = int(len(feats) * 0.8)
        X_train, X_test = feats[cols].iloc[:split], feats[cols].iloc[split:]
        y_train, y_test = feats['modal_price'].iloc[:split], feats['modal_price'].iloc[split:]
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        return {
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "mape": float(np.mean(np.abs((y_test - y_pred) / y_test)) * 100),
            "r2": float(r2_score(y_test, y_pred))
        }`,

    train: `# ml_service/train_evaluate.py
# Standalone CLI Script
import argparse, json, pandas as pd
from model_pipeline import AgriculturalPricePredictor

parser = argparse.ArgumentParser()
parser.add_argument("--csv", required=True)
parser.add_argument("--horizon", default=14, type=int)
args = parser.parse_args()

df = pd.read_csv(args.csv)
predictor = AgriculturalPricePredictor()
metrics = predictor.train_and_evaluate(df)
forecast = predictor.generate_forecast(df, horizon_days=args.horizon)
print(f"Model MAE: ₹{metrics['mae']}, MAPE: {metrics['mape']}%")`,

    docker: `# ml_service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,

    req: `fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
pandas>=2.2.0
numpy>=1.26.0
scikit-learn>=1.4.0
requests>=2.31.0`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Cpu className="w-5 h-5 text-emerald-700" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                {t.pythonTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.pythonSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-stone-100 text-stone-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-stone-200">
              ml_service/ (FastAPI + Scikit-Learn)
            </span>
          </div>
        </div>
      </div>

      {/* Engine Switcher & Connection Controller */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {t.engineMode}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'ta'
                ? 'வலைத்தள உள்ளமை இயந்திரம் அல்லது வெளிப்புற பைதான் மைக்ரோசர்வீஸ் தேர்ந்தெடுங்கள்.'
                : 'Toggle between the ultra-fast web native execution engine or your external Python FastAPI service.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => onTogglePythonEngine(false)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isPythonEngineActive
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.engineWeb}
            </button>
            <button
              onClick={() => onTogglePythonEngine(true)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isPythonEngineActive
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.enginePython}
            </button>
          </div>
        </div>

        {/* Python Endpoint URL & Ping Test */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Python FastAPI Endpoint URL
            </label>
            <input
              type="text"
              value={pythonEndpoint}
              onChange={(e) => onEndpointChange(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'ta' ? 'இணைப்பு சோதனை' : 'Test API Connection'}
            </label>
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="w-full px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{testStatus === 'testing' ? 'Testing...' : t.testConnection}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              testStatus === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : testStatus === 'failed'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            {testStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testMessage}</span>
          </div>
        )}
      </div>

      {/* Terminal Launch Instructions */}
      <div className="bg-stone-950 text-stone-100 rounded-2xl p-5 shadow-lg border border-stone-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2">
          <span className="flex items-center gap-2 font-bold text-emerald-400">
            <Terminal className="w-4 h-4" />
            {t.runCommandGuide}
          </span>
          <span className="text-[11px] text-stone-500">Terminal (Bash)</span>
        </div>

        <div className="space-y-2 text-stone-300">
          <p className="text-stone-400"># 1. Navigate to the Python microservice directory</p>
          <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-300">cd ml_service</div>

          <p className="text-stone-400"># 2. Install dependencies (Scikit-Learn, Pandas, NumPy, FastAPI)</p>
          <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-300">pip install -r requirements.txt</div>

          <p className="text-stone-400"># 3. Launch Uvicorn development server on port 8000</p>
          <div className="p-2.5 bg-stone-900 rounded-lg text-emerald-300">
            uvicorn main:app --reload --host 0.0.0.0 --port 8000
          </div>
        </div>
      </div>

      {/* Interactive Microservice Code Viewer */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/80 px-4 py-2.5">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold text-stone-600">
            {[
              { id: 'main', label: 'main.py' },
              { id: 'pipeline', label: 'model_pipeline.py' },
              { id: 'train', label: 'train_evaluate.py' },
              { id: 'docker', label: 'Dockerfile' },
              { id: 'req', label: 'requirements.txt' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCodeTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCodeTab === tab.id
                    ? 'bg-emerald-800 text-white'
                    : 'hover:bg-stone-200 text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => copyCode(codeSnippets[activeCodeTab])}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-4 bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">
          <pre>{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>
    </div>
  );
};
