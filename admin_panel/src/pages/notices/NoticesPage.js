import React from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Add } from '@mui/icons-material';

const notices = [
  { id: 1, title: 'Maintenance Bill Due', date: '2024-01-20', status: 'Active', views: 145 },
  { id: 2, title: 'Society Meeting', date: '2024-01-18', status: 'Active', views: 89 },
  { id: 3, title: 'Power Maintenance', date: '2024-01-15', status: 'Expired', views: 67 },
];

export default function NoticesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notices</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Notice</Button>
      </Box>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Views</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>{notice.title}</TableCell>
                  <TableCell>{notice.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={notice.status} 
                      color={notice.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{notice.views}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
