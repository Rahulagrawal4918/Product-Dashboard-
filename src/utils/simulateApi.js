export const simulateUpdate = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() < 0.2 ? reject("Update failed") : resolve(data);
    }, 800);
  });
};