// ============================================
// Утилита для создания элементов
// ============================================
function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

// ============================================
// Состояние игры
// ============================================
const state = {
  moves: 0,
  pairsFound: 0,
  firstCard: null,
  secondCard: null,
  isLocked: false,
  isFinished: false,
};

// ============================================
// Создание интерфейса
// ============================================
const app = el('div', 'app');
document.body.append(app);

// --- Хедер ---
const header = el('header', 'header');
app.append(header);

const headerTitle = el('h1', 'header__title', 'Memory Game');
header.append(headerTitle);

const headerButtons = el('div', 'header__buttons');
header.append(headerButtons);

const newGameBtn = el('button', 'btn btn--primary', 'Новая игра');
newGameBtn.type = 'button';
headerButtons.append(newGameBtn);

const leaderboardBtn = el('button', 'btn btn--secondary', 'Таблица лидеров');
leaderboardBtn.type = 'button';
headerButtons.append(leaderboardBtn);

// --- Счётчики ---
const stats = el('div', 'stats');
app.append(stats);

const movesEl = el('div', 'stats__item');
const movesLabel = el('span', 'stats__label', 'Ходы: ');
const movesValue = el('span', 'stats__value', '0');
movesEl.append(movesLabel, movesValue);
stats.append(movesEl);

const pairsEl = el('div', 'stats__item');
const pairsLabel = el('span', 'stats__label', 'Пары: ');
const pairsValue = el('span', 'stats__value', '0 / 8');
pairsEl.append(pairsLabel, pairsValue);
stats.append(pairsEl);

// --- Игровое поле ---
const board = el('div', 'board');
app.append(board);

// ============================================
// Перемешивание (Фишер-Йетс)
// ============================================
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================
// Генерация карточек
// ============================================
function createCardElement(cardData) {
  const card = el('button', 'card');
  card.type = 'button';
  card.dataset.id = String(cardData.id);
  card.dataset.pairId = String(cardData.pairId);

  const inner = el('div', 'card__inner');
  card.append(inner);

  const backFace = el('div', 'card__face card__face--back');
  const frontFace = el('div', 'card__face card__face--front');

  const img = document.createElement('img');
  img.src = cardData.image;
  img.alt = '';
  img.width = 100;
  img.height = 100;
  frontFace.append(img);

  inner.append(backFace, frontFace);
  return card;
}

// ============================================
// Рендер поля
// ============================================
function buildDeck() {
  // Дублируем каждое изображение, получаем 16 карточек
  const doubled = CARD_IMAGES.flatMap((item) => [
    { ...item, pairId: item.id },
    { ...item, pairId: item.id },
  ]);
  // Перемешиваем
  return shuffle(doubled).map((item, index) => ({
    ...item,
    id: index + 1,
  }));
}

function renderCards() {
  // Очищаем поле через removeChild — innerHTML использовать нельзя
  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }

  const deck = buildDeck();
  deck.forEach((cardData) => {
    const cardEl = createCardElement(cardData);
    board.append(cardEl);
  });
}
// ============================================
// Обновление счётчиков
// ============================================
function updateStats() {
  movesValue.textContent = String(state.moves);
  pairsValue.textContent = `${state.pairsFound} / 8`;
}

// ============================================
// Запуск игры
// ============================================
updateStats();
renderCards();

// ============================================
// Логика выбора карточек
// ============================================
const FLIP_DELAY = 1000;
let flipTimer = null;

function flipCard(card) {
  card.classList.add('is-flipped');
}

function unflipCard(card) {
  card.classList.remove('is-flipped');
}

function resetSelection() {
  state.firstCard = null;
  state.secondCard = null;
}

function isCardClickable(card) {
  if (state.isLocked) return false;
  if (state.isFinished) return false;
  if (card.classList.contains('is-flipped')) return false;
  return true;
}

function handleCardClick(card) {
  if (!isCardClickable(card)) return;

  // Открываем карточку
  flipCard(card);

  // Первая карточка пары
  if (!state.firstCard) {
    state.firstCard = card;
    return;
  }

  // Вторая карточка — засчитываем ход
  state.secondCard = card;
  state.moves += 1;
  updateStats();

  const firstPairId = state.firstCard.dataset.pairId;
  const secondPairId = card.dataset.pairId;

  if (firstPairId === secondPairId) {
    // --- Совпали ---
    state.pairsFound += 1;
    updateStats();
    resetSelection();

          if (state.pairsFound === 8) {
      state.isFinished = true;
      addResult(state.moves);
      // Небольшая задержка, чтобы игрок успел увидеть последнюю пару
      setTimeout(showWinModal, 400);
    }
  } else {
    // --- Не совпали: блокируем и закрываем с задержкой ---
    state.isLocked = true;

    const firstCard = state.firstCard;
    const secondCard = state.secondCard;

    flipTimer = setTimeout(() => {
      unflipCard(firstCard);
      unflipCard(secondCard);
      resetSelection();
      state.isLocked = false;
      flipTimer = null;
    }, FLIP_DELAY);
  }
}

