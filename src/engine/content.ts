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
  | 'oval'
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'right_triangle'
  | 'diamond'
  | 'rhombus'
  | 'parallelogram'
  | 'trapezoid'
  | 'pentagon'
  | 'hexagon'
  | 'heptagon'
  | 'octagon'
  | 'nonagon'
  | 'decagon'
  | 'star'
  | 'heart'
  | 'crescent'
  | 'cross'
  | 'plus'
  | 'arrow'
  | 'ellipse'
  | 'semicircle'
  | 'kite'
  | 'shield'
  | 'cloud'
  | 'drop'
  | 'moon'
  | 'sun';

export interface Shape {
  en: string;
  vi: string;
  kind: ShapeKind;
  hex: string;
}

export const SHAPES: Item[] = [
  { en: 'circle', vi: 'hình tròn', emoji: '⚪' },
  { en: 'oval', vi: 'hình bầu dục', emoji: '🥚' },
  { en: 'square', vi: 'hình vuông', emoji: '🟦' },
  { en: 'rectangle', vi: 'hình chữ nhật', emoji: '▭' },
  { en: 'triangle', vi: 'hình tam giác', emoji: '🔺' },
  { en: 'right triangle', vi: 'tam giác vuông', emoji: '📐' },
  { en: 'diamond', vi: 'hình kim cương', emoji: '💎' },
  { en: 'rhombus', vi: 'hình thoi', emoji: '🔶' },
  { en: 'parallelogram', vi: 'hình bình hành', emoji: '▱' },
  { en: 'trapezoid', vi: 'hình thang', emoji: '⏢' },
  { en: 'pentagon', vi: 'hình ngũ giác', emoji: '⬟' },
  { en: 'hexagon', vi: 'hình lục giác', emoji: '⬢' },
  { en: 'heptagon', vi: 'hình thất giác', emoji: '🟣' },
  { en: 'octagon', vi: 'hình bát giác', emoji: '🛑' },
  { en: 'nonagon', vi: 'hình cửu giác', emoji: '🟣' },
  { en: 'decagon', vi: 'hình thập giác', emoji: '🔟' },
  { en: 'star', vi: 'ngôi sao', emoji: '⭐' },
  { en: 'heart', vi: 'trái tim', emoji: '❤️' },
  { en: 'crescent', vi: 'trăng khuyết', emoji: '🌙' },
  { en: 'cross', vi: 'hình chữ thập', emoji: '✝️' },
  { en: 'plus', vi: 'dấu cộng', emoji: '➕' },
  { en: 'arrow', vi: 'mũi tên', emoji: '➡️' },
  { en: 'ellipse', vi: 'hình elip', emoji: '🥚' },
  { en: 'semicircle', vi: 'nửa hình tròn', emoji: '🌗' },
  { en: 'kite', vi: 'hình cánh diều', emoji: '🪁' },
  { en: 'shield', vi: 'hình khiên', emoji: '🛡️' },
  { en: 'cloud', vi: 'hình đám mây', emoji: '☁️' },
  { en: 'drop', vi: 'giọt nước', emoji: '💧' },
  { en: 'moon', vi: 'mặt trăng', emoji: '🌙' },
  { en: 'sun', vi: 'mặt trời', emoji: '☀️' },
];
// ---------------------------------------------------------------------------
// Animal sounds — English onomatopoeia for the "who am I?" listening game.
// Keyed by Item.en so we can reuse the ANIMALS pack and its emoji.
// ---------------------------------------------------------------------------

