import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ROLE_OPTIONS = ["帝王", "太子", "将帅", "文臣", "外交", "敌人", "竞争", "奸臣", "后宫", "研究"];

export default function PeopleIndex() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [era, setEra] = useState("");
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [initials, setInitials] = useState([]);
  const [initialFilter, setInitialFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const buildInitials = (list) => {
    const set = new Set();
    list.forEach(p => {
      const ch = (p.name || "").charAt(0);
      if (ch) set.add(ch);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-CN"));
  };

  const applyInitialFilter = (base) => {
    if (!initialFilter) return base;
    return base.filter(p => (p.name || "").charAt(0) === initialFilter);
  };

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("category", role);
      if (era) params.set("era", era);
      const res = await fetch(`/api/persons?${params.toString()}`);
      const json = await res.json();
      const base = json.items || [];
      setAllItems(base);
      setInitials(buildInitials(base));
      setItems(applyInitialFilter(base));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初次加载全部
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 改变首字索引时重新应用过滤
    setItems(applyInitialFilter(allItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilter]);

  return (
    <div className="card">
      <h2>人物索引导航</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="搜索姓名/字号/谥号/籍贯"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">按身份/类别</option>
          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          type="text"
          placeholder="按朝代筛选（如 hongwu/jianwen/yongle）"
          value={era}
          onChange={(e) => setEra(e.target.value)}
        />
        <button onClick={search}>搜索</button>
      </div>

      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="cards">
          {items.map(p => (
            <div key={p.id} className="person-card">
              <div className="person-title">
                <Link to={`/person/${p.id}`}>{p.name}</Link>
              </div>
              <div className="person-meta">
                <span className="role">{(p.roles || []).join("、")}</span>
                <span className="origin">{p.origin}</span>
              </div>
              <div className="era-tags">
                {(p.eraTags || []).join("、")}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="row" style={{ gap: 6, marginBottom: 8 }}>
        <strong>姓氏首字索引：</strong>
        <button
          className={`timeline-node ${!initialFilter ? "active" : ""}`}
          onClick={() => setInitialFilter("")}
        >
          全部
        </button>
        {initials.map(ch => (
          <button
            key={ch}
            className={`timeline-node ${initialFilter === ch ? "active" : ""}`}
            onClick={() => setInitialFilter(ch)}
            title={`姓氏首字：${ch}`}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}
