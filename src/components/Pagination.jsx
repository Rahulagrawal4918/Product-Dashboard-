export default function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="pagination-bar">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={page === index + 1 ? "active-page" : ""}
          onClick={() => setPage(index + 1)}
        >
          {index + 1}
        </button>
      ))}

      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
