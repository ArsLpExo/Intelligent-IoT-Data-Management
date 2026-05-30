// components/TimeSelector.jsx
import React from 'react';
// adding disabled prop to TimeSelector to disable the dropdown when the user selects relative time mode in the TimeRangePanel. This is to prevent users from selecting absolute times when they have chosen to use a relative time range, which would not make sense and could lead to confusion. By disabling the dropdown, we can provide a clearer user experience and guide users towards making valid selections based on their chosen time mode.
const TimeSelector = ({ label, timeOptions, selectedTime, setSelectedTime, disabled }) => (
  <label>
    {label}:&nbsp;
    <select
      value={selectedTime}
      onChange={e => setSelectedTime(e.target.value)}
      disabled={disabled}
    >
      {(timeOptions || []).map((time, i) => (
        <option key={i} value={time}>{time}</option>
      ))}
    </select>
  </label>
);

export default TimeSelector;
