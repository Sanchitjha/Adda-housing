import React from 'react';
import { Box, Typography, Card, Grid, TextField, Button, Divider } from '@mui/material';

export default function SocietyPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Society Management</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Society Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField fullWidth label="Society Name" defaultValue="Galaxy Apartments" margin="normal" />
            <TextField fullWidth label="Address" defaultValue="123 Main Road" margin="normal" />
            <TextField fullWidth label="City" defaultValue="Mumbai" margin="normal" />
            <TextField fullWidth label="State" defaultValue="Maharashtra" margin="normal" />
            <TextField fullWidth label="Pincode" defaultValue="400001" margin="normal" />
            <TextField fullWidth label="Contact Phone" defaultValue="+91 9876543210" margin="normal" />
            <TextField fullWidth label="Contact Email" defaultValue="info@galaxyapartments.com" margin="normal" />
            <Button variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Statistics</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">Total Blocks: <strong>5</strong></Typography>
            <Typography variant="body1">Total Flats: <strong>120</strong></Typography>
            <Typography variant="body1">Total Members: <strong>245</strong></Typography>
            <Typography variant="body1">Staff Members: <strong>12</strong></Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
