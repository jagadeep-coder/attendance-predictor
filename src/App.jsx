import { useState, useMemo, useEffect } from "react";
import { timetables } from "./data/timetables";
import { calculateAttendancePlan } from "./engine/attendanceEngine";
import "./index.css";

function App() {
  const [section, setSection] = useState("III ECE-A");
  const [attendanceInputs, setAttendanceInputs] = useState({});
  const [planningDate, setPlanningDate] = useState("");
  const [semesterDeadline, setSemesterDeadline] = useState("2026-11-30");
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const timetable = timetables[section];
  const sectionList = Object.keys(timetables);

  const subjectList = useMemo(() => {
    if (!timetable) return [];
    const subs = new Set();
    Object.values(timetable.schedule).forEach(day => {
      day.forEach(slot => {
        if (slot.subject && slot.type !== 'empty' && slot.type !== 'break') {
          subs.add(slot.subject);
        }
      });
    });
    return Array.from(subs);
  }, [timetable]);

  const handleSectionChange = (e) => {
    setSection(e.target.value);
    setAttendanceInputs({});
    setResults(null);
    setErrorMsg("");
  };

  const handleInputChange = (sub, field, value) => {
    const num = parseInt(value, 10);
    setAttendanceInputs(prev => ({
      ...prev,
      [sub]: {
        ...prev[sub],
        [field]: isNaN(num) ? "" : num
      }
    }));
  };

  const calculate = () => {
    setErrorMsg("");
    if (!planningDate) {
      setErrorMsg("Please select a planning date.");
      return;
    }
    if (planningDate < today) {
      setErrorMsg("Planning date cannot be before today.");
      return;
    }
    
    let isValid = true;
    const newResults = {};

    for (const sub of subjectList) {
      const input = attendanceInputs[sub] || {};
      const attended = input.attended === "" || input.attended === undefined ? null : input.attended;
      const conducted = input.conducted === "" || input.conducted === undefined ? null : input.conducted;
      
      if (attended === null || conducted === null) {
        isValid = false;
        setErrorMsg(`Please enter attendance for ${getSubjectInfo(sub).name}`);
        break;
      }
      if (attended < 0 || conducted < 0 || attended > conducted) {
        isValid = false;
        setErrorMsg(`Invalid input for ${getSubjectInfo(sub).name}. Attended cannot be negative or greater than conducted.`);
        break;
      }

      const res = calculateAttendancePlan({
        section,
        subject: sub,
        attendedClasses: attended,
        conductedClasses: conducted,
        today,
        planningDate,
        semesterDeadline,
        timetablesIndex: timetables
      });
      newResults[sub] = res;
    }

    if (isValid) {
      setResults(newResults);
    }
  };

  const getSubjectInfo = (sub) => {
    const info = timetable.subjects && timetable.subjects[sub];
    if (info) {
      return {
        name: info.name || sub,
        code: info.code || "N/A",
        type: info.type ? info.type.charAt(0).toUpperCase() + info.type.slice(1) : "Academic"
      };
    }
    return { name: sub, code: "N/A", type: "Academic" };
  };

  const ActionableMessage = ({ horizon, isDeadline }) => {
    if (horizon.irreversibleDetention) {
      return (
        <div className="alert alert-danger">
          <strong>{isDeadline ? "IRREVERSIBLE BY SEMESTER DEADLINE" : "IRREVERSIBLE BY PLANNING DATE"}</strong>
          <p style={{ marginTop: "4px" }}>
            {isDeadline 
              ? "Even with 100% attendance in all remaining periods before the semester deadline, 90% cannot be reached." 
              : "Even with 100% attendance in the remaining periods before your planning date, 90% cannot be reached."}
          </p>
        </div>
      );
    }
    
    if (horizon.requiredToReach90 > 0) {
      if (horizon.requiredToReach90 > horizon.futureClasses) {
         return (
           <div className="alert alert-warning">
             <p>90% cannot be mathematically reached within this horizon.</p>
           </div>
         );
      }
      return (
        <div className="alert alert-info">
          <p>Attend {horizon.requiredToReach90} of the next {horizon.futureClasses} attendance periods to reach 90%.</p>
        </div>
      );
    }
    
    if (horizon.maxMissableClasses > 0) {
      return (
        <div className="alert alert-success">
          <p>You can miss up to {horizon.maxMissableClasses} attendance periods and remain at or above 90%.</p>
        </div>
      );
    }
    
    return (
      <div className="alert alert-success">
        <p>Your attendance is currently above the 90% threshold.</p>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Attendance Recovery System</h1>
        <p>Know exactly where you stand. Plan your recovery before it's too late.</p>
      </div>

      <div className="card">
        <h2>Student Details</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Section</label>
            <select className="form-control" value={section} onChange={handleSectionChange}>
              {sectionList.map(sec => (
                <option key={sec} value={sec}>{timetables[sec].name} ({timetables[sec].academicYear})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Today's Date <span style={{fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Included in future periods)</span></label>
            <input type="date" className="form-control" value={today} disabled />
          </div>
          <div className="form-group">
            <label>Planning Date</label>
            <input type="date" className="form-control" value={planningDate} onChange={e => {setPlanningDate(e.target.value); setResults(null);}} />
          </div>
          <div className="form-group">
            <label>Semester Deadline</label>
            <input type="date" className="form-control" value={semesterDeadline} onChange={e => {setSemesterDeadline(e.target.value); setResults(null);}} />
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: "20px" }}>Subject Attendance</h2>
      <div className="subjects-grid">
        {subjectList.map(sub => {
          const info = getSubjectInfo(sub);
          const att = attendanceInputs[sub]?.attended ?? "";
          const con = attendanceInputs[sub]?.conducted ?? "";
          const perc = con ? ((att / con) * 100).toFixed(2) : "0.00";

          return (
            <div key={sub} className="subject-card">
              <div className="subject-header">
                <div className="subject-title">{info.name}</div>
                <div className="subject-meta">{info.code} &middot; {info.type}</div>
              </div>
              
              <div className="attendance-inputs">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Attended</label>
                  <input 
                    type="number" 
                    className="form-control input-sm"
                    min="0"
                    value={att} 
                    onChange={e => handleInputChange(sub, 'attended', e.target.value)} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Conducted</label>
                  <input 
                    type="number" 
                    className="form-control input-sm"
                    min="0"
                    value={con} 
                    onChange={e => handleInputChange(sub, 'conducted', e.target.value)} 
                  />
                </div>
              </div>

              <div className="current-attendance">
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Current Attendance</div>
                <div className="percentage">{att !== "" && con !== "" ? `${perc}%` : "--%"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginTop: "24px" }}>
          {errorMsg}
        </div>
      )}

      <div style={{ marginTop: "32px" }}>
        <button className="btn" onClick={calculate} style={{ padding: "16px", fontSize: "1.1rem" }}>
          Calculate Recovery Plan
        </button>
      </div>

      {!results ? (
        <div className="empty-state">
          <h3>No Plan Generated Yet</h3>
          <p style={{ marginTop: "8px" }}>Enter your attendance details and calculate your recovery plan.</p>
        </div>
      ) : (
        <div className="results-section">
          <h2 style={{ marginBottom: "24px" }}>Recovery Plan Results</h2>
          
          {subjectList.map(sub => {
            const data = results[sub];
            const info = getSubjectInfo(sub);
            
            return (
              <div key={sub} className="card result-card">
                <div className="subject-header">
                  <div className="subject-title">{info.name}</div>
                  <div className="subject-meta">{info.code} &middot; {info.type}</div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>
                    {data.current.percentage.toFixed(2)}%
                  </span>
                  <span style={{ color: "var(--text-secondary)", marginLeft: "10px" }}>
                    (Attended: {data.current.attended} / Conducted: {data.current.conducted})
                  </span>
                </div>
                
                <div className="horizon-grid">
                  <div className="horizon-card">
                    <div className="horizon-title">Planning Horizon</div>
                    <ul className="stat-list">
                      <li><span>Future attendance periods:</span> <strong>{data.planningHorizon.futureClasses}</strong></li>
                      <li><span>Required to reach 90%:</span> <strong>{data.planningHorizon.requiredToReach90}</strong></li>
                      <li><span>Maximum missable:</span> <strong>{data.planningHorizon.maxMissableClasses}</strong></li>
                      <li><span>Maximum possible attendance:</span> <strong>{data.planningHorizon.maxPossiblePercentage.toFixed(2)}%</strong></li>
                    </ul>
                    <ActionableMessage horizon={data.planningHorizon} isDeadline={false} />
                  </div>

                  <div className="horizon-card">
                    <div className="horizon-title">November Deadline</div>
                    <ul className="stat-list">
                      <li><span>Future attendance periods:</span> <strong>{data.deadlineHorizon.futureClasses}</strong></li>
                      <li><span>Required to reach 90%:</span> <strong>{data.deadlineHorizon.requiredToReach90}</strong></li>
                      <li><span>Maximum missable:</span> <strong>{data.deadlineHorizon.maxMissableClasses}</strong></li>
                      <li><span>Maximum possible attendance:</span> <strong>{data.deadlineHorizon.maxPossiblePercentage.toFixed(2)}%</strong></li>
                    </ul>
                    <ActionableMessage horizon={data.deadlineHorizon} isDeadline={true} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;