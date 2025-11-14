// 基础 Express 后端，提供 Era/Person/Event 的查询与检索 API
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 加载数据种子
const seed = require("./data/seed.json");

// 简单工具：大小写不敏感包含
function includesIgnoreCase(haystack, needle) {
  if (!haystack || !needle) return false;
  return String(haystack).toLowerCase().includes(String(needle).toLowerCase());
}

// GET /api/eras：返回所有朝代（精简信息）
app.get("/api/eras", (req, res) => {
  const eras = seed.eras.map((e) => ({
    id: e.id,
    name: e.name,
    emperor: e.emperor,
    eraBackground: e.eraBackground,
    majorTopics: e.majorTopics,
    majorEventIds: e.majorEventIds
  }));
  res.json({ items: eras, total: eras.length });
});

// GET /api/eras/:id：返回某朝代详情 + 本朝人物概览 + 相关事件
app.get("/api/eras/:id", (req, res) => {
  const eraId = req.params.id;
  const era = seed.eras.find((e) => e.id === eraId);
  if (!era) {
    return res.status(404).json({ error: "Era not found" });
  }
  const personsInEra = seed.persons.filter((p) => p.eraTags?.includes(eraId));
  const crossEraPersons = seed.persons.filter(
    (p) => Array.isArray(p.eraTags) && p.eraTags.includes(eraId) && p.eraTags.length > 1
  );
  const eventsByEraIds = seed.events.filter((ev) => ev.eraIds?.includes(eraId));
  const eventsByMajorIds = Array.isArray(era.majorEventIds)
    ? seed.events.filter((ev) => era.majorEventIds.includes(ev.id))
    : [];
  const eventsInEra = [...eventsByEraIds, ...eventsByMajorIds].reduce((acc, ev) => {
    if (!acc.some((x) => x.id === ev.id)) acc.push(ev);
    return acc;
  }, []);

  res.json({
    era,
    persons: personsInEra.map((p) => ({
      id: p.id,
      name: p.name,
      roles: p.roles,
      origin: p.origin,
      highestRole: p.roles?.[0] || null,
      coreDeeds: p.coreDeeds?.slice(0, 2) || []
    })),
    crossEraPersons: crossEraPersons.map((p) => ({ id: p.id, name: p.name, eraTags: p.eraTags })),
    events: eventsInEra
  });
});

// GET /api/persons：支持按姓名/字号/谥号/籍贯搜索；按身份类别；按朝代
// 示例：/api/persons?q=朱&category=文臣&era=yongle
app.get("/api/persons", (req, res) => {
  const { q, category, era } = req.query;

  let results = seed.persons.slice();

  if (q) {
    results = results.filter(
      (p) =>
        includesIgnoreCase(p.name, q) ||
        includesIgnoreCase(p.styleName, q) ||
        includesIgnoreCase(p.posthumousTitle, q) ||
        includesIgnoreCase(p.origin, q)
    );
  }

  if (category) {
    results = results.filter((p) => Array.isArray(p.roles) && p.roles.includes(category));
  }

  if (era) {
    results = results.filter((p) => Array.isArray(p.eraTags) && p.eraTags.includes(era));
  }

  res.json({
    total: results.length,
    items: results.map((p) => ({
      id: p.id,
      name: p.name,
      roles: p.roles,
      origin: p.origin,
      eraTags: p.eraTags
    }))
  });
});

// GET /api/persons/:id：人物独立页数据（分朝代履历、核心事迹等）
app.get("/api/persons/:id", (req, res) => {
  const personId = req.params.id;
  const p = seed.persons.find((x) => x.id === personId);
  if (!p) {
    return res.status(404).json({ error: "Person not found" });
  }
  const relatedEvents = seed.events.filter((ev) =>
    ev.eraIds?.some((er) => p.eraTags?.includes(er))
  );

  res.json({
    id: p.id,
    name: p.name,
    styleName: p.styleName,
    posthumousTitle: p.posthumousTitle,
    origin: p.origin,
    roles: p.roles,
    eraTags: p.eraTags,
    coreDeeds: p.coreDeeds,
    bioByEra: p.bioByEra || {},
    relations: p.relations || [],
    relatedEvents
  });
});

// GET /api/events：事件列表
app.get("/api/events", (req, res) => {
  res.json({ total: seed.events.length, items: seed.events });
});

// GET /api/events/:id：事件详情 + 关键人物
app.get("/api/events/:id", (req, res) => {
  const eventId = req.params.id;
  const ev = seed.events.find((x) => x.id === eventId);
  if (!ev) {
    return res.status(404).json({ error: "Event not found" });
  }
  const keyPersons = seed.persons.filter((p) =>
    ev.eraIds?.some((er) => p.eraTags?.includes(er))
  );
  res.json({ event: ev, keyPersons: keyPersons.map((p) => ({ id: p.id, name: p.name })) });
});

// 端口
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`RWZ_MingJian API server running at http://localhost:${PORT}`);
});
