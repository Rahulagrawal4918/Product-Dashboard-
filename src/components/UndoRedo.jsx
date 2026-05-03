import { useProducts } from "../context/ProductContext";

export default function UndoRedo() {
  const { state, dispatch } = useProducts();

  return (
    <div className="control-row history-panel">
      <div className="history-actions">
        <button
          className="secondary-button"
          disabled={!state.past.length}
          onClick={() => dispatch({ type: "UNDO" })}
        >
          Undo
        </button>

        <button
          className="secondary-button"
          disabled={!state.future.length}
          onClick={() => dispatch({ type: "REDO" })}
        >
          Redo
        </button>
      </div>

      <div className="history-note">
        {state.lastAction ? `Last action: ${state.lastAction}` : "Ready to edit product categories."}
      </div>
    </div>
  );
}
