export default function Layout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📦</span>
          <div>
            <h2>Dashboard</h2>
            <p>Inventory & pricing overview</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-link active">Overview</a>
          <a href="#products" className="nav-link">Products</a>
          <a href="#settings" className="nav-link">Settings</a>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p className="eyebrow">Product Operations</p>
            <h1>Smart Inventory Manager</h1>
          </div>

          <div className="user-pill">
            <span>Rahul</span>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}
