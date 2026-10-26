import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { apiClient } from '../services/api';
import Table from '../components/common/Table';
import Button from '../components/common/Button';

const BookingApprovals = () => {
  const { user } = useAuth();
  const { getAll, refresh } = useData();
  const bookings = getAll('bookingRequests');
  const isAdmin = user?.role === 'Admin';

  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const approve = async (id) => {
    if (!window.confirm(`Approve booking #${id}?`)) return;

    setBusyId(id);
    setMessage('');

    try {
      await apiClient.post(`/approvals/${id}/approve`);
      await refresh();
      setMessage(`Booking #${id} approved successfully.`);
    } catch (error) {
      setMessage(error?.message || 'Approval failed.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Enter rejection reason (3-500 characters):');
    if (reason === null) return;

    const trimmed = reason.trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      setMessage('Rejection reason must contain 3–500 characters.');
      return;
    }

    setBusyId(id);
    setMessage('');

    try {
      await apiClient.post(`/approvals/${id}/reject`, { reason: trimmed });
      await refresh();
      setMessage(`Booking #${id} rejected successfully.`);
    } catch (error) {
      setMessage(error?.message || 'Rejection failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="scheduling-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Approvals</h1>
          <p className="page-subtitle">
            Review satellite communication booking requests
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refresh()}>Refresh</Button>
      </div>

      {message && <p role="status">{message}</p>}

      <Table
        data={bookings}
        emptyMessage="No booking requests available."
        columns={[
          { header: 'Request', accessor: 'request_id' },
          { header: 'Window', accessor: 'window_id' },
          { header: 'Antenna', accessor: 'ant_id' },
          { header: 'Station', accessor: 'gs_id' },
          {
            header: 'Start',
            accessor: 'start_time',
            render: (value) => value ? new Date(value).toLocaleString() : '-'
          },
          {
            header: 'End',
            accessor: 'end_time',
            render: (value) => value ? new Date(value).toLocaleString() : '-'
          },
          { header: 'Status', accessor: 'status' },
          ...(isAdmin ? [{
            header: 'Actions',
            accessor: 'request_id',
            render: (id, booking) => booking.status === 'pending' ? (
              <>
                <Button variant="primary" size="sm" disabled={busyId !== null} onClick={() => approve(id)}>
                  Approve
                </Button>
                {' '}
                <Button variant="danger" size="sm" disabled={busyId !== null} onClick={() => reject(id)}>
                  Reject
                </Button>
              </>
            ) : 'Reviewed'
          }] : [])
        ]}
      />
    </div>
  );
};

export default BookingApprovals;
