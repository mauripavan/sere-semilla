// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── CONFIG ────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER  = '34683149248';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreybgwk';

// ─── STATE ─────────────────────────────────────────────────────────────────
let currentUser  = null;
let selectedFile = null;
let currentArtwork = null;
let selectedPhotoFile = null;

// ─── ELEMENTS ──────────────────────────────────────────────────────────────
const adminNavBtn      = document.getElementById('adminNavBtn');
const loginModal       = document.getElementById('loginModal');
const loginClose       = document.getElementById('loginClose');
const loginForm        = document.getElementById('loginForm');
const loginEmail       = document.getElementById('loginEmail');
const loginPassword    = document.getElementById('loginPassword');
const loginError       = document.getElementById('loginError');
const loginSubmit      = document.getElementById('loginSubmit');

const adminPanel       = document.getElementById('adminPanel');
const logoutBtn        = document.getElementById('logoutBtn');

// Tabs
const adminTabs        = document.querySelectorAll('.admin-tab');
const adminSections    = document.querySelectorAll('.admin-section');

// Obras
const dropZone         = document.getElementById('dropZone');
const fileInput        = document.getElementById('fileInput');
const imagePreview     = document.getElementById('imagePreview');
const previewImg       = document.getElementById('previewImg');
const changeImage      = document.getElementById('changeImage');
const artTitle         = document.getElementById('artTitle');
const artDesc          = document.getElementById('artDesc');
const artPrice         = document.getElementById('artPrice');
const publishBtn       = document.getElementById('publishBtn');
const uploadProgress   = document.getElementById('uploadProgress');
const progressFill     = document.getElementById('progressFill');
const progressLabel    = document.getElementById('progressLabel');

// Galería
const galleryGrid      = document.getElementById('galleryGrid');
const galleryCount     = document.getElementById('galleryCount');
const galleryLoading   = document.getElementById('galleryLoading');
const heroVisual       = document.getElementById('heroVisual');

// Lightbox
const lightbox         = document.getElementById('lightbox');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxCaption  = document.getElementById('lightboxCaption');
const lightboxDesc     = document.getElementById('lightboxDesc');
const lightboxPrice    = document.getElementById('lightboxPrice');
const lightboxWhatsapp = document.getElementById('lightboxWhatsapp');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxDelete   = document.getElementById('lightboxDelete');

// Sobre mí — admin
const photoSelectBtn   = document.getElementById('photoSelectBtn');
const photoFileInput   = document.getElementById('photoFileInput');
const photoCurrentImg  = document.getElementById('photoCurrentImg');
const photoPlaceholder = document.getElementById('photoPlaceholder');
const aboutText1       = document.getElementById('aboutText1');
const aboutText2       = document.getElementById('aboutText2');
const saveAboutBtn     = document.getElementById('saveAboutBtn');
const aboutProgress    = document.getElementById('aboutProgress');
const aboutProgressFill= document.getElementById('aboutProgressFill');
const aboutProgressLabel=document.getElementById('aboutProgressLabel');

// Sobre mí — público
const publicAboutText1 = document.getElementById('publicAboutText1');
const publicAboutText2 = document.getElementById('publicAboutText2');
const aboutPublicPhoto = document.getElementById('aboutPublicPhoto');
const aboutPhotoPlaceholder = document.getElementById('aboutPhotoPlaceholder');

// Sitio — admin
const siteHeroTitleMain  = document.getElementById('siteHeroTitleMain');
const siteHeroTitleEm    = document.getElementById('siteHeroTitleEm');
const siteHeroDescription= document.getElementById('siteHeroDescription');
const siteProjectsIntro  = document.getElementById('siteProjectsIntro');
const saveSiteBtn        = document.getElementById('saveSiteBtn');

// Hero — público
const heroTitleMain    = document.getElementById('heroTitleMain');
const heroTitleEm      = document.getElementById('heroTitleEm');
const heroDescription  = document.getElementById('heroDescription');
const projectsIntro    = document.getElementById('projectsIntro');

// (proyectos ahora son dinámicos — ver sección PROYECTOS DINÁMICOS)

// Contacto
const contactForm      = document.getElementById('contactForm');
const contactSubmit    = document.getElementById('contactSubmit');

