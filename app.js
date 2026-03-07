// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── CONFIG ────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '34683149248'; // +34 683 14 92 48

// ─── STATE ─────────────────────────────────────────────────────────────────
let currentUser = null;
let selectedFile = null;
let currentArtwork = null;

// ─── ELEMENTS ──────────────────────────────────────────────────────────────
const adminNavBtn     = document.getElementById('adminNavBtn');
const loginModal      = document.getElementById('loginModal');
const loginClose      = document.getElementById('loginClose');
const loginForm       = document.getElementById('loginForm');
const loginEmail      = document.getElementById('loginEmail');
const loginPassword   = document.getElementById('loginPassword');
const loginError      = document.getElementById('loginError');
const loginSubmit     = document.getElementById('loginSubmit');

const uploadSection   = document.getElementById('upload');
const logoutBtn       = document.getElementById('logoutBtn');

const dropZone        = document.getElementById('dropZone');
const fileInput       = document.getElementById('fileInput');
const imagePreview    = document.getElementById('imagePreview');
const previewImg      = document.getElementById('previewImg');
const changeImage     = document.getElementById('changeImage');

const artTitle        = document.getElementById('artTitle');
const artDesc         = document.getElementById('artDesc');
const artPrice        = document.getElementById('artPrice');
const publishBtn      = document.getElementById('publishBtn');
const uploadProgress  = document.getElementById('uploadProgress');
const progressFill    = document.getElementById('progressFill');
const progressLabel   = document.getElementById('progressLabel');

const galleryGrid     = document.getElementById('galleryGrid');
const galleryCount    = document.getElementById('galleryCount');
const galleryLoading  = document.getElementById('galleryLoading');

const heroVisual      = document.getElementById('heroVisual');

const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxDesc    = document.getElementById('lightboxDesc');
const lightboxPrice   = document.getElementById('lightboxPrice');
const lightboxWhatsapp= document.getElementById('lightboxWhatsapp');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxDelete  = document.getElementById('lightboxDelete');

const toast           = document.getElementById('toast');
const toastMsg        = document.getElementById('toastMsg');

const contactForm     = document.getElementById('contactForm');
const contactSubmit   = document.getElementById('contactSubmit');

// ─── AUTH ───────────────────────────────────────────────────────────────────

adminNavBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (currentUser) {
    handleLogout();
  } else {
    openLoginModal();
  }
});

