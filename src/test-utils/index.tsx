export const fiftyFifty = (p: PromiseLike<any>) => {
  return new Promise((resolve, reject) => {
    if (
      Math.floor(Math.random() * 2) + 1 ===
      Math.floor(Math.random() * 2) + 1
    ) {
      resolve(p)
    } else {
      reject(p)
    }
  })
}
