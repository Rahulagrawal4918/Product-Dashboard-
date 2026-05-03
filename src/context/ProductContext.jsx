import { createContext, useReducer, useContext } from "react";

const ProductContext = createContext();

const initialState = {
  past: [],
  present: [],
  future: [],
  loading: false,
  error: null,
  pendingUpdates: [],
  lastAction: null,
};

function updateProductList(products, id, updater) {
  return products.map((product) =>
    product.id === id ? updater(product) : product
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true, error: null };

    case "SET_PRODUCTS":
      return {
        ...state,
        loading: false,
        error: null,
        present: action.payload,
        pendingUpdates: [],
        lastAction: "Products loaded",
      };

    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload, lastAction: "Load failed" };

    case "UPDATE_CATEGORY_OPTIMISTIC": {
      const { id, category, requestId } = action.payload;
      return {
        past: [...state.past, state.present],
        present: updateProductList(state.present, id, (product) => ({
          ...product,
          category,
          status: "saving",
          updateToken: requestId,
        })),
        future: [],
        loading: false,
        error: null,
        pendingUpdates: [...new Set([...state.pendingUpdates, id])],
        lastAction: `Updating category for product ${id}`,
      };
    }

    case "UPDATE_CATEGORY_SUCCESS":
      return {
        ...state,
        present: updateProductList(state.present, action.payload.id, (product) => {
          if (product.updateToken !== action.payload.requestId) return product;
          const { updateToken, ...rest } = product;
          return {
            ...rest,
            status: "saved",
            lastUpdated: Date.now(),
          };
        }),
        pendingUpdates: state.pendingUpdates.filter((id) => id !== action.payload.id),
        lastAction: "Category saved",
      };

    case "UPDATE_CATEGORY_FAILURE":
      return {
        ...state,
        present: updateProductList(state.present, action.payload.id, (product) => {
          if (product.updateToken !== action.payload.requestId) return product;
          return {
            ...action.payload.previousProduct,
            status: "failed",
          };
        }),
        pendingUpdates: state.pendingUpdates.filter((id) => id !== action.payload.id),
        error: action.payload.error,
        lastAction: "Save failed",
      };

    case "LIVE_UPDATE": {
      const { id, price, rating } = action.payload;
      if (state.pendingUpdates.includes(id)) return state;
      return {
        ...state,
        present: updateProductList(state.present, id, (product) => ({
          ...product,
          price,
          rating,
          status: "live",
          lastUpdated: Date.now(),
        })),
        lastAction: "Live update applied",
      };
    }

    case "UNDO":
      if (!state.past.length) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past.at(-1),
        future: [state.present, ...state.future],
        loading: false,
        error: null,
        pendingUpdates: state.pendingUpdates,
        lastAction: "Undo last change",
      };

    case "REDO":
      if (!state.future.length) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
        loading: false,
        error: null,
        pendingUpdates: state.pendingUpdates,
        lastAction: "Redo change",
      };

    default:
      return state;
  }
}

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);