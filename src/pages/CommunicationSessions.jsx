
import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';
import { apiClient } from '../services/api';

const CommunicationSessions = () => {
  const { getAll, refresh } = useData();

  const satellites = getAll('satellites');
  const stations = getAll('groundStations');
  const antennas = getAll('antennas');
  const bands = getAll('frequencyBands');
  const windows = getAll('communicationWindows');

  const fmt = (value) =>
    value ? new Date(value).toLocaleString() : '—';

  // Submit a booking request, not a confirmed session.
  const handleBookingRequest = async (values) => {
    const windowId = Number(values.window_id);
    const selectedWindow = windows.find(
      (window) => Number(window.window_id) === windowId
    );

    if (!selectedWindow) {
      throw new Error('Please select a valid communication window.');
    }

    if (Number(selectedWindow.sat_id) !== Number(values.sat_id)) {
      throw new Error(
        'The selected satellite does not match the communication window.'
      );
    }

    if (Number(selectedWindow.gs_id) !== Number(values.gs_id)) {
      throw new Error(
        'The selected ground station does not match the communication window.'
      );
    }

    const toLocalTimestamp = (value) => {
      if (!value) return value;
      return value.length === 16 ? `${value}:00` : value;
    };

    const result = await apiClient.post('/scheduling/sessions', {
      window_id: windowId,
      station_id: Number(values.gs_id),
      antenna_id: Number(values.ant_id),
      frequency: Number(values.band_id),
      scheduled_start: toLocalTimestamp(values.start_time),
      scheduled_end: toLocalTimestamp(values.end_time),
    });

    // Refresh the shared data after a successful submission.
    await refresh();

    return {
      message:
        result?.message || 'Booking request submitted for approval',
    };
  };

  const fields = [
    {
      name: 'window_id',
      label: 'Communication Window',
      type: 'select',
      required: true,
      options: () =>
        windows.map((window) => ({
          value: window.window_id,
          label: `#${window.window_id} (${window.status})`,
        })),
      display: (value) => (value ? `#${value}` : '—'),
      validate: (value, values) => {
        const selectedWindow = windows.find(
          (window) => Number(window.window_id) === Number(value)
        );

        if (!selectedWindow) return null;

        if (
          values.sat_id &&
          Number(selectedWindow.sat_id) !== Number(values.sat_id)
        ) {
          return 'Window does not match the selected satellite';
        }

        if (
          values.gs_id &&
          Number(selectedWindow.gs_id) !== Number(values.gs_id)
        ) {
          return 'Window does not match the selected ground station';
        }

        return null;
      },
    },
    {
      name: 'sat_id',
      label: 'Satellite',
      type: 'select',
      required: true,
      options: () =>
        satellites.map((satellite) => ({
          value: satellite.sat_id,
          label: satellite.sat_name,
        })),
      display: (value) =>
        satellites.find(
          (satellite) => Number(satellite.sat_id) === Number(value)
        )?.sat_name || '—',
    },
    {
      name: 'gs_id',
      label: 'Ground Station',
      type: 'select',
      required: true,
      options: () =>
        stations.map((station) => ({
          value: station.gs_id,
          label: station.gs_name,
        })),
      display: (value) =>
        stations.find(
          (station) => Number(station.gs_id) === Number(value)
        )?.gs_name || '—',
    },
    {
      name: 'ant_id',
      label: 'Antenna',
      type: 'select',
      required: true,
      options: () =>
        antennas.map((antenna) => ({
          value: antenna.ant_id,
          label: antenna.ant_name,
        })),
      display: (value) =>
        antennas.find(
          (antenna) => Number(antenna.ant_id) === Number(value)
        )?.ant_name || '—',
    },
    {
      name: 'band_id',
      label: 'Frequency Band',
      type: 'select',
      required: true,
      options: () =>
        bands.map((band) => ({
          value: band.band_id,
          label: band.band_name,
        })),
      display: (value) =>
        bands.find(
          (band) => Number(band.band_id) === Number(value)
        )?.band_name || '—',
    },
    {
      name: 'start_time',
      label: 'Start Time',
      type: 'datetime-local',
      required: true,
      display: fmt,
    },
    {
      name: 'end_time',
      label: 'End Time',
      type: 'datetime-local',
      required: true,
      display: fmt,
      validate: (value, values) =>
        value &&
        values.start_time &&
        new Date(value) <= new Date(values.start_time)
          ? 'End must be after start'
          : null,
    },
  ];

  const columns = [
    { header: 'Session ID', accessor: 'session_id' },
    {
      header: 'Satellite',
      accessor: 'sat_id',
      render: (value) =>
        satellites.find(
          (satellite) => Number(satellite.sat_id) === Number(value)
        )?.sat_name || '—',
    },
    {
      header: 'Station',
      accessor: 'gs_id',
      render: (value) =>
        stations.find(
          (station) => Number(station.gs_id) === Number(value)
        )?.gs_name || '—',
    },
    {
      header: 'Antenna',
      accessor: 'ant_id',
      render: (value) =>
        antennas.find(
          (antenna) => Number(antenna.ant_id) === Number(value)
        )?.ant_name || '—',
    },
    {
      header: 'Band',
      accessor: 'band_id',
      render: (value) =>
        bands.find(
          (band) => Number(band.band_id) === Number(value)
        )?.band_name || '—',
    },
    {
      header: 'Start',
      accessor: 'start_time',
      render: fmt,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge
          variant={
            value === 'completed'
              ? 'success'
              : value === 'in_progress'
                ? 'warning'
                : value === 'cancelled'
                  ? 'danger'
                  : 'info'
          }
        >
          {(value || 'scheduled').replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  return (
    <CrudPage
      title="Communication Sessions"
      description="Scheduled and historical communication sessions linking satellites, stations, antennas and bands. New bookings require Admin approval."
      collection="communicationSessions"
      allowCreate={true}
      onCreate={handleBookingRequest}
      idKey="session_id"
      columns={columns}
      fields={fields}
      initialValues={{}}
      summaryStats={[
        {
          label: 'Total Sessions',
          value: (records) => records.length,
        },
        {
          label: 'Scheduled',
          value: (records) =>
            records.filter((session) => session.status === 'scheduled')
              .length,
        },
        {
          label: 'In Progress',
          value: (records) =>
            records.filter((session) => session.status === 'in_progress')
              .length,
        },
        {
          label: 'Completed',
          value: (records) =>
            records.filter((session) => session.status === 'completed')
              .length,
        },
      ]}
      filters={[
        {
          key: 'status',
          accessor: 'status',
          label: 'Status',
          options: [
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
        {
          key: 'sat',
          accessor: 'sat_id',
          label: 'Satellite',
          options: satellites.map((satellite) => ({
            value: satellite.sat_id,
            label: satellite.sat_name,
          })),
        },
      ]}
    />
  );
};

export default CommunicationSessions;
