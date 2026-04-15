




import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Twitter,
  Reddit,
  Facebook,
  Refresh,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { sentimentAPI, SentimentOverview } from '../services/api';

const SENTIMENT_COLORS = {
  positive: '#4caf50',
  neutral: '#ff9800',
  negative: '#f44336',
};

const PLATFORM_ICONS = {
  twitter: <Twitter />,
  reddit: <Reddit />,
  facebook: <Facebook />,
  linkedin: <Facebook />, // Using Facebook icon as placeholder
};

const SentimentMonitoring: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      const data = await sentimentAPI.getOverview(timeframe);
      setSentimentData(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch sentiment data');
      console.error('Sentiment error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();
  }, [timeframe]);

  useEffect(() => {
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSentimentData, 60000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const handleTimeframeChange = (event: React.MouseEvent<HTMLElement>, newTimeframe: string | null) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <TrendingUp sx={{ color: 'success.main' }} />;
    if (sentiment < -0.1) return <TrendingDown sx={{ color: 'error.main' }} />;
    return <TrendingFlat sx={{ color: 'warning.main' }} />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'success';
    if (sentiment < -0.1) return 'error';
    return 'warning';
  };

  if (loading && !sentimentData) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading sentiment data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchSentimentData}>
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!sentimentData) return null;

  // Prepare chart data
  const sentimentTrendData = sentimentData.sentimentTrend.map(item => ({
    ...item,
    sentimentPercent: (item.sentiment * 100).toFixed(1),
  }));

  const topicSentimentData = sentimentData.topTopics.map(topic => ({
    name: topic.topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    sentiment: topic.avgSentiment,
    engagement: topic.totalEngagement,
    count: topic.count,
  }));

  // Mock social media posts for demonstration
  const recentPosts = [
    {
      id: '1',
      platform: 'twitter',
      author: '@EconAnalyst',
      text: 'Fed\'s latest policy decision shows commitment to fighting inflation while supporting employment. Smart move! 📈',
      sentiment: 0.7,
      timestamp: '2 hours ago',
      engagement: 245,
    },
    {
      id: '2',
      platform: 'reddit',
      author: 'u/MarketWatcher',
      text: 'The Fed\'s communication strategy has been much clearer lately. Appreciate the transparency in their decision-making process.',
      sentiment: 0.5,
      timestamp: '4 hours ago',
      engagement: 89,
    },
    {
      id: '3',
      platform: 'twitter',
      author: '@FinanceNews',
      text: 'Concerned about the Fed\'s approach to rate hikes. Seems too aggressive given current economic uncertainties.',
      sentiment: -0.4,
      timestamp: '6 hours ago',
      engagement: 156,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Sentiment Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={handleTimeframeChange}
            size="small"
          >
            <ToggleButton value="7d">7 Days</ToggleButton>
            <ToggleButton value="30d">30 Days</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchSentimentData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Posts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {sentimentData.summary.totalPosts.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Twitter />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Average Sentiment
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {(sentimentData.summary.avgSentiment * 100).toFixed(1)}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getSentimentIcon(sentimentData.summary.avgSentiment)}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {sentimentData.summary.avgSentiment > 0 ? 'Positive' : 
                       sentimentData.summary.avgSentiment < 0 ? 'Negative' : 'Neutral'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Risk Alerts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: sentimentData.summary.riskAlerts > 0 ? 'error.main' : 'text.primary' }}>
                    {sentimentData.summary.riskAlerts}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {sentimentData.summary.riskAlerts > 0 ? (
                      <Chip label="Attention Required" color="error" size="small" />
                    ) : (
                      <Chip label="All Clear" color="success" size="small" />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Trending Topics
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {sentimentData.topTopics.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Active discussions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sentiment Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Sentiment Trend Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'sentiment' ? `${value}%` : value,
                        name === 'sentiment' ? 'Sentiment' : 'Volume'
                      ]}
                    />
                    <Bar yAxisId="right" dataKey="volume" fill="#e3f2fd" name="Volume" />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="sentimentPercent" 
                      stroke="#1976d2" 
                      strokeWidth={3}
                      name="sentiment"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Topic Sentiment */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Topic Sentiment
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicSentimentData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-1, 1]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <RechartsTooltip 
                      formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Sentiment']}
                    />
                    <Bar 
                      dataKey="sentiment" 
                      fill={(entry) => entry.sentiment > 0 ? SENTIMENT_COLORS.positive : 
                                     entry.sentiment < 0 ? SENTIMENT_COLORS.negative : 
                                     SENTIMENT_COLORS.neutral}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Posts and Top Topics */}
      <Grid container spacing={3}>
        {/* Recent Posts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Social Media Posts
              </Typography>
              <List>
                {recentPosts.map((post) => (
                  <ListItem key={post.id} divider>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {post.author}
                          </Typography>
                          <Chip
                            size="small"
                            label={post.sentiment > 0 ? 'Positive' : post.sentiment < 0 ? 'Negative' : 'Neutral'}
                            color={getSentimentColor(post.sentiment) as any}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {post.timestamp}
                          </Typography>
                        </Box>
                        <Typography variant="body2" paragraph>
                          {post.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {post.engagement} engagements
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Topics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Discussion Topics
              </Typography>
              <List>
                {sentimentData.topTopics.slice(0, 5).map((topic, index) => (
                  <ListItem key={topic.topic} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {topic.topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <Chip 
                            label={`#${index + 1}`} 
                            size="small" 
                            color={index === 0 ? 'primary' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption">
                              {topic.count} posts
                            </Typography>
                            <Chip
                              size="small"
                              label={`${(topic.avgSentiment * 100).toFixed(0)}%`}
                              color={getSentimentColor(topic.avgSentiment) as any}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((topic.totalEngagement / 10000) * 100, 100)}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SentimentMonitoring;




