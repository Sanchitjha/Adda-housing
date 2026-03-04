import React from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid } from '@mui/material';

const AddStaffPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Add New Staff</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone Number" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Role" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Shift" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Address" multiline rows={2} /></Grid>
            <Grid item xs={12}><Button variant="contained">Add Staff</Button></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
export default AddStaffPage;