// Toast
const toast            = document.getElementById('toast');
const toastMsg         = document.getElementById('toastMsg');

// ─── AUTH ───────────────────────────────────────────────────────────────────

adminNavBtn.addEventListener('click', (e) => {
  e.preventDefault();
  currentUser ? handleLogout() : openLoginModal();
});

loginClose.addEventListener('click', closeLoginModal);
loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });

function openLoginModal() {
  loginModal.classList.add('open');
  loginEmail.focus();
  loginError.textContent = '';
}

function closeLoginModal() {
  loginModal.classList.remove('open');
  loginForm.reset();
  loginError.textContent = '';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Ingresando…';

  const { error } = await db.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value,
  });

  loginSubmit.disabled = false;
  loginSubmit.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Ingresar`;

  if (error) { loginError.textContent = 'Email o contraseña incorrectos.'; return; }
  closeLoginModal();
});

logoutBtn.addEventListener('click', handleLogout);

async function handleLogout() { await db.auth.signOut(); }

db.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user ?? null;
  updateUIForAuth();
});

function updateUIForAuth() {
  if (currentUser) {
    adminPanel.classList.remove('hidden');
    adminNavBtn.textContent = 'Cerrar sesión';
    adminNavBtn.style.background = 'var(--rust)';
    loadAdminContent();
    adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    adminPanel.classList.add('hidden');
    adminNavBtn.textContent = 'Admin';
    adminNavBtn.style.background = '';
    resetUploadForm();
  }
  lightboxDelete.classList.toggle('hidden', !currentUser);
}

// ─── ADMIN TABS ──────────────────────────────────────────────────────────────

adminTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    adminTabs.forEach(t => t.classList.remove('active'));
    adminSections.forEach(s => s.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.remove('hidden');
  });
});

// ─── SITE CONTENT (solo sobre mí) ───────────────────────────────────────────

async function loadSiteContent() {
  const { data, error } = await db.from('site_content').select('*');
  if (error || !data) return;

  const content = {};
  data.forEach(row => { content[row.key] = row.value; });

  // Actualizar sección pública — Sobre mí
  if (content.about_text_1) publicAboutText1.textContent = content.about_text_1;
  if (content.about_text_2) publicAboutText2.textContent = content.about_text_2;
  if (content.about_photo && content.about_photo !== '') {
    aboutPublicPhoto.src = content.about_photo;
    aboutPublicPhoto.classList.remove('hidden');
    aboutPhotoPlaceholder.classList.add('hidden');
  }

  // Actualizar sección pública — Hero y proyectos
  if ('hero_title_main' in content) heroTitleMain.textContent = content.hero_title_main;
  if ('hero_title_em' in content) {
    if (content.hero_title_em === '') {
      heroTitleEm.classList.add('hidden');
    } else {
      heroTitleEm.textContent = content.hero_title_em;
      heroTitleEm.classList.remove('hidden');
    }
  }
  if ('hero_description' in content) heroDescription.textContent = content.hero_description;
  if ('projects_intro' in content) projectsIntro.textContent = content.projects_intro;

  return content;
}

async function loadAdminContent() {
  const content = await loadSiteContent();
  if (!content) return;

  // Rellenar campos del panel admin — Sobre mí
  aboutText1.value = content.about_text_1 || '';
  aboutText2.value = content.about_text_2 || '';
  if (content.about_photo && content.about_photo !== '') {
    photoCurrentImg.src = content.about_photo;
    photoCurrentImg.classList.remove('hidden');
    photoPlaceholder.classList.add('hidden');
  }

  // Rellenar campos del panel admin — Sitio
  siteHeroTitleMain.value   = content.hero_title_main  || '';
  siteHeroTitleEm.value     = content.hero_title_em    || '';
  siteHeroDescription.value = content.hero_description || '';
  siteProjectsIntro.value   = content.projects_intro   || '';

  // Cargar proyectos en el panel admin
  loadAdminProjects();
}

async function upsertContent(key, value) {
  return db.from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

// ─── PROYECTOS DINÁMICOS ─────────────────────────────────────────────────────

const publicProjectsGrid = document.getElementById('publicProjectsGrid');
const projectsAdminList  = document.getElementById('projectsAdminList');
const addProjectBtn      = document.getElementById('addProjectBtn');

async function loadPublicProjects() {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('position', { ascending: true });

  if (error || !data) {
    publicProjectsGrid.innerHTML = '';
    return;
  }

  if (data.length === 0) {
    publicProjectsGrid.innerHTML = `<p style="color:var(--sand);font-size:.9rem;grid-column:1/-1">Próximamente…</p>`;
    return;
  }

  publicProjectsGrid.innerHTML = '';
  data.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-num">${String(i + 1).padStart(2, '0')}</div>
      <h3>${escapeHtml(proj.title)}</h3>
      <p>${escapeHtml(proj.description || '')}</p>
      <span class="project-tag">${escapeHtml(proj.tag || '')}</span>
    `;
    publicProjectsGrid.appendChild(card);
  });
}

