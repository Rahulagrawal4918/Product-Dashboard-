import { useMemo, useState } from "react";
import { useProducts } from "../context/ProductContext";
import { saveProductCategory } from "../api/productApi";
import usePagination from "../hooks/usePagination";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import Pagination from "./Pagination";

export default function ProductTable({ mode, setMode }) {
  const { state, dispatch } = useProducts();
  const [count, setCount] = useState(8);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [drafts, setDrafts] = useState({});

  const categories = useMemo(
    () => ["all", ...new Set(state.present.map((product) => product.category))],
    [state.present]
  );

  const filteredData = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const list = state.present.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm);
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return [...list].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortField === "price") return (a.price - b.price) * direction;
      if (sortField === "rating") return (a.rating.rate - b.rating.rate) * direction;
      return a.title.localeCompare(b.title) * direction;
    });
  }, [state.present, search, categoryFilter, sortField, sortDirection]);

  const { currentData, page, setPage, totalPages } = usePagination(filteredData, 5);
  const loadMore = () => setCount((c) => c + 5);
  const ref = useInfiniteScroll(loadMore);
  const data = mode === "pagination" ? currentData : filteredData.slice(0, count);

  const commitCategory = (id, rawValue, originalCategory) => {
    const category = rawValue.trim();
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (!category || category === originalCategory) return;

    const previousProduct = state.present.find((product) => product.id === id);
    if (!previousProduct) return;

    const requestId = `${id}-${Date.now()}`;
    dispatch({ type: "UPDATE_CATEGORY_OPTIMISTIC", payload: { id, category, requestId } });

    saveProductCategory({ ...previousProduct, category })
      .then(() => {
        dispatch({ type: "UPDATE_CATEGORY_SUCCESS", payload: { id, requestId } });
      })
      .catch((error) => {
        dispatch({
          type: "UPDATE_CATEGORY_FAILURE",
          payload: {
            id,
            requestId,
            previousProduct,
            error: error?.toString() || "Category update failed",
          },
        });
      });
  };

  const handleDraftChange = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="table-card fade-in">
      <div className="table-header">
        <div>
          <h3>Products</h3>
          <p>Quickly search, sort, and edit categories in a clean product catalog.</p>
          <p className="input-hint">Tip: edit the category and press Enter or click away to save.</p>
        </div>

        <div className="view-toggle">
          <span className="view-label">View mode</span>
          <button
            className={mode === "pagination" ? "active" : ""}
            onClick={() => setMode("pagination")}
          >
            Pagination
          </button>
          <button
            className={mode === "infinite" ? "active" : ""}
            onClick={() => setMode("infinite")}
          >
            Infinite
          </button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-panel">
          <input
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All categories" : category}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-panel">
          <button onClick={() => toggleSort("title")}>Title {sortField === "title" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</button>
          <button onClick={() => toggleSort("price")}>Price {sortField === "price" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</button>
          <button onClick={() => toggleSort("rating")}>Rating {sortField === "rating" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</button>
        </div>
      </div>

      <div className="table-container">
        {data.length ? (
          <table className="product-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Category</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.map((product, index) => {
                const draftValue = drafts[product.id];
                const pending = state.pendingUpdates.includes(product.id);
                const isRecentlyLive =
                  product.status === "live" &&
                  product.lastUpdated &&
                  Date.now() - product.lastUpdated < 9000;
                const rowClass = product.status === "failed" ? "failed-row shake" : "";

                return (
                  <tr
                    key={product.id}
                    ref={index === data.length - 1 && mode === "infinite" ? ref : null}
                    className={rowClass}
                  >
                    <td>
                      <div className="title-cell">
                        <span>{product.title}</span>
                        {isRecentlyLive && <span className="badge live">Live</span>}
                      </div>
                    </td>
                    <td className="price">₹{product.price.toFixed(2)}</td>
                    <td className="category-cell">
                      <input
                        value={draftValue ?? product.category}
                        onChange={(event) => handleDraftChange(product.id, event.target.value)}
                        onBlur={(event) => commitCategory(product.id, event.target.value, product.category)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.target.blur();
                        }}
                        className={pending ? "pending-input" : ""}
                      />
                      <div className="category-meta">
                        {pending && <span className="badge saving">Saving…</span>}
                        {product.status === "failed" && (
                          <span className="badge error">Failed</span>
                        )}
                        {product.status === "failed" && (
                          <span className="row-note">Save failed. Edit again to retry.</span>
                        )}
                      </div>
                    </td>
                    <td className="rating">⭐ {product.rating.rate.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No products match the current filters.</div>
        )}
      </div>

      {mode === "pagination" && (
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      )}
    </div>
  );
}
