const API_URL = 'http://127.0.0.1:8000';

export const authService = {
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Server returned error (${response.status})`;
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error('Backend server is offline. Please make sure the FastAPI backend is running on http://127.0.0.1:8000');
      }
      throw err;
    }
  },

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const data = await this.request('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  },

  async register(email, password, fullName, role = 'developer') {
    return this.request('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        role,
        is_active: true,
      }),
    });
  },

  async getMe() {
    return this.request('/api/auth/me');
  },
};

export const usersService = {
  async getAll() {
    return authService.request('/api/users');
  },

  async create(userData) {
    return authService.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  async update(userId, userData) {
    return authService.request(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  async delete(userId) {
    return authService.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

export const projectsService = {
  async getAll(workspaceId = null, status = null) {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return authService.request(`/api/projects${qs}`);
  },

  async getById(id) {
    return authService.request(`/api/projects/${id}`);
  },

  async create(projectData) {
    return authService.request('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
  },

  async update(id, projectData) {
    return authService.request(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
  },

  async delete(id) {
    return authService.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

export const tasksService = {
  async getAll(projectId = null) {
    let endpoint = '/api/tasks';
    if (projectId) {
      endpoint += `?project_id=${projectId}`;
    }
    return authService.request(endpoint);
  },

  async create(taskData) {
    return authService.request('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
  },

  async update(id, taskData) {
    return authService.request(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
  },

  async delete(id) {
    return authService.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

export const dashboardService = {
  async getStats() {
    return authService.request('/api/dashboard/stats');
  },
};

export const reviewsService = {
  async getAll(projectId = null) {
    let endpoint = '/api/reviews';
    if (projectId) {
      endpoint += `?project_id=${projectId}`;
    }
    return authService.request(endpoint);
  },

  async create(reviewData) {
    return authService.request('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
  },

  async update(id, reviewData) {
    return authService.request(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
  },

  async delete(id) {
    return authService.request(`/api/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

export const organizationsService = {
  async getOrganizations() {
    return authService.request('/api/organizations');
  },

  async createOrganization(orgData) {
    return authService.request('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData),
    });
  },

  async getWorkspaces(orgId) {
    return authService.request(`/api/organizations/${orgId}/workspaces`);
  },

  async createWorkspace(orgId, wsData) {
    return authService.request(`/api/organizations/${orgId}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wsData),
    });
  },

  async getWorkspaceMembers(wsId) {
    return authService.request(`/api/organizations/workspaces/${wsId}/members`);
  },
};





