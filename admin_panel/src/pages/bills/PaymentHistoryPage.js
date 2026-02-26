import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const payments = [
  { id: 1, member: 'John Doe', flat: '101', amount: 4500, date: '2024-01-15', method: 'Razorpay', status: 'SUCCESS' },
  { id: 2, member: 'Sarah Smith', flat: '205', amount: 5200, date: '2024-01-14', method: 'Razorpay', status: 'SUCCESS' },
  { id: 3, member: 'Mike Johnson', flat: '302', amount: 4800, date: '2024-01-14', method: 'Cash', status: 'PENDING' },
];

const PaymentHistoryPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Payment History</Typography>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.member}</TableCell>
                  <TableCell>{p.flat}</TableCell>
                  <TableCell align="right">₹{p.amount}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell><Chip label={p.status} size="small" color={p.status === 'SUCCESS' ? 'success' : 'warning'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
export default PaymentHistoryPage;
