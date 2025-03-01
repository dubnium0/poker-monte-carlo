// Oyun değişkenleri
let deck = [];          // Deste
let players = [];       // Oyuncular
let communityCards = []; // Ortak kartlar
let currentPhase = 0;   // Oyun aşaması
let winProbabilities = []; // Kazanma olasılıkları
let selectedCards = new Set(); // Seçilen kartları izle

// Kart takımları ve değerleri
const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const PHASES = ["Başlangıç", "Flop", "Turn", "River", "Showdown"];

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  textFont("Arial");
  resetGame();
}

function draw() {
  // Oyun çizimi kodları...
}

function resetGame() {
  // Oyuncuları oluştur (boş ellerle)
  players = [];
  for (let i = 0; i < 4; i++) {
    players.push({
      id: i + 1,
      hand: [null, null],
      folded: false
    });
  }
  
  // Ortak kartları sıfırla
  communityCards = [null, null, null, null, null];
  
  // Olasılıkları sıfırla
  winProbabilities = [];
  
  // Seçilen kartları sıfırla
  selectedCards = new Set();
}

function updateCardSelection(playerId, cardPosition) {
  const valueSelect = document.getElementById(`player${playerId}-card${cardPosition}-value`);
  const suitSelect = document.getElementById(`player${playerId}-card${cardPosition}-suit`);
  
  const value = valueSelect.value;
  const suit = suitSelect.value;
  
  // Eğer değer veya takım seçilmediyse, kartı atama
  if (!value || !suit) {
    // Eğer önceden bir kart atanmışsa, o kartı kaldır
    const oldCard = players[playerId-1].hand[cardPosition-1];
    if (oldCard) {
      const cardKey = `${oldCard.value}${oldCard.suit}`;
      selectedCards.delete(cardKey);
      players[playerId-1].hand[cardPosition-1] = null;
    }
    return;
  }
  
  // Yeni kart için anahtar oluştur
  const cardKey = `${value}${suit}`;
  
  // Eğer bu kart zaten seçilmişse
  if (selectedCards.has(cardKey)) {
    alert(`${value}${suit} kartı zaten kullanılmış!`);
    valueSelect.value = "";
    suitSelect.value = "";
    return;
  }
  
  // Önceki kartı kaldır (eğer varsa)
  const oldCard = players[playerId-1].hand[cardPosition-1];
  if (oldCard) {
    const oldCardKey = `${oldCard.value}${oldCard.suit}`;
    selectedCards.delete(oldCardKey);
  }
  
  // Yeni kartı ekle
  selectedCards.add(cardKey);
  players[playerId-1].hand[cardPosition-1] = { value, suit };
  
  // Olasılıkları güncelle
  calculateAndUpdateProbabilities();
}

function updateCommunityCard(index) {
  const communityPositions = [
    { value: "flop1-value", suit: "flop1-suit" },
    { value: "flop2-value", suit: "flop2-suit" },
    { value: "flop3-value", suit: "flop3-suit" },
    { value: "turn-value", suit: "turn-suit" },
    { value: "river-value", suit: "river-suit" }
  ];
  
  const valueSelect = document.getElementById(communityPositions[index].value);
  const suitSelect = document.getElementById(communityPositions[index].suit);
  
  const value = valueSelect.value;
  const suit = suitSelect.value;
  
  // Eğer değer veya takım seçilmediyse, kartı atama
  if (!value || !suit) {
    // Eğer önceden bir kart atanmışsa, o kartı kaldır
    const oldCard = communityCards[index];
    if (oldCard) {
      const cardKey = `${oldCard.value}${oldCard.suit}`;
      selectedCards.delete(cardKey);
      communityCards[index] = null;
    }
    return;
  }
  
  // Yeni kart için anahtar oluştur
  const cardKey = `${value}${suit}`;
  
  // Eğer bu kart zaten seçilmişse
  if (selectedCards.has(cardKey)) {
    alert(`${value}${suit} kartı zaten kullanılmış!`);
    valueSelect.value = "";
    suitSelect.value = "";
    return;
  }
  
  // Önceki kartı kaldır (eğer varsa)
  const oldCard = communityCards[index];
  if (oldCard) {
    const oldCardKey = `${oldCard.value}${oldCard.suit}`;
    selectedCards.delete(oldCardKey);
  }
  
  // Yeni kartı ekle
  selectedCards.add(cardKey);
  communityCards[index] = { value, suit };
  
  // Olasılıkları güncelle
  calculateAndUpdateProbabilities();
}

