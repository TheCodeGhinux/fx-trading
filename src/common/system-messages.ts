export const USER_LOGIN_SUCCESSFULLY = 'User logged in successfully';
export const USER_CREATION_FAILED = 'User creation failed';
export const USER_NOT_AUTHORIZED =
  'User is not authorized to perform this action';

export const USER_ALREADY_EXISTS = 'User already exists';
export const INTERNAL_SERVER_ERROR = 'Internal Server Error';
export const RESOURCE_ACTION = (resource: string, action: string, id?: string) => {
  if (id) {
    return `${resource} with ${id} ${action} `;
  }
  return `${resource} ${action} `;
};
export const RESOURCE_FETCHED = (resource: string, id?: string) => {
  if (id) {
    return `${resource} with ${id} feteched successfully `;
  }
  return `${resource} fetched successfully `;
};
export const RESOURCE_INVALID = (resource: string, id?: string) => {
  if (id) {
    return `${resource} with ${id} is invalid `;
  }
  return `${resource} is invalid `;
};
export const RESOURCE_EXISTS = (resource: string, id?: string) => {
  if (id) {
    return `${resource} with ${id} already exists `;
  }
  return `${resource} already exists `;
};
export const RESOURCE_NOT_FOUD = (resource: string, id?: string) => {
  if (id) {
    return `${resource} with ${id} not found `;
  }
  return `${resource} not found `;
};
export const RESOURCE_UPDATED = (resource: string, id?: string) => {
  if(id) {
    return `${resource} with ${id} updated successfully `;
  }
  return `${resource} updated successfully `;
};
export const RESOURCE_CREATED = (resource: string, id?: string) => {
    if(id) {
    return `${resource} with ${id} created successfully `;
  }
  return `${resource} created successfully `;
};
export const RESOURCE_DELETED = (resource: string, id?: string) => {
  if (id) {
    return `${resource} with ${id} deleted successfully `;
  }
  return `${resource} deleted successfully `;
};

export const AUTH_TOKEN_INVALID = 'Invalid authentication token';
export const AUTH_TOKEN_EXPIRED = 'Expired authentication token';
export const USER_NOT_AUTHENTICATED =
  'Authentication is required to access this resource.';
export const UNAUTHORIZED_ACTION = 'Unauthorized to perform this action';

export const INVALID_CREDENTIALS = 'Invalid credentials';
export const LOGIN_ERROR = 'An error occurred during login';
export const INVALID_LOGIN_CREDENTIALS = 'Invalid Email or Password';

export const INVALID_PARAMETER = (param: string) => `${param} is required`;
export const RESOURCE_NOT_FOUND = (resource: string) => `${resource} not found`;
export const FORBIDDEN_ACTION = 'Access to this resource is forbidden';

