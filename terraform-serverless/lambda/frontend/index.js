


// Federal Reserve Communications AI - Frontend Lambda Function
// This function serves the complete website as a single-page application

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fed Communications AI - AI-Powered Communication Management</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1rem;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 1rem 2rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
            color: white;
            font-size: 1.8rem;
            font-weight: 600;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .status-text {
            color: white;
            font-size: 0.9rem;
        }

        .live-clock {
            color: rgba(255, 255, 255, 0.9);
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            background: rgba(0, 0, 0, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            backdrop-filter: blur(5px);
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .main-content {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 1.5rem;
            height: calc(100vh - 200px);
            overflow-y: auto;
            padding: 1rem 0;
        }

        .panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
        }

        .panel-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #f1f5f9;
        }

        .panel-header .material-icons {
            color: #6366f1;
            font-size: 1.5rem;
        }

        .panel-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
        }

        .panel-content {
            flex: 1;
            overflow-y: auto;
        }

        .inquiry-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .inquiry-card:hover {
            background: #f1f5f9;
            border-color: #6366f1;
            transform: translateY(-1px);
        }

        .inquiry-card.selected {
            background: #eef2ff;
            border-color: #6366f1;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .inquiry-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .inquiry-subject {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.9rem;
        }

        .inquiry-time {
            font-size: 0.8rem;
            color: #64748b;
            font-family: 'Courier New', monospace;
        }

        .inquiry-content {
            color: #475569;
            font-size: 0.85rem;
            line-height: 1.4;
            margin-bottom: 0.5rem;
        }

        .inquiry-tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .tag {
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 500;
        }

        .tag.category {
            background: #dbeafe;
            color: #1d4ed8;
        }

        .tag.sentiment {
            background: #dcfce7;
            color: #166534;
        }

        .tag.risk {
            background: #fef3c7;
            color: #92400e;
        }

        .response-editor {
            width: 100%;
            height: 200px;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 1rem;
            font-family: inherit;
            font-size: 0.9rem;
            resize: vertical;
            background: #f8fafc;
            color: #475569;
            outline: none;
            transition: all 0.2s ease;
        }

        .response-editor:focus {
            border-color: #6366f1;
            background: white;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .response-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
        }

        .btn {
            padding: 0.6rem 1.2rem;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: #6366f1;
            color: white;
        }

        .btn-primary:hover {
            background: #5b21b6;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
            background: #e2e8f0;
        }

        .insights-panel {
            grid-column: 1 / -1;
            max-height: 300px;
        }

        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            height: 100%;
        }

        .insight-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
        }

        .insight-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .insight-icon {
            font-size: 1.2rem;
        }

        .insight-title {
            font-weight: 600;
            font-size: 0.9rem;
            color: #1e293b;
        }

        .insight-content {
            flex: 1;
        }

        .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.4rem 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .metric-row:last-child {
            border-bottom: none;
        }

        .metric-label {
            font-size: 0.8rem;
            color: #64748b;
        }

        .metric-value {
            font-weight: 600;
            font-size: 0.85rem;
            color: #1e293b;
        }

        .trending-topics {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .topic-tag {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .alert-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .alert-item:last-child {
            border-bottom: none;
        }

        .alert-indicator {
            font-size: 0.8rem;
        }

        .alert-text {
            font-size: 0.8rem;
            color: #475569;
        }

        .sentiment-bar {
            display: flex;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 0.5rem 0;
        }

        .sentiment-positive {
            background: linear-gradient(90deg, #10b981, #34d399);
        }

        .sentiment-neutral {
            background: linear-gradient(90deg, #6b7280, #9ca3af);
        }

        .sentiment-negative {
            background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #64748b;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e2e8f0;
            border-top: 2px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* AI-Powered Features Styles */
        .ai-panel {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .ai-badge {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
            border-radius: 8px;
            font-weight: bold;
            margin-left: 0.5rem;
        }

        .sentiment-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
        }

        .sentiment-bar {
            flex: 1;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }

        .sentiment-fill {
            height: 100%;
            transition: width 0.3s ease;
        }

        .sentiment-positive { background: #10b981; }
        .sentiment-neutral { background: #6b7280; }
        .sentiment-negative { background: #ef4444; }

        .trending-topic {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem;
            border-radius: 8px;
            margin: 0.5rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .trend-score {
            background: rgba(255, 255, 255, 0.2);
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .ai-insight {
            background: rgba(255, 255, 255, 0.1);
            border-left: 4px solid #fbbf24;
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 0 8px 8px 0;
        }

        .ai-insight.alert { border-left-color: #ef4444; }
        .ai-insight.info { border-left-color: #3b82f6; }

        .chart-container {
            position: relative;
            height: 200px;
            margin: 1rem 0;
        }

        .ai-controls {
            display: flex;
            gap: 0.5rem;
            margin: 1rem 0;
            flex-wrap: wrap;
        }

        .ai-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }

        .ai-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }

        .ai-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .text-analyzer {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 12px;
            margin: 1rem 0;
        }

        .text-analyzer textarea {
            width: 100%;
            min-height: 100px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 0.75rem;
            color: white;
            font-family: inherit;
            resize: vertical;
        }

        .text-analyzer textarea::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .analysis-results {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }

        .keyword-tag {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            margin: 0.2rem;
        }

        .entity-tag {
            display: inline-block;
            background: rgba(59, 130, 246, 0.3);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            margin: 0.2rem;
            border: 1px solid rgba(59, 130, 246, 0.5);
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
                grid-template-rows: auto auto auto auto;
            }
            
            .header {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
            
            .insights-grid {
                grid-template-columns: 1fr;
            }

            .ai-controls {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🏛️ Fed Communications AI</h1>
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span class="status-text">System Operational</span>
            </div>
            <div class="live-clock" id="liveClock"></div>
        </header>

        <main class="main-content">
            <div class="panel">
                <div class="panel-header">
                    <span class="material-icons">inbox</span>
                    <span class="panel-title">Inquiry Viewer</span>
                </div>
                <div class="panel-content" id="inquiryContainer">
                    <div class="loading">
                        <div class="spinner"></div>
                        Loading inquiries...
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-header">
                    <span class="material-icons">edit</span>
                    <span class="panel-title">AI Draft Response</span>
                </div>
                <div class="panel-content">
                    <textarea 
                        class="response-editor" 
                        id="responseEditor" 
                        placeholder="Select an inquiry to generate AI response...">
                    </textarea>
                    <div class="response-actions">
                        <button class="btn btn-primary" onclick="generateResponse()">
                            <span class="material-icons" style="font-size: 1rem;">auto_awesome</span>
                            Generate AI Response
                        </button>
                        <button class="btn btn-secondary" onclick="saveDraft()">
                            <span class="material-icons" style="font-size: 1rem;">save</span>
                            Save Draft
                        </button>
                        <button class="btn btn-secondary" onclick="sendResponse()">
                            <span class="material-icons" style="font-size: 1rem;">send</span>
                            Send Response
                        </button>
                    </div>
                </div>
            </div>

            <div class="panel insights-panel">
                <div class="panel-header">
                    <span class="material-icons">insights</span>
                    <span class="panel-title">Insights Dashboard</span>
                </div>
                <div class="panel-content">
                    <div class="insights-grid" id="insightsGrid">
                        <div class="loading">
                            <div class="spinner"></div>
                            Loading dashboard data...
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Sentiment Analysis Panel -->
            <div class="panel ai-panel">
                <div class="panel-header">
                    <span class="material-icons">psychology</span>
                    <span class="panel-title">AI Sentiment Analysis</span>
                    <span class="ai-badge">AI</span>
                </div>
                <div class="panel-content">
                    <div class="sentiment-indicator">
                        <span>Positive:</span>
                        <div class="sentiment-bar">
                            <div class="sentiment-fill sentiment-positive" id="positiveBar" style="width: 33%"></div>
                        </div>
                        <span id="positivePercent">33%</span>
                    </div>
                    <div class="sentiment-indicator">
                        <span>Neutral:</span>
                        <div class="sentiment-bar">
                            <div class="sentiment-fill sentiment-neutral" id="neutralBar" style="width: 34%"></div>
                        </div>
                        <span id="neutralPercent">34%</span>
                    </div>
                    <div class="sentiment-indicator">
                        <span>Negative:</span>
                        <div class="sentiment-bar">
                            <div class="sentiment-fill sentiment-negative" id="negativeBar" style="width: 33%"></div>
                        </div>
                        <span id="negativePercent">33%</span>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="sentimentChart"></canvas>
                    </div>
                    
                    <div class="ai-controls">
                        <button class="ai-btn" onclick="refreshSentimentData()">
                            <span class="material-icons">refresh</span>
                            Refresh
                        </button>
                        <button class="ai-btn" onclick="exportSentimentReport()">
                            <span class="material-icons">download</span>
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            <!-- AI Trending Topics Panel -->
            <div class="panel ai-panel">
                <div class="panel-header">
                    <span class="material-icons">trending_up</span>
                    <span class="panel-title">Trending Topics</span>
                    <span class="ai-badge">AI</span>
                </div>
                <div class="panel-content">
                    <div id="trendingTopics">
                        <div class="loading">
                            <div class="spinner"></div>
                            Analyzing trending topics...
                        </div>
                    </div>
                    
                    <div class="ai-controls">
                        <button class="ai-btn" onclick="refreshTrendingTopics()">
                            <span class="material-icons">refresh</span>
                            Refresh
                        </button>
                        <button class="ai-btn" onclick="viewTopicDetails()">
                            <span class="material-icons">analytics</span>
                            View Details
                        </button>
                    </div>
                </div>
            </div>

            <!-- AI Text Analyzer Panel -->
            <div class="panel ai-panel">
                <div class="panel-header">
                    <span class="material-icons">text_fields</span>
                    <span class="panel-title">Real-time Text Analyzer</span>
                    <span class="ai-badge">AI</span>
                </div>
                <div class="panel-content">
                    <div class="text-analyzer">
                        <textarea 
                            id="textAnalyzerInput" 
                            placeholder="Paste text here to analyze sentiment, extract key phrases, and classify content..."
                            oninput="debounceAnalyzeText()">
                        </textarea>
                        
                        <div class="ai-controls">
                            <button class="ai-btn" onclick="analyzeText()" id="analyzeBtn">
                                <span class="material-icons">psychology</span>
                                Analyze Text
                            </button>
                            <button class="ai-btn" onclick="clearAnalysis()">
                                <span class="material-icons">clear</span>
                                Clear
                            </button>
                        </div>
                        
                        <div class="analysis-results" id="analysisResults" style="display: none;">
                            <h4>Analysis Results:</h4>
                            <div id="sentimentResult"></div>
                            <div id="categoryResult"></div>
                            <div id="keyPhrasesResult"></div>
                            <div id="entitiesResult"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Insights Panel -->
            <div class="panel ai-panel">
                <div class="panel-header">
                    <span class="material-icons">lightbulb</span>
                    <span class="panel-title">AI Insights & Recommendations</span>
                    <span class="ai-badge">AI</span>
                </div>
                <div class="panel-content">
                    <div id="aiInsights">
                        <div class="loading">
                            <div class="spinner"></div>
                            Generating AI insights...
                        </div>
                    </div>
                    
                    <div class="ai-controls">
                        <button class="ai-btn" onclick="refreshInsights()">
                            <span class="material-icons">refresh</span>
                            Refresh Insights
                        </button>
                        <button class="ai-btn" onclick="generateReport()">
                            <span class="material-icons">assessment</span>
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Global variables
        let inquiries = [];
        let selectedInquiry = null;
        let dashboardData = null;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            updateClock();
            setInterval(updateClock, 1000);
            loadInquiries();
            loadDashboardData();
        });

        // Update live clock
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            document.getElementById('liveClock').textContent = \`\${dateString} \${timeString}\`;
        }

        // Load inquiries from API
        async function loadInquiries() {
            try {
                const response = await fetch('/api/inquiries');
                const data = await response.json();
                inquiries = data.inquiries || [];
                renderInquiries();
            } catch (error) {
                console.error('Error loading inquiries:', error);
                document.getElementById('inquiryContainer').innerHTML = 
                    '<div style="padding: 1rem; color: #ef4444;">Failed to load inquiries. Please try again.</div>';
            }
        }

        // Render inquiries list
        function renderInquiries() {
            const container = document.getElementById('inquiryContainer');
            
            if (!inquiries || inquiries.length === 0) {
                container.innerHTML = '<div style="padding: 1rem; color: #6b7280;">No inquiries found.</div>';
                return;
            }
            
            container.innerHTML = inquiries.map((inquiry, index) => \`
                <div class="inquiry-card \${selectedInquiry === index ? 'selected' : ''}" onclick="selectInquiry(\${index})">
                    <div class="inquiry-meta">
                        <div class="inquiry-subject">\${inquiry.subject || 'No Subject'}</div>
                        <div class="inquiry-time">\${new Date(inquiry.date || inquiry.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div class="inquiry-content">\${(inquiry.body || inquiry.content || '').substring(0, 100)}...</div>
                    <div class="inquiry-tags">
                        <span class="tag category">\${inquiry.category || 'General'}</span>
                        <span class="tag sentiment">\${inquiry.priority || 'medium'} Priority</span>
                        <span class="tag risk">\${inquiry.source || 'unknown'}</span>
                    </div>
                </div>
            \`).join('');
        }

        // Select inquiry
        function selectInquiry(index) {
            selectedInquiry = index;
            renderInquiries();
            
            const inquiry = inquiries[index];
            document.getElementById('responseEditor').placeholder = \`Responding to: "\${inquiry.subject}"\\n\\nClick "Generate AI Response" to create a draft response.\`;
        }

        // Generate AI response
        async function generateResponse() {
            if (selectedInquiry === null) {
                alert('Please select an inquiry first.');
                return;
            }

            const inquiry = inquiries[selectedInquiry];
            const editor = document.getElementById('responseEditor');
            
            editor.value = 'Generating AI response...';
            
            // Simulate AI response generation
            setTimeout(() => {
                const responses = [
                    \`Dear \${inquiry.source || 'Stakeholder'},\\n\\nThank you for your inquiry regarding \${inquiry.subject || 'Federal Reserve policy'}. The Federal Reserve remains committed to maintaining price stability and full employment as outlined in our dual mandate.\\n\\nBased on current economic indicators and recent FOMC decisions, we can provide the following information...\\n\\nBest regards,\\nFederal Reserve Communications Team\`,
                    \`Thank you for contacting the Federal Reserve. Your inquiry about \${inquiry.category || 'monetary policy'} is important to us.\\n\\nThe Federal Reserve's current stance on this matter aligns with our commitment to data-driven decision making and transparent communication with the public.\\n\\nFor additional information, please refer to our recent publications and statements available on our website.\\n\\nSincerely,\\nFed Communications AI\`,
                    \`We appreciate your interest in Federal Reserve operations. Regarding your question about \${inquiry.subject || 'economic policy'}, please note that the Federal Reserve operates independently to serve the public interest.\\n\\nOur recent policy decisions reflect careful consideration of economic data, inflation trends, and employment statistics.\\n\\nWe encourage you to review our latest meeting minutes and economic projections for more detailed information.\\n\\nRespectfully,\\nFederal Reserve\`
                ];
                
                editor.value = responses[Math.floor(Math.random() * responses.length)];
            }, 2000);
        }

        // Save draft
        function saveDraft() {
            const content = document.getElementById('responseEditor').value;
            if (!content.trim()) {
                alert('Please enter a response before saving.');
                return;
            }
            
            // Simulate saving
            alert('Draft saved successfully!');
        }

        // Send response
        function sendResponse() {
            const content = document.getElementById('responseEditor').value;
            if (!content.trim()) {
                alert('Please enter a response before sending.');
                return;
            }
            
            if (confirm('Are you sure you want to send this response?')) {
                alert('Response sent successfully!');
                document.getElementById('responseEditor').value = '';
                selectedInquiry = null;
                renderInquiries();
            }
        }

        // Load dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard/analytics');
                dashboardData = await response.json();
                renderDashboard();
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                renderDashboard(); // Render with sample data
            }
        }

        // Render dashboard
        function renderDashboard() {
            const container = document.getElementById('insightsGrid');
            
            // Use sample data if API fails
            const data = dashboardData || {
                federalReserveRates: {
                    federalFundsRate: "5.25-5.50%",
                    discountRate: "5.50%",
                    tenYearTreasury: "4.28%"
                },
                economicIndicators: {
                    unemploymentRate: "3.7%",
                    corePCEInflation: "3.2%",
                    gdpGrowth: "4.9%"
                },
                communicationSentiment: {
                    positive: 65,
                    neutral: 25,
                    negative: 10
                },
                trendingTopics: ["Interest Rates", "Inflation", "Employment", "Banking Policy", "Economic Outlook", "FOMC Decisions"],
                priorityAlerts: [
                    { level: "🔴", message: "High-profile media inquiry on rate policy" },
                    { level: "🟡", message: "Congressional request for inflation data" },
                    { level: "🟢", message: "Routine public information requests" }
                ],
                marketImpact: {
                    sp500: "+0.8%",
                    usdIndex: "103.2",
                    vix: "16.4"
                }
            };

            container.innerHTML = \`
                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">📊</span>
                        <span class="insight-title">Federal Reserve Key Rates</span>
                    </div>
                    <div class="insight-content">
                        <div class="metric-row">
                            <span class="metric-label">Federal Funds Rate</span>
                            <span class="metric-value">\${data.federalReserveRates.federalFundsRate}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Discount Rate</span>
                            <span class="metric-value">\${data.federalReserveRates.discountRate}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">10-Year Treasury</span>
                            <span class="metric-value">\${data.federalReserveRates.tenYearTreasury}</span>
                        </div>
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">💼</span>
                        <span class="insight-title">Economic Indicators</span>
                    </div>
                    <div class="insight-content">
                        <div class="metric-row">
                            <span class="metric-label">Unemployment Rate</span>
                            <span class="metric-value">\${data.economicIndicators.unemploymentRate}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Core PCE Inflation</span>
                            <span class="metric-value">\${data.economicIndicators.corePCEInflation}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">GDP Growth (Q3)</span>
                            <span class="metric-value">\${data.economicIndicators.gdpGrowth}</span>
                        </div>
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">🎯</span>
                        <span class="insight-title">Communication Sentiment</span>
                    </div>
                    <div class="insight-content">
                        <div class="sentiment-bar">
                            <div class="sentiment-positive" style="width: \${data.communicationSentiment.positive}%"></div>
                            <div class="sentiment-neutral" style="width: \${data.communicationSentiment.neutral}%"></div>
                            <div class="sentiment-negative" style="width: \${data.communicationSentiment.negative}%"></div>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Positive \${data.communicationSentiment.positive}%</span>
                            <span class="metric-label">Neutral \${data.communicationSentiment.neutral}%</span>
                            <span class="metric-label">Negative \${data.communicationSentiment.negative}%</span>
                        </div>
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">🔥</span>
                        <span class="insight-title">Trending Topics</span>
                    </div>
                    <div class="insight-content">
                        <div class="trending-topics">
                            \${data.trendingTopics.map(topic => \`<span class="topic-tag">\${topic}</span>\`).join('')}
                        </div>
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">⚠️</span>
                        <span class="insight-title">Priority Alerts</span>
                    </div>
                    <div class="insight-content">
                        \${data.priorityAlerts.map(alert => \`
                            <div class="alert-item">
                                <span class="alert-indicator">\${alert.level}</span>
                                <span class="alert-text">\${alert.message}</span>
                            </div>
                        \`).join('')}
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">📈</span>
                        <span class="insight-title">Market Impact</span>
                    </div>
                    <div class="insight-content">
                        <div class="metric-row">
                            <span class="metric-label">S&P 500</span>
                            <span class="metric-value">\${data.marketImpact.sp500}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">USD Index</span>
                            <span class="metric-value">\${data.marketImpact.usdIndex}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">VIX</span>
                            <span class="metric-value">\${data.marketImpact.vix}</span>
                        </div>
                    </div>
                </div>
            \`;
        }

        // AI-Powered Functions

        let sentimentChart = null;
        let analysisTimeout = null;

        // Initialize AI features
        function initializeAI() {
            loadSentimentData();
            loadTrendingTopics();
            loadAIInsights();
            initializeSentimentChart();
        }

        // Initialize sentiment chart
        function initializeSentimentChart() {
            const ctx = document.getElementById('sentimentChart').getContext('2d');
            sentimentChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [33, 34, 33],
                        backgroundColor: ['#10b981', '#6b7280', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: 'white' }
                        }
                    }
                }
            });
        }

        // Load sentiment data
        async function loadSentimentData() {
            try {
                const response = await fetch('/api/sentiment/overview');
                const data = await response.json();
                updateSentimentDisplay(data);
            } catch (error) {
                console.error('Error loading sentiment data:', error);
            }
        }

        // Update sentiment display
        function updateSentimentDisplay(data) {
            const positive = Math.round(data.positive * 100);
            const neutral = Math.round(data.neutral * 100);
            const negative = Math.round(data.negative * 100);

            document.getElementById('positiveBar').style.width = positive + '%';
            document.getElementById('neutralBar').style.width = neutral + '%';
            document.getElementById('negativeBar').style.width = negative + '%';

            document.getElementById('positivePercent').textContent = positive + '%';
            document.getElementById('neutralPercent').textContent = neutral + '%';
            document.getElementById('negativePercent').textContent = negative + '%';

            if (sentimentChart) {
                sentimentChart.data.datasets[0].data = [positive, neutral, negative];
                sentimentChart.update();
            }
        }

        // Load trending topics
        async function loadTrendingTopics() {
            try {
                const response = await fetch('/api/trending/topics');
                const topics = await response.json();
                renderTrendingTopics(topics);
            } catch (error) {
                console.error('Error loading trending topics:', error);
                document.getElementById('trendingTopics').innerHTML = 
                    '<div style="color: rgba(255,255,255,0.7);">Failed to load trending topics</div>';
            }
        }

        // Render trending topics
        function renderTrendingTopics(topics) {
            const container = document.getElementById('trendingTopics');
            
            if (!topics || topics.length === 0) {
                container.innerHTML = '<div style="color: rgba(255,255,255,0.7);">No trending topics found</div>';
                return;
            }

            container.innerHTML = topics.slice(0, 5).map(topic => \`
                <div class="trending-topic">
                    <div>
                        <strong>\${topic.topic}</strong>
                        <div style="font-size: 0.8rem; opacity: 0.8;">\${topic.mentions} mentions</div>
                    </div>
                    <div class="trend-score">\${topic.trend_score}</div>
                </div>
            \`).join('');
        }

        // Load AI insights
        async function loadAIInsights() {
            try {
                const response = await fetch('/api/dashboard/analytics');
                const data = await response.json();
                renderAIInsights(data.ai_insights || []);
            } catch (error) {
                console.error('Error loading AI insights:', error);
                document.getElementById('aiInsights').innerHTML = 
                    '<div style="color: rgba(255,255,255,0.7);">Failed to load AI insights</div>';
            }
        }

        // Render AI insights
        function renderAIInsights(insights) {
            const container = document.getElementById('aiInsights');
            
            if (!insights || insights.length === 0) {
                container.innerHTML = '<div style="color: rgba(255,255,255,0.7);">No insights available</div>';
                return;
            }

            container.innerHTML = insights.map(insight => \`
                <div class="ai-insight \${insight.level}">
                    <h4>\${insight.type.replace('_', ' ').toUpperCase()}</h4>
                    <p>\${insight.message}</p>
                    <small><strong>Recommendation:</strong> \${insight.recommendation}</small>
                </div>
            \`).join('');
        }

        // Analyze text function
        async function analyzeText() {
            const text = document.getElementById('textAnalyzerInput').value.trim();
            if (!text) {
                alert('Please enter some text to analyze');
                return;
            }

            const analyzeBtn = document.getElementById('analyzeBtn');
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<div class="spinner"></div> Analyzing...';

            try {
                const response = await fetch('/api/analyze/text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text })
                });

                const result = await response.json();
                displayAnalysisResults(result);
            } catch (error) {
                console.error('Error analyzing text:', error);
                alert('Failed to analyze text. Please try again.');
            } finally {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<span class="material-icons">psychology</span> Analyze Text';
            }
        }

        // Display analysis results
        function displayAnalysisResults(result) {
            const resultsContainer = document.getElementById('analysisResults');
            resultsContainer.style.display = 'block';

            // Sentiment
            const sentimentColor = result.sentiment.sentiment === 'POSITIVE' ? '#10b981' : 
                                 result.sentiment.sentiment === 'NEGATIVE' ? '#ef4444' : '#6b7280';
            document.getElementById('sentimentResult').innerHTML = \`
                <p><strong>Sentiment:</strong> 
                <span style="color: \${sentimentColor}; font-weight: bold;">
                    \${result.sentiment.sentiment}
                </span> 
                (Confidence: \${Math.round(result.sentiment.confidence * 100)}%)</p>
            \`;

            // Category
            document.getElementById('categoryResult').innerHTML = \`
                <p><strong>Predicted Category:</strong> \${result.predicted_category.replace('_', ' ')}</p>
            \`;

            // Key phrases
            document.getElementById('keyPhrasesResult').innerHTML = \`
                <p><strong>Key Phrases:</strong></p>
                <div>\${result.key_phrases.map(phrase => 
                    \`<span class="keyword-tag">\${phrase}</span>\`
                ).join('')}</div>
            \`;

            // Entities
            document.getElementById('entitiesResult').innerHTML = \`
                <p><strong>Entities:</strong></p>
                <div>\${result.entities.map(entity => 
                    \`<span class="entity-tag">\${entity.text} (\${entity.type})</span>\`
                ).join('')}</div>
            \`;
        }

        // Debounced text analysis
        function debounceAnalyzeText() {
            clearTimeout(analysisTimeout);
            analysisTimeout = setTimeout(() => {
                const text = document.getElementById('textAnalyzerInput').value.trim();
                if (text.length > 50) { // Auto-analyze for longer texts
                    analyzeText();
                }
            }, 2000);
        }

        // Clear analysis
        function clearAnalysis() {
            document.getElementById('textAnalyzerInput').value = '';
            document.getElementById('analysisResults').style.display = 'none';
        }

        // Generate AI response for selected inquiry
        async function generateResponse() {
            if (selectedInquiry === null) {
                alert('Please select an inquiry first');
                return;
            }

            const inquiry = inquiries[selectedInquiry];
            const responseEditor = document.getElementById('responseEditor');
            
            responseEditor.value = 'Generating AI response...';

            try {
                const response = await fetch(\`/api/inquiries/\${inquiry.inquiry_id}/generate-response\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();
                responseEditor.value = result.generated_response;
            } catch (error) {
                console.error('Error generating response:', error);
                responseEditor.value = 'Failed to generate response. Please try again.';
            }
        }

        // Refresh functions
        function refreshSentimentData() { loadSentimentData(); }
        function refreshTrendingTopics() { loadTrendingTopics(); }
        function refreshInsights() { loadAIInsights(); }

        // Export functions (placeholder)
        function exportSentimentReport() {
            alert('Sentiment report export feature coming soon!');
        }

        function viewTopicDetails() {
            alert('Topic details view coming soon!');
        }

        function generateReport() {
            alert('AI insights report generation coming soon!');
        }

        // Enhanced initialization
        document.addEventListener('DOMContentLoaded', function() {
            updateClock();
            setInterval(updateClock, 1000);
            loadInquiries();
            loadDashboardData();
            
            // Initialize AI features after a short delay
            setTimeout(initializeAI, 1000);
        });
    </script>
</body>
</html>
`;

exports.handler = async (event, context) => {
    console.log('Frontend Lambda invoked:', JSON.stringify(event, null, 2));
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        },
        body: html
    };
};


