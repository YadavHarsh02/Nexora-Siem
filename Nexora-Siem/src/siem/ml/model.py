import pandas as pd

from sklearn.linear_model import LogisticRegression


class ThreatClassifier:

    def __init__(self):

        self.model = LogisticRegression()

    def train_model(self):

        dataset = pd.read_csv(
            "data/labeled/training_data.csv"
        )

        X = dataset.drop("label", axis=1)

        y = dataset["label"]

        self.model.fit(X, y)

        print("[INFO] ML model trained successfully")

    def predict_threat(self, features):

        feature_vector = pd.DataFrame(
            [features]
        )

        prediction = self.model.predict(
            feature_vector
        )[0]

        probability = self.model.predict_proba(
            feature_vector
        )[0][1]

        return {

            "prediction":
                "malicious"
                if prediction == 1
                else "benign",

            "confidence":
                round(probability * 100, 2)
        }
