const store = new Map();
const TOKEN = 'ajc2026'; // 你的口令，之后可以改

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.searchParams.get('token') !== TOKEN) {
    return res.status(403).json({ ok: false, msg: '口令不对' });
  }

  // /api/screentime/toggle/应用名 —— 手机端上报
  if (parts[0] === 'toggle' && parts[1]) {
    const app = decodeURIComponent(parts[1]);
    const now = Date.now();
    const prev = store.get(app);
    const event = !prev || prev.state === 'close' ? 'open' : 'close';
    store.set(app, { state: event, time: now });
    return res.json({ ok: true, app, event });
  }

  // /api/screentime/query —— 查记录
  if (parts[0] === 'query') {
    const now = Date.now();
    const data = [];
    for (const [app, r] of store) {
      if (now - r.time > 24 * 3600 * 1000) store.delete(app);
      else data.push({ app, state: r.state, time: new Date(r.time).toISOString() });
    }
    return res.json({ ok: true, data });
  }

  res.status(404).json({ ok: false, msg: '没这个接口' });
}
