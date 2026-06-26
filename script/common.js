const API_URL = "http://localhost:3000";

const api = {
  async get(resource) {
    const response = await fetch(`${API_URL}/${resource}`);
    if (!response.ok) throw new Error("Unable to load data");
    return response.json();
  },
  async post(resource, payload) {
    const response = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Unable to save data");
    return response.json();
  },
  async patch(resource, id, payload) {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Unable to update data");
    return response.json();
  }
};