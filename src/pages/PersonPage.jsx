import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PersonPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/persons/${id}`);
        const json = await res.json();
        setP(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="card">加载中...</div>;
  if (!p?.id) return <div className="card">未找到该人物。</div>;

  const eraTags = p.eraTags || [];
  const bioByEra = p.bioByEra || {};

  return (
    <div className="card">
      <h2>{p.name} {p.styleName ? `（${p.styleName}）` : ""} {p.posthumousTitle ? `· ${p.posthumousTitle}` : ""}</h2>
      <p className="muted">籍贯：{p.origin} · 身份：{(p.roles || []).join("、")}</p>

      <div className="anchors">
        <strong>所属朝代标签：</strong>
        {eraTags.map(tag => (
          <a key={tag} href={`#era-${tag}`} className="anchor">{tag}</a>
        ))}
      </div>

      <h3>核心事迹与时代关联</h3>
      <ul>
        {(p.coreDeeds || []).map((d, idx) => <li key={idx}>{d}</li>)}
      </ul>

      <h3>详细生平时间线 / 朝代履历</h3>
      {eraTags.map(tag => (
        <section key={tag} id={`era-${tag}`} className="era-section">
          <h4>〔{tag}〕时期</h4>
          <p>{bioByEra[tag] || "（待补充）"}</p>
        </section>
      ))}

      <h3>相关事件</h3>
      <ul>
        {(p.relatedEvents || []).map(ev => (
          <li key={ev.id}>
            <Link to={`/event/${ev.id}`}>{ev.title}</Link>
          </li>
        ))}
      </ul>

      {(p.relations || []).length > 0 && (
        <>
          <h3>关系（师承 / 同门 / 姻亲 等）</h3>
          <ul>
            {p.relations.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}