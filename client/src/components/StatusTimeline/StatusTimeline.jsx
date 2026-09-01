import { formatStatus } from "../../utils/formatters";

const STEPS = ["pending", "in_progress", "resolved"];

export default function StatusTimeline({ status }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div>
      <div className="timeline">
        {STEPS.map((step, index) => {
          let stepClass = "";
          if (index < currentIndex) stepClass = "completed";
          else if (index === currentIndex) stepClass = "active";

          return (
            <div key={step} className={`timeline-step ${stepClass}`}>
              <div className="timeline-dot">{index < currentIndex ? "✓" : index + 1}</div>
              <h4>{formatStatus(step)}</h4>
            </div>
          );
        })}
      </div>

      {status === "rejected" && (
        <div className="timeline-rejected">This complaint has been rejected</div>
      )}
    </div>
  );
}
