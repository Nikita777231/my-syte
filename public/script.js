/* ---------- ПОИСК ---------- */
const searchForm = document.getElementById('searchForm');
const resultDiv  = document.getElementById('result');

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('orderId').value.trim();
  if (!id) return;
  try {
    const res = await fetch(`/api/order/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error((await res.json()).error || 'Не найдено');
    const o = await res.json();

    document.getElementById('rId').textContent     = o.Номер_Заказа;
    document.getElementById('rLength').textContent = o.Высота;
    document.getElementById('rWidth').textContent  = o.Ширина;
    document.getElementById('rHeight').textContent = o.Толщина;
    document.getElementById('rPrice').textContent  = o.Цена;
    document.getElementById('rAddress').textContent= o.Адрес_Доставки;
    document.getElementById('rEquipment').textContent = o.Комплектация;
    document.getElementById('rDescription').textContent = o.Описание_Примечание;

    const img = document.getElementById('rPhoto');
    if (o.photo) { img.src = o.photo; img.style.display = 'inline'; }
    else { img.style.display = 'none'; }

    resultDiv.hidden = false;
  } catch (err) {
    alert(err.message || 'Ошибка при поиске');
    resultDiv.hidden = true;
  }
});

/* ---------- СОЗДАНИЕ ---------- */
const modal      = document.getElementById('createModal');
const openBtn    = document.getElementById('openCreateBtn');
const closeBtn   = document.querySelector('.close');
const createForm = document.getElementById('createForm');

openBtn.addEventListener('click', () => modal.classList.add('show'));
closeBtn.addEventListener('click', () => modal.classList.remove('show'));
window.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

createForm.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(createForm);
  try {
    const res = await fetch('/api/order', { method: 'POST', body: fd });
    if (!res.ok) throw new Error((await res.json()).error || 'Ошибка');
    alert('Заказ создан!');
    createForm.reset();
    modal.classList.remove('show');
  } catch (err) {
    alert(err.message || 'Не удалось создать заказ');
  }
});

/* ---------- ИЗМЕНЕНИЕ ЗАКАЗА ---------- */
const openEditBtn = document.getElementById('openEditBtn');
const editModal   = document.getElementById('editModal');
const editForm    = document.getElementById('editForm');
const closeEdit   = document.getElementById('closeEdit');

openEditBtn.addEventListener('click', async () => {
  const id = document.getElementById('editId').value.trim();
  if (!id) { alert('Введите номер заказа'); return; }

  try {
    const res = await fetch(`/api/order/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Не найдено');
    const o = await res.json();

    document.getElementById('editOrderId').value  = o.Номер_Заказа;
    document.getElementById('editLength').value   = o.Высота;
    document.getElementById('editWidth').value    = o.Ширина;
    document.getElementById('editHeight').value   = o.Толщина;
    document.getElementById('editPrice').value    = o.Цена;
    document.getElementById('editAddress').value  = o.Адрес_Доставки;
    document.getElementById('editOldPhoto').value = o.photo || '';
    document.getElementById('editEquipment').value = o.Комплектация;
    document.getElementById('editDescription').value = o.Описание_Примечание;
    editModal.classList.add('show');
  } catch (e) {
    alert(e.message || 'Ошибка при поиске');
  }
});

closeEdit.addEventListener('click', () => editModal.classList.remove('show'));
window.addEventListener('click', e => { if (e.target === editModal) editModal.classList.remove('show'); });

editForm.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(editForm);

  const id = document.getElementById('editOrderId').value;
  try {
    const res = await fetch(`/api/order/${id}`, { method: 'PUT', body: fd });
    if (!res.ok) throw new Error('Ошибка при изменении');
    alert('Заказ изменён!');
    editModal.classList.remove('show');
  } catch (e) {
    alert(e.message || 'Не удалось изменить заказ');
  }
});

/* ---------- УДАЛЕНИЕ ЗАКАЗА ---------- */
const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener('click', async () => {
  const id = document.getElementById('editId').value.trim();
  if (!id) { 
    alert('Введите номер заказа'); 
    return; 
  }

  if (!confirm(`Точно удалить заказ №${id}?`)) return;

  try {
    const res = await fetch(`/api/order/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error || 'Ошибка при удалении');
    alert('Заказ удалён!');
    document.getElementById('editId').value = '';
    document.getElementById('result').hidden = true;
  } catch (e) {
    alert(e.message || 'Не удалось удалить заказ');
  }
});
