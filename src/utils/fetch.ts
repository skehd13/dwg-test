const baseUrl = process.env.NODE_ENV === "production" ? "" : "/api";

export const apiFetch = (url: string, method: CRUD, sendData?: any) => {
  const options = sendData
    ? {
        method,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("id_token"),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      }
    : {
        method,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("id_token"),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
  return fetch(baseUrl + url, options).then((response) => {
    if (!response.ok) {
      if (response.status === 401 || response.status === 419) {
        localStorage.setItem("id_token", "");
      }
      return response.json().then((resJson) => {
        return Promise.reject(resJson);
      });
    }
    return response.json();
  });
};