function resetSelections() {
  // Tüm seçimleri sıfırla
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 2; j++) {
      document.getElementById(`player${i}-card${j}-value`).value = "";
      document.getElementById(`player${i}-card${j}-suit`).value = "";
    }
  }
  
  document.getElementById("flop1-value").value = "";
  document.getElementById("flop1-suit").value = "";
  document.getElementById("flop2-value").value = "";
  document.getElementById("flop2-suit").value = "";
  document.getElementById("flop3-value").value = "";
  document.getElementById("flop3-suit").value = "";
  document.getElementById("turn-value").value = "";
  document.getElementById("turn-suit").value = "";
  document.getElementById("river-value").value = "";
  document.getElementById("river-suit").value = "";
  
  resetGame();
}

function randomDeal() {
  // Önce seçimleri sıfırla
  resetSelections();
  
  // Tam desteyi oluştur
  const fullDeck = [];
  for (let suit of SUITS) {
    for (let value of VALUES) {
      fullDeck.push({ value, suit });
    }
  }
  
  // Desteyi karıştır
  for (let i = fullDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
  }
  
  // Oyuncu kartlarını dağıt
  let cardIndex = 0;
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 2; j++) {
      const card = fullDeck[cardIndex++];
      document.getElementById(`player${i}-card${j}-value`).value = card.value;
      document.getElementById(`player${i}-card${j}-suit`).value = card.suit;
      updateCardSelection(i, j);
    }
  }
  
  // Flop kartlarını dağıt
  const flop1 = fullDeck[cardIndex++];
  document.getElementById("flop1-value").value = flop1.value;
  document.getElementById("flop1-suit").value = flop1.suit;
  updateCommunityCard(0);
  
  const flop2 = fullDeck[cardIndex++];
  document.getElementById("flop2-value").value = flop2.value;
  document.getElementById("flop2-suit").value = flop2.suit;
  updateCommunityCard(1);
  
  const flop3 = fullDeck[cardIndex++];
  document.getElementById("flop3-value").value = flop3.value;
  document.getElementById("flop3-suit").value = flop3.suit;
  updateCommunityCard(2);
  
  // Turn kartını dağıt
  const turn = fullDeck[cardIndex++];
  document.getElementById("turn-value").value = turn.value;
  document.getElementById("turn-suit").value = turn.suit;
  updateCommunityCard(3);
  
  // River kartını dağıt
  const river = fullDeck[cardIndex++];
  document.getElementById("river-value").value = river.value;
  document.getElementById("river-suit").value = river.suit;
  updateCommunityCard(4);
}

