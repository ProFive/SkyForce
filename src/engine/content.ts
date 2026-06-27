// Shared content packs for the kids' learning games. Data-driven so one
// mechanic (catch / touch) can teach many lessons just by swapping the pack.

export interface Item {
  en: string; // spoken/labelled in English
  vi: string; // Vietnamese gloss (for future bilingual UI)
  emoji?: string; // drawn for emoji-based games
  hex?: string; // drawn as a colored blob for color games
}

export const FRUITS: Item[] = [
  { en: 'apple', vi: 'táo', emoji: '🍎' },
  { en: 'green apple', vi: 'táo xanh', emoji: '🍏' },
  { en: 'banana', vi: 'chuối', emoji: '🍌' },
  { en: 'orange', vi: 'cam', emoji: '🍊' },
  { en: 'mandarin', vi: 'quýt', emoji: '🍊' },
  { en: 'tangerine', vi: 'quýt', emoji: '🍊' },
  { en: 'clementine', vi: 'quýt clementine', emoji: '🍊' },
  { en: 'lemon', vi: 'chanh vàng', emoji: '🍋' },
  { en: 'lime', vi: 'chanh xanh', emoji: '🍋' },
  { en: 'grapefruit', vi: 'bưởi chùm', emoji: '🍊' },
  { en: 'pomelo', vi: 'bưởi', emoji: '🍊' },
  { en: 'grapes', vi: 'nho', emoji: '🍇' },
  { en: 'green grapes', vi: 'nho xanh', emoji: '🍇' },
  { en: 'red grapes', vi: 'nho đỏ', emoji: '🍇' },
  { en: 'strawberry', vi: 'dâu tây', emoji: '🍓' },
  { en: 'blueberries', vi: 'việt quất', emoji: '🫐' },
  { en: 'raspberry', vi: 'mâm xôi đỏ', emoji: '🫐' },
  { en: 'blackberry', vi: 'mâm xôi đen', emoji: '🫐' },
  { en: 'cranberry', vi: 'nam việt quất', emoji: '🫐' },
  { en: 'cherry', vi: 'anh đào', emoji: '🍒' },
  { en: 'watermelon', vi: 'dưa hấu', emoji: '🍉' },
  { en: 'melon', vi: 'dưa lưới', emoji: '🍈' },
  { en: 'cantaloupe', vi: 'dưa vàng', emoji: '🍈' },
  { en: 'honeydew', vi: 'dưa mật', emoji: '🍈' },
  { en: 'pineapple', vi: 'dứa', emoji: '🍍' },
  { en: 'mango', vi: 'xoài', emoji: '🥭' },
  { en: 'papaya', vi: 'đu đủ', emoji: '🥭' },
  { en: 'guava', vi: 'ổi', emoji: '🍐' },
  { en: 'dragon fruit', vi: 'thanh long', emoji: '🍈' },
  { en: 'passion fruit', vi: 'chanh dây', emoji: '🍊' },
  { en: 'lychee', vi: 'vải', emoji: '🍒' },
  { en: 'longan', vi: 'nhãn', emoji: '🍇' },
  { en: 'rambutan', vi: 'chôm chôm', emoji: '🍓' },
  { en: 'durian', vi: 'sầu riêng', emoji: '🍈' },
  { en: 'jackfruit', vi: 'mít', emoji: '🍈' },
  { en: 'star fruit', vi: 'khế', emoji: '⭐' },
  { en: 'custard apple', vi: 'mãng cầu', emoji: '🍏' },
  { en: 'soursop', vi: 'mãng cầu xiêm', emoji: '🍏' },
  { en: 'sapodilla', vi: 'hồng xiêm', emoji: '🥥' },
  { en: 'persimmon', vi: 'hồng', emoji: '🍊' },
  { en: 'pear', vi: 'lê', emoji: '🍐' },
  { en: 'peach', vi: 'đào', emoji: '🍑' },
  { en: 'plum', vi: 'mận', emoji: '🍑' },
  { en: 'apricot', vi: 'mơ', emoji: '🍑' },
  { en: 'nectarine', vi: 'xuân đào', emoji: '🍑' },
  { en: 'fig', vi: 'sung', emoji: '🍇' },
  { en: 'pomegranate', vi: 'lựu', emoji: '🍎' },
  { en: 'kiwi', vi: 'kiwi', emoji: '🥝' },
  { en: 'coconut', vi: 'dừa', emoji: '🥥' },
  { en: 'avocado', vi: 'bơ', emoji: '🥑' },
  { en: 'olive', vi: 'ô liu', emoji: '🫒' },
  { en: 'date', vi: 'chà là', emoji: '🌴' },
  { en: 'mulberry', vi: 'dâu tằm', emoji: '🫐' },
  { en: 'gooseberry', vi: 'lý gai', emoji: '🫐' },
  { en: 'currant', vi: 'nho Hy Lạp', emoji: '🫐' },
  { en: 'breadfruit', vi: 'sa kê', emoji: '🍈' },
  { en: 'rose apple', vi: 'mận roi', emoji: '🍐' },
  { en: 'jujube', vi: 'táo tàu', emoji: '🍎' },
  { en: 'salak', vi: 'mây Thái', emoji: '🍐' },
  { en: 'tamarind', vi: 'me', emoji: '🥜' },
];

