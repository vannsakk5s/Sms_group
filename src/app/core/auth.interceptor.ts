import { HttpInterceptorFn } from '@angular/common/http';

// ក្នុង core/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // ទាញយកដោយផ្ទាល់ពី localStorage
  
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};