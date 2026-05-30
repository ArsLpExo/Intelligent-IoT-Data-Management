import React, { useState } from 'react';
import { useSensorData } from '../hooks/useSensorData.js';
import { useFilteredData } from '../hooks/useFilteredData.js';
import { useStreamNames } from '../hooks/useStreamNames.js';
import { useTimeRange } from '../hooks/useTimeRange.js';
import TimeSelector from './TimeSelector.jsx';
import TimeRangePanel from './TimeRangePanel.jsx';

// import StreamSelector from './StreamSelector.jsx';
import StreamDropdownSelector from "./StreamDropdownSelector.jsx";
import IntervalSelector from './IntervalSelector.jsx';
import StreamStats from './StreamStats.jsx';
import './Dashboard.css';
import Chart from './Chart.jsx';
import MostCorrelatedPair from './MostCorrelatedPair.jsx';
import ScatterPlot from './ScatterPlot.jsx';




const Dashboard = () => {
  const { data, loading, error } = useSensorData(true); // mock mode
  const streamNames = useStreamNames(data);

  // removing absolute time selectors from the main dashboard and moving them to the time range panel, which will be shown when the user clicks the "Select Time Range" button. This is to declutter the main dashboard and provide a more focused interface for time range selection.
  //const [startTime, endTime] = useTimeRange(data);
  const timeOptions = useTimeRange(data);
  const [selectedTimeStart, setSelectedTimeStart] = useState('');
  const [selectedTimeEnd, setSelectedTimeEnd] = useState('');
  //const correlation = useCorrelationMatrix(data, streamNames, startTime, endTime);

  // Time Range Panel State changes: finalStartTime and finalEndTime are the actual times that will be used for filtering the data and updating the charts. They only get updated when the user clicks the "Analyze Time Range" button in the TimeRangePanel, which triggers the handleSubmit function. This way, users can freely change their time selections without immediately affecting the dashboard until they confirm their choices by clicking the button.
  const [showTimePanel, setShowTimePanel] = useState(false);
  const [timeMode, setTimeMode] = useState("absolute"); // "absolute" or "relative"
  const [relativeRange, setRelativeRange] = useState("5min");
  const [finalStartTime, setFinalStartTime] = useState(null);
  const [finalEndTime, setFinalEndTime] = useState(null);



  const [selectedStreams, setSelectedStreams] = useState([]);
  const intervals = ['5min', '15min', '1h', '6h'];
  const [selectedInterval, setSelectedInterval] = useState(intervals[0]);


  {/* removing absolute time selectors from the main dashboard and moving them to the time range panel, which will be shown when the user clicks the "Select Time Range" button. This is to declutter the main dashboard and provide a more focused interface for time range selection. */ }

  // const filteredData = useFilteredData(data, {
  //   startTime: selectedTimeStart,
  //   endTime: selectedTimeEnd,
  //   selectedStreams,
  //   interval: selectedInterval
  // });


  const filteredData = useFilteredData(data, {
    startTime: finalStartTime,
    endTime: finalEndTime,
    selectedStreams,
    interval: selectedInterval
  });


  const streamCount = selectedStreams.length;


  // updating the handleSubmit function to set the finalStartTime and finalEndTime based on the user's selections in the TimeRangePanel. This function will be called when the user clicks the "Analyze Time Range" button in the TimeRangePanel, and it will determine the actual time range to use for filtering the data based on whether the user selected an absolute or relative time range.
  //   const handleSubmit = () => {
  //   console.log('Selected Time Range:', selectedTimeStart, '→', selectedTimeEnd);


  //   console.log('selectedInterval:', selectedInterval);
  //   // You can filter data, send to backend, or trigger chart updates

  //   console.log('Filtered Data:', filteredData);

  // };

  const handleSubmit = React.useCallback(() => {
  console.log("Dashboard timeMode:", timeMode, "relativeRange:", relativeRange);

  if (timeMode === "absolute") {
    setFinalStartTime(
      selectedTimeStart ? new Date(selectedTimeStart).getTime() : null
    );
    setFinalEndTime(
      selectedTimeEnd ? new Date(selectedTimeEnd).getTime() : null
    );
  }

  if (timeMode === "relative") {
    // const now = Date.now();
    const now = new Date(data[data.length - 1].created_at).getTime();


    const ranges = {
      "5min": 5 * 60 * 1000,
      "15min": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 1000,
      "24h": 24 * 60 * 1000
    };

    const duration = ranges[relativeRange] || 0;

    setFinalEndTime(now);
    setFinalStartTime(now - duration);
  }

  setShowTimePanel(false);
}, [timeMode, relativeRange, selectedTimeStart, selectedTimeEnd]);


  // end of handleSubmit function

  // refereshing the dashboard with the same time range when the user clicks the refresh button. This is done by reapplying the same finalStartTime and finalEndTime values, which will trigger a re-render of the dashboard and update the charts with the current time range. This allows users to easily refresh the data without having to reselect their time range, providing a convenient way to see updated information while keeping their existing selections intact.
  // const handleRefresh = () => {
  //   // Reapply the same time range to trigger re-render
  //   setFinalStartTime(finalStartTime);
  //   setFinalEndTime(finalEndTime);

  //   console.log("Dashboard refreshed with same time range");
  // };

  const handleRefresh = () => {
  if (timeMode === "relative") {
    const now = new Date(data[data.length - 1].created_at).getTime();

    const ranges = {
      "5min": 5 * 60 * 1000,
      "15min": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000
    };

    const duration = ranges[relativeRange];

    setFinalEndTime(now);
    setFinalStartTime(now - duration);

    console.log("Refreshed relative time range");
    return;
  }

  // Absolute mode
  setFinalStartTime(finalStartTime);
  setFinalEndTime(finalEndTime);
  console.log("Refreshed absolute time range");
};


  // end of handleRefresh function

  // formatTimeRange function to display the selected time range in a user-friendly format on the "Select Time Range" button. This function takes the start and end times, the selected time mode (absolute or relative), and the relative range as inputs, and returns a formatted string that represents the selected time range. For absolute time ranges, it formats the start and end times into a readable date and time format. For relative time ranges, it simply returns a string indicating the relative range (e.g., "Last 5 minutes"). This helps users quickly understand their current time range selection at a glance when they look at the button.
  const formatTimeRange = (start, end, mode, relativeRange) => {
  if (mode === "relative") {
    return `Last ${relativeRange}`;
  }

  // Absolute mode
  const startStr = new Date(start).toLocaleString();
  const endStr = new Date(end).toLocaleString();
  return `${startStr} → ${endStr}`;
};

// end of formatTimeRange function


  if (loading) return <p>Loading dataset...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div >

      <div className='info-plate'>
        <h3>Note: </h3>
        <ol>
          <li>Select at least one stream to view the line chart.</li>
          <li>Select two streams to see their scatter plot with a trendline, their correlation coefficient, and a rolling correlation line plot in the time interval using the selected time-window.</li>
          <li>Select at least three streams and a time range, to see which two streams are the most correlated in the selected time range, their scatter plot with a trendline.</li>

          <li>If no scatter plot is shown, it means there is not enough variance in the data during the selected time range.</li>
          <li>If no rolling correlation line is shown, it means there is not enough variance in the data during the selected time range.</li>
          <li>If no meaningful scatter plot is available for the most correlated pair, it means one or both streams lack variance in the selected time range.</li>
          <li>If no time range is selected, the entire dataset is used.</li>
        </ol>

        <h3> Total Data Points in Dataset: {data.length} |

          Data Points in Selected Range: {filteredData.length}
        </h3>
      </div>

      <div className='dashboard-container'>
        <div className='label-plate'>Streams: {streamNames.map(s => s.name).join(', ')}
        </div>


        <div className='selector-grid '>
          <div className='selector-group'>

            {/* remmoving stream selector and replacing it with a dropdown selector to save space and make the dashboard cleaner, especially when there are many streams. The dropdown will allow users to easily search and select streams without overwhelming the interface with too many checkboxes or options. */}
            {/* <StreamSelector 
            data={data}
             // streams={streamNames}
           selectedStreams={selectedStreams}
             setSelectedStreams={setSelectedStreams}
               /> */}


            <StreamDropdownSelector
              streams={streamNames.map(s => s.name)}
              selectedStreams={selectedStreams}
              setSelectedStreams={setSelectedStreams}
            />
            {/* end streamdropdown */}
          </div>

          <div className='selector-group'>
            <IntervalSelector
              intervals={intervals}
              selectedInterval={selectedInterval}
              setSelectedInterval={setSelectedInterval}
            />
          </div>


          {/* <div className='selector-group card' > */}

            {/* <h3>Time Range Selection</h3> */}
              <div className="time-controls-wrapper">
            <div className='time-controls'>


              {/* removing absolute time selectors from the main dashboard and moving them to the time range panel, which will be shown when the user clicks the "Select Time Range" button. This is to declutter the main dashboard and provide a more focused interface for time range selection. */}
              {/* <div>
              <TimeSelector
              label="Start Time"
              timeOptions={timeOptions}
              selectedTime={selectedTimeStart}
              setSelectedTime={setSelectedTimeStart}
              />
              </div> */}
              {/* <div>
              <TimeSelector
              label="End Time"
              timeOptions={timeOptions}
              selectedTime={selectedTimeEnd}
              setSelectedTime={setSelectedTimeEnd}
              />
               </div> */}
              {/* this button for future use */}
              {/* <div className='button'>
             <button onClick={handleSubmit}>Analyse Time Range</button>
              </div>            */}

              <button
                className="time-range-toggle"
                onClick={() => setShowTimePanel(prev => !prev)}>
                {/* Select Time Range ▼ */}
                   {finalStartTime && finalEndTime
                 ? formatTimeRange(finalStartTime, finalEndTime, timeMode, relativeRange)
                : "Select Time Range ▼"}
              </button>

              <button className="refresh-btn" onClick={handleRefresh}>
                ⟳
              </button>

            {/* </div> */}
              </div>

          </div>



          {showTimePanel && (
            <div className="time-range-overlay">
              <TimeRangePanel
                timeOptions={timeOptions}
                selectedTimeStart={selectedTimeStart}
                setSelectedTimeStart={setSelectedTimeStart}
                selectedTimeEnd={selectedTimeEnd}
                setSelectedTimeEnd={setSelectedTimeEnd}
                timeMode={timeMode}
                setTimeMode={setTimeMode}
                relativeRange={relativeRange}
                setRelativeRange={setRelativeRange}
                onAnalyze={handleSubmit}
              />
            </div>
          )}



        </div>



        {/* add some space here */}
        <p></p>
        {streamCount === 0 && (
          <div className='empty-state'>
            <h3>Please select one or more streams to view statistics and charts.</h3>
          </div>
        )}
        {streamCount === 1 && (
          <div className='single-stream-block'>
            <h3>Selected one stream to see their scatter plot. Select another stream to explore correlations.</h3>

          </div>
        )}
        {streamCount === 2 && (
          <div className='pair-stream-block'>
            <h4>Selected two streams to see their scatter plot and rolling correlation. Select one more stream to see the most correlated pair among the selected streams.</h4>
            {/* <p>Note: If no scatter plot is shown, it means there is not enough data to display it.</p> */}


            <ScatterPlot data={filteredData}
              streams={selectedStreams}
              title={`Scatter Plot of selected two streams: `}
            />

          </div>
        )}

        {streamCount > 2 && (
          <div className='multi-stream-block'>
            <h3>Selected {streamCount} streams.</h3>
            <MostCorrelatedPair data={filteredData} streams={selectedStreams} />
            <p>Note: If no scatter plot is shown, it means there is not enough variance in the data during the selected time range.</p>

          </div>
        )}


        <div>
          <div className='stream-stats'>
            {selectedStreams.map(stream => (
              <StreamStats key={stream} data={filteredData} stream={stream} />
            ))}
          </div>
        </div>

      </div>

      <div className="chart-container">
        <Chart data={filteredData} selectedStreams={selectedStreams} />
      </div>

    </div>
  );
};

export default Dashboard;