async function loadAdminProjects() {
  projectsAdminList.innerHTML = `<div class="projects-admin-loading"><div class="spinner"></div></div>`;

  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('position', { ascending: true });

  projectsAdminList.innerHTML = '';

  if (error) {
    projectsAdminList.innerHTML = `<p style="color:var(--rust);font-size:.85rem;">Error al cargar proyectos.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    renderAdminProjectCard(null, 1); // mostrar card vacío para empezar
    return;
  }

  data.forEach((proj, i) => renderAdminProjectCard(proj, i + 1));
}

function renderAdminProjectCard(proj, num) {
  const card = document.createElement('div');
  card.className = 'project-edit-card';
  if (proj) card.dataset.id = proj.id;

  card.innerHTML = `
    <div class="project-edit-card-header">
      <div class="project-edit-num">${String(num).padStart(2, '0')}</div>
      <div class="project-edit-actions">
        <button class="btn-save-project" title="Guardar este proyecto">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Guardar
        </button>
        <button class="btn-delete-project" title="Eliminar proyecto">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Eliminar
        </button>
      </div>
    </div>
    <div class="field-group">
      <label>Título *</label>
      <input type="text" class="proj-title" placeholder="Nombre del proyecto" value="${escapeHtml(proj?.title || '')}" />
    </div>
    <div class="field-group">
      <label>Descripción</label>
      <textarea class="proj-desc" rows="3" placeholder="Describí este proyecto…">${escapeHtml(proj?.description || '')}</textarea>
    </div>
    <div class="field-group">
      <label>Etiqueta</label>
      <input type="text" class="proj-tag" placeholder="Ej: Serie · 2024" value="${escapeHtml(proj?.tag || '')}" />
    </div>
  `;

  // Botón guardar
  card.querySelector('.btn-save-project').addEventListener('click', async () => {
    const titleInput = card.querySelector('.proj-title');
    const title = titleInput.value.trim();
    if (!title) { showToast('El título es obligatorio', 'error'); titleInput.focus(); return; }

    const saveBtn = card.querySelector('.btn-save-project');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando…';

    const payload = {
      title,
      description: card.querySelector('.proj-desc').value.trim() || null,
      tag:         card.querySelector('.proj-tag').value.trim() || null,
      position:    [...projectsAdminList.children].indexOf(card) + 1,
    };

    let error;
    if (card.dataset.id) {
      // Update
      ({ error } = await db.from('projects').update(payload).eq('id', card.dataset.id));
    } else {
      // Insert
      const { data, error: insertErr } = await db.from('projects').insert(payload).select().single();
      error = insertErr;
      if (data) card.dataset.id = data.id;
    }

    saveBtn.disabled = false;
    saveBtn.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Guardar`;

    if (error) { showToast('Error al guardar', 'error'); return; }

    showToast('Proyecto guardado ✓', 'success');
    loadPublicProjects(); // actualizar vista pública
    renumberAdminCards();
  });

  // Botón eliminar
  card.querySelector('.btn-delete-project').addEventListener('click', async () => {
    if (!confirm('¿Eliminar este proyecto?')) return;

    if (card.dataset.id) {
      const { error } = await db.from('projects').delete().eq('id', card.dataset.id);
      if (error) { showToast('Error al eliminar', 'error'); return; }
    }

    card.remove();
    renumberAdminCards();
    showToast('Proyecto eliminado', 'success');
    loadPublicProjects();
  });

  projectsAdminList.appendChild(card);
}

