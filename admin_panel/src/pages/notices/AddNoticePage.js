import React from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid } from '@mui/material';

const AddNoticePage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Add New Notice</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Title" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={4} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Priority" select></TextField></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Valid Until" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><Button variant="contained">Publish Notice</Button></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
export default AddNoticePage;
