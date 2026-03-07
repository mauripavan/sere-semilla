-- ══════════════════════════════════════════════════════════════════════════
-- SERE SEMILLA — Supabase Setup
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor → New query
-- Se puede correr múltiples veces sin errores (idempotente)
-- ══════════════════════════════════════════════════════════════════════════

-- 1. TABLA DE OBRAS ─────────────────────────────────────────────────────────
create table if not exists artworks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  title       text not null,
  description text,
  price       numeric(10, 2),
  image_url   text not null,
  image_path  text not null,
  user_id     uuid references auth.users(id) on delete cascade
);

-- 2. ROW LEVEL SECURITY ─────────────────────────────────────────────────────
alter table artworks enable row level security;

-- Limpiar policies anteriores (por si ya existen)
drop policy if exists "Lectura pública"           on artworks;
drop policy if exists "Solo admin puede insertar" on artworks;
drop policy if exists "Solo admin puede eliminar" on artworks;
drop policy if exists "Solo admin puede actualizar" on artworks;

-- Cualquiera puede VER las obras (galería pública)
create policy "Lectura pública"
  on artworks for select
  using (true);

-- Solo usuarios autenticados pueden INSERTAR obras
create policy "Solo admin puede insertar"
  on artworks for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Solo el dueño puede ELIMINAR su obra
create policy "Solo admin puede eliminar"
  on artworks for delete
  to authenticated
  using (auth.uid() = user_id);

-- Solo el dueño puede ACTUALIZAR su obra
create policy "Solo admin puede actualizar"
  on artworks for update
  to authenticated
  using (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES
-- Ejecutar DESPUÉS de crear el bucket "artworks" en Storage → New bucket
-- ══════════════════════════════════════════════════════════════════════════

-- Limpiar policies de storage anteriores
drop policy if exists "Lectura pública de imágenes"    on storage.objects;
drop policy if exists "Solo admin puede subir"         on storage.objects;
drop policy if exists "Solo admin puede eliminar imágenes" on storage.objects;

-- Cualquiera puede leer imágenes
create policy "Lectura pública de imágenes"
  on storage.objects for select
  using ( bucket_id = 'artworks' );

-- Solo autenticados pueden subir
create policy "Solo admin puede subir"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'artworks' );

-- Solo autenticados pueden eliminar
create policy "Solo admin puede eliminar imágenes"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'artworks' );