function renumberAdminCards() {
  [...projectsAdminList.children].forEach((card, i) => {
    const numEl = card.querySelector('.project-edit-num');
    if (numEl) numEl.textContent = String(i + 1).padStart(2, '0');
  });
}

addProjectBtn.addEventListener('click', () => {
  const num = projectsAdminList.children.length + 1;
  renderAdminProjectCard(null, num);
  // Scroll al nuevo card
  projectsAdminList.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ─── GUARDAR SOBRE MÍ ────────────────────────────────────────────────────────

photoSelectBtn.addEventListener('click', () => photoFileInput.click());

photoFileInput.addEventListener('change', () => {
  const file = photoFileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Solo imágenes JPG o PNG', 'error'); return; }
  if (file.size > 5 * 1024 * 1024)     { showToast('Máximo 5 MB', 'error'); return; }

  selectedPhotoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    photoCurrentImg.src = e.target.result;
    photoCurrentImg.classList.remove('hidden');
    photoPlaceholder.classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

saveAboutBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  saveAboutBtn.disabled = true;
  aboutProgress.classList.remove('hidden');
  setAboutProgress(10, 'Guardando…');

  try {
    let photoUrl = null;

    // Subir foto si eligió una nueva
    if (selectedPhotoFile) {
      setAboutProgress(30, 'Subiendo foto…');
      const ext = selectedPhotoFile.name.split('.').pop().toLowerCase();
      const fileName = `profile/photo-${Date.now()}.${ext}`;

      const { error: uploadErr } = await db.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, selectedPhotoFile, { upsert: true, contentType: selectedPhotoFile.type });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = db.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
      photoUrl = urlData.publicUrl;
      selectedPhotoFile = null;
    }

    setAboutProgress(60, 'Guardando textos…');

    const updates = [
      upsertContent('about_text_1', aboutText1.value.trim()),
      upsertContent('about_text_2', aboutText2.value.trim()),
    ];
    if (photoUrl) updates.push(upsertContent('about_photo', photoUrl));

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed) throw failed.error;

    setAboutProgress(100, '¡Guardado!');
    showToast('Sección "Sobre mí" actualizada', 'success');

    // Reflejar en la página pública inmediatamente
    publicAboutText1.textContent = aboutText1.value.trim();
    publicAboutText2.textContent = aboutText2.value.trim();
    if (photoUrl) {
      aboutPublicPhoto.src = photoUrl;
      aboutPublicPhoto.classList.remove('hidden');
      aboutPhotoPlaceholder.classList.add('hidden');
    }

    setTimeout(() => aboutProgress.classList.add('hidden'), 1500);

  } catch (err) {
    console.error(err);
    showToast('Error al guardar. Intentá de nuevo.', 'error');
  } finally {
    saveAboutBtn.disabled = false;
  }
});

function setAboutProgress(pct, label) {
  aboutProgressFill.style.width = pct + '%';
  aboutProgressLabel.textContent = label;
}

// ─── GUARDAR SITIO ────────────────────────────────────────────────────────────

saveSiteBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  saveSiteBtn.disabled = true;

  try {
    const results = await Promise.all([
      upsertContent('hero_title_main',  siteHeroTitleMain.value.trim()),
      upsertContent('hero_title_em',    siteHeroTitleEm.value.trim()),
      upsertContent('hero_description', siteHeroDescription.value.trim()),
      upsertContent('projects_intro',   siteProjectsIntro.value.trim()),
    ]);
    const failed = results.find(r => r.error);
    if (failed) throw failed.error;

    await loadSiteContent();
    showToast('Contenido del sitio actualizado', 'success');

  } catch (err) {
    console.error(err);
    showToast('Error al guardar. Intentá de nuevo.', 'error');
  } finally {
    saveSiteBtn.disabled = false;
  }
});

// ─── HERO CON OBRAS REALES ──────────────────────────────────────────────────

