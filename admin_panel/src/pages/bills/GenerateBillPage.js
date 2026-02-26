import React from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid } from '@mui/material';

const GenerateBillPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Generate Bill</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Bill Month" type="month" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Maintenance Rate (per sq ft)" /></Grid>
            <Grid item xs={12}><Button variant="contained">Generate Bills</Button></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
export default GenerateBillPage;