// Olasılıkları hesaplamak için gerekli fonksiyon
function calculateAndUpdateProbabilities() {
console.log("Olasılıklar hesaplanıyor...");

// Aktif oyuncuları bul (en az bir kartı dağıtılmış olanlar)
const activePlayers = players.filter(player => player.hand[0] !== null || player.hand[1] !== null);

if (activePlayers.length < 2) {
console.log("Olasılık hesaplaması için en az 2 aktif oyuncu gerekli.");
return;
}

// Ortak kartları kontrol et
const validCommunityCards = communityCards.filter(card => card !== null);

// Her oyuncu için el gücü ve kazanma olasılığını hesapla
let handStrengths = [];

for (let player of activePlayers) {
// Oyuncunun kartlarını kontrol et
if (player.hand[0] === null || player.hand[1] === null) {
  console.log(`Oyuncu ${player.id} için eksik kartlar var.`);
  continue;
}

// Oyuncunun elini ve ortak kartları birleştir
const allCards = [...validCommunityCards, player.hand[0], player.hand[1]];

// El gücünü hesapla (1-10 arası, 10 en güçlü)
const handRank = evaluateHand(allCards);
const handType = getHandTypeName(handRank.rank);

// Ortak kartların durumuna göre kazanma olasılığını hesapla
let winProbability = 0;

if (validCommunityCards.length === 0) {
  // Pre-flop
  winProbability = calculatePreFlopProbability(player.hand);
} else if (validCommunityCards.length === 3) {
  // Flop sonrası
  winProbability = calculateFlopProbability(player.hand, validCommunityCards);
} else if (validCommunityCards.length === 4) {
  // Turn sonrası
  winProbability = calculateTurnProbability(player.hand, validCommunityCards);
} else if (validCommunityCards.length === 5) {
  // River sonrası - tam el değerlendirmesi
  winProbability = calculateRiverProbability(player.hand, validCommunityCards, activePlayers.length);
}

handStrengths.push({
  playerId: player.id,
  handRank: handRank,
  handType: handType,
  winProbability: winProbability
});
}

// Sonuçları güncelle ve göster
winProbabilities = handStrengths;
updateProbabilityDisplay(handStrengths);

console.log("Olasılık hesaplaması tamamlandı:", winProbabilities);
}

// El değerlendirme fonksiyonu
function evaluateHand(cards) {
if (cards.length < 5) return { rank: 0, value: "Yetersiz Kart" };

// Kartları değere göre sırala (A en yüksek)
const sortedCards = [...cards].sort((a, b) => {
const valueOrder = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };
return valueOrder[b.value] - valueOrder[a.value];
});

// Kartları gruplara ayır
const valueCounts = {};
const suitCounts = {};

for (let card of sortedCards) {
if (!valueCounts[card.value]) valueCounts[card.value] = 0;
if (!suitCounts[card.suit]) suitCounts[card.suit] = 0;
valueCounts[card.value]++;
suitCounts[card.suit]++;
}

// Kontroller
const valueGroups = Object.values(valueCounts).sort((a, b) => b - a);
const hasStraight = checkStraight(sortedCards);
const hasFlush = Object.values(suitCounts).some(count => count >= 5);

// Royal Flush veya Straight Flush kontrolü
if (hasFlush && hasStraight) {
const highCard = sortedCards[0].value === "A" ? "Ace" : sortedCards[0].value;
return { rank: 9, value: `${highCard} High Straight Flush` };
}

// Dört Eş kontrolü
if (valueGroups[0] === 4) {
const fourOfAKind = Object.keys(valueCounts).find(value => valueCounts[value] === 4);
return { rank: 8, value: `Four of a Kind ${fourOfAKind}s` };
}

// Full House kontrolü
if (valueGroups[0] === 3 && valueGroups[1] >= 2) {
const threeOfAKind = Object.keys(valueCounts).find(value => valueCounts[value] === 3);
const pair = Object.keys(valueCounts).find(value => valueCounts[value] === 2);
return { rank: 7, value: `Full House ${threeOfAKind}s over ${pair}s` };
}

// Flush kontrolü
if (hasFlush) {
const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
return { rank: 6, value: `${flushSuit} Flush` };
}

// Straight kontrolü
if (hasStraight) {
const highCard = sortedCards[0].value === "A" ? "Ace" : sortedCards[0].value;
return { rank: 5, value: `${highCard} High Straight` };
}

// Üçlü kontrolü
if (valueGroups[0] === 3) {
const threeOfAKind = Object.keys(valueCounts).find(value => valueCounts[value] === 3);
return { rank: 4, value: `Three of a Kind ${threeOfAKind}s` };
}

// İki Çift kontrolü
if (valueGroups[0] === 2 && valueGroups[1] === 2) {
const pairs = Object.keys(valueCounts)
  .filter(value => valueCounts[value] === 2)
  .sort((a, b) => {
    const valueOrder = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };
    return valueOrder[b] - valueOrder[a];
  });
return { rank: 3, value: `Two Pair ${pairs[0]}s and ${pairs[1]}s` };
}

