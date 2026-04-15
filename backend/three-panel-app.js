// Three-panel UX design HTML template
const threePanelApp = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fed Communications AI - Communication Management</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
        
        .app-container {
            display: grid;
            grid-template-areas: 
                "header header"
                "left right"
                "bottom bottom";
            grid-template-rows: 70px 1fr 350px;
            grid-template-columns: 1fr 1fr;
            height: 100vh;
            gap: 8px;
            background: transparent;
            padding: 8px;
            animation: fadeIn 0.8s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            grid-area: header;
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .header h1 {
            font-size: 1.6rem;
            font-weight: 600;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.9rem;
        }

        .live-clock {
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            color: #e2e8f0;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .status-dot {
            width: 10px;
            height: 10px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        
        .live-clock {
            font-family: 'Courier New', monospace;
            font-size: 0.95rem;
            font-weight: 500;
            opacity: 0.9;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .left-panel {
            grid-area: left;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 16px;
            padding: 1.5rem;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .right-panel {
            grid-area: right;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 16px;
            padding: 1.5rem;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .bottom-panel {
            grid-area: bottom;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 16px;
            padding: 1.5rem;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .left-panel:hover, .right-panel:hover, .bottom-panel:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .panel-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .panel-title .material-icons {
            color: #3b82f6;
        }
        
        .inquiry-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 1px solid rgba(226, 232, 240, 0.5);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }
        
        .inquiry-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .inquiry-card:hover {
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            border-color: #3b82f6;
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }

        .inquiry-card:hover::before {
            opacity: 1;
        }
        
        .inquiry-card.selected {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.2);
        }

        .inquiry-card.selected::before {
            opacity: 1;
        }
        
        .inquiry-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .inquiry-subject {
            font-weight: 500;
            color: #1f2937;
        }
        
        .inquiry-time {
            font-size: 0.8rem;
            color: #6b7280;
        }
        
        .inquiry-content {
            color: #4b5563;
            font-size: 0.9rem;
            line-height: 1.4;
            margin-bottom: 0.75rem;
        }
        
        .inquiry-tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .tag {
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .tag.category {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .tag.sentiment {
            background: #d1fae5;
            color: #065f46;
        }
        
        .tag.sentiment.negative {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .tag.sentiment.neutral {
            background: #f3f4f6;
            color: #374151;
        }
        
        .tag.risk {
            background: #fef3c7;
            color: #92400e;
        }
        
        .tag.risk.high {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .response-editor {
            width: 100%;
            min-height: 400px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 1rem;
            font-family: inherit;
            font-size: 0.9rem;
            line-height: 1.5;
            resize: vertical;
        }
        
        .response-editor:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .response-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
        }
        
        .btn-primary {
            background: #3b82f6;
            color: white;
        }
        
        .btn-primary:hover {
            background: #2563eb;
        }
        
        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }
        
        .btn-secondary:hover {
            background: #e5e7eb;
        }
        
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            height: 100%;
        }
        
        .insight-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 1px solid rgba(226, 232, 240, 0.5);
            border-radius: 12px;
            padding: 1.2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .insight-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .insight-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.1);
        }

        .insight-card:hover::before {
            opacity: 1;
        }
        
        .insight-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Federal Reserve Rates Styling */
        .fed-rates, .economic-indicators, .market-indicators {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .rate-item, .indicator-item, .market-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
        }

        .rate-label, .indicator-label, .market-label {
            font-size: 0.85rem;
            color: #4b5563;
            font-weight: 500;
        }

        .rate-value, .indicator-value, .market-value {
            font-size: 0.9rem;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }

        .indicator-value.positive, .market-value.positive {
            color: #059669;
        }

        .indicator-value.neutral, .market-value.neutral {
            color: #d97706;
        }

        .indicator-value.negative, .market-value.negative {
            color: #dc2626;
        }

        .rate-trend, .sentiment-trend {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 0.75rem;
            padding: 0.5rem;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 6px;
        }

        /* Topic Tags */
        .topic-tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            margin: 0.25rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .topic-tag.hot {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            animation: pulse 2s infinite;
        }

        .topic-tag.warm {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }

        .topic-tag.normal {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            color: white;
        }

        /* Alert Items */
        .alert-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            font-size: 0.85rem;
        }

        .alert-item.high {
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid #ef4444;
        }

        .alert-item.medium {
            background: rgba(245, 158, 11, 0.1);
            border-left: 3px solid #f59e0b;
        }

        .alert-item.low {
            background: rgba(34, 197, 94, 0.1);
            border-left: 3px solid #22c55e;
        }

        .alert-icon {
            font-size: 1rem;
        }
        
        .sentiment-chart {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 0.75rem;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .sentiment-bar {
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease;
            position: relative;
        }

        .sentiment-bar:hover {
            transform: scale(1.05);
            z-index: 1;
        }
        
        .sentiment-positive { background: linear-gradient(135deg, #10b981, #059669); }
        .sentiment-neutral { background: linear-gradient(135deg, #6b7280, #4b5563); }
        .sentiment-negative { background: linear-gradient(135deg, #ef4444, #dc2626); }
        
        .topics-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .topic-tag {
            padding: 0.25rem 0.5rem;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .alert-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            margin-bottom: 0.5rem;
        }
        
        .alert-icon {
            color: #dc2626;
            font-size: 1rem;
        }
        
        .alert-text {
            font-size: 0.8rem;
            color: #991b1b;
        }
        
        @media (max-width: 1024px) {
            .app-container {
                grid-template-areas: 
                    "header"
                    "left"
                    "right"
                    "bottom";
                grid-template-columns: 1fr;
                grid-template-rows: 60px 1fr 1fr 300px;
            }
            
            .insights-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <h1>🏛️ Fed Communications AI</h1>
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span>System Operational</span>
                <div class="live-clock" id="liveClock"></div>
            </div>
        </div>
        
        <div class="left-panel">
            <div class="panel-title">
                <span class="material-icons">inbox</span>
                Inquiry Viewer
            </div>
            <div id="inquiries-list">
                <!-- Inquiries will be loaded here -->
            </div>
        </div>
        
        <div class="right-panel">
            <div class="panel-title">
                <span class="material-icons">edit</span>
                AI Draft Response
            </div>
            <textarea class="response-editor" id="response-editor" placeholder="Select an inquiry to generate AI response..."></textarea>
            <div class="response-actions">
                <button class="btn btn-primary" onclick="generateResponse()">Generate AI Response</button>
                <button class="btn btn-secondary" onclick="saveResponse()">Save Draft</button>
                <button class="btn btn-secondary" onclick="sendResponse()">Send Response</button>
            </div>
        </div>
        
        <div class="bottom-panel">
            <div class="panel-title">
                <span class="material-icons">insights</span>
                Insights Dashboard
            </div>
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-title">📊 Federal Reserve Key Rates</div>
                    <div class="fed-rates">
                        <div class="rate-item">
                            <span class="rate-label">Federal Funds Rate</span>
                            <span class="rate-value" id="fedFundsRate">5.25-5.50%</span>
                        </div>
                        <div class="rate-item">
                            <span class="rate-label">Discount Rate</span>
                            <span class="rate-value" id="discountRate">5.50%</span>
                        </div>
                        <div class="rate-item">
                            <span class="rate-label">10-Year Treasury</span>
                            <span class="rate-value" id="treasuryRate">4.28%</span>
                        </div>
                    </div>
                    <div class="rate-trend">📈 Rates held steady at last FOMC meeting</div>
                </div>

                <div class="insight-card">
                    <div class="insight-title">💼 Economic Indicators</div>
                    <div class="economic-indicators">
                        <div class="indicator-item">
                            <span class="indicator-label">Unemployment Rate</span>
                            <span class="indicator-value positive">3.7%</span>
                        </div>
                        <div class="indicator-item">
                            <span class="indicator-label">Core PCE Inflation</span>
                            <span class="indicator-value neutral">3.2%</span>
                        </div>
                        <div class="indicator-item">
                            <span class="indicator-label">GDP Growth (Q3)</span>
                            <span class="indicator-value positive">4.9%</span>
                        </div>
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-title">🎯 Communication Sentiment</div>
                    <div class="sentiment-chart">
                        <div class="sentiment-bar sentiment-positive" style="flex: 3;">
                            <span>Positive 65%</span>
                        </div>
                        <div class="sentiment-bar sentiment-neutral" style="flex: 2;">
                            <span>Neutral 25%</span>
                        </div>
                        <div class="sentiment-bar sentiment-negative" style="flex: 1;">
                            <span>Negative 10%</span>
                        </div>
                    </div>
                    <div class="sentiment-trend">📈 Positive sentiment up 8% this week</div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-title">🔥 Trending Topics</div>
                    <div class="topics-cloud" id="topics-cloud">
                        <span class="topic-tag hot">Interest Rates</span>
                        <span class="topic-tag warm">Inflation</span>
                        <span class="topic-tag normal">Employment</span>
                        <span class="topic-tag warm">Banking Policy</span>
                        <span class="topic-tag normal">Economic Outlook</span>
                        <span class="topic-tag hot">FOMC Decisions</span>
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-title">⚠️ Priority Alerts</div>
                    <div id="risk-alerts">
                        <div class="alert-item high">
                            <span class="alert-icon">🔴</span>
                            <span>High-profile media inquiry on rate policy</span>
                        </div>
                        <div class="alert-item medium">
                            <span class="alert-icon">🟡</span>
                            <span>Congressional request for inflation data</span>
                        </div>
                        <div class="alert-item low">
                            <span class="alert-icon">🟢</span>
                            <span>Routine public information requests</span>
                        </div>
                    </div>
                </div>

                <div class="insight-card">
                    <div class="insight-title">📈 Market Impact</div>
                    <div class="market-indicators">
                        <div class="market-item">
                            <span class="market-label">S&P 500</span>
                            <span class="market-value positive">+0.8%</span>
                        </div>
                        <div class="market-item">
                            <span class="market-label">USD Index</span>
                            <span class="market-value neutral">103.2</span>
                        </div>
                        <div class="market-item">
                            <span class="market-label">VIX</span>
                            <span class="market-value positive">16.4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let selectedInquiry = null;
        let inquiries = [];

        // Live Clock
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: 'America/Los_Angeles',
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const clockElement = document.getElementById('liveClock');
            if (clockElement) {
                clockElement.textContent = 'SF Time: ' + timeString;
            }
        }

        // Update clock every second
        setInterval(updateClock, 1000);
        updateClock(); // Initial call
        
        // Load inquiries
        async function loadInquiries() {
            try {
                console.log('Loading inquiries...');
                const response = await fetch('/api/inquiries');
                const data = await response.json();
                console.log('API Response:', data);
                inquiries = data.inquiries || data; // Handle both formats
                console.log('Inquiries loaded:', inquiries.length);
                
                // If no inquiries from API, use sample Federal Reserve inquiries
                if (!inquiries || inquiries.length === 0) {
                    inquiries = getSampleInquiries();
                }
                
                renderInquiries();
            } catch (error) {
                console.error('Error loading inquiries:', error);
                // Show sample Federal Reserve data if API fails
                inquiries = getSampleInquiries();
                renderInquiries();
            }
        }

        // Sample Federal Reserve inquiries
        function getSampleInquiries() {
            return [
                {
                    id: 1,
                    subject: 'Request for Current Interest Rate Policy Statement',
                    sender: 'financial.reporter@wsj.com',
                    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    content: 'Dear Federal Reserve Communications Team, I am writing to request the most recent policy statement regarding the current federal funds rate. Could you please provide information about the rationale behind the current 5.25-5.50% rate range and any anticipated changes in the upcoming FOMC meetings?',
                    priority: 'high',
                    category: 'Media Inquiry'
                },
                {
                    id: 2,
                    subject: 'Congressional Request: Inflation Data and Projections',
                    sender: 'staff@banking.house.gov',
                    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    content: 'The House Committee on Financial Services requests detailed information on current inflation metrics, including Core PCE data, and the Fed\'s projections for the next 12 months. This information is needed for upcoming hearings on monetary policy effectiveness.',
                    priority: 'high',
                    category: 'Congressional'
                },
                {
                    id: 3,
                    subject: 'Academic Research: Employment Data Access',
                    sender: 'research@economics.stanford.edu',
                    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    content: 'Hello, I am conducting research on the relationship between Federal Reserve policy and employment outcomes. Could you provide access to historical employment data used in FOMC decision-making processes? This is for academic publication purposes.',
                    priority: 'medium',
                    category: 'Academic'
                },
                {
                    id: 4,
                    subject: 'Public Information Request: Banking Supervision Guidelines',
                    sender: 'citizen.inquiry@gmail.com',
                    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                    content: 'As a concerned citizen, I would like to understand the Federal Reserve\'s current banking supervision guidelines, particularly regarding stress testing requirements for regional banks. Could you provide publicly available documentation on this topic?',
                    priority: 'low',
                    category: 'Public Inquiry'
                },
                {
                    id: 5,
                    subject: 'Market Analysis Request: Fed Communication Impact',
                    sender: 'analyst@goldmansachs.com',
                    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    content: 'We are analyzing the market impact of Federal Reserve communications. Could you provide information about the timing and methodology of public communications, particularly regarding forward guidance on monetary policy?',
                    priority: 'medium',
                    category: 'Financial Institution'
                }
            ];
        }
        
        // Render inquiries list
        function renderInquiries() {
            console.log('Rendering inquiries:', inquiries.length);
            const container = document.getElementById('inquiries-list');
            
            if (!inquiries || inquiries.length === 0) {
                container.innerHTML = '<div style="padding: 1rem; color: #6b7280;">No inquiries found.</div>';
                return;
            }
            
            container.innerHTML = inquiries.map((inquiry, index) => \`
                <div class="inquiry-card \${selectedInquiry === index ? 'selected' : ''}" onclick="selectInquiry(\${index})">
                    <div class="inquiry-meta">
                        <div class="inquiry-subject">\${inquiry.subject || 'No Subject'}</div>
                        <div class="inquiry-time">\${new Date(inquiry.timestamp).toLocaleTimeString()}</div>
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
            document.getElementById('response-editor').placeholder = \`Responding to: "\${inquiry.subject}"\\n\\nClick "Generate AI Response" to create a draft response.\`;
        }
        
        // Generate AI response
        async function generateResponse() {
            if (selectedInquiry === null) {
                alert('Please select an inquiry first');
                return;
            }
            
            const inquiry = inquiries[selectedInquiry];
            const editor = document.getElementById('response-editor');
            
            editor.value = 'Generating AI response...';
            
            try {
                const response = await fetch('/api/responses/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inquiryId: inquiry.id })
                });
                
                const data = await response.json();
                editor.value = data.response;
            } catch (error) {
                editor.value = \`Dear \${inquiry.sender || 'Valued Correspondent'},

Thank you for your inquiry regarding \${inquiry.category.toLowerCase()}. We appreciate your interest in the Federal Reserve Bank of San Francisco's policies and operations.

\${inquiry.category === 'Monetary Policy' ? 
    'We understand your concerns about monetary policy decisions. The Federal Reserve carefully considers economic data and conditions when making policy decisions to promote maximum employment and price stability.' :
    'We have received your inquiry and our team is reviewing the matter carefully.'
}

\${inquiry.riskLevel === 'High' ? 
    'Given the nature of your inquiry, we want to ensure we provide you with the most accurate and comprehensive information. Our senior staff will review this matter and provide a detailed response.' :
    'We strive to provide timely and accurate responses to all inquiries.'
}

If you have any additional questions or need further clarification, please don't hesitate to contact us.

Best regards,
External Communications Department
Federal Reserve Bank of San Francisco\`;
            }
        }
        
        // Save response
        function saveResponse() {
            const response = document.getElementById('response-editor').value;
            if (response.trim()) {
                alert('Response draft saved successfully');
            } else {
                alert('Please enter a response first');
            }
        }
        
        // Send response
        function sendResponse() {
            const response = document.getElementById('response-editor').value;
            if (response.trim()) {
                alert('Response sent successfully');
                document.getElementById('response-editor').value = '';
                selectedInquiry = null;
                renderInquiries();
            } else {
                alert('Please enter a response first');
            }
        }
        
        // Load trending topics
        async function loadTopics() {
            try {
                const response = await fetch('/api/sentiment/overview');
                const data = await response.json();
                
                const topicsContainer = document.getElementById('topics-cloud');
                const topics = ['Interest Rates', 'Inflation', 'Employment', 'Banking Regulation', 'Economic Outlook', 'Monetary Policy'];
                
                topicsContainer.innerHTML = topics.map(topic => 
                    \`<span class="topic-tag">\${topic}</span>\`
                ).join('');
            } catch (error) {
                console.error('Error loading topics:', error);
            }
        }
        
        // Load risk alerts
        async function loadRiskAlerts() {
            const alertsContainer = document.getElementById('risk-alerts');
            const alerts = [
                'High volume of negative sentiment detected',
                'Trending topic: Banking concerns',
                'Unusual inquiry pattern identified'
            ];
            
            alertsContainer.innerHTML = alerts.map(alert => \`
                <div class="alert-item">
                    <span class="material-icons alert-icon">warning</span>
                    <span class="alert-text">\${alert}</span>
                </div>
            \`).join('');
        }
        
        // Initialize app
        loadInquiries();
        loadTopics();
        loadRiskAlerts();
        
        // Refresh data every 30 seconds
        setInterval(() => {
            loadInquiries();
            loadTopics();
            loadRiskAlerts();
        }, 30000);
    </script>
</body>
</html>
`;

module.exports = threePanelApp;
