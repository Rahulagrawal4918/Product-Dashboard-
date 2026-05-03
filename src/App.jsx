import { useEffect, useRef, useState } from "react";
import { ProductProvider, useProducts } from "./context/ProductContext";
import { fetchProducts } from "./api/productApi";
import ProductTable from "./components/ProductTable";
import UndoRedo from "./components/UndoRedo";
import Layout from "./layout/DashboardLayout";

function Main() {
  const { state, dispatch } = useProducts();
  const [mode, setMode] = useState("pagination");

  const totalProducts = state.present.length;
  const categoriesCount = new Set(state.present.map((item) => item.category)).size;
  const pendingCount = state.pendingUpdates.length;

  useEffect(() => {
    dispatch({ type: "SET_LOADING" });
    fetchProducts()
      .then((data) => dispatch({ type: "SET_PRODUCTS", payload: data }))
      .catch((error) =>
        dispatch({ type: "SET_ERROR", payload: error.message || "Unable to load products" })
      );
  }, [dispatch]);

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.present.length) return;

      const candidates = currentState.present.filter(
        (item) => !currentState.pendingUpdates.includes(item.id)
      );
      if (!candidates.length) return;

      const product = candidates[Math.floor(Math.random() * candidates.length)];
      const price = +(product.price * (0.94 + Math.random() * 0.12)).toFixed(2);
      const rating = {
        ...product.rating,
        rate: +Math.max(1, Math.min(5, product.rating.rate + (Math.random() - 0.5) * 0.4)).toFixed(1),
      };

      dispatch({ type: "LIVE_UPDATE", payload: { id: product.id, price, rating } });
    }, 5200);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Layout>
      {state.loading && (
        <div className="loader-overlay">
          <div className="loader-card">
            <div className="loader-spinner" aria-hidden="true"></div>
            <p className="loader-text">Loading product dashboard…</p>
          </div>
        </div>
      )}

      <section className="hero-panel">
        <div className="dashboard-intro">
          <p className="intro-text">
            Manage product categories, view live pricing updates, and keep inventory in sync with simple table editing.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total products</span>
            <strong>{totalProducts}</strong>
          </div>
          <div className="stat-card">
            <span>Categories</span>
            <strong>{categoriesCount}</strong>
          </div>
          <div className="stat-card">
            <span>Pending saves</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </section>

      <div className="status-panel">
        <div className={`pill ${state.loading ? "loading" : "ready"}`}>
          {state.loading ? "Loading products…" : "Products loaded"}
        </div>
        {state.error && <div className="pill error">{state.error}</div>}
      </div>

      <section className="panel-section">
        <UndoRedo />
        <ProductTable mode={mode} setMode={setMode} />
      </section>
    </Layout>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <Main />
    </ProductProvider>
  );
}
