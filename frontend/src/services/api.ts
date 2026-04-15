


import axios from 'axios';

const API_BASE_URL = 'http://localhost:54989/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface DashboardAnalytics {
  totalInquiries: number;
  highPriorityInquiries: number;
  avgResponseTime: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  riskAlerts: number;
  trendingTopics: string[];
  lastUpdated: string;
}

export interface Inquiry {
  id: string;
  source: string;
  channel: string;
  subject: string;
  body: string;
  category: string;
  priority: string;
  timestamp: string;
  sender_name: string;
  sender_organization: string;
  analysis?: {
    sentiment: {
      score: number;
      label: string;
      confidence: number;
    };
    risks: {
      hasRisk: boolean;
      riskLevel: string;
      riskFactors: string[];
      description?: string;
    };
    suggestedCategory: string;
    analyzedAt: string;
  };
}

export interface SocialMediaPost {
  id: string;
  platform: string;
  author_type: string;
  author_handle: string;
  text: string;
  sentiment: string;
  sentiment_score: number;
  topic: string;
  engagement_score: number;
  timestamp: string;
  hashtags?: string[];
}

export interface NewsArticle {
  id: string;
  source: string;
  headline: string;
  snippet: string;
  full_text: string;
  author: string;
  sentiment: string;
  sentiment_score: number;
  topics: string[];
  entities_mentioned: string[];
  risk_flag: boolean;
  risk_description?: string;
  published_date: string;
}

export interface ResponseTemplate {
  id: string;
  inquiry_category: string;
  inquiry_example: string;
  template_subject: string;
  template_body: string;
  tone: string;
  placeholders: string[];
  approval_status: string;
  last_updated: string;
  usage_count: number;
  category_tags: string[];
  target_audience: string;
}

export interface SentimentOverview {
  sentimentTrend: Array<{
    date: string;
    sentiment: number;
    volume: number;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
    avgSentiment: number;
    totalEngagement: number;
  }>;
  summary: {
    totalPosts: number;
    avgSentiment: number;
    riskAlerts: number;
  };
}

// API Functions
export const dashboardAPI = {
  getAnalytics: (): Promise<DashboardAnalytics> =>
    api.get('/dashboard/analytics').then(res => res.data),
};

export const inquiriesAPI = {
  getInquiries: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    priority?: string;
    source?: string;
  }): Promise<{
    inquiries: Inquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> => api.get('/inquiries', { params }).then(res => res.data),

  getInquiry: (id: string): Promise<Inquiry> =>
    api.get(`/inquiries/${id}`).then(res => res.data),

  createInquiry: (inquiry: Partial<Inquiry>): Promise<Inquiry> =>
    api.post('/inquiries', inquiry).then(res => res.data),
};

export const templatesAPI = {
  getTemplates: (category?: string): Promise<ResponseTemplate[]> =>
    api.get('/templates', { params: { category } }).then(res => res.data),

  generateResponse: (inquiryId: string, templateId: string): Promise<{
    subject: string;
    body: string;
    template_id: string;
    generated_at: string;
  }> => api.post('/responses/generate', { inquiryId, templateId }).then(res => res.data),
};

export const sentimentAPI = {
  getOverview: (timeframe?: string): Promise<SentimentOverview> =>
    api.get('/sentiment/overview', { params: { timeframe } }).then(res => res.data),
};

export const newsAPI = {
  getMonitoring: (params?: {
    page?: number;
    limit?: number;
    riskOnly?: boolean;
  }): Promise<{
    articles: NewsArticle[];
    total: number;
    page: number;
    totalPages: number;
  }> => api.get('/news/monitoring', { params }).then(res => res.data),
};

export default api;


