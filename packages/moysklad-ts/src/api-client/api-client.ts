import { version } from "../../package.json";
import { btoa } from "js-base64";
import { handleError } from "./handle-error";

export type BasicAuth = {
  login: string;
  password: string;
};

export type TokenAuth = {
  token: string;
};

export type Auth = BasicAuth | TokenAuth;

export type ApiClientOptions = {
  baseUrl?: string;
  userAgent?: string;
  auth: Auth;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: object;
  searchParameters?: URLSearchParams;
};
type RequestOptionsWithoutMethod = Omit<RequestOptions, "method">;

export class ApiClient {
  private baseUrl: string;
  private userAgent: string;
  private auth: Auth;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.moysklad.ru/api/remap/1.2";
    this.userAgent =
      options.userAgent ??
      `moysklad-ts/${version} (+https://github.com/MonsterDeveloper/moysklad-ts)`;

    this.auth = options.auth;
  }
  async request(endpoint: string, options: RequestOptions = {}) {
    const url = endpoint.startsWith("/") ? this.baseUrl + endpoint : endpoint;

    const response = await fetch(
      url + (options.searchParameters ? `?${options.searchParameters}` : ""),
      {
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers: {
          ...options.headers,
          Authorization:
            "token" in this.auth
              ? `Bearer ${this.auth.token}`
              : "Basic " + btoa(`${this.auth.login}:${this.auth.password}`),
          "User-Agent": this.userAgent,
          "Content-Type": "application/json",
          Accept: "application/json;charset=utf-8",
          "Accept-Encoding": "gzip",
        },
      },
    );

    if (!response.ok) await handleError(response);

    return response;
  }

  async get(url: string, options: RequestOptionsWithoutMethod = {}) {
    return this.request(url, { ...options, method: "GET" });
  }

  async post(url: string, options: RequestOptionsWithoutMethod = {}) {
    return this.request(url, { ...options, method: "POST" });
  }

  async put(url: string, options: RequestOptionsWithoutMethod = {}) {
    return this.request(url, { ...options, method: "PUT" });
  }

  async delete(url: string, options: RequestOptionsWithoutMethod = {}) {
    return this.request(url, { ...options, method: "DELETE" });
  }
}
