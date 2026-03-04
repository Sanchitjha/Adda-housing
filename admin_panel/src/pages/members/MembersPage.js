import React from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Chip } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

const members = [
  { id: 1, name: 'John Doe', phone: '9876543210', flat: 'A-101', type: 'Owner', status: 'Active' },
  { id: 2, name: 'Jane Smith', phone: '9876543211', flat: 'A-102', type: 'Owner', status: 'Active' },
  { id: 3, name: 'Mike Johnson', phone: '9876543212', flat: 'B-201', type: 'Tenant', status: 'Active' },
  { id: 4, name: 'Sarah Williams', phone: '9876543213', flat: 'B-202', type: 'Owner', status: 'Inactive' },
];

export default function MembersPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Members Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Member</Button>
      </Box>
      
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{member.name[0]}</Avatar>
                      {member.name}
                    </Box>
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.flat}</TableCell>
                  <TableCell>{member.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={member.status} 
                      color={member.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton><Visibility /></IconButton>
                    <IconButton><Edit /></IconButton>
                    <IconButton color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