// Tek Çift kontrolü
if (valueGroups[0] === 2) {
const pair = Object.keys(valueCounts).find(value => valueCounts[value] === 2);
return { rank: 2, value: `Pair of ${pair}s` };
}

// Yüksek Kart
const highCard = sortedCards[0].value;
return { rank: 1, value: `${highCard} High Card` };
}

// Straight kontrolü için yardımcı fonksiyon
function checkStraight(sortedCards) {
const valueOrder = { "A": 14, "K": 13, "Q": 12, "J": 11, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2 };

// Unique değerleri al ve sırala
const uniqueValues = [...new Set(sortedCards.map(card => card.value))]
.sort((a, b) => valueOrder[b] - valueOrder[a]);

// A-5-4-3-2 düşük straight kontrolü
if (uniqueValues.includes("A") && uniqueValues.includes("2") && uniqueValues.includes("3") && 
  uniqueValues.includes("4") && uniqueValues.includes("5")) {
return true;
}

// Normal straight kontrolü
for (let i = 0; i < uniqueValues.length - 4; i++) {
if (valueOrder[uniqueValues[i]] - valueOrder[uniqueValues[i+4]] === 4) {
  return true;
}
}

return false;
}

// El türü adını döndüren fonksiyon
function getHandTypeName(rank) {
const handTypes = [
"Yetersiz Kart",
"Yüksek Kart",
"Bir Çift",
"İki Çift", 
"Üçlü",
"Straight",
"Flush",
"Full House",
"Dört Kağıt",
"Straight Flush"
];
return handTypes[rank];
}

// Pre-flop olasılık hesaplama (kart güçlerine göre basit hesaplama)
function calculatePreFlopProbability(hand) {
if (hand[0] === null || hand[1] === null) return 0;

const valueOrder = { "A": 14, "K": 13, "Q": 12, "J": 11, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2 };
const card1Value = valueOrder[hand[0].value];
const card2Value = valueOrder[hand[1].value];

// Aynı değerde iki kart (çift)
if (card1Value === card2Value) {
if (card1Value >= 10) return 0.85;  // AA, KK, QQ, JJ, 10-10
if (card1Value >= 7) return 0.70;   // 9-9, 8-8, 7-7
return 0.55;                        // Küçük çiftler
}

// Aynı suit iki kart (suited)
const suited = hand[0].suit === hand[1].suit;

// Yüksek kartlar
if (card1Value >= 10 && card2Value >= 10) {
return suited ? 0.75 : 0.65;
}

// Bir yüksek kart, bir orta/düşük kart
if (card1Value >= 10 || card2Value >= 10) {
const gap = Math.abs(card1Value - card2Value);
if (gap <= 2) return suited ? 0.60 : 0.50;
return suited ? 0.50 : 0.40;
}

// Connected kartlar veya yakın kartlar
const gap = Math.abs(card1Value - card2Value);
if (gap <= 2) {
return suited ? 0.55 : 0.45;
}

// Diğer durumlar
return suited ? 0.40 : 0.30;
}

// Flop sonrası olasılık hesaplama
function calculateFlopProbability(hand, communityCards) {
// Toplam eli değerlendir
const allCards = [...communityCards, hand[0], hand[1]];
const handRank = evaluateHand(allCards);

// Mevcut el gücüne göre olasılık atama
switch (handRank.rank) {
case 9: return 0.95;  // Straight Flush
case 8: return 0.90;  // Four of a Kind
case 7: return 0.85;  // Full House
case 6: return 0.75;  // Flush
case 5: return 0.65;  // Straight
case 4: return 0.55;  // Three of a Kind
case 3: return 0.45;  // Two Pair
case 2: return 0.35;  // One Pair
default: return 0.25; // High Card
}
}

// Turn sonrası olasılık hesaplama
function calculateTurnProbability(hand, communityCards) {
// Toplam eli değerlendir
const allCards = [...communityCards, hand[0], hand[1]];
const handRank = evaluateHand(allCards);

// Mevcut el gücüne göre olasılık atama (turn sonrası daha kesinleşiyor)
switch (handRank.rank) {
case 9: return 0.98;  // Straight Flush
case 8: return 0.95;  // Four of a Kind
case 7: return 0.90;  // Full House
case 6: return 0.80;  // Flush
case 5: return 0.70;  // Straight
case 4: return 0.60;  // Three of a Kind
case 3: return 0.50;  // Two Pair
case 2: return 0.40;  // One Pair
default: return 0.30; // High Card
}
}

