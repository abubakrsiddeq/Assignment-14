import { useEffect, useMemo, useState } from "react";
import { clearMyLogs, fetchMyLogs } from "../services/api";
import { useToast } from "../context/ToastContext";

const ActivityLogPanel = ({ onClose, isOpen = true }) => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchMyLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message || "Failed to load logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadLogs();
  }, [isOpen]);

  const getTypeLabel = (type) => {
    if (type === "success") return "Success";
    if (type === "error") return "Error";
    return "Info";
  };

  const normalizedLogs = useMemo(
    () =>
      logs.map((entry) => {
        const isError = String(entry.action || "").includes("DELETE") ? "info" : "success";
        const type = String(entry.action || "").includes("DELETE") ? "error" : isError;
        return {
          id: entry._id,
          actorName: entry.actorName,
          actorEmail: entry.actorEmail,
          action: entry.action,
          targetType: entry.targetType,
          message: entry.message,
          type,
          time: new Date(entry.createdAt).toLocaleString([], {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }),
    [logs]
  );

  const handleClearLogs = async () => {
    try {
      await clearMyLogs();
      setLogs([]);
      showToast("Activity logs cleared", "success");
    } catch (error) {
      showToast(error.message || "Failed to clear logs", "error");
    }
  };

  return (
    <section className="activity-log-card" aria-live="polite">
      <div className="activity-log-header">
        <div className="activity-log-heading">
          <p className="activity-log-overline">Runtime Feed</p>
          <h3>Activity Log</h3>
          <p className="activity-log-subtitle">Live events from your current session</p>
        </div>
        <div className="activity-log-actions">
          {onClose && (
            <button
              type="button"
              className="activity-close-btn"
              onClick={onClose}
              aria-label="Close activity log"
            >
              ×
            </button>
          )}
          <span className="activity-count-badge">{normalizedLogs.length}</span>
          {normalizedLogs.length > 0 && (
            <button type="button" className="activity-clear-btn" onClick={handleClearLogs}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="activity-empty">
          <span className="activity-empty-icon" aria-hidden="true">◷</span>
          <p>Loading logs...</p>
        </div>
      ) : normalizedLogs.length === 0 ? (
        <div className="activity-empty">
          <span className="activity-empty-icon" aria-hidden="true">◷</span>
          <p>No activity found yet.</p>
        </div>
      ) : (
        <ul className="activity-list">
          {normalizedLogs.map((entry) => (
            <li key={entry.id} className={`activity-item activity-${entry.type}`}>
              <div className="activity-item-top">
                <span className={`activity-type-badge activity-type-${entry.type}`}>{getTypeLabel(entry.type)}</span>
                <span className="activity-time">{entry.time}</span>
              </div>
              <p className="activity-message">{entry.message}</p>
              <p className="activity-user-line">
                <strong>{entry.actorName}</strong> ({entry.actorEmail}) • {entry.targetType}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ActivityLogPanel;
