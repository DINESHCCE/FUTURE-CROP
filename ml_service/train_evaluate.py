"""
FutureCrop Standalone Training & Evaluation Script
=================================================
Usage:
    python train_evaluate.py --csv sample_agmarknet_tomato.csv --horizon 14
"""

import argparse
import json
import pandas as pd
from model_pipeline import AgriculturalPricePredictor

def main():
    parser = argparse.ArgumentParser(description="Train and evaluate FutureCrop Random Forest Model.")
    parser.add_argument("--csv", type=str, required=True, help="Path to CSV dataset")
    parser.add_argument("--horizon", type=int, default=14, help="Forecast horizon in days")
    parser.add_argument("--export_json", type=str, default="evaluation_output.json", help="Path to save output JSON")
    args = parser.parse_args()

    print(f"[*] Loading dataset from: {args.csv}")
    try:
        df = pd.read_csv(args.csv)
    except Exception as e:
        print(f"[!] Error reading CSV: {e}")
        return

    predictor = AgriculturalPricePredictor()
    print("[*] Running data cleaning, lag feature engineering & chronological split (80/20)...")
    metrics = predictor.train_and_evaluate(df)

    if metrics.get("status") != "trained":
        print(f"[!] Training failed: {metrics.get('error')}")
        return

    print("\n[+] Model Trained Successfully!")
    print(f"    - Algorithm:      {metrics.get('algorithm')}")
    print(f"    - Sample Records: {metrics.get('sample_count')}")
    print(f"    - Train Size:     {metrics.get('train_size')}")
    print(f"    - Test Size:      {metrics.get('test_size')}")
    print(f"    - MAE:            ₹{metrics.get('mae')} / Quintal")
    print(f"    - RMSE:           ₹{metrics.get('rmse')} / Quintal")
    print(f"    - MAPE:           {metrics.get('mape')}%")
    print(f"    - R² Score:       {metrics.get('r2_score')}")

    print(f"\n[*] Generating {args.horizon}-day forward forecast with uncertainty bounds...")
    forecast = predictor.generate_forecast(df, horizon_days=args.horizon)

    print(f"    - Current Price:         ₹{forecast.get('current_price')}")
    print(f"    - Predicted Final Price: ₹{forecast.get('predicted_final_price')}")
    print(f"    - Expected Change:       ₹{forecast.get('price_change_rupees')} ({forecast.get('price_change_percent')}%)")
    print(f"    - Projected Trend:       {forecast.get('trend').upper()}")

    output_data = {
        "metrics": metrics,
        "forecast": forecast
    }

    with open(args.export_json, "w") as f:
        json.dump(output_data, f, indent=2)
    print(f"\n[+] Full metrics and forecast points saved to: {args.export_json}")

if __name__ == "__main__":
    main()
