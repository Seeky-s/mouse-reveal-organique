import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import BoxMouseOrganique from "../src/index.js";
import "./style.css";

function Playground() {
  const [size, setSize] = useState(1);
  const [trail, setTrail] = useState(2.2);
  const [organic, setOrganic] = useState(1);
  const [disabled, setDisabled] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  return <>
    <header><a href="#playground">m/o<span>mouse reveal organique</span></a><span className="badge">REACT · INDEPENDENT ENGINE · v0.1</span></header>
    <Analytics />
    <main id="playground">
      <div className="intro"><p className="eyebrow">UN MOUVEMENT. UN AUTRE MONDE.</p><h1>Let it <em>flow.</em></h1><p>Un masque vivant, une trace qui s’efface.<br/>Déplacez la souris sur le paysage pour explorer.</p></div>
      <BoxMouseOrganique className="landscape" img_cover="/cover.svg" img_background="/reveal.svg" size_mouse={size} trail_duration={trail} organic={organic} disabled={disabled} image_alt="Paysage abstrait de montagnes à la tombée du jour">
        <div className="landscape-top"><span>01 / LIQUID EXPLORATION</span><span>MOVE TO REVEAL ↗</span></div>
        <div className="landscape-bottom"><div><p>JUST BELOW THE SURFACE</p><h2>A different<br/>perspective.</h2></div><button onClick={() => setClicks(n => n + 1)}>Le contenu reste cliquable ↗ <span>{clicks > 0 ? `(${clicks})` : ""}</span></button></div>
      </BoxMouseOrganique>
      <section className="controls" aria-label="Réglages de l’effet">
        <label>Taille <output>{size.toFixed(2)}</output><input aria-label="Taille" type="range" min="0.25" max="2" step="0.05" value={size} onChange={e => setSize(Number(e.target.value))}/></label>
        <label>Traînée <output>{trail.toFixed(1)} s</output><input aria-label="Traînée" type="range" min="0.2" max="6" step="0.1" value={trail} onChange={e => setTrail(Number(e.target.value))}/></label>
        <label>Organique <output>{organic.toFixed(1)}</output><input aria-label="Organique" type="range" min="0" max="2" step="0.1" value={organic} onChange={e => setOrganic(Number(e.target.value))}/></label>
        <label className="toggle"><input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)}/> Désactiver</label>
      </section>
      <section className="details"><div><p className="eyebrow">UNE SIMPLE ENVELOPPE REACT</p><h2>Votre contenu.<br/>Votre mise en page.</h2><p>Pas de dépendance d’animation. Pas de CSS à importer.<br/>Chaque instance possède sa propre simulation.</p><pre><code>{`<BoxMouseOrganique\n  img_cover="/cover.jpg"\n  img_background="/reveal.jpg"\n  size_mouse={1}\n  style={{ minHeight: 500 }}\n>\n  <h1>Votre contenu</h1>\n</BoxMouseOrganique>`}</code></pre></div>
        <BoxMouseOrganique className="small-preview" img_cover="/reveal.svg" img_background="/cover.svg" size_mouse={0.7} trail_duration={1.5}><span>02 / INDEPENDENT INSTANCE</span><h3>Small box.<br/>Same freedom.</h3></BoxMouseOrganique>
      </section>
      <section className="use-cases" aria-labelledby="use-cases-title">
        <div className="section-heading"><p className="eyebrow">PLUSIEURS FORMATS. UN SEUL COMPOSANT.</p><h2 id="use-cases-title">Built for more than<br/><em>one kind of story.</em></h2><p>Change the layout, content and parameters — the interaction adapts to the moment.</p></div>
        <div className="case-grid">
          <BoxMouseOrganique className="case case-portfolio" img_cover="/cover.svg" img_background="/reveal.svg" size_mouse={0.62} trail_duration={1.1} organic={1.55} image_alt="Aperçu d'un projet de portfolio">
            <div className="case-meta"><span>PORTFOLIO / 2026</span><button aria-pressed={saved} onClick={() => setSaved(value => !value)}>{saved ? "SAVED ✓" : "SAVE PROJECT +"}</button></div>
            <div><p>Selected work</p><h3>Ocean<br/>House</h3></div>
          </BoxMouseOrganique>
          <BoxMouseOrganique className="case case-editorial" img_cover="/reveal.svg" img_background="/cover.svg" size_mouse={1.18} trail_duration={3.8} organic={0.45} image_alt="Aperçu d'un article éditorial">
            <span className="issue">FIELD NOTES — 08</span>
            <div><p>ESSAY / PLACE</p><h3>On finding<br/>a new horizon.</h3><a href="#playground">Read the story ↗</a></div>
          </BoxMouseOrganique>
          <BoxMouseOrganique className="case case-product" img_cover="/cover.svg" img_background="/reveal.svg" size_mouse={0.48} trail_duration={0.7} organic={0.85} image_alt="Aperçu d'une carte produit">
            <div className="product-top"><span>OBJECT / 03</span><span>€ 240</span></div>
            <div className="product-bottom"><div><p>THE WEEKEND EDIT</p><h3>Trail bag</h3></div><button onClick={() => setAdded(value => !value)}>{added ? "Added ✓" : "Add to bag +"}</button></div>
          </BoxMouseOrganique>
        </div>
      </section>
    </main><footer>Conçu pour React 18 et 19 · Les appareils tactiles affichent l’image de couverture.</footer>
  </>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Playground/></StrictMode>);
