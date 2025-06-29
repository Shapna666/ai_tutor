import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement as ChartJsLineElement 
} from 'chart.js';
import { useAuth } from './AuthContext.jsx';

// Register all necessary Chart.js components
Chart.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  ChartJsLineElement
);

// Main Report Component
export default function Report() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  return (
    <div className="reports-container printable-report">
      {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard() {
  const subjectMasteryData = {
    labels: ['Data Structures', 'OS', 'DBMS', 'Networks', 'AI', 'ML'],
    datasets: [{
      label: 'Mastery',
      data: [88, 75, 92, 80, 65, 95],
      backgroundColor: ['#a6cee3', '#b2df8a', '#fdbf6f', '#cab2d6', '#fb9a99', '#99d8c9'],
      borderRadius: 6,
    }],
  };

  const topicCompletionData = {
    labels: ['Data Structures', 'OS', 'DBMS', 'Networks', 'AI', 'ML'],
    datasets: [{
      data: [18, 15, 22, 15, 10, 20],
      backgroundColor: ['#a6cee3', '#b2df8a', '#fdbf6f', '#cab2d6', '#fb9a99', '#99d8c9'],
      borderColor: '#fff',
      borderWidth: 3,
    }],
  };
  
  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Activities',
      data: [3, 5, 4, 6, 7, 2, 4],
      fill: true,
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      borderColor: '#1e40af',
      tension: 0.4,
    }],
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 20 },
      },
    },
  };
  
  const lineOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 10 } },
  };

  return (
    <>
      <div className="reports-header no-print">
        <h2 style={{ fontSize: '2.2rem' }}>Your Progress Dashboard</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem', alignItems: 'stretch' }}>
        <div className="dashboard-card" style={{ height: '380px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Subject Mastery</h3>
          <Bar data={subjectMasteryData} options={barOptions} />
        </div>
        <div className="dashboard-card" style={{ height: '380px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Topic Completion</h3>
          <Doughnut data={topicCompletionData} options={doughnutOptions} />
        </div>
      </div>
      
      <div className="dashboard-card" style={{ marginTop: '2rem', height: '300px' }}>
        <h3>Weekly Learning Activity</h3>
        <Line data={weeklyActivityData} options={lineOptions} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }} className="no-print">
        <button onClick={() => window.print()} className="btn-primary" style={{padding: '0.8rem 2rem', fontSize: '1rem'}}>
          📥 Download as PDF
        </button>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .reports-container { padding: 0 !important; }
          .no-print, .navbar { display: none !important; }
          .dashboard-card { box-shadow: none !important; border: 1px solid #e2e8f0; }
        }
      `}</style>
    </>
  );
}


// Teacher Dashboard Component (renamed from TeacherReportList)
function TeacherDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/reports',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReports(response.data);
      } catch (error) {
        setMessage(
          `❌ Error loading reports: ${
            error.response?.data?.error || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const viewReportInModal = async (report) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/view-report/${report.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      setMessage(`❌ Error viewing report: ${error.response?.data?.error || 'Could not load PDF'}`);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/download-report/${reportId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(`❌ Download error: ${error.response?.data?.error || error.message}`);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(reports.filter(r => r.id !== reportId));
      setMessage('✅ Report deleted successfully');
    } catch (error) {
      setMessage(`❌ Delete error: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (message) return <div style={{ color: message.includes('❌') ? 'red' : 'green', marginBottom: 16 }}>{message}</div>;

  return (
    <>
      <div className="reports-header no-print">
        <h2>📊 Student Reports Dashboard</h2>
      </div>
      <div className="report-grid">
        {reports.length > 0 ? reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-card-header">
              <h4>📊 {report.student_name}</h4>
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
            <p className="report-card-summary">
              {report.remarks ? `Remark: "${report.remarks}"` : "No remarks added yet."}
            </p>
            <div className="report-card-actions">
              <button onClick={() => viewReportInModal(report)} className="btn-view">👁️ View</button>
              <button onClick={() => downloadReport(report.id)} className="btn-download">📥 Download</button>
              <button onClick={() => deleteReport(report.id)} className="btn-delete">🗑️ Delete</button>
            </div>
          </div>
        )) : (
          <div className="no-reports-message">
            <p>No reports found. Reports will appear here once students complete their assessments.</p>
          </div>
        )}
      </div>
    </>
  );
} 