export const ANIMALS: Item[] = [
  // Pets
  { en: 'cat', vi: 'mèo', emoji: '🐱' },
  { en: 'dog', vi: 'chó', emoji: '🐶' },
  { en: 'rabbit', vi: 'thỏ', emoji: '🐰' },
  { en: 'hamster', vi: 'chuột hamster', emoji: '🐹' },
  { en: 'mouse', vi: 'chuột', emoji: '🐭' },
  { en: 'rat', vi: 'chuột cống', emoji: '🐀' },
  { en: 'guinea pig', vi: 'chuột lang', emoji: '🐹' },

  // Farm animals
  { en: 'cow', vi: 'bò', emoji: '🐮' },
  { en: 'pig', vi: 'heo', emoji: '🐷' },
  { en: 'sheep', vi: 'cừu', emoji: '🐑' },
  { en: 'goat', vi: 'dê', emoji: '🐐' },
  { en: 'horse', vi: 'ngựa', emoji: '🐴' },
  { en: 'donkey', vi: 'lừa', emoji: '🐴' },
  { en: 'chicken', vi: 'gà', emoji: '🐔' },
  { en: 'rooster', vi: 'gà trống', emoji: '🐓' },
  { en: 'duck', vi: 'vịt', emoji: '🦆' },
  { en: 'turkey', vi: 'gà tây', emoji: '🦃' },
  { en: 'goose', vi: 'ngỗng', emoji: '🪿' },

  // Wild mammals
  { en: 'bear', vi: 'gấu', emoji: '🐻' },
  { en: 'polar bear', vi: 'gấu Bắc Cực', emoji: '🐻‍❄️' },
  { en: 'panda', vi: 'gấu trúc', emoji: '🐼' },
  { en: 'koala', vi: 'gấu túi', emoji: '🐨' },
  { en: 'lion', vi: 'sư tử', emoji: '🦁' },
  { en: 'tiger', vi: 'hổ', emoji: '🐯' },
  { en: 'leopard', vi: 'báo', emoji: '🐆' },
  { en: 'cheetah', vi: 'báo săn', emoji: '🐆' },
  { en: 'wolf', vi: 'sói', emoji: '🐺' },
  { en: 'fox', vi: 'cáo', emoji: '🦊' },
  { en: 'deer', vi: 'hươu', emoji: '🦌' },
  { en: 'moose', vi: 'nai sừng tấm', emoji: '🫎' },
  { en: 'buffalo', vi: 'trâu', emoji: '🐃' },
  { en: 'bison', vi: 'bò rừng', emoji: '🦬' },
  { en: 'elephant', vi: 'voi', emoji: '🐘' },
  { en: 'rhinoceros', vi: 'tê giác', emoji: '🦏' },
  { en: 'hippopotamus', vi: 'hà mã', emoji: '🦛' },
  { en: 'camel', vi: 'lạc đà', emoji: '🐫' },
  { en: 'llama', vi: 'lạc đà không bướu', emoji: '🦙' },
  { en: 'kangaroo', vi: 'chuột túi', emoji: '🦘' },
  { en: 'sloth', vi: 'lười', emoji: '🦥' },
  { en: 'otter', vi: 'rái cá', emoji: '🦦' },
  { en: 'beaver', vi: 'hải ly', emoji: '🦫' },
  { en: 'monkey', vi: 'khỉ', emoji: '🐵' },
  { en: 'gorilla', vi: 'khỉ đột', emoji: '🦍' },
  { en: 'orangutan', vi: 'đười ươi', emoji: '🦧' },

  // Birds
  { en: 'bird', vi: 'chim', emoji: '🐦' },
  { en: 'parrot', vi: 'vẹt', emoji: '🦜' },
  { en: 'eagle', vi: 'đại bàng', emoji: '🦅' },
  { en: 'owl', vi: 'cú mèo', emoji: '🦉' },
  { en: 'penguin', vi: 'chim cánh cụt', emoji: '🐧' },
  { en: 'flamingo', vi: 'hồng hạc', emoji: '🦩' },
  { en: 'peacock', vi: 'chim công', emoji: '🦚' },
  { en: 'swan', vi: 'thiên nga', emoji: '🦢' },
  { en: 'dove', vi: 'chim bồ câu', emoji: '🕊️' },

  // Reptiles & amphibians
  { en: 'frog', vi: 'ếch', emoji: '🐸' },
  { en: 'turtle', vi: 'rùa', emoji: '🐢' },
  { en: 'snake', vi: 'rắn', emoji: '🐍' },
  { en: 'lizard', vi: 'thằn lằn', emoji: '🦎' },
  { en: 'crocodile', vi: 'cá sấu', emoji: '🐊' },

  // Sea animals
  { en: 'fish', vi: 'cá', emoji: '🐟' },
  { en: 'tropical fish', vi: 'cá nhiệt đới', emoji: '🐠' },
  { en: 'blowfish', vi: 'cá nóc', emoji: '🐡' },
  { en: 'shark', vi: 'cá mập', emoji: '🦈' },
  { en: 'whale', vi: 'cá voi', emoji: '🐋' },
  { en: 'dolphin', vi: 'cá heo', emoji: '🐬' },
  { en: 'octopus', vi: 'bạch tuộc', emoji: '🐙' },
  { en: 'squid', vi: 'mực', emoji: '🦑' },
  { en: 'seal', vi: 'hải cẩu', emoji: '🦭' },
  { en: 'lobster', vi: 'tôm hùm', emoji: '🦞' },
  { en: 'crab', vi: 'cua', emoji: '🦀' },
  { en: 'shrimp', vi: 'tôm', emoji: '🦐' },

  // Insects & small creatures
  { en: 'ant', vi: 'kiến', emoji: '🐜' },
  { en: 'bee', vi: 'ong', emoji: '🐝' },
  { en: 'ladybug', vi: 'bọ rùa', emoji: '🐞' },
  { en: 'butterfly', vi: 'bướm', emoji: '🦋' },
  { en: 'spider', vi: 'nhện', emoji: '🕷️' },
  { en: 'scorpion', vi: 'bọ cạp', emoji: '🦂' },
  { en: 'snail', vi: 'ốc sên', emoji: '🐌' },
  { en: 'worm', vi: 'giun', emoji: '🪱' },
  { en: 'mosquito', vi: 'muỗi', emoji: '🦟' },
  { en: 'fly', vi: 'ruồi', emoji: '🪰' },
  { en: 'cockroach', vi: 'gián', emoji: '🪳' },
  { en: 'cricket', vi: 'dế', emoji: '🦗' },
];