function loadHeroImages(artworks) {
  const picks = artworks.slice(0, 3);
  if (picks.length === 0) return;

  const sizes = ['large', 'small', 'accent'];
  heroVisual.innerHTML = '';

  picks.forEach((artwork, i) => {
    const card = document.createElement('div');
    card.className = `hero-card ${sizes[i]}`;
    card.style.cursor = 'pointer';
    const img = document.createElement('img');
    img.src = artwork.image_url;
    img.alt = artwork.title;
    card.appendChild(img);
    card.addEventListener('click', () => openLightbox(artwork));
    heroVisual.appendChild(card);
  });

  for (let i = picks.length; i < 3; i++) {
    const card = document.createElement('div');
    card.className = `hero-card ${sizes[i]} hero-card-placeholder`;
    card.innerHTML = `<div class="placeholder-icon"><svg fill="none" stroke="rgba(100,80,60,0.3)" stroke-width="1.5" viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
    heroVisual.appendChild(card);
  }
}

// ─── DRAG & DROP / FILE INPUT ───────────────────────────────────────────────

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault(); dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelected(file);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFileSelected(fileInput.files[0]); });
changeImage.addEventListener('click', () => fileInput.click());

function handleFileSelected(file) {
  if (!file.type.startsWith('image/')) { showToast('Solo se aceptan imágenes (JPG, PNG, WEBP)', 'error'); return; }
  if (file.size > 10 * 1024 * 1024)   { showToast('La imagen no puede superar los 10 MB', 'error'); return; }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    dropZone.classList.add('hidden');
    imagePreview.classList.remove('hidden');
    updatePublishBtn();
  };
  reader.readAsDataURL(file);
}

artTitle.addEventListener('input', updatePublishBtn);
function updatePublishBtn() { publishBtn.disabled = !(selectedFile && artTitle.value.trim()); }

function resetUploadForm() {
  selectedFile = null;
  fileInput.value = '';
  artTitle.value = '';
  artDesc.value = '';
  artPrice.value = '';
  previewImg.src = '';
  dropZone.classList.remove('hidden');
  imagePreview.classList.add('hidden');
  uploadProgress.classList.add('hidden');
  progressFill.style.width = '0%';
  updatePublishBtn();
}

// ─── PUBLISH ────────────────────────────────────────────────────────────────

publishBtn.addEventListener('click', async () => {
  if (!selectedFile || !artTitle.value.trim()) return;
  if (!currentUser) { openLoginModal(); return; }

  publishBtn.disabled = true;
  uploadProgress.classList.remove('hidden');
  setProgress(10, 'Preparando imagen…');

  try {
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    setProgress(30, 'Subiendo imagen…');

    const { error: storageError } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false, contentType: selectedFile.type });

    if (storageError) throw storageError;
    setProgress(70, 'Guardando datos…');

    const { data: urlData } = db.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    const price = artPrice.value ? parseFloat(artPrice.value) : null;

    const { error: insertError } = await db.from('artworks').insert({
      title: artTitle.value.trim(),
      description: artDesc.value.trim() || null,
      price,
      image_url: urlData.publicUrl,
      image_path: fileName,
      user_id: currentUser.id,
    });

    if (insertError) throw insertError;
    setProgress(100, '¡Publicado!');

    setTimeout(() => {
      resetUploadForm();
      showToast('¡Obra publicada en la galería!', 'success');
      loadGallery();
      document.getElementById('galeria').scrollIntoView({ behavior: 'smooth' });
    }, 600);

  } catch (err) {
    console.error(err);
    showToast('Error al publicar. Intentá de nuevo.', 'error');
    publishBtn.disabled = false;
    uploadProgress.classList.add('hidden');
    updatePublishBtn();
  }
});

function setProgress(pct, label) {
  progressFill.style.width = pct + '%';
  progressLabel.textContent = label;
}

// ─── GALLERY ────────────────────────────────────────────────────────────────

async function loadGallery() {
  galleryGrid.innerHTML = '';
  galleryGrid.appendChild(galleryLoading);
  galleryLoading.classList.remove('hidden');

  const { data, error } = await db.from('artworks').select('*').order('created_at', { ascending: false });
  galleryLoading.classList.add('hidden');

  if (error) {
    galleryCount.textContent = '';
    galleryGrid.innerHTML = `<div class="gallery-empty"><p>No se pudo cargar la galería</p><span>Revisá tu conexión e intentá de nuevo</span></div>`;
    return;
  }

  if (!data || data.length === 0) {
    galleryCount.textContent = '0 obras';
    galleryGrid.innerHTML = `<div class="gallery-empty"><p>La galería está vacía</p><span>Subí tu primera creación para comenzar</span></div>`;
    return;
  }

  loadHeroImages(data);
  galleryCount.textContent = `${data.length} ${data.length === 1 ? 'obra' : 'obras'}`;
  galleryGrid.innerHTML = '';

  data.forEach((artwork, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${i * 0.07}s`;
    const priceHtml = artwork.price != null ? `<span class="caption-price">€ ${formatPrice(artwork.price)}</span>` : '';
    item.innerHTML = `
      <img src="${artwork.image_url}" alt="${escapeHtml(artwork.title)}" loading="lazy" />
      <div class="gallery-caption">
        <span class="caption-title">${escapeHtml(artwork.title)}</span>
        ${priceHtml}
      </div>`;
    item.addEventListener('click', () => openLightbox(artwork));
    galleryGrid.appendChild(item);
  });
}

