import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function TimelineNav() {
  const [eras, setEras] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/eras");
        const data = await res.json();
        setEras(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="timeline loading">时间线加载中...</div>;
  }

  const goEra = (id) => navigate(`/era/${id}`);

  return (
    <div className="timeline">
      {eras.map((era) => {
        const isActive = location.pathname === `/era/${era.id}`;
        return (
          <button
            key={era.id}
            className={`timeline-node ${isActive ? "active" : ""}`}
            onClick={() => goEra(era.id)}
            title={`${era.emperor?.name || era.name}（${era.emperor?.reignYears || ""}）`}
          >
            {era.name}
          </button>
        );
      })}
    </div>
  );
}