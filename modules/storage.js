// modules/storage.js
export const Storage = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
}
