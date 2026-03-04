import React, { useState } from 'react';
import { Box, Typography, Card, TextField, Button, Switch, FormControlLabel, Divider, Grid, Avatar } from '@mui/material';
import { Save, Person, Lock, Notifications, Business } from '@mui/icons-material';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    societyName: 'Green Valley Apartments',
    email: 'admin@greenvalley.com',
    phone: '+91 9876543210',
    address: '123 Green Valley, Mumbai',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    maintenanceAlert: true,
    visitorAlert: true,
    complaintAlert: true
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h6">Society Information</Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Society Name"
              name="societyName"
              value={settings.societyName}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={settings.address}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Notifications color="primary" />
              <Typography variant="h6">Notification Preferences</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  name="emailNotifications"
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  name="smsNotifications"
                />
              }
              label="SMS Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                  name="pushNotifications"
                />
              }
              label="Push Notifications"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Alert Types</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceAlert}
                  onChange={handleChange}
                  name="maintenanceAlert"
                />
              }
              label="Maintenance Bills"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.visitorAlert}
                  onChange={handleChange}
                  name="visitorAlert"
                />
              }
              label="Visitor Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.complaintAlert}
                  onChange={handleChange}
                  name="complaintAlert"
                />
              }
              label="Complaint Updates"
            />
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Person color="primary" />
              <Typography variant="h6">Admin Profile</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80 }}>A</Avatar>
              <Button variant="outlined">Change Photo</Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" defaultValue="Admin" margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" defaultValue="User" margin="normal" />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Save />} size="large" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
