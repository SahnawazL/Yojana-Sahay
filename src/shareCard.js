// src/shareCard.js — Yojana Sahay · "My benefits" image card for WhatsApp etc.
// ─────────────────────────────────────────────────────────────────────────────
// Draws a 1080×1350 card on a <canvas> (no libraries): total yearly benefit,
// scheme count, the top schemes with their amounts, and the app link.
// Shares it as an image through the phone's share sheet when supported;
// otherwise downloads the image and opens WhatsApp with a text version.
// ─────────────────────────────────────────────────────────────────────────────

const SITE = "https://yojanasahay.vercel.app";

export function shortINR(n) {
  if (!n) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")} L`;
  if (n >= 1000)     return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fitText(ctx, text, maxWidth) {
  let t = String(text);
  if (ctx.measureText(t).width <= maxWidth) return t;
  while (t.length > 3 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t + "…";
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawBenefitCard({ total, count, top = [], state, lang = "en" }) {
  const hi = lang === "hi";
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const font = (w, s) => `${w} ${s}px ${hi ? "'Noto Sans Devanagari'," : ""}'Noto Sans', system-ui, -apple-system, sans-serif`;

  // Background — deep saffron → navy
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#FF8A1F"); g.addColorStop(0.55, "#C2410C"); g.addColorStop(1, "#1E1B4B");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Soft glow
  const rg = ctx.createRadialGradient(W * 0.8, 120, 20, W * 0.8, 120, 520);
  rg.addColorStop(0, "rgba(255,255,255,0.22)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  // Tricolour strip
  [["#FF9933", 0], ["#FFFFFF", 1], ["#138808", 2]].forEach(([col, i]) => { ctx.fillStyle = col; ctx.fillRect(i * W / 3, 0, W / 3, 14); });

  // Brand row
  const logo = await loadImage("/icons/logo192.png");
  if (logo) { ctx.save(); roundRect(ctx, 72, 70, 96, 96, 24); ctx.clip(); ctx.drawImage(logo, 72, 70, 96, 96); ctx.restore(); }
  ctx.fillStyle = "#fff"; ctx.font = font(800, 44); ctx.textBaseline = "middle";
  ctx.fillText("Yojana Sahay", logo ? 192 : 72, 104);
  ctx.font = font(500, 26); ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(hi ? "सरकारी योजना खोजक" : "Government scheme finder", logo ? 192 : 72, 144);

  // Headline
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = font(700, 34);
  ctx.fillText(hi ? "मेरी पात्र योजनाओं से संभावित सालाना लाभ" : "My possible yearly benefit from government schemes", 72, 290);
  ctx.fillStyle = "#FFD54A"; ctx.font = font(900, 168);
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 24;
  ctx.fillText(shortINR(total), 64, 470);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff"; ctx.font = font(700, 40);
  ctx.fillText(hi ? `${count} योजनाएं${state ? ` · ${state}` : ""}` : `${count} scheme${count === 1 ? "" : "s"} I may qualify for${state ? ` · ${state}` : ""}`, 72, 545);

  // Top schemes panel
  const px = 56, py = 600, pw = W - 112, rowH = 88, rows = top.slice(0, 5);
  const ph = 90 + rows.length * rowH;
  ctx.fillStyle = "rgba(255,255,255,0.12)"; roundRect(ctx, px, py, pw, ph, 36); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = font(800, 26);
  ctx.fillText(hi ? "सबसे बड़े लाभ" : "BIGGEST BENEFITS", px + 40, py + 60);
  rows.forEach((s, i) => {
    const y = py + 90 + i * rowH;
    if (i) { ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(px + 40, y, pw - 80, 2); }
    ctx.fillStyle = "#fff"; ctx.font = font(700, 36);
    ctx.fillText(fitText(ctx, s.name, pw - 330), px + 40, y + 57);
    ctx.fillStyle = "#FFD54A"; ctx.font = font(800, 38); ctx.textAlign = "right";
    ctx.fillText(`${shortINR(s.annual)}${hi ? "/वर्ष" : "/yr"}`, px + pw - 40, y + 57);
    ctx.textAlign = "left";
  });

  // Footer CTA
  const fy = H - 170;
  ctx.fillStyle = "#fff"; roundRect(ctx, 56, fy, W - 112, 116, 30); ctx.fill();
  ctx.fillStyle = "#C2410C"; ctx.font = font(800, 36);
  ctx.fillText(hi ? "आप भी मुफ्त में जांचें 👉" : "Check yours free 👉", 96, fy + 72);
  ctx.textAlign = "right"; ctx.fillStyle = "#1E1B4B"; ctx.font = font(800, 34);
  ctx.fillText("yojanasahay.vercel.app", W - 96, fy + 72);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = font(500, 22);
  ctx.fillText(hi ? "*अनुमानित — आवेदन और मंज़ूरी पर निर्भर" : "*Estimate — depends on applying and approval", 72, H - 24);

  return c;
}

export async function shareBenefitCard(opts) {
  const hi = opts.lang === "hi";
  const text = hi
    ? `मैं सरकारी योजनाओं से हर साल ${shortINR(opts.total)} तक पा सकता/सकती हूं (${opts.count} योजनाएं)। आप भी मुफ्त में जांचें: ${SITE}`
    : `I may be eligible for up to ${shortINR(opts.total)} a year from ${opts.count} government schemes. Check yours free: ${SITE}`;
  try {
    const canvas = await drawBenefitCard(opts);
    const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
    if (blob) {
      const file = new File([blob], "my-yojana-benefits.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "Yojana Sahay" });
        return "shared";
      }
      // No image sharing → save the picture, then open WhatsApp with the text.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "my-yojana-benefits.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
  } catch (err) {
    if (err?.name === "AbortError") return "cancelled"; // user closed the share sheet
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  return "whatsapp";
}