export const COLORS: Item[] = [
  // Basic colors
  { en: 'red', vi: 'đỏ', hex: '#FF0000' },
  { en: 'blue', vi: 'xanh dương', hex: '#0000FF' },
  { en: 'green', vi: 'xanh lá', hex: '#008000' },
  { en: 'yellow', vi: 'vàng', hex: '#FFFF00' },
  { en: 'orange', vi: 'cam', hex: '#FFA500' },
  { en: 'purple', vi: 'tím', hex: '#800080' },
  { en: 'pink', vi: 'hồng', hex: '#FFC0CB' },
  { en: 'brown', vi: 'nâu', hex: '#A52A2A' },
  { en: 'black', vi: 'đen', hex: '#000000' },
  { en: 'white', vi: 'trắng', hex: '#FFFFFF' },
  { en: 'gray', vi: 'xám', hex: '#808080' },

  // Common variants
  { en: 'light blue', vi: 'xanh da trời nhạt', hex: '#87CEFA' },
  { en: 'dark blue', vi: 'xanh dương đậm', hex: '#00008B' },
  { en: 'light green', vi: 'xanh lá nhạt', hex: '#90EE90' },
  { en: 'dark green', vi: 'xanh lá đậm', hex: '#006400' },
  { en: 'light gray', vi: 'xám nhạt', hex: '#D3D3D3' },
  { en: 'dark gray', vi: 'xám đậm', hex: '#696969' },
  { en: 'light pink', vi: 'hồng nhạt', hex: '#FFB6C1' },
  { en: 'dark red', vi: 'đỏ đậm', hex: '#8B0000' },

  // Popular colors
  { en: 'cyan', vi: 'xanh lơ', hex: '#00FFFF' },
  { en: 'teal', vi: 'xanh ngọc đậm', hex: '#008080' },
  { en: 'turquoise', vi: 'xanh ngọc', hex: '#40E0D0' },
  { en: 'navy', vi: 'xanh hải quân', hex: '#000080' },
  { en: 'sky blue', vi: 'xanh da trời', hex: '#87CEEB' },
  { en: 'mint', vi: 'xanh bạc hà', hex: '#98FF98' },
  { en: 'lime', vi: 'xanh chanh', hex: '#32CD32' },
  { en: 'olive', vi: 'xanh ô liu', hex: '#808000' },
  { en: 'gold', vi: 'vàng kim', hex: '#FFD700' },
  { en: 'silver', vi: 'bạc', hex: '#C0C0C0' },
  { en: 'beige', vi: 'be', hex: '#F5F5DC' },
  { en: 'cream', vi: 'kem', hex: '#FFFDD0' },
  { en: 'ivory', vi: 'ngà', hex: '#FFFFF0' },
  { en: 'maroon', vi: 'đỏ nâu', hex: '#800000' },
  { en: 'burgundy', vi: 'đỏ rượu vang', hex: '#800020' },
  { en: 'violet', vi: 'tím hoa cà', hex: '#8F00FF' },
  { en: 'lavender', vi: 'tím oải hương', hex: '#E6E6FA' },
  { en: 'magenta', vi: 'đỏ tím', hex: '#FF00FF' },
  { en: 'indigo', vi: 'chàm', hex: '#4B0082' },
  { en: 'coral', vi: 'san hô', hex: '#FF7F50' },
  { en: 'peach', vi: 'đào', hex: '#FFDAB9' },
  { en: 'salmon', vi: 'hồng cá hồi', hex: '#FA8072' },
  { en: 'khaki', vi: 'kaki', hex: '#F0E68C' },
  { en: 'tan', vi: 'nâu vàng', hex: '#D2B48C' },
  { en: 'chocolate', vi: 'nâu sô cô la', hex: '#D2691E' },
  { en: 'crimson', vi: 'đỏ thẫm', hex: '#DC143C' },
  { en: 'aqua', vi: 'xanh nước biển', hex: '#00FFFF' },
];
export const pick = <T>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];

