# FRONTEND SYSTEM CONTEXT: SIMAMA

**Tech Stack:** Nuxt 4, Vue 3 (Composition API), Tailwind CSS v4, Pinia, VeeValidate & Zod.

## 1. PROJECT OVERVIEW

Frontend untuk Sistem Informasi Manajemen Magang (SIMAMA). Backend menggunakan Golang. Sistem menggunakan framework Nuxt 4 dengan arsitektur folder di dalam `/app`.

## 2. API INTEGRATION RULES

- Base URL API diambil dari environment variables (`useRuntimeConfig().public.apiBase` atau `.env`).
- Semua request API (kecuali login) WAJIB menyertakan header `Authorization: Bearer <token>`.
- Token Auth dikelola menggunakan Pinia store (`app/stores/auth.ts`) yang menggunakan `pinia-plugin-persistedstate`.
- Logic pemanggilan API (fetch/$fetch) dipisahkan ke dalam folder `app/services/`.

## 3. FILE STRUCTURE & NAMING CONVENTION

- Halaman/Routing berada di folder `app/pages/` dan berformat `.vue`.
- Komponen UI yang reusable berada di `app/components/` (seperti `app/components/table/`, `app/components/ui/`).
- Gunakan `<script setup lang="ts">` (Vue 3 Composition API) di semua komponen dan halaman.
- Layout menggunakan fitur bawaan Nuxt di folder `app/layouts/` (misal diset menggunakan `definePageMeta({ layout: 'admin' })`).

## 4. PERMISSION & RBAC HANDLING

Sistem ini menggunakan composable `usePermission()` untuk mengontrol hak akses halaman dan aksi (Action/Toolbar).
- **Proteksi Halaman:** Selalu definisikan permission saat memanggil `definePageMeta`. Contoh:
  ```ts
  definePageMeta({
    layout: "admin",
    permission: "REGISTRATION.VIEW",
  });