// River sonrası olasılık hesaplama (tam el değerlendirmesi)
function calculateRiverProbability(hand, communityCards, playerCount) {
// Toplam eli değerlendir
const allCards = [...communityCards, hand[0], hand[1]];
const handRank = evaluateHand(allCards);

// Oyuncu sayısına göre kazanma olasılığını kabaca ayarla
const playerFactor = Math.max(0.2, 1 - (playerCount * 0.15));

// River sonrası nihai el
switch (handRank.rank) {
case 9: return 0.99 * playerFactor;  // Straight Flush
case 8: return 0.97 * playerFactor;  // Four of a Kind
case 7: return 0.93 * playerFactor;  // Full House
case 6: return 0.85 * playerFactor;  // Flush
case 5: return 0.75 * playerFactor;  // Straight
case 4: return 0.65 * playerFactor;  // Three of a Kind
case 3: return 0.55 * playerFactor;  // Two Pair
case 2: return 0.40 * playerFactor;  // One Pair
default: return 0.20 * playerFactor; // High Card
}
}

// Olasılık sonuçlarını görüntüleme
function updateProbabilityDisplay(handStrengths) {
// Canvas'ı temizle (sadece olasılıkların olduğu bölgeyi)
fill(34, 139, 34); // Poker masası yeşili
noStroke();
rect(20, 250, width - 40, 230); // Olasılık gösterim alanını temizle

// Başlık
fill(255);
textSize(18);
textAlign(LEFT);
text("Oyuncu El Değerlendirmeleri:", 30, 280);

for (let i = 0; i < handStrengths.length; i++) {
const result = handStrengths[i];
const yPos = 320 + i * 40;

// Oyuncu ismi ve el tipi
textSize(16);
fill(255);
textAlign(LEFT);
text(`Oyuncu ${result.playerId}:`, 30, yPos);

// El tipi ve değeri
textSize(14);
fill(220, 220, 100);
text(`${result.handType} (${result.handRank.value})`, 120, yPos);

// Kazanma olasılığı
const probability = Math.round(result.winProbability * 100);

// Olasılık rengi (düşük: kırmızı, orta: sarı, yüksek: yeşil)
let probColor;
if (probability < 30) {
  probColor = color(255, 80, 80); // Kırmızı
} else if (probability < 60) {
  probColor = color(255, 255, 80); // Sarı
} else {
  probColor = color(80, 255, 80); // Yeşil
}

// Olasılık çubuğu
stroke(180);
strokeWeight(1);
fill(50);
rect(350, yPos - 15, 300, 20); // Çubuk arka planı

noStroke();
fill(probColor);
rect(350, yPos - 15, 3 * probability, 20); // Çubuk doldurma (max 300px)

// Olasılık yüzdesi
fill(255);
textAlign(CENTER);
text(`%${probability}`, 350 + 150, yPos + 2);

// Konsola da yazdır
console.log(`Oyuncu ${result.playerId}: ${result.handType} (${result.handRank.value}) - Kazanma olasılığı: %${probability}`);
}

// Eğer hiç oyuncu yoksa bilgi mesajı göster
if (handStrengths.length === 0) {
fill(200);
textAlign(CENTER);
textSize(16);
text("Oyun başlamadı veya yeterli oyuncu seçilmedi.", width/2, 320);
}

// En güçlü eli belirt
if (handStrengths.length > 1) {
// En yüksek olasılığa sahip oyuncuyu bul
let maxProb = -1;
let bestPlayer = null;

for (let result of handStrengths) {
  if (result.winProbability > maxProb) {
    maxProb = result.winProbability;
    bestPlayer = result;
  }
}

if (bestPlayer) {
  fill(255, 215, 0); // Altın rengi
  textAlign(CENTER);
  textSize(16);
  text(`En güçlü el: Oyuncu ${bestPlayer.playerId} - %${Math.round(maxProb * 100)} kazanma şansı`, width/2, 460);
}
}
}

