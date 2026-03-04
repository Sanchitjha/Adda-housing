import React from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid } from '@mui/material';

const AddMemberPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Add New Member
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Flat Number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Block" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained">Add Member</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddMemberPage;
