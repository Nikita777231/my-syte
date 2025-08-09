/* ---------- ПОИСК ---------- */
const searchForm   = document.getElementById('searchForm');
const resultDiv = document.getElementById('result');

searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('orderId').value.trim();
      if (!id) return;

      try {
        const res = await fetch(`/api/order/${id}`);
        if (!res.ok) throw new Error((await res.json()).error || 'Не найдено');
        const o = await res.json();

        document.getElementById('rId').textContent      = o.Номер_Заказа;
        document.getElementById('rLength').textContent  = o.Высота;
        document.getElementById('rWidth').textContent   = o.Ширина;
        document.getElementById('rHeight').textContent  = o.Толщина;
        document.getElementById('rPrice').textContent   = o.Цена;
        document.getElementById('rAddress').textContent = o.Адрес_Доставки;

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

    openBtn .addEventListener('click', () => modal.classList.add('show'));
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    window  .addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('show');
    });

    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(createForm);

      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          // без headers: multipart сам установит boundary
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Ошибка');
        alert('Заказ создан!');
        createForm.reset();
        closeModal();
      } catch (err) {
        alert(err.message || 'Не удалось создать заказ');
      }
      /* ---- отображение ---- */
      // в обработчике поиска добавляем строку:
      const img = document.getElementById('rPhoto');
      if (o.photo) {
        img.src = o.photo;
        img.style.display = 'inline';
      } else {
        img.style.display = 'none';
      }
    });
    