// ---------------------------------------------------------------------------
// Shapes — drawn procedurally (no emoji) so "find the circle" reads cleanly.
// ---------------------------------------------------------------------------

export type ShapeKind =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'diamond';

export interface Shape {
  en: string;
  vi: string;
  kind: ShapeKind;
  hex: string;
}

export const SHAPES: Shape[] = [
  { en: 'circle', vi: 'hình tròn', kind: 'circle', hex: '#ff6b6b' },
  { en: 'square', vi: 'hình vuông', kind: 'square', hex: '#4dabf7' },
  { en: 'triangle', vi: 'hình tam giác', kind: 'triangle', hex: '#51cf66' },
  { en: 'star', vi: 'ngôi sao', kind: 'star', hex: '#ffd43b' },
  { en: 'heart', vi: 'trái tim', kind: 'heart', hex: '#ff8787' },
  { en: 'diamond', vi: 'hình thoi', kind: 'diamond', hex: '#da77f2' },
];

// ---------------------------------------------------------------------------
// Animal sounds — English onomatopoeia for the "who am I?" listening game.
// Keyed by Item.en so we can reuse the ANIMALS pack and its emoji.
// ---------------------------------------------------------------------------

export const ANIMAL_SOUNDS: Record<string, string> = {
  cat: 'meow',
  dog: 'woof woof',
  cow: 'moo',
  pig: 'oink oink',
  duck: 'quack quack',
  sheep: 'baa',
  goat: 'maa',
  rooster: 'cock-a-doodle-doo',
  chicken: 'cluck cluck',
  horse: 'neigh',
  lion: 'roar',
  tiger: 'roar',
  wolf: 'howl',
  bird: 'tweet tweet',
  owl: 'hoot hoot',
  bee: 'buzz',
  frog: 'ribbit',
  snake: 'hiss',
  monkey: 'ooh ooh ah ah',
  elephant: 'pawoo',
};

// ---------------------------------------------------------------------------
// Quiz bank — kid-friendly general-knowledge questions (science, body, nature).
// Each question carries its own answer options; `answer` indexes the correct one.
// ---------------------------------------------------------------------------

export interface QuizQ {
  q: string; // spoken + shown question
  vi?: string; // Vietnamese gloss (future bilingual UI)
  options: string[];
  answer: number; // index into options
}

export const QUIZZES: QuizQ[] = [
  { q: 'What color is the sky on a sunny day?', vi: 'Bầu trời màu gì?', options: ['blue', 'green', 'red'], answer: 0 },
  { q: 'How many legs does a spider have?', vi: 'Nhện có mấy chân?', options: ['8', '6', '4'], answer: 0 },
  { q: 'Which animal says moo?', vi: 'Con gì kêu moo?', options: ['cow', 'cat', 'duck'], answer: 0 },
  { q: 'What do bees make?', vi: 'Ong làm ra gì?', options: ['honey', 'milk', 'bread'], answer: 0 },
  { q: 'Which one can fly?', vi: 'Con nào biết bay?', options: ['bird', 'fish', 'dog'], answer: 0 },
  { q: 'What do we use to see?', vi: 'Ta nhìn bằng gì?', options: ['eyes', 'ears', 'nose'], answer: 0 },
  { q: 'What do we use to hear?', vi: 'Ta nghe bằng gì?', options: ['ears', 'hands', 'feet'], answer: 0 },
  { q: 'Which is the biggest animal?', vi: 'Con nào to nhất?', options: ['whale', 'ant', 'mouse'], answer: 0 },
  { q: 'Where do fish live?', vi: 'Cá sống ở đâu?', options: ['water', 'sky', 'tree'], answer: 0 },
  { q: 'What grows from a tiny seed?', vi: 'Hạt nhỏ lớn thành gì?', options: ['plant', 'rock', 'car'], answer: 0 },
  { q: 'How many days are in a week?', vi: 'Một tuần có mấy ngày?', options: ['7', '5', '10'], answer: 0 },
  { q: 'What color is grass?', vi: 'Cỏ màu gì?', options: ['green', 'blue', 'pink'], answer: 0 },
  { q: 'Which one is cold?', vi: 'Cái nào lạnh?', options: ['ice', 'fire', 'sun'], answer: 0 },
  { q: 'What gives us light in the day?', vi: 'Ban ngày gì cho ta ánh sáng?', options: ['sun', 'moon', 'star'], answer: 0 },
  { q: 'Which one do we drink?', vi: 'Cái nào để uống?', options: ['water', 'sand', 'paper'], answer: 0 },
  { q: 'What does a baby dog called?', vi: 'Chó con gọi là gì?', options: ['puppy', 'kitten', 'calf'], answer: 0 },
  { q: 'How many fingers on one hand?', vi: 'Một bàn tay có mấy ngón?', options: ['5', '4', '6'], answer: 0 },
  { q: 'Which season is the coldest?', vi: 'Mùa nào lạnh nhất?', options: ['winter', 'summer', 'spring'], answer: 0 },
  { q: 'What do plants need to grow?', vi: 'Cây cần gì để lớn?', options: ['water', 'candy', 'toys'], answer: 0 },
  { q: 'Which one is a fruit?', vi: 'Cái nào là trái cây?', options: ['apple', 'chair', 'shoe'], answer: 0 },
];
