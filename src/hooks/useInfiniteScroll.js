import { useRef } from "react";

export default function useInfiniteScroll(callback) {
  const observer = useRef();

  return (node) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) callback();
    });

    if (node) observer.current.observe(node);
  };
}