




import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Pagination,
  Tooltip,
  Alert,
  LinearProgress,
  Grid,
  Paper,
} from '@mui/material';
import {
  Visibility,
  Reply,
  Add,
  FilterList,
  Search,
} from '@mui/icons-material';
import { inquiriesAPI, templatesAPI, Inquiry, ResponseTemplate } from '../services/api';

const InquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedResponse, setGeneratedResponse] = useState<any>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    source: '',
    search: '',
  });

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(filters.category && { category: filters.category }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.source && { source: filters.source }),
      };
      
      const data = await inquiriesAPI.getInquiries(params);
      setInquiries(data.inquiries);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inquiries');
      console.error('Inquiries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (category?: string) => {
    try {
      const data = await templatesAPI.getTemplates(category);
      setTemplates(data);
    } catch (err) {
      console.error('Templates error:', err);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, filters]);

  const handleViewDetails = async (inquiry: Inquiry) => {
    try {
      const detailedInquiry = await inquiriesAPI.getInquiry(inquiry.id);
      setSelectedInquiry(detailedInquiry);
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
    }
  };

  const handleGenerateResponse = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseOpen(true);
    await fetchTemplates(inquiry.category);
  };

  const handleTemplateSelect = async () => {
    if (!selectedInquiry || !selectedTemplate) return;
    
    try {
      const response = await templatesAPI.generateResponse(selectedInquiry.id, selectedTemplate);
      setGeneratedResponse(response);
    } catch (err) {
      console.error('Error generating response:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'media': return 'primary';
      case 'stakeholder': return 'secondary';
      case 'public': return 'info';
      default: return 'default';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  if (loading && inquiries.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading inquiries...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Communication Inquiries
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* Handle new inquiry */}}
        >
          New Inquiry
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="federal_funds_rate">Federal Funds Rate</MenuItem>
                <MenuItem value="inflation">Inflation</MenuItem>
                <MenuItem value="banking_regulation">Banking Regulation</MenuItem>
                <MenuItem value="quantitative_easing">Quantitative Easing</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                select
                label="Priority"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                select
                label="Source"
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              >
                <MenuItem value="">All Sources</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="stakeholder">Stakeholder</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({ category: '', priority: '', source: '', search: '' })}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Inquiries Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Sender</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {inquiry.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                      {inquiry.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inquiry.source}
                      color={getSourceColor(inquiry.source) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {inquiry.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inquiry.priority}
                      color={getPriorityColor(inquiry.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {inquiry.sender_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inquiry.sender_organization}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(inquiry.timestamp).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(inquiry)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate Response">
                        <IconButton size="small" onClick={() => handleGenerateResponse(inquiry)}>
                          <Reply />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Inquiry Details</DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Subject</Typography>
                  <Typography variant="body2" paragraph>{selectedInquiry.subject}</Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Sender Information</Typography>
                  <Typography variant="body2">{selectedInquiry.sender_name}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedInquiry.sender_organization}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Message Body</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedInquiry.body}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {selectedInquiry.analysis && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>AI Analysis</Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>Sentiment Analysis</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={selectedInquiry.analysis.sentiment.label}
                            color={getSentimentColor(selectedInquiry.analysis.sentiment.label) as any}
                            size="small"
                          />
                          <Typography variant="body2">
                            Score: {selectedInquiry.analysis.sentiment.score.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>Risk Assessment</Typography>
                        <Chip
                          label={selectedInquiry.analysis.risks.riskLevel}
                          color={selectedInquiry.analysis.risks.hasRisk ? 'error' : 'success'}
                          size="small"
                        />
                        {selectedInquiry.analysis.risks.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {selectedInquiry.analysis.risks.description}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" gutterBottom>Suggested Category</Typography>
                        <Chip
                          label={selectedInquiry.analysis.suggestedCategory.replace(/_/g, ' ')}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setDetailsOpen(false);
            if (selectedInquiry) handleGenerateResponse(selectedInquiry);
          }}>
            Generate Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Generation Dialog */}
      <Dialog open={responseOpen} onClose={() => setResponseOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Generate Response</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Select Template</Typography>
                <TextField
                  fullWidth
                  select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.inquiry_category.replace(/_/g, ' ')} - {template.tone}
                    </MenuItem>
                  ))}
                </TextField>
                
                <Button
                  variant="contained"
                  onClick={handleTemplateSelect}
                  disabled={!selectedTemplate}
                  fullWidth
                >
                  Generate Response
                </Button>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {generatedResponse && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Generated Response</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                        Subject: {generatedResponse.subject}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {generatedResponse.body}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResponseOpen(false);
            setGeneratedResponse(null);
            setSelectedTemplate('');
          }}>
            Close
          </Button>
          {generatedResponse && (
            <Button variant="contained">
              Send Response
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InquiriesPage;




