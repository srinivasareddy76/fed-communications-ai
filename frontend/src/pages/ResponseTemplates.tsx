




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
  TextField,
  MenuItem,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  ExpandMore,
  ContentCopy,
  CheckCircle,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { templatesAPI, ResponseTemplate } from '../services/api';

const ResponseTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Form state for editing/creating templates
  const [formData, setFormData] = useState({
    inquiry_category: '',
    template_subject: '',
    template_body: '',
    tone: '',
    target_audience: '',
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesAPI.getTemplates(categoryFilter || undefined);
      setTemplates(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch response templates');
      console.error('Templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter]);

  const handleViewDetails = (template: ResponseTemplate) => {
    setSelectedTemplate(template);
    setDetailsOpen(true);
  };

  const handleEdit = (template: ResponseTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      inquiry_category: template.inquiry_category,
      template_subject: template.template_subject,
      template_body: template.template_body,
      tone: template.tone,
      target_audience: template.target_audience,
    });
    setEditOpen(true);
  };

  const handleCopyTemplate = (template: ResponseTemplate) => {
    navigator.clipboard.writeText(template.template_body);
    // You could add a snackbar notification here
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'formal': return 'primary';
      case 'informational': return 'info';
      case 'empathetic': return 'secondary';
      case 'technical': return 'warning';
      default: return 'default';
    }
  };

  const categories = [
    'monetary_policy',
    'federal_funds_rate',
    'inflation',
    'banking_regulation',
    'quantitative_easing',
    'employment',
    'financial_stability',
  ];

  const tones = ['formal', 'informational', 'empathetic', 'technical'];
  const audiences = ['media', 'public', 'stakeholder', 'academic'];

  // Mock template statistics
  const templateStats = {
    total: templates.length,
    approved: templates.filter(t => t.approval_status === 'approved').length,
    pending: templates.filter(t => t.approval_status === 'pending').length,
    mostUsed: templates.reduce((prev, current) => 
      (prev.usage_count > current.usage_count) ? prev : current, templates[0] || { usage_count: 0 }
    ),
  };

  if (loading && templates.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading response templates...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Response Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTemplates}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedTemplate(null);
              setFormData({
                inquiry_category: '',
                template_subject: '',
                template_body: '',
                tone: '',
                target_audience: '',
              });
              setEditOpen(true);
            }}
          >
            New Template
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Templates
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {templateStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Approved
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {templateStats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pending Review
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {templateStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Most Used
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {templateStats.mostUsed?.usage_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                times used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Template Library
              </Typography>
              
              {templates.map((template) => (
                <Accordion key={template.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {template.inquiry_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={template.tone}
                            color={getToneColor(template.tone) as any}
                            size="small"
                          />
                          <Chip
                            label={template.approval_status}
                            color={getApprovalColor(template.approval_status) as any}
                            size="small"
                            icon={template.approval_status === 'approved' ? <CheckCircle /> : <Schedule />}
                          />
                          <Chip
                            label={`${template.usage_count} uses`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" gutterBottom>Template Subject</Typography>
                        <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {template.template_subject}
                          </Typography>
                        </Paper>
                        
                        <Typography variant="subtitle2" gutterBottom>Template Body</Typography>
                        <Paper sx={{ p: 2, backgroundColor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {template.template_body.substring(0, 500)}
                            {template.template_body.length > 500 && '...'}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>Template Details</Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Target Audience"
                              secondary={template.target_audience}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Last Updated"
                              secondary={new Date(template.last_updated).toLocaleDateString()}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Placeholders"
                              secondary={template.placeholders.length}
                            />
                          </ListItem>
                        </List>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Tooltip title="View Full Template">
                            <IconButton size="small" onClick={() => handleViewDetails(template)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Template">
                            <IconButton size="small" onClick={() => handleEdit(template)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy Template">
                            <IconButton size="small" onClick={() => handleCopyTemplate(template)}>
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <List>
                <ListItem>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      setSelectedTemplate(null);
                      setFormData({
                        inquiry_category: '',
                        template_subject: '',
                        template_body: '',
                        tone: '',
                        target_audience: '',
                      });
                      setEditOpen(true);
                    }}
                  >
                    Create New Template
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ContentCopy />}
                  >
                    Import Templates
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CheckCircle />}
                  >
                    Bulk Approve
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Template Categories */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Categories
              </Typography>
              <List>
                {categories.map((category) => {
                  const count = templates.filter(t => t.inquiry_category === category).length;
                  return (
                    <ListItem key={category} divider>
                      <ListItemText
                        primary={category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        secondary={`${count} templates`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Template Details</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" gutterBottom>Subject Template</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 3 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedTemplate.template_subject}
                    </Typography>
                  </Paper>
                  
                  <Typography variant="subtitle2" gutterBottom>Body Template</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 3 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedTemplate.template_body}
                    </Typography>
                  </Paper>
                  
                  <Typography variant="subtitle2" gutterBottom>Example Usage</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="body2">
                      {selectedTemplate.inquiry_example}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>Template Metadata</Typography>
                  <List>
                    <ListItem divider>
                      <ListItemText
                        primary="Category"
                        secondary={selectedTemplate.inquiry_category.replace(/_/g, ' ')}
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText
                        primary="Tone"
                        secondary={selectedTemplate.tone}
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText
                        primary="Target Audience"
                        secondary={selectedTemplate.target_audience}
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText
                        primary="Approval Status"
                        secondary={
                          <Chip
                            label={selectedTemplate.approval_status}
                            color={getApprovalColor(selectedTemplate.approval_status) as any}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText
                        primary="Usage Count"
                        secondary={`${selectedTemplate.usage_count} times`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Last Updated"
                        secondary={new Date(selectedTemplate.last_updated).toLocaleString()}
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Available Placeholders</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedTemplate.placeholders.map((placeholder) => (
                      <Chip
                        key={placeholder}
                        label={placeholder}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setDetailsOpen(false);
            if (selectedTemplate) handleEdit(selectedTemplate);
          }}>
            Edit Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Template Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.inquiry_category}
                  onChange={(e) => setFormData({ ...formData, inquiry_category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Tone"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                >
                  {tones.map((tone) => (
                    <MenuItem key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Target Audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                >
                  {audiences.map((audience) => (
                    <MenuItem key={audience} value={audience}>
                      {audience.charAt(0).toUpperCase() + audience.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Template"
                  value={formData.template_subject}
                  onChange={(e) => setFormData({ ...formData, template_subject: e.target.value })}
                  placeholder="Re: Your Inquiry Regarding {{topic}} – Reference {{reference_number}}"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  label="Body Template"
                  value={formData.template_body}
                  onChange={(e) => setFormData({ ...formData, template_body: e.target.value })}
                  placeholder="Dear {{sender_name}},&#10;&#10;Thank you for contacting the Federal Reserve..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResponseTemplates;