loginClose.addEventListener('click', closeLoginModal);
loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) closeLoginModal();
});

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

  const { data, error } = await db.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value,
  });

  loginSubmit.disabled = false;
  loginSubmit.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
    Ingresar`;

  if (error) {
    loginError.textContent = 'Email o contraseña incorrectos.';
    return;
  }

  closeLoginModal();
});

logoutBtn.addEventListener('click', handleLogout);

async function handleLogout() {
  await db.auth.signOut();
}

db.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user ?? null;
  updateUIForAuth();
});

function updateUIForAuth() {
  if (currentUser) {
    uploadSection.classList.remove('hidden');
    adminNavBtn.textContent = 'Cerrar sesión';
    adminNavBtn.style.background = 'var(--rust)';
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    uploadSection.classList.add('hidden');
    adminNavBtn.textContent = 'Admin';
    adminNavBtn.style.background = '';
    resetUploadForm();
  }
  if (lightboxDelete) {
    lightboxDelete.classList.toggle('hidden', !currentUser);
  }
}

// ─── HERO CON OBRAS REALES ──────────────────────────────────────────────────

function loadHeroImages(artworks) {
  // Tomar hasta las últimas 3 obras
  const picks = artworks.slice(0, 3);
  if (picks.length === 0) return; // sin obras → mantener placeholders

  const sizes = ['large', 'small', 'accent'];
  const animations = ['floatA', 'floatB', 'floatC'];

  // Reconstruir el hero-visual con imágenes reales
  heroVisual.innerHTML = '';

  picks.forEach((artwork, i) => {
    const card = document.createElement('div');
    card.className = `hero-card ${sizes[i]}`;
    card.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = artwork.image_url;
    img.alt = artwork.title;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';

    card.appendChild(img);
    card.addEventListener('click', () => openLightbox(artwork));
    heroVisual.appendChild(card);
  });

  // Si solo hay 1 o 2 obras, llenar el resto con placeholders vacíos
  for (let i = picks.length; i < 3; i++) {
    const card = document.createElement('div');
    card.className = `hero-card ${sizes[i]} hero-card-placeholder`;
    card.innerHTML = `<div class="placeholder-icon">
      <svg fill="none" stroke="rgba(100,80,60,0.3)" stroke-width="1.5" viewBox="0 0 24 24" width="32" height="32">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>`;
    heroVisual.appendChild(card);
  }
}

// ─── DRAG & DROP / FILE INPUT ───────────────────────────────────────────────

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelected(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFileSelected(fileInput.files[0]);
});

changeImage.addEventListener('click', () => fileInput.click());

function handleFileSelected(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Solo se aceptan imágenes (JPG, PNG, WEBP)', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('La imagen no puede superar los 10 MB', 'error');
    return;
  }

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

function updatePublishBtn() {
  publishBtn.disabled = !(selectedFile && artTitle.value.trim());
}

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
      .upload(fileName, selectedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: selectedFile.type,
      });

    if (storageError) throw storageError;

    setProgress(70, 'Guardando datos…');

    const { data: urlData } = db.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;
    const price = artPrice.value ? parseFloat(artPrice.value) : null;

    const { error: insertError } = await db
      .from('artworks')
      .insert({
        title: artTitle.value.trim(),
        description: artDesc.value.trim() || null,
        price: price,
        image_url: imageUrl,
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

  const { data, error } = await db
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false });

  galleryLoading.classList.add('hidden');

  if (error) {
    galleryCount.textContent = '';
    galleryGrid.innerHTML = `
      <div class="gallery-empty">
        <p>No se pudo cargar la galería</p>
        <span>Revisá tu conexión e intentá de nuevo</span>
      </div>`;
    return;
  }

  if (!data || data.length === 0) {
    galleryCount.textContent = '0 obras';
    galleryGrid.innerHTML = `
      <div class="gallery-empty">
        <p>La galería está vacía</p>
        <span>Subí tu primera creación para comenzar</span>
      </div>`;
    return;
  }

  // Actualizar hero con las últimas 3 obras
  loadHeroImages(data);

  galleryCount.textContent = `${data.length} ${data.length === 1 ? 'obra' : 'obras'}`;
  galleryGrid.innerHTML = '';

  data.forEach((artwork, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${i * 0.07}s`;

    const priceHtml = artwork.price != null
      ? `<span class="caption-price">€ ${formatPrice(artwork.price)}</span>`
      : '';

    item.innerHTML = `
      <img src="${artwork.image_url}" alt="${escapeHtml(artwork.title)}" loading="lazy" />
      <div class="gallery-caption">
        <span class="caption-title">${escapeHtml(artwork.title)}</span>
        ${priceHtml}
      </div>
    `;

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

  // Armar mensaje de WhatsApp con el nombre y precio de la obra
  const priceText = artwork.price != null ? ` (€ ${formatPrice(artwork.price)})` : '';
  const msg = encodeURIComponent(
    `Hola! Me interesa la obra "${artwork.title}"${priceText}. ¿Está disponible?`
  );
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
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ─── DELETE ─────────────────────────────────────────────────────────────────

lightboxDelete.addEventListener('click', async () => {
  if (!currentArtwork || !currentUser) return;

  const confirmed = confirm(`¿Eliminar "${currentArtwork.title}"? Esta acción no se puede deshacer.`);
  if (!confirmed) return;

  lightboxDelete.disabled = true;
  lightboxDelete.textContent = 'Eliminando…';

  try {
    if (currentArtwork.image_path) {
      await db.storage.from(STORAGE_BUCKET).remove([currentArtwork.image_path]);
    }

    const { error } = await db
      .from('artworks')
      .delete()
      .eq('id', currentArtwork.id);

    if (error) throw error;

    closeLightbox();
    showToast('Obra eliminada', 'success');
    loadGallery();

  } catch (err) {
    console.error(err);
    showToast('Error al eliminar', 'error');
  } finally {
    lightboxDelete.disabled = false;
    lightboxDelete.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
      Eliminar obra`;
  }
});

// ─── CONTACTO ───────────────────────────────────────────────────────────────

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMsg').value.trim();

  // Armar el mailto con los datos del form
  const subject = encodeURIComponent(`Consulta desde Sere Semilla — ${name}`);
  const body    = encodeURIComponent(
    `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`
  );

  // Abrir el cliente de mail
  window.location.href = `mailto:seresemilla@gmail.com?subject=${subject}&body=${body}`;

  showToast('Abriendo tu cliente de email…', 'success');
  contactForm.reset();
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
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── INIT ───────────────────────────────────────────────────────────────────

(async () => {
  const { data: { session } } = await db.auth.getSession();
  currentUser = session?.user ?? null;
  updateUIForAuth();
  loadGallery();
})();
