// =================== 你的方法：保持不变 ===================
function showGallery() {
  viewAdd.classList.add('hidden'); 
  viewGallery.classList.remove('hidden');
}
function showAdd() {
  viewGallery.classList.add('hidden'); 
  viewAdd.classList.remove('hidden');
}

function showPreview(file) {
  const preview    = document.querySelector('.preview');
  const uploadarea = document.querySelector('.upload-area');
  if (!(preview instanceof HTMLImageElement)) {
    alert('预览区域不存在：请添加 <img id="preview">');
    return;
  }

  const url = URL.createObjectURL(file);
  console.log('[preview] url =', url);

  preview.onload = () => {
    URL.revokeObjectURL(url);
    preview.classList.remove('hidden');    // 显示图片
    uploadarea?.classList?.add('hidden');  // 隐藏上传区
    console.log('[preview] loaded');
  };

  preview.onerror = () => {
    URL.revokeObjectURL(url);
    resetPreview('预览失败：文件不是有效图片');
    console.warn('[preview] error');
  };

  preview.src = url; // 放最后
}


function isImageFile(f) {
  if (!f) return false;
  if (f.type) return f.type.startsWith('image/');                 // 常规路径
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || '');   // 兜底：看扩展名
}
function showMsg(text){
  const dlg = document.getElementById('msg');
  document.getElementById('msg-text').textContent = text;

  if (typeof dlg.showModal === 'function') {
    dlg.showModal();            // ouvrir la boîte de dialogue
  } else {
    alert(text);                // solution de repli pour les anciens navigateurs
  }
}

function clearPreview() {
  const preview    = document.querySelector('.preview');
  const uploadarea = document.querySelector('.upload-area');
  const fileIn     = document.querySelector('.file');

  // 隐藏预览、显示上传区、清掉 src
  if (preview) {
    preview.removeAttribute('src');
    preview.classList.add('hidden');
  }
  uploadarea?.classList?.remove('hidden');

  // 清空文件输入
  if (fileIn) fileIn.value = '';
}

// =================== DOM 与常量 ===================
const dlg         = document.querySelector('#edit-bar dialog');
const viewGallery = document.getElementById('view-gallery');
const viewAdd     = document.querySelector('.viewadd');

// 分类与下拉
const categories  = JSON.parse(sessionStorage.getItem('categories') || '[]');
const select      = document.getElementById('category');

// 文件与预览
const btnAdd      = document.querySelector('.btn-addphoto');
const fileIn      = document.querySelector('.file');
const preview     = document.querySelector('.preview');
const uploadarea  = document.querySelector('.upload-area');

// 表单与按钮
const form        = document.getElementById('add-form');
const title       = document.getElementById('title');
const submitBtn   = form.querySelector('.btn-primary');

// —— 兼容你后面用了 file / category 的写法（不改你方法，做别名桥接）
// const file     = fileIn;
// const category = select;

// =================== 事件与初始化（整合后只绑定一次） ===================
document.addEventListener('DOMContentLoaded', () => {
  // 关闭与返回：回到相册
  document.addEventListener('click', (e) => {
  if (e.target.closest('.back-modal')) {
    e.preventDefault();
    showGallery();
    clearPreview();
  }
});

 document.addEventListener('click', (e) => {
  if (!e.target.closest('.close-modal')) return;
  e.preventDefault();
  if (dlg?.open && typeof dlg.close === 'function') dlg.close();
  showGallery();
  clearPreview();
});

  // 添加并预览图片（使用你的 showPreview）
  if (btnAdd) btnAdd.addEventListener('click', () => fileIn.click());
  if (fileIn) fileIn.addEventListener('change', () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    if (isImageFile(f)) {
      // 是图片：进入预览（内部会切换可见性）
      showPreview(f);
    } else {
      //  不是图片：清空预览，显示上传区并提示
      const preview    = document.querySelector('.preview');
      const uploadarea = document.querySelector('.upload-area');
      preview?.removeAttribute('src');
      preview?.classList?.add('hidden');
      uploadarea?.classList?.remove('hidden');
      alert('请选择图片文件');
  }
  });


  // 生成分类下拉菜单（value=分类 id，text=分类名）
  if (select) {
    if (select.options[0] && select.options[0].value === '') 
    {
     select.remove(0);                       // 去掉占位
    }
    const frag = document.createDocumentFragment();
    categories.forEach(c => frag.append(new Option(c.name, c.id)));
    select.append(frag);
  }


  // =================== 提交：FormData 上传（保持你的字段与流程） ===================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ⇩⇩⇩ 新增：一次性检查缺失项并提示
    const p = fileIn.files && fileIn.files[0];
    const missing = [];
  if (!p)        missing.push('图片');
  if (!title) missing.push('标题');
  if (!select)    missing.push('分类');
  if (missing.length) { alert('请先完成：' + missing.join('、')); return; }


    const f = fileIn.files[0];
    if (!f.type.startsWith('image/')) return alert('请选择图片文件');
    if (f.size > 4 * 1024 * 1024)      return alert('图片不能超过 4MB');

    const fd = new FormData();
    fd.append('image', f);
    fd.append('title', title.value.trim());
    fd.append('category', select.value); // 你原本的写法：保证 option 的 value 是 id

    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd, // 别手动设 Content-Type
      });
      if (!res.ok) {
        if (res.status === 401) return alert('未授权，请重新登录');
        return alert(`上传失败 (${res.status})`);
      }

      const newWork = await res.json();
      alert('上传成功');

      // 重置
      form.reset();
      submitBtn.disabled = true;
      if (preview) { preview.removeAttribute('src'); preview.classList.add('hidden'); }
      uploadarea?.classList?.remove?.('hidden');

      // 如需刷新画廊，保持你的注释
      const works = JSON.parse(sessionStorage.getItem('works') || '[]');
      works.push(newWork);
      sessionStorage.setItem('works', JSON.stringify(works));
      if (typeof renderGallery === 'function') renderGallery(works);

    } catch (err) {
      console.error(err);
      alert('网络错误，请重试');
    }
  });
});