export const ANIMAL_SOUNDS: Record<string, string> = {
  // Pets
  cat: 'meow',
  dog: 'woof woof',
  puppy: 'yip yip',
  kitten: 'meow',
  rabbit: 'squeak',
  hamster: 'squeak',
  guinea_pig: 'squeak',
  mouse: 'squeak',
  rat: 'squeak',

  // Farm animals
  cow: 'moo',
  buffalo: 'moo',
  pig: 'oink oink',
  sheep: 'baa',
  lamb: 'baa',
  goat: 'maa',
  horse: 'neigh',
  donkey: 'hee-haw',
  chicken: 'cluck cluck',
  rooster: 'cock-a-doodle-doo',
  chick: 'cheep cheep',
  duck: 'quack quack',
  goose: 'honk honk',
  turkey: 'gobble gobble',

  // Wild animals
  lion: 'roar',
  tiger: 'roar',
  leopard: 'growl',
  cheetah: 'growl',
  bear: 'growl',
  panda: 'snuffle',
  koala: 'grunt',
  wolf: 'howl',
  fox: 'yip yip',
  deer: 'bleat',
  moose: 'grunt',
  elephant: 'trumpet',
  rhinoceros: 'snort',
  hippopotamus: 'grunt',
  camel: 'grunt',
  kangaroo: 'chortle',
  monkey: 'ooh ooh ah ah',
  gorilla: 'grunt',
  orangutan: 'hoo hoo',
  sloth: 'chirp',
  otter: 'chirp',
  beaver: 'growl',

  // Birds
  bird: 'tweet tweet',
  parrot: 'squawk',
  eagle: 'screech',
  owl: 'hoot hoot',
  penguin: 'honk',
  flamingo: 'honk',
  peacock: 'scream',
  swan: 'honk',
  dove: 'coo coo',

  // Reptiles & amphibians
  frog: 'ribbit',
  toad: 'croak',
  snake: 'hiss',
  turtle: 'hiss',
  lizard: 'hiss',
  crocodile: 'growl',
  alligator: 'growl',

  // Sea animals
  fish: 'blub blub',
  tropical_fish: 'blub blub',
  whale: 'whale song',
  dolphin: 'click click',
  seal: 'arf arf',
  crab: 'click click',

  // Insects
  bee: 'buzz',
  wasp: 'buzz',
  butterfly: 'flutter',
  mosquito: 'buzz',
  fly: 'buzz',
  cricket: 'chirp chirp',
  grasshopper: 'chirp',
  cicada: 'buzz'
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

export const MORE_QUIZZES: QuizQ[] = [
  // Colors
  { q: 'What color is a banana?', vi: 'Chuối màu gì?', options: ['yellow', 'blue', 'black'], answer: 0 },
  { q: 'What color is an apple?', vi: 'Táo thường màu gì?', options: ['red', 'purple', 'gray'], answer: 0 },
  { q: 'What color is snow?', vi: 'Tuyết màu gì?', options: ['white', 'green', 'orange'], answer: 0 },
  { q: 'What color is coal?', vi: 'Than đá màu gì?', options: ['black', 'pink', 'yellow'], answer: 0 },

  // Animals
  { q: 'Which animal barks?', vi: 'Con nào sủa?', options: ['dog', 'cat', 'fish'], answer: 0 },
  { q: 'Which animal meows?', vi: 'Con nào kêu meo meo?', options: ['cat', 'cow', 'duck'], answer: 0 },
  { q: 'Which animal has a long trunk?', vi: 'Con nào có vòi dài?', options: ['elephant', 'lion', 'horse'], answer: 0 },
  { q: 'Which animal has a very long neck?', vi: 'Con nào có cổ rất dài?', options: ['giraffe', 'dog', 'pig'], answer: 0 },
  { q: 'Which animal lives in the ocean?', vi: 'Con nào sống ở đại dương?', options: ['whale', 'rabbit', 'cow'], answer: 0 },
  { q: 'Which animal hops?', vi: 'Con nào nhảy bằng hai chân sau?', options: ['kangaroo', 'fish', 'duck'], answer: 0 },
  { q: 'Which animal gives us eggs?', vi: 'Con nào đẻ trứng?', options: ['chicken', 'cow', 'dog'], answer: 0 },
  { q: 'Which animal gives us milk?', vi: 'Con nào cho sữa?', options: ['cow', 'lion', 'duck'], answer: 0 },

  // Fruits
  { q: 'Which fruit is yellow?', vi: 'Trái nào màu vàng?', options: ['banana', 'apple', 'grape'], answer: 0 },
  { q: 'Which fruit is red?', vi: 'Trái nào màu đỏ?', options: ['strawberry', 'coconut', 'pear'], answer: 0 },
  { q: 'Which fruit has lots of tiny seeds outside?', vi: 'Trái nào có nhiều hạt nhỏ bên ngoài?', options: ['strawberry', 'banana', 'orange'], answer: 0 },
  { q: 'Which fruit is very big?', vi: 'Trái nào rất lớn?', options: ['watermelon', 'grape', 'cherry'], answer: 0 },

  // Shapes
  { q: 'How many sides does a triangle have?', vi: 'Tam giác có mấy cạnh?', options: ['3', '4', '5'], answer: 0 },
  { q: 'How many sides does a square have?', vi: 'Hình vuông có mấy cạnh?', options: ['4', '3', '5'], answer: 0 },
  { q: 'Which shape is round?', vi: 'Hình nào tròn?', options: ['circle', 'square', 'triangle'], answer: 0 },
  { q: 'Which shape has five sides?', vi: 'Hình nào có 5 cạnh?', options: ['pentagon', 'circle', 'triangle'], answer: 0 },

  // Numbers
  { q: 'What comes after 5?', vi: 'Sau số 5 là số nào?', options: ['6', '7', '4'], answer: 0 },
  { q: 'What comes before 10?', vi: 'Trước số 10 là số nào?', options: ['9', '8', '11'], answer: 0 },
  { q: 'How many wheels does a bicycle have?', vi: 'Xe đạp có mấy bánh?', options: ['2', '3', '4'], answer: 0 },
  { q: 'How many eyes do people usually have?', vi: 'Con người thường có mấy mắt?', options: ['2', '1', '3'], answer: 0 },

  // Body
  { q: 'What do we smell with?', vi: 'Ta ngửi bằng gì?', options: ['nose', 'mouth', 'ears'], answer: 0 },
  { q: 'What do we eat with?', vi: 'Ta ăn bằng gì?', options: ['mouth', 'eyes', 'feet'], answer: 0 },
  { q: 'What do we walk with?', vi: 'Ta đi bằng gì?', options: ['feet', 'hands', 'ears'], answer: 0 },
  { q: 'How many ears do people have?', vi: 'Con người có mấy tai?', options: ['2', '1', '3'], answer: 0 },

  // Nature
  { q: 'Where does the sun rise?', vi: 'Mặt trời mọc ở đâu?', options: ['east', 'west', 'north'], answer: 0 },
  { q: 'What falls from the clouds?', vi: 'Cái gì rơi từ mây xuống?', options: ['rain', 'sand', 'rocks'], answer: 0 },
  { q: 'Which season is the hottest?', vi: 'Mùa nào nóng nhất?', options: ['summer', 'winter', 'autumn'], answer: 0 },
  { q: 'What shines at night?', vi: 'Cái gì tỏa sáng vào ban đêm?', options: ['moon', 'grass', 'tree'], answer: 0 },

  // Food
  { q: 'Which one is a vegetable?', vi: 'Đâu là rau củ?', options: ['carrot', 'apple', 'banana'], answer: 0 },
  { q: 'Which one is sweet?', vi: 'Cái nào ngọt?', options: ['cake', 'salt', 'pepper'], answer: 0 },
  { q: 'What do we drink when we are thirsty?', vi: 'Khát thì uống gì?', options: ['water', 'sand', 'paper'], answer: 0 },

  // Transport
  { q: 'Which vehicle flies?', vi: 'Xe nào bay được?', options: ['airplane', 'bus', 'train'], answer: 0 },
  { q: 'Which vehicle runs on rails?', vi: 'Phương tiện nào chạy trên đường ray?', options: ['train', 'car', 'bike'], answer: 0 },
  { q: 'Which vehicle sails on water?', vi: 'Phương tiện nào đi trên nước?', options: ['boat', 'bus', 'truck'], answer: 0 },

  // Math
  { q: 'What is 1 + 1?', vi: '1 + 1 bằng bao nhiêu?', options: ['2', '3', '1'], answer: 0 },
  { q: 'What is 2 + 3?', vi: '2 + 3 bằng bao nhiêu?', options: ['5', '4', '6'], answer: 0 },
  { q: 'What is 5 - 2?', vi: '5 - 2 bằng bao nhiêu?', options: ['3', '2', '4'], answer: 0 },
  { q: 'What is 3 × 2?', vi: '3 × 2 bằng bao nhiêu?', options: ['6', '5', '8'], answer: 0 },

  // Vocabulary
  { q: 'Which word is a color?', vi: 'Từ nào là màu sắc?', options: ['blue', 'apple', 'dog'], answer: 0 },
  { q: 'Which word is an animal?', vi: 'Từ nào là con vật?', options: ['lion', 'banana', 'chair'], answer: 0 },
  { q: 'Which word is a fruit?', vi: 'Từ nào là trái cây?', options: ['orange', 'table', 'shoe'], answer: 0 },
  { q: 'Which word is a shape?', vi: 'Từ nào là hình dạng?', options: ['circle', 'dog', 'tree'], answer: 0 },

  // Daily life
  { q: 'Where do you sleep?', vi: 'Con ngủ ở đâu?', options: ['bed', 'sink', 'road'], answer: 0 },
  { q: 'Where do fish swim?', vi: 'Cá bơi ở đâu?', options: ['water', 'sand', 'sky'], answer: 0 },
  { q: 'What do you wear on your feet?', vi: 'Con mang gì ở chân?', options: ['shoes', 'hat', 'gloves'], answer: 0 },
  { q: 'What do you wear on your head?', vi: 'Con đội gì trên đầu?', options: ['hat', 'sock', 'belt'], answer: 0 },
];