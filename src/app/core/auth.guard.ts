import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // ឆែកមើល Token ផ្ទាល់

  if (token) {
    return true; // បើមាន Token ឱ្យចូល Chat
  } else {
    return router.createUrlTree(['/login']); // បើអត់ទេ រុញទៅ Login
  }
};