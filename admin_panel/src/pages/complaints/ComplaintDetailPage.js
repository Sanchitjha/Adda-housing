import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { useParams } from 'react-router-dom';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Complaint Details</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="h6">Water leakage in bathroom</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography color="text.secondary">Flat: 101, Block A</Typography></Grid>
            <Grid item xs={12} sm={6}><Chip label="OPEN" color="error" /></Grid>
            <Grid item xs={12}><Typography>Description: Water is leaking from the bathroom ceiling...</Typography></Grid>
            <Grid item xs={12}><Button variant="contained">Update Status</Button></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
export default ComplaintDetailPage;