// Oyuncuları çizme fonksiyonu (draw fonksiyonu içinde çağrılır)
function drawPlayers() {
const playerPositions = [
{ x: width/2, y: height - 70 },  // Alt
{ x: 120, y: height/2 },         // Sol
{ x: width/2, y: 120 },          // Üst
{ x: width - 120, y: height/2 }  // Sağ
];

for (let i = 0; i < players.length; i++) {
const player = players[i];
const pos = playerPositions[i];

// Oyuncu arka planı
fill(50, 50, 80, 200);
noStroke();
ellipse(pos.x, pos.y, 150, 150);

// Oyuncu numarası
fill(255);
textSize(16);
textAlign(CENTER);
text(`Oyuncu ${player.id}`, pos.x, pos.y - 30);

// Kartları çiz
if (player.hand[0]) {
  drawCard(player.hand[0], pos.x - 25, pos.y + 10);
}

if (player.hand[1]) {
  drawCard(player.hand[1], pos.x + 25, pos.y + 10);
}

// Olasılık bilgilerini göster
if (winProbabilities.length > 0) {
  const probability = winProbabilities.find(prob => prob.playerId === player.id);
  if (probability) {
    const winProb = Math.round(probability.winProbability * 100);
    
    // Olasılık rengi
    if (winProb < 30) {
      fill(255, 80, 80); // Kırmızı
    } else if (winProb < 60) {
      fill(255, 255, 80); // Sarı
    } else {
      fill(80, 255, 80); // Yeşil
    }
    
    textSize(18);
    textAlign(CENTER);
    text(`%${winProb}`, pos.x, pos.y + 60);
  }
}
}
}

// Ortak kartları çizme fonksiyonu (draw fonksiyonu içinde çağrılır)
function drawCommunityCards() {
// Ortak kartlar için arka plan
fill(30, 100, 30);
noStroke();
rect(width/2 - 200, height/2 - 40, 400, 80, 10);

// Ortak kartları çiz
for (let i = 0; i < communityCards.length; i++) {
if (communityCards[i]) {
  drawCard(communityCards[i], width/2 - 160 + i * 80, height/2);
} else {
  drawCardPlaceholder(width/2 - 160 + i * 80, height/2);
}
}

// Oyun aşamasını göster
let phaseText = "Başlangıç";
const validCards = communityCards.filter(card => card !== null);

if (validCards.length >= 3) phaseText = "Flop";
if (validCards.length >= 4) phaseText = "Turn";
if (validCards.length >= 5) phaseText = "River";

fill(255);
textSize(16);
textAlign(CENTER);
text(phaseText, width/2, height/2 - 50);
}

// Kart çizme fonksiyonu
function drawCard(card, x, y) {
// Kart arka planı
stroke(50);
strokeWeight(1);
fill(255);
rect(x - 20, y - 30, 40, 60, 5);

// Kart rengi
let cardColor;
if (card.suit === "♥" || card.suit === "♦") {
cardColor = color(255, 0, 0); // Kırmızı
} else {
cardColor = color(0); // Siyah
}

// Kart değeri ve takımı
fill(cardColor);
textSize(16);
textAlign(CENTER, CENTER);
text(card.value, x, y - 15);

textSize(20);
text(card.suit, x, y + 5);
}

// Boş kart yer tutucusu
function drawCardPlaceholder(x, y) {
stroke(80);
strokeWeight(1);
fill(80);
rect(x - 20, y - 30, 40, 60, 5);

fill(120);
textSize(20);
textAlign(CENTER, CENTER);
text("?", x, y);
}

// Draw fonksiyonu güncelleme
function draw() {
background(34, 139, 34); // Poker masası yeşili

// Başlık
fill(255);
textSize(24);
textAlign(CENTER);
text("Poker Simulasyonu", width/2, 30);

// Oyuncuları çiz
drawPlayers();

// Ortak kartları çiz
drawCommunityCards();
}