import React from 'react';
import { Box, Typography, Card, Button, Grid } from '@mui/material';
import { Download, PictureAsPdf, TableChart } from '@mui/icons-material';

export default function ReportsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reports & Exports</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Maintenance Reports</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate monthly maintenance collection reports
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<PictureAsPdf />}>PDF</Button>
              <Button variant="outlined" startIcon={<TableChart />}>Excel</Button>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Visitor Reports</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Daily and monthly visitor logs
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<PictureAsPdf />}>PDF</Button>
              <Button variant="outlined" startIcon={<TableChart />}>Excel</Button>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Complaint Reports</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Complaint status and resolution reports
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<PictureAsPdf />}>PDF</Button>
              <Button variant="outlined" startIcon={<TableChart />}>Excel</Button>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Financial Reports</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Income and expense summaries
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<PictureAsPdf />}>PDF</Button>
              <Button variant="outlined" startIcon={<TableChart />}>Excel</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
