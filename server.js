const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SITE_ID = 4;
const AUTH = 'Basic amFtZXMuYnJvd25Acm9ja2V0LXJlei5jb206ZDE5NTAyNmJiZGI4NWEwZjcxNGM4NGU0OGRjOTZlYTAyNmY2YzVkNQ==';
const BASE_URL = 'https://sales.rocket-rez.com/RocketAPI/v1';

// In-memory store for self-check-ins
// Structure: { [scheduleId]: { [orderId]: { checkedInAt, firstName, lastName, partySize } } }
const selfCheckIns = {};

// Get tour schedules for a date
app.get('/api/schedules', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const response = await fetch(`${BASE_URL}/TourSchedules?SiteId=${SITE_ID}&SelectedDate=${date}`, {
      headers: { Authorization: AUTH }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get manifest for a specific schedule
app.get('/api/manifest', async (req, res) => {
  const { tourId, scheduleId, date } = req.query;
  try {
    const response = await fetch(
      `${BASE_URL}/TourManifest?SiteId=${SITE_ID}&TourId=${tourId}&ScheduleId=${scheduleId}&SelectedDate=${date}`,
      { headers: { Authorization: AUTH } }
    );
    const data = await response.json();

    // Attach self-check-in status
    const scheduleCheckIns = selfCheckIns[scheduleId] || {};
    if (data.Orders) {
      data.Orders = data.Orders.map(order => ({
        ...order,
        selfCheckedIn: !!scheduleCheckIns[order.OrderId],
        selfCheckedInAt: scheduleCheckIns[order.OrderId]?.checkedInAt || null
      }));
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark an order as self-checked-in (guest arrived, waiting for staff)
app.post('/api/checkin', (req, res) => {
  const { scheduleId, orderId, firstName, lastName, partySize } = req.body;
  if (!selfCheckIns[scheduleId]) selfCheckIns[scheduleId] = {};
  selfCheckIns[scheduleId][orderId] = {
    checkedInAt: new Date().toISOString(),
    firstName,
    lastName,
    partySize
  };
  res.json({ success: true });
});

// Remove check-in (once RocketRez staff has completed the formal check-in)
app.delete('/api/checkin/:scheduleId/:orderId', (req, res) => {
  const { scheduleId, orderId } = req.params;
  if (selfCheckIns[scheduleId]) {
    delete selfCheckIns[scheduleId][orderId];
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Check-in app running at http://localhost:${PORT}\n`);
});