// ─── LIGHTBOX ───────────────────────────────────────────────────────────────

function openLightbox(artwork) {
  currentArtwork = artwork;
  lightboxImg.src = artwork.image_url;
  lightboxImg.alt = artwork.title;
  lightboxCaption.textContent = artwork.title;
  lightboxDesc.textContent = artwork.description || '';
  lightboxPrice.textContent = artwork.price != null ? `€ ${formatPrice(artwork.price)}` : '';
  const priceText = artwork.price != null ? ` (€ ${formatPrice(artwork.price)})` : '';
  const msg = encodeURIComponent(`Hola! Me interesa la obra "${artwork.title}"${priceText}. ¿Está disponible?`);
  lightboxWhatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  lightboxDelete.classList.toggle('hidden', !currentUser);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  currentArtwork = null;
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ─── DELETE ─────────────────────────────────────────────────────────────────

lightboxDelete.addEventListener('click', async () => {
  if (!currentArtwork || !currentUser) return;
  if (!confirm(`¿Eliminar "${currentArtwork.title}"? Esta acción no se puede deshacer.`)) return;

  lightboxDelete.disabled = true;
  lightboxDelete.textContent = 'Eliminando…';

  try {
    if (currentArtwork.image_path) {
      await db.storage.from(STORAGE_BUCKET).remove([currentArtwork.image_path]);
    }
    const { error } = await db.from('artworks').delete().eq('id', currentArtwork.id);
    if (error) throw error;
    closeLightbox();
    showToast('Obra eliminada', 'success');
    loadGallery();
  } catch (err) {
    console.error(err);
    showToast('Error al eliminar', 'error');
  } finally {
    lightboxDelete.disabled = false;
    lightboxDelete.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg> Eliminar obra`;
  }
});

// ─── CONTACTO ───────────────────────────────────────────────────────────────

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactSubmit.disabled = true;
  contactSubmit.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Enviando…`;

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name:    document.getElementById('contactName').value.trim(),
        email:   document.getElementById('contactEmail').value.trim(),
        message: document.getElementById('contactMsg').value.trim(),
      }),
    });
    if (!res.ok) throw new Error();
    showToast('¡Mensaje enviado! Te respondo pronto.', 'success');
    contactForm.reset();
  } catch {
    showToast('No se pudo enviar. Intentá de nuevo.', 'error');
  } finally {
    contactSubmit.disabled = false;
    contactSubmit.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar mensaje`;
  }
});

// ─── TOAST ──────────────────────────────────────────────────────────────────

let toastTimer;
function showToast(msg, type = 'success') {
  toastMsg.textContent = msg;
  toast.classList.remove('show', 'success', 'error');
  void toast.offsetWidth;
  toast.classList.add('show', type);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ───────────────────────────────────────────────────────────────────

(async () => {
  const { data: { session } } = await db.auth.getSession();
  currentUser = session?.user ?? null;
  updateUIForAuth();
  loadGallery();
  loadSiteContent();    // cargar textos sobre mí sin necesidad de login
  loadPublicProjects(); // cargar proyectos públicos
})();
