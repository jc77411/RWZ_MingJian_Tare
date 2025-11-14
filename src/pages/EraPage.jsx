import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function EraPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/eras/${id}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="card">加载中...</div>;
  if (!data?.era) return <div className="card">未找到该朝代。</div>;

  const { era, persons, crossEraPersons, events } = data;
  const emperor = era.emperor || {};

  return (
    <div className="grid two">
      <section className="card">
        <h2>{era.name} · {emperor.reignTitle}（{emperor.reignYears}）</h2>
        <p className="muted">{emperor.name} · 主要特点/评价：{emperor.overview}</p>
        <h3>时代背景</h3>
        <p>{era.eraBackground}</p>

        <h3>本朝重大议题</h3>
        <ul className="tags">
          {(era.majorTopics || []).map((t) => <li key={t} className="tag">{t}</li>)}
        </ul>

        <h3>相关事件</h3>
        <ul>
          {(events || []).map(ev => (
            <li key={ev.id}><Link to={`/event/${ev.id}`}>{ev.title}</Link></li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>本章人物概览</h3>
        <div className="cards">
          {(persons || []).map(p => (
            <div key={p.id} className="person-card">
              <div className="person-title">
                <Link to={`/person/${p.id}`}>{p.name}</Link>
              </div>
              <div className="person-meta">
                <span className="role">{(p.roles || [])[0]}</span>
                <span className="origin">{p.origin}</span>
              </div>
              {(p.coreDeeds || []).length > 0 && (
                <ul className="deeds">
                  {p.coreDeeds.map((d, idx) => <li key={idx}>{d}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>

        <h4>跨朝人物提示</h4>
        <ul>
          {(crossEraPersons || []).map(p => (
            <li key={p.id}>
              <Link to={`/person/${p.id}`}>{p.name}</Link> · 活跃朝代：{(p.eraTags || []).join("、")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}