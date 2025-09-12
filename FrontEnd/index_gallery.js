// =================== Galerie modale (整理版) ===================
// 存储与数据
const storage = sessionStorage;
let works = JSON.parse(storage.getItem('works') || '[]');
if (!Array.isArray(works) || works.length === 0) {
  const res = await fetch('http://localhost:5678/api/works');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  works = await res.json();
  storage.setItem('works', JSON.stringify(works));
}
console.log('indexgqlleryWorks:', works);

const mainGallery = document.querySelector('#portfolio .gallery');

// 渲染相册
function renderGallery(list, container) {
  if (!container || !Array.isArray(list)) return;

  const frag = document.createDocumentFragment();
  for (const w of list) {
    const fig = document.createElement('figure');
    fig.dataset.id = w.id;

    if (w.category?.id) {
      fig.dataset.categoryId = w.category.id;
      fig.dataset.categoryName = w.category.name;
    } else if (w.categoryId) {
      fig.dataset.categoryId = w.categoryId;
    }

    const img = document.createElement('img');
    img.src = w.imageUrl;
    img.alt = w.title || '';
    img.loading = 'lazy';

    const cap = document.createElement('figcaption');
    cap.textContent = w.title || '';

    // 如需模态里带删除按钮，可在外层决定是否追加
    fig.append(img, cap);
    frag.append(fig);
  }
  container.replaceChildren(frag);
}

renderGallery(works, mainGallery);  // 渲染到主页