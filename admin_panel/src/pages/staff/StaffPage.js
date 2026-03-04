import React from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip } from '@mui/material';
import { Add, Edit, Delete, Phone, Email } from '@mui/icons-material';

const staff = [
  { id: 1, name: 'Ramesh Kumar', role: 'Security Guard', phone: '9876543210', shift: 'Morning', status: 'Active' },
  { id: 2, name: 'Suresh Patel', role: 'Security Guard', phone: '9876543211', shift: 'Night', status: 'Active' },
  { id: 3, name: 'Lakshmi Devi', role: 'Housekeeping', phone: '9876543212', shift: 'Morning', status: 'Active' },
  { id: 4, name: 'Kamal Singh', role: 'Electrician', phone: '9876543213', shift: 'General', status: 'Active' },
];

export default function StaffPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Staff Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Staff</Button>
      </Box>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar>{member.name[0]}</Avatar>
                      {member.name}
                    </Box>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.shift}</TableCell>
                  <TableCell>
                    <Chip label={member.status} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Phone />} />
                    <Button size="small" startIcon={<Edit />} />
                    <Button size="small" color="error" startIcon={<Delete />} />
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
