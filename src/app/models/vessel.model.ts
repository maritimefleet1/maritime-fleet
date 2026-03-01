// Standard response format from our Spring Boot backend
export interface ApiResponse<T> {
  status: number;  // 1 for success, -1 for error
  message: string;
  data: T;
}

export interface Vessel {
  id?: number;
  name: string;
  imo: string;
  type: string;
  status: string;
  createdOn?: string;
  updatedAt?: string;
}