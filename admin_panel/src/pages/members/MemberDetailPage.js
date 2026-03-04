import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Avatar, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';

const MemberDetailPage = () => {
  const { id } = useParams();
  
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Member Details
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
              J
            </Avatar>
            <Box>
              <Typography variant="h5">John Doe</Typography>
              <Chip label="Owner" color="primary" size="small" />
            </Box>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">9876543210</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">john@example.com</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Flat</Typography>
              <Typography variant="body1">101, Block A</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip label="Active" color="success" size="small" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MemberDetailPage;
