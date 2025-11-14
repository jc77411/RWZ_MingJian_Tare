import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import TimelineNav from "./components/TimelineNav.jsx";
import EraPage from "./pages/EraPage.jsx";
import PersonPage from "./pages/PersonPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import PeopleIndex from "./pages/PeopleIndex.jsx";

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <h1>明鉴 人物志</h1>
          <p className="subtitle">明朝哪些人儿 · 按朝代/年号剖分人物与事件</p>
        </div>
        <nav className="top-nav">
          <Link to="/">时间线</Link>
          <Link to="/people">人物索引</Link>
        </nav>
      </header>

      <main className="app-main">
        <TimelineNav />
        <div className="content">
          <Routes>
            <Route path="/" element={<div className="card"><p>请选择上方时间线中的年号节点进入对应朝代。</p></div>} />
            <Route path="/era/:id" element={<EraPage />} />
            <Route path="/person/:id" element={<PersonPage />} />
            <Route path="/event/:id" element={<EventPage />} />
            <Route path="/people" element={<PeopleIndex />} />
          </Routes>
        </div>
      </main>

      <footer className="app-footer">
        <small>文本为主 · 响应式 · 不使用图片资源</small>
      </footer>
    </div>
  );
}