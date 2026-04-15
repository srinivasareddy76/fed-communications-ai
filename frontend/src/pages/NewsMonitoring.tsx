




import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Pagination,
} from '@mui/material';
import {
  Warning,
  Article,
  TrendingUp,
  TrendingDown,
  Visibility,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { newsAPI, NewsArticle } from '../services/api';

const NewsMonitoring: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [riskOnly, setRiskOnly] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await newsAPI.getMonitoring({
        page,
        limit: 10,
        riskOnly,
      });
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch news articles');
      console.error('News error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, riskOnly]);

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchArticles, 300000);
    return () => clearInterval(interval);
  }, [page, riskOnly]);

  const handleViewDetails = (article: NewsArticle) => {
    setSelectedArticle(article);
    setDetailsOpen(true);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  const getRiskColor = (riskFlag: boolean) => {
    return riskFlag ? 'error' : 'success';
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'bloomberg': 'primary',
      'reuters': 'secondary',
      'wsj': 'info',
      'ft': 'warning',
      'cnbc': 'success',
    };
    return colors[source.toLowerCase()] || 'default';
  };

  // Mock trending entities for demonstration
  const trendingEntities = [
    { name: 'Federal Reserve', mentions: 245, trend: 'up' },
    { name: 'Jerome Powell', mentions: 189, trend: 'up' },
    { name: 'FOMC', mentions: 156, trend: 'down' },
    { name: 'Interest Rates', mentions: 134, trend: 'up' },
    { name: 'Inflation', mentions: 98, trend: 'down' },
  ];

  // Mock risk alerts
  const riskAlerts = [
    {
      id: '1',
      title: 'Market Volatility Spike',
      description: 'Unusual trading patterns detected following Fed announcement',
      severity: 'high',
      timestamp: '15 minutes ago',
    },
    {
      id: '2',
      title: 'Negative Sentiment Surge',
      description: 'Sharp increase in negative sentiment around monetary policy',
      severity: 'medium',
      timestamp: '1 hour ago',
    },
    {
      id: '3',
      title: 'Media Coverage Spike',
      description: 'Significant increase in Fed-related news coverage',
      severity: 'low',
      timestamp: '2 hours ago',
    },
  ];

  if (loading && articles.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading news articles...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            News Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={riskOnly}
                onChange={(e) => setRiskOnly(e.target.checked)}
                color="error"
              />
            }
            label="Risk Articles Only"
          />
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchArticles} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Articles
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {articles.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Article />
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
                    Risk Articles
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {articles.filter(a => a.risk_flag).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Warning />
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
                    Avg Sentiment
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {articles.length > 0 ? 
                      (articles.reduce((sum, a) => sum + a.sentiment_score, 0) / articles.length * 100).toFixed(0) + '%'
                      : '0%'
                    }
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
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
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {riskAlerts.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Articles List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Articles
              </Typography>
              <List>
                {articles.map((article) => (
                  <ListItem key={article.id} divider>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, mr: 2 }}>
                          {article.headline}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          {article.risk_flag && (
                            <Chip
                              icon={<Warning />}
                              label="Risk"
                              color="error"
                              size="small"
                            />
                          )}
                          <Chip
                            label={article.sentiment}
                            color={getSentimentColor(article.sentiment) as any}
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {article.snippet}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={article.source}
                            color={getSourceColor(article.source) as any}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            by {article.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {new Date(article.published_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(article)}
                        >
                          View Details
                        </Button>
                      </Box>
                      
                      {article.risk_description && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Risk Alert:</strong> {article.risk_description}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
              
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Risk Alerts */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Risk Alerts
              </Typography>
              <List>
                {riskAlerts.map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Warning 
                            sx={{ 
                              color: alert.severity === 'high' ? 'error.main' : 
                                     alert.severity === 'medium' ? 'warning.main' : 'info.main',
                              fontSize: 16 
                            }} 
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {alert.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {alert.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Trending Entities */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Trending Entities
              </Typography>
              <List>
                {trendingEntities.map((entity) => (
                  <ListItem key={entity.name} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {entity.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {entity.trend === 'up' ? (
                              <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                            ) : (
                              <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
                            )}
                            <Typography variant="caption">
                              {entity.mentions}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((entity.mentions / 250) * 100, 100)}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          color={entity.trend === 'up' ? 'success' : 'error'}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Article Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, mr: 2 }}>
              {selectedArticle?.headline}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedArticle?.risk_flag && (
                <Chip
                  icon={<Warning />}
                  label="Risk Alert"
                  color="error"
                  size="small"
                />
              )}
              <Chip
                label={selectedArticle?.sentiment}
                color={getSentimentColor(selectedArticle?.sentiment || '') as any}
                size="small"
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedArticle && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                    {selectedArticle.full_text}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>Article Metadata</Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Source</Typography>
                      <Chip
                        label={selectedArticle.source}
                        color={getSourceColor(selectedArticle.source) as any}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Author</Typography>
                      <Typography variant="body2">{selectedArticle.author}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Published</Typography>
                      <Typography variant="body2">
                        {new Date(selectedArticle.published_date).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Sentiment Score</Typography>
                      <Typography variant="body2">
                        {(selectedArticle.sentiment_score * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Topics</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {selectedArticle.topics.map((topic) => (
                          <Chip
                            key={topic}
                            label={topic.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Entities Mentioned</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {selectedArticle.entities_mentioned.slice(0, 6).map((entity) => (
                          <Chip
                            key={entity}
                            label={entity}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                  
                  {selectedArticle.risk_description && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Risk Assessment:</strong> {selectedArticle.risk_description}
                      </Typography>
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">
            Generate Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsMonitoring;




