import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function EventPage() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [keyPersons, setKeyPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const json = await res.json();
        setEv(json.event);
        setKeyPersons(json.keyPersons || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="card">加载中...</div>;
  if (!ev?.id) return <div className="card">未找到该事件。</div>;

  return (
    <div className="card">
      <h2>{ev.title}</h2>
      <p className="muted">涉及朝代：{(ev.eraIds || []).join("、")}</p>
      <h3>事件概述</h3>
      <p>{ev.summary}</p>

      <h3>关键人物</h3>
      <ul>
        {keyPersons.map(p => (
          <li key={p.id}><Link to={`/person/${p.id}`}>{p.name}</Link></li>
        ))}
      </ul>
    </div>
  );
}