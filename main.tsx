import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const categories = [
  { title: 'Salgados', description: 'Coxinhas, empadas, esfihas e assados', emoji: '🥐', slug: 'salgados' },
  { title: 'Bolos e doces', description: 'Fatias, bolos inteiros e doces', emoji: '🎂', slug: 'bolos' },
  { title: 'Bebidas', description: 'Refrigerantes, sucos e água', emoji: '🥤', slug: 'bebidas' },
  { title: 'Festas e eventos', description: 'Kits, cento de salgados e encomendas', emoji: '🎉', slug: 'festas' },
];

function App() {
  const slug = window.location.pathname.split('/').filter(Boolean)[0] || 'padaria-demo';
  return <main className="shell">
    <header className="hero">
      <div className="brandmark">AM</div>
      <div><p className="eyebrow">AGELMAX • CARDÁPIO DIGITAL</p><h1>Padaria Sabor & Arte</h1><p className="subtitle">Feito com carinho, pedido com facilidade.</p></div>
      <span className="open-pill">● Aberto hoje</span>
    </header>
    <section className="welcome"><p className="eyebrow">BEM-VINDO</p><h2>O que você deseja hoje?</h2><p>Escolha uma categoria, monte seu pedido e selecione entrega ou retirada.</p><div className="search"><span>⌕</span><input aria-label="Buscar produtos" placeholder="Buscar produtos no cardápio" /></div></section>
    <section className="section-heading"><div><p className="eyebrow">NOSSO CARDÁPIO</p><h2>Explore as categorias</h2></div><span className="muted">4 categorias</span></section>
    <section className="categories">{categories.map((category) => <a className="category" key={category.slug} href={`/${slug}/${category.slug}`}><div className="category-emoji">{category.emoji}</div><div><h3>{category.title}</h3><p>{category.description}</p><span className="category-link">Ver opções <span>→</span></span></div></a>)}</section>
    <section className="event-banner"><div><p className="eyebrow">MOMENTOS ESPECIAIS</p><h2>Vai fazer uma festa?</h2><p>Peça um orçamento de bolos, doces e salgados para seu evento.</p><a href={`/${slug}/festas`}>Solicitar orçamento →</a></div><span className="banner-emoji">🎂</span></section>
    <footer><strong>AgelMax</strong><span>Cardápio demonstrativo • Os pedidos reais serão habilitados após configurar a API.</span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
