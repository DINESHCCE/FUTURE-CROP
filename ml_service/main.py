"""
FutureCrop FastAPI Machine Learning Backend Service
===================================================
Provides REST APIs for:
1. Historical price data ingestion & validation
2. Chronological training & backtest evaluation (MAE, RMSE, MAPE, R2)
3. Multi-horizon price forecasting with 80% & 95% uncertainty intervals
4. Feature inspection
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import io
import uvicorn
from model_pipeline import AgriculturalPricePredictor

app = FastAPI(
    title="FutureCrop ML Engine API",
    description="Agricultural commodity price prediction and time-series forecasting backend powered by Scikit-Learn & FastAPI.",
    version="1.0.0"
)

# Enable CORS for AI Studio / frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory predictor cache per commodity/market
predictors: Dict[str, AgriculturalPricePredictor] = {}

class PriceRecord(BaseModel):
    date: str = Field(..., example="2026-10-01")
    modal_price: float = Field(..., example=2650.0)
    commodity: Optional[str] = "tomato"
    market: Optional[str] = "Koyambedu"
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    arrivals: Optional[float] = None

class TrainRequest(BaseModel):
    commodity_id: str = Field(..., example="tomato")
    market_id: str = Field(..., example="koyambedu")
    records: List[PriceRecord]

class ForecastRequest(BaseModel):
    commodity_id: str = Field(..., example="tomato")
    market_id: str = Field(..., example="koyambedu")
    horizon_days: int = Field(default=14, ge=1, le=60)
    records: List[PriceRecord]

@app.get("/")
def root():
    return {
        "service": "FutureCrop ML Service",
        "status": "operational",
        "docs_url": "/docs",
        "active_models": list(predictors.keys())
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "trained_models_count": len(predictors)
    }

@app.post("/api/train")
def train_model(payload: TrainRequest):
    """
    Train Random Forest regressor with chronological train/test split.
    """
    key = f"{payload.commodity_id}_{payload.market_id}"
    df = pd.DataFrame([r.dict() for r in payload.records])

    predictor = AgriculturalPricePredictor()
    metrics = predictor.train_and_evaluate(df)

    if metrics.get("status") == "trained":
        predictors[key] = predictor
        return {
            "success": True,
            "message": f"Model successfully trained for {payload.commodity_id} in {payload.market_id}",
            "metrics": metrics
        }
    else:
        raise HTTPException(
            status_code=400,
            detail=metrics.get("error", "Failed to train model due to data constraints.")
        )

@app.post("/api/predict")
def predict_prices(payload: ForecastRequest):
    """
    Generate price predictions with 80% and 95% statistical intervals.
    """
    key = f"{payload.commodity_id}_{payload.market_id}"
    df = pd.DataFrame([r.dict() for r in payload.records])

    predictor = predictors.get(key)
    if predictor is None:
        predictor = AgriculturalPricePredictor()

    result = predictor.generate_forecast(df, horizon_days=payload.horizon_days)

    if result.get("status") == "insufficient_data":
        raise HTTPException(
            status_code=422,
            detail=result.get("error", "Insufficient data to generate reliable forecast.")
        )

    predictors[key] = predictor
    return result

@app.post("/api/upload-csv")
async def upload_csv_and_evaluate(file: UploadFile = File(...)):
    """
    Upload CSV dataset, validate AGMARKNET schema, train model, and return evaluation.
    """
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

    predictor = AgriculturalPricePredictor()
    metrics = predictor.train_and_evaluate(df)

    if metrics.get("status") != "trained":
        raise HTTPException(status_code=422, detail=metrics.get("error"))

    forecast = predictor.generate_forecast(df, horizon_days=14)
    return {
        "success": True,
        "rows_ingested": len(df),
        "metrics": metrics,
        "sample_forecast": forecast
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
