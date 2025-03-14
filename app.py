from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Sample data for training the model
# In a real project, you'd use a larger dataset
data = {
    'text': [
        "I love this product, it's amazing!",
        "This is great, highly recommended",
        "I'm really happy with my purchase",
        "This is terrible, don't buy it",
        "I hate this, complete waste of money",
        "Very disappointed with the quality",
        "Not bad, but could be better",
        "Somewhat satisfied with the experience",
        "Neutral opinion on this product",
        "Amazing service and quick delivery",
        "Awful customer support experience",
        "Mediocre at best, wouldn't recommend"
    ],
    'sentiment': [
        'positive', 'positive', 'positive',
        'negative', 'negative', 'negative',
        'neutral', 'neutral', 'neutral',
        'positive', 'negative', 'negative'
    ]
}

df = pd.DataFrame(data)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df['sentiment'], test_size=0.2, random_state=42
)

# Create a pipeline with CountVectorizer and MultinomialNB
text_clf = Pipeline([
    ('vect', CountVectorizer()),
    ('clf', MultinomialNB())
])

# Train the model
text_clf.fit(X_train, y_train)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Predict sentiment
    prediction = text_clf.predict([text])[0]
    
    # Get probability scores
    proba = text_clf.predict_proba([text])[0]
    sentiment_scores = {
        'positive': float(proba[list(text_clf.classes_).index('positive')]) if 'positive' in text_clf.classes_ else 0,
        'neutral': float(proba[list(text_clf.classes_).index('neutral')]) if 'neutral' in text_clf.classes_ else 0,
        'negative': float(proba[list(text_clf.classes_).index('negative')]) if 'negative' in text_clf.classes_ else 0
    }
    
    # Add some additional analysis
    word_count = len(text.split())
    char_count = len(text)
    
    return jsonify({
        'text': text,
        'sentiment': prediction,
        'scores': sentiment_scores,
        'word_count': word_count,
        'char_count': char_count
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)