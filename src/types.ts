export interface KeyPass {
  id: string;
  group?: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateKeyPassRequest {
  group?: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

export interface UpdateKeyPassRequest {
  group?: string;
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

export interface SearchResponse {
  items: KeyPass[];
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
