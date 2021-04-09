export const delay = (t = 2000) =>
  new Promise((resolve) => setTimeout(resolve, t));
