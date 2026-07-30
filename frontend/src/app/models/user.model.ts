export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  active?: boolean;
}
