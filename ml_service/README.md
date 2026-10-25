# FutureCrop Python Machine Learning Microservice

This microservice provides high-precision agricultural market price prediction using **Scikit-Learn Random Forest Regression**, **Lagged Time-Series Features**, and **Chronological Validation** with statistical prediction intervals.

## Architecture & Rigor

1. **Strict Chronological Splitting**: Prevents future data leakage by training exclusively on the first 80% chronological window and testing on the subsequent 20% out-of-sample window.
2. **Feature Engineering**:
   - Lagged prices: $t-1, t-3, t-7, t-14, t-30$
   - Rolling moving averages: 7-day, 14-day, 30-day SMA & EMA
   - Rolling standard deviations (volatility proxy)
   - Day-of-week, weekend arrival shifts, and cyclical annual sine/cosine harmonics
3. **Statistical Uncertainty**:
   - Computes residual error variance on the out-of-sample test split.
   - Generates expanding prediction cones:
     - 80% prediction interval: $\hat{y} \pm 1.28 \times \sigma_{\text{residual}} \times \sqrt{1 + 0.12(h-1)}$
     - 95% prediction interval: $\hat{y} \pm 1.96 \times \sigma_{\text{residual}} \times \sqrt{1 + 0.12(h-1)}$
4. **Data Sufficiency Guard**:
   - Automatically refuses to generate spurious predictions if fewer than 15 historical market records exist.

---

## Quickstart (Local Virtual Environment)

```bash
cd ml_service

# 1. Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive Swagger UI will be accessible at: `http://localhost:8000/docs`

---

## Running with Docker

```bash
cd ml_service

# Build container
docker build -t futurecrop-ml-service .

# Run container on port 8000
docker run -d -p 8000:8000 --name futurecrop-ml futurecrop-ml-service
```

---

## Connecting to FutureCrop Frontend

1. In the FutureCrop web interface, navigate to the **ML Lab & FastAPI Pipeline** tab.
2. Toggle the execution engine from **"Internal Web Engine"** to **"External Python FastAPI Service"**.
3. Verify the endpoint URL (default: `http://localhost:8000`).
4. Click **"Test Connection"** to ping `/health`. When healthy, all predictions and model evaluations will route directly through your running Python FastAPI container!

---

## Standalone Script Execution

To train and evaluate a model from any AGMARKNET CSV file directly from the terminal:

```bash
python train_evaluate.py --csv sample_market_data.csv --horizon 14 --export_json evaluation_result.json
```
