// App.js
import React, { useState } from 'react';
import './App.css';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function App() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }
      
      const result = await response.json();
      setAnalysis(result);
      setHistory([...history, result]);
    } catch (err) {
      setError('Error analyzing text: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      case 'neutral': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const COLORS = ['#4CAF50', '#2196F3', '#F44336'];

  const renderSentimentChart = () => {
    if (!analysis) return null;
    
    const data = [
      { name: 'Positive', value: analysis.scores.positive },
      { name: 'Neutral', value: analysis.scores.neutral },
      { name: 'Negative', value: analysis.scores.negative },
    ];
    
    return (
      <div className="chart-container">
        <h3>Sentiment Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderHistoryChart = () => {
    if (history.length === 0) return null;
    
    const data = history.map((item, index) => ({
      id: index + 1,
      positive: item.scores.positive,
      neutral: item.scores.neutral,
      negative: item.scores.negative,
    }));
    
    return (
      <div className="chart-container">
        <h3>Analysis History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="id" label={{ value: 'Entry #', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="positive" fill="#4CAF50" />
            <Bar dataKey="neutral" fill="#2196F3" />
            <Bar dataKey="negative" fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sentiment Analysis Dashboard</h1>
        <p>Enter text to analyze its sentiment using machine learning</p>
      </header>
      
      <div className="main-content">
        <div className="input-section">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze..."
            rows={5}
            className="text-input"
          />
          <button 
            onClick={analyzeText} 
            disabled={loading} 
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze Sentiment'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
        
        {analysis && (
          <div className="result-section">
            <div className="sentiment-badge" style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}>
              {analysis.sentiment.toUpperCase()}
            </div>
            
            <div className="metrics">
              <div className="metric">
                <h4>Word Count</h4>
                <p>{analysis.word_count}</p>
              </div>
              <div className="metric">
                <h4>Character Count</h4>
                <p>{analysis.char_count}</p>
              </div>
            </div>
            
            {renderSentimentChart()}
            {renderHistoryChart()}
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <p>Built with React, Python, and Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;