// =================== Galerie modale (整理版) ===================
// 存储与数据
const storage = sessionStorage;
const token   = storage.getItem('token');
const works   = JSON.parse(storage.getItem('works') || '[]');

// 画廊容器
const gallery = document.querySelector('#edit-bar #gallery');
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

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'del';
    del.setAttribute('aria-label', 'Supprimer'); // 或 '删除'

    // 图标 <i>
    const icon = document.createElement('i');
    icon.className = 'bi bi-trash3'; 

    del.appendChild(icon);

    // 如需模态里带删除按钮，可在外层决定是否追加
    fig.append(img, cap, del);
    frag.append(fig);
  }
  container.replaceChildren(frag);
}

renderGallery(works, gallery); // 渲染到模态


// 视图元素
const dlg         = document.querySelector('#edit-bar dialog');
const viewGallery = document.getElementById('view-gallery');
const viewAdd     = document.getElementById('view-add');

// 切页：只做显示/隐藏
function showGallery() {
  viewAdd?.classList.add('hidden');
  viewGallery?.classList.remove('hidden');
}
function showAdd() {
  viewGallery?.classList.add('hidden');
  viewAdd?.classList.remove('hidden');
}

// 打开/关闭/切换（确保元素存在再绑定）
const btnClose  = document.getElementById('close-modal');
const btnAddDlg = document.getElementById('btn-ajouter');

btnClose?.addEventListener('click', () => {
  if (dlg?.open && typeof dlg.close === 'function') dlg.close();
});

btnAddDlg?.addEventListener('click', () => {
  showAdd();
  if (typeof dlg?.showModal === 'function') dlg.showModal();
});


//supprimer Datas +++++++++++++++++++++++++++++++++++++
// 监听画廊内的删除按钮点击

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  gallery.addEventListener('click', async (e) => {
    const btn = e.target.closest('button.del');
    if (!btn) return;

    const fig = btn.closest('figure');
    const workId = Number.parseInt(fig?.dataset.id, 10);
    if (!Number.isInteger(workId)) return;

    const token = sessionStorage.getItem('token');
    if (!token) return alert('未授权，请先登录');
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
      const res = await fetch(`http://localhost:5678/api/works/${workId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const bodyText = await res.text().catch(() => '');
      if (res.status === 200 || res.status === 204) {
        // 更新缓存
        let cached = JSON.parse(sessionStorage.getItem('works') || '[]');
        cached = cached.filter(w => Number(w.id) !== workId);
        sessionStorage.setItem('works', JSON.stringify(cached));

        // 保持 modal 不关闭：不调用 dlg.close()
        // 为了避免滚动跳动，只移除该节点
        const y = gallery.scrollTop;
        fig.remove();
        gallery.scrollTop = y;

        // 可选：给个轻提示（不关 modal）
        // showMsg('删除成功');
        return;
      }

      if (res.status === 401) return alert('未授权，请重新登录（401）');
      if (res.status === 403) return alert('没有删除权限（403）');
      if (res.status === 404) return alert('作品不存在（404）');

      alert(`删除失败 (${res.status})${bodyText ? '：' + bodyText : ''}`);
    } catch (err) {
      console.error(err);
      alert('网络错误，请重试');
    }
  });
});



