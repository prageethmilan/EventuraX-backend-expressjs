import sys
import json
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer

try:

    model_path = os.path.join(os.path.dirname(__file__), "vendor_ranking_model.pkl")
    vectorizer_path = os.path.join(os.path.dirname(__file__), "vectorizer.pkl")

    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        print(json.dumps({"error": f"Model file not found: {model_path}"}))
        sys.exit(1)

    # ✅ Load Trained Model
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)

    # ✅ Read input data from Node.js
    input_data = sys.stdin.read().strip()

    if not input_data:
        print(json.dumps([]))  # Return empty array if no data
        sys.exit(0)

    vendor_reviews = json.loads(input_data)
    df = pd.DataFrame(vendor_reviews)

    # ✅ Ensure required columns exist
    if "rating" not in df.columns or "reviewText" not in df.columns:
        print(json.dumps({"error": "Missing 'rating' or 'reviewText' column"}))
        sys.exit(1)

    X_text = vectorizer.transform(df["reviewText"])
    X_text = X_text.toarray()

    X_rating = df[["rating"]].values
    X = np.hstack((X_text, X_rating))

    # X_text_df = pd.DataFrame(X_text, columns=vectorizer.get_feature_names_out())
    #
    # X_rating_df = df[["rating"]].astype(str)
    # X_rating_df.columns = ["rating"]
    #
    # X = pd.concat([X_text_df, X_rating_df], axis=1)
    #
    # X.columns = X.columns.astype(str)

    # ✅ Predict Scores
    df["score"] = model.predict(X)

    # ✅ Select Top 2 Vendors
    top_vendors = (
        df.nlargest(2, "score")[["vendorId", "score"]]
        .to_dict(orient="records")
    )

    # ✅ Return JSON result
    print(json.dumps(top_vendors))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
