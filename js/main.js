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