// Делегирование клика — один обработчик на всё поле
board.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (!card) return;
  handleCardClick(card);
});

// ============================================
// Новая игра
// ============================================
function resetGame() {
  // Отменяем активный таймер закрытия
  if (flipTimer) {
    clearTimeout(flipTimer);
    flipTimer = null;
  }

  // Сбрасываем состояние
  state.moves = 0;
  state.pairsFound = 0;
  state.firstCard = null;
  state.secondCard = null;
  state.isLocked = false;
  state.isFinished = false;

  // Обновляем счётчики и поле
  updateStats();
  renderCards();
}

newGameBtn.addEventListener('click', resetGame);

// ============================================
// Общий компонент модального окна
// ============================================
function createModal() {
  const modal = el('div', 'modal');
  modal.setAttribute('aria-hidden', 'true');

  const overlay = el('div', 'modal__overlay');
  const content = el('div', 'modal__content');
  content.setAttribute('role', 'dialog');
  content.setAttribute('aria-modal', 'true');

  modal.append(overlay, content);
  document.body.append(modal);

  // Клик по тёмному фону — закрыть
  overlay.addEventListener('click', () => closeModal(modalInstance));

  // Escape — закрыть
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal(modalInstance);
    }
  });

  return modal;
}

function openModal(modalInstance, contentBuilder) {
  const content = modalInstance.querySelector('.modal__content');

  // Очищаем старый контент
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  // Строим новый контент
  contentBuilder(content);

  modalInstance.classList.add('is-open');
  modalInstance.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(modalInstance) {
  modalInstance.classList.remove('is-open');
  modalInstance.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

// ============================================
// Модальное окно победы
// ============================================
const winModal = createModal();

function buildWinContent(container) {
  const title = el('h2', 'modal__title', 'Победа!');
  const text = el('p', 'modal__text', `Вы нашли все пары за ${state.moves} ходов.`);

  const buttons = el('div', 'modal__buttons');

  const playAgainBtn = el('button', 'btn btn--primary', 'Новая игра');
  playAgainBtn.type = 'button';
  playAgainBtn.addEventListener('click', () => {
    closeModal(winModal);
    resetGame();
  });

  const closeBtn = el('button', 'btn btn--secondary', 'Закрыть');
  closeBtn.type = 'button';
  closeBtn.addEventListener('click', () => closeModal(winModal));

  buttons.append(playAgainBtn, closeBtn);
  container.append(title, text, buttons);
}

function showWinModal() {
  openModal(winModal, buildWinContent);
}

// ============================================
// Работа с localStorage
// ============================================
const RESULTS_KEY = 'memory-game-results';
const MAX_RESULTS = 10;

function loadResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveResults(results) {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    // игнорируем ошибки записи
  }
}

function addResult(moves) {
  const results = loadResults();
  const newResult = {
    moves,
    date: Date.now(),
  };

  results.push(newResult);

  // Сортировка: по ходам (по возрастанию), при равенстве — по дате (раньше выше)
  results.sort((a, b) => {
    if (a.moves !== b.moves) return a.moves - b.moves;
    return a.date - b.date;
  });

  // Оставляем только 10 лучших
  const top10 = results.slice(0, MAX_RESULTS);
  saveResults(top10);
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ============================================
// Модальное окно таблицы лидеров
// ============================================
const leaderboardModal = createModal();

function buildLeaderboardContent(container) {
  const title = el('h2', 'modal__title', 'Таблица лидеров');
  container.append(title);

  const results = loadResults();

  if (results.length === 0) {
    const empty = el('p', 'leaderboard__empty', 'Пока нет результатов');
    container.append(empty);
  } else {
    const list = el('ul', 'leaderboard');

    results.forEach((result, index) => {
      const item = el('li', 'leaderboard__item');

      const place = el('span', 'leaderboard__place', `${index + 1}.`);
      const moves = el('span', 'leaderboard__moves', `Ходов: ${result.moves}`);
      const date = el('span', 'leaderboard__date', formatDate(result.date));

      item.append(place, moves, date);
      list.append(item);
    });

    container.append(list);
  }

  const buttons = el('div', 'modal__buttons');
  const closeBtn = el('button', 'btn btn--secondary', 'Закрыть');
  closeBtn.type = 'button';
  closeBtn.addEventListener('click', () => closeModal(leaderboardModal));
  buttons.append(closeBtn);

  container.append(buttons);
}

function showLeaderboard() {
  openModal(leaderboardModal, buildLeaderboardContent);
}

leaderboardBtn.addEventListener('click', showLeaderboard);
