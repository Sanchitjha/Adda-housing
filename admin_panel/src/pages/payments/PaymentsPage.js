import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const payments = [
  { id: 1, flat: 'A-101', name: 'John Doe', amount: 4500, date: '2024-01-20', mode: 'Online', status: 'Success' },
  { id: 2, flat: 'A-102', name: 'Jane Smith', amount: 4500, date: '2024-01-20', mode: 'UPI', status: 'Success' },
  { id: 3, flat: 'B-201', name: 'Mike Johnson', amount: 5200, date: '2024-01-19', mode: 'Cash', status: 'Pending' },
];

export default function PaymentsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Payments</Typography>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flat</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.flat}</TableCell>
                  <TableCell>{payment.name}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.mode}</TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      color={payment.status === 'Success' ? 'success' : 'warning'} 
                      size="small" 
                    />
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
