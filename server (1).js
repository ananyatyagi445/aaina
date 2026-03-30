/**
 * ╔══════════════════════════════════════════════════╗
 * ║         AAINA — Backend API Server               ║
 * ║   Indian Skin Tone Color Analysis Platform       ║
 * ║   Created by: Ananya Tyagi                       ║
 * ║   Stack: Node.js · HTTP · JSON File Database     ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Run:  node server.js
 * API:  http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT    = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// ─────────────────────────────────────────
//  DATABASE (JSON file — no npm required)
// ─────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const init = { users: [], sessions: [], preferences: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────
//  AUTH HELPERS
// ─────────────────────────────────────────
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'aaina_salt_2024').digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getUserFromToken(token, db) {
  const session = db.sessions.find(s => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  return db.users.find(u => u.id === session.userId) || null;
}

// ─────────────────────────────────────────
//  COLOUR DATA (served from backend)
// ─────────────────────────────────────────
const COLOUR_DATA = {
  fair: {
    name: 'Fair',
    range: 'Porcelain · Light · Ivory',
    swatch: '#EBC9B0',
    desc: 'Warm ivory with peachy or rosy undertones. Common in North and Northeast India.',
    clothing: {
      best: [
        { hex: '#4B2D8F', name: 'Royal Purple',   why: 'Creates rich contrast against fair skin, making your complexion luminous', rating: 5, occasion: 'Parties & weddings' },
        { hex: '#1B5E8F', name: 'Cobalt Blue',    why: 'Cool jewel tones complement peachy undertones beautifully',               rating: 5, occasion: 'Office & formal' },
        { hex: '#8B0000', name: 'Wine Red',        why: 'Deep red adds drama and warmth without washing you out',                  rating: 5, occasion: 'Festive & evening' },
        { hex: '#2E7D32', name: 'Emerald Green',  why: 'Rich green creates a stunning contrast with ivory skin',                  rating: 4, occasion: 'Casual & outings' },
        { hex: '#C94B27', name: 'Burnt Orange',   why: 'Earthy warmth brings a sun-kissed glow to fair skin',                    rating: 4, occasion: 'Casual & daytime' },
        { hex: '#004D40', name: 'Deep Teal',      why: 'Cool-warm balance that flatters peachy-ivory undertones perfectly',       rating: 4, occasion: 'Semi-formal' },
        { hex: '#880E4F', name: 'Deep Pink',      why: 'Vibrant pink against fair skin creates a classic Indian beauty look',     rating: 5, occasion: 'Festive & celebrations' },
        { hex: '#7B3F00', name: 'Chocolate',      why: 'Deep earthy brown grounds fair skin with cozy elegance',                  rating: 3, occasion: 'Everyday & relaxed' },
      ],
      avoid: [
        { hex: '#F5F5DC', name: 'Beige',      why: 'Too close to fair skin — makes you look washed out' },
        { hex: '#FFFACD', name: 'Pale Yellow',why: 'Clashes with peachy undertones and dulls your complexion' },
        { hex: '#E8D5C4', name: 'Blush Nude', why: 'Blends into fair skin — creates a flat, no-contrast look' },
      ],
      traditional: [
        { hex: '#8B0000', name: 'Deep Red Lehenga',    why: 'Classic bridal red — creates a powerful, radiant look', rating: 5, occasion: 'Weddings & pujas' },
        { hex: '#4B2D8F', name: 'Violet Saree',        why: 'Jewel-toned violet makes fair complexion look ethereal', rating: 5, occasion: 'Festive occasions' },
        { hex: '#006400', name: 'Dark Green Suit',     why: 'Rich forest green creates a regal contrast with ivory skin', rating: 4, occasion: 'Eid, Diwali, parties' },
        { hex: '#880E4F', name: 'Magenta Dupatta',     why: 'Pop of hot pink adds festive energy against fair skin', rating: 5, occasion: 'Sangeet & Haldi' },
        { hex: '#1B5E8F', name: 'Royal Blue Kurta',   why: 'Cool royal blue gives a crisp, polished ethnic look', rating: 4, occasion: 'Office & casual ethnic' },
        { hex: '#7B3F00', name: 'Chocolate Sherwani', why: 'Deep earthy brown adds sophistication to fair complexion', rating: 3, occasion: 'Casual ethnic events' },
      ],
      western: [
        { hex: '#2E7D32', name: 'Emerald Blazer',    why: 'Jewel-green blazer over white makes fair skin pop dramatically', rating: 5, occasion: 'Office & parties' },
        { hex: '#1B5E8F', name: 'Navy Jeans',        why: 'Dark navy is the most flattering denim shade for fair skin',     rating: 5, occasion: 'Everyday casual' },
        { hex: '#C94B27', name: 'Rust Top',          why: 'Warm rust adds a sun-kissed glow — perfect for daytime looks',   rating: 4, occasion: 'Brunches & outings' },
        { hex: '#4B2D8F', name: 'Plum Dress',        why: 'Deep plum creates an effortlessly elegant evening look',         rating: 5, occasion: 'Dinners & events' },
        { hex: '#2C2C2C', name: 'Charcoal Trousers', why: 'Charcoal offers contrast without harshness of jet black',        rating: 4, occasion: 'Formal & office' },
        { hex: '#8B0000', name: 'Wine Coat',         why: 'A wine-red coat is a power statement for fair-skinned women',    rating: 5, occasion: 'Winter & formal' },
      ],
    },
    makeup: [
      { hex: '#E8896A', name: 'Peach Blush',  type: 'Blush',      tip: 'Apply to apples of cheeks for a natural flush' },
      { hex: '#C0392B', name: 'Berry Lip',    type: 'Lipstick',   tip: 'Bold berry lip with minimal eye makeup is perfection' },
      { hex: '#F4A460', name: 'Nude Beige',   type: 'Lip & Base', tip: 'Warm nude slightly deeper than your skin looks natural' },
      { hex: '#8B0000', name: 'Deep Red',     type: 'Lipstick',   tip: 'Classic red lip — pair with clean, minimal makeup' },
      { hex: '#D4888A', name: 'Rose Pink',    type: 'Blush & Lip',tip: 'Rosy pink is your most versatile everyday shade' },
      { hex: '#A0522D', name: 'Mocha',        type: 'Lipstick',   tip: 'Warm mocha for daytime looks — flattering and easy' },
    ],
    jewelry: [
      { hex: '#FFD700', name: 'Yellow Gold',  metal: true,  tip: 'Classic yellow gold enhances warm peachy undertones' },
      { hex: '#E8C8A0', name: 'Rose Gold',    metal: true,  tip: 'Rose gold is especially flattering for fair Indian skin' },
      { hex: '#50C878', name: 'Emerald',      metal: false, tip: 'Deep green stones create stunning contrast' },
      { hex: '#E0115F', name: 'Ruby',         metal: false, tip: 'Ruby red stones complement fair skin beautifully' },
      { hex: '#9B59B6', name: 'Amethyst',     metal: false, tip: 'Purple stones echo jewel-tone clothing palette' },
      { hex: '#3F51B5', name: 'Sapphire',     metal: false, tip: 'Blue sapphire against fair skin is timelessly elegant' },
    ],
    footwear: [
      { hex: '#7B3F00', name: 'Tan Brown',      tip: 'Neutral tan works for both ethnic and western looks' },
      { hex: '#800000', name: 'Burgundy',        tip: 'Deep burgundy is a sophisticated choice for all occasions' },
      { hex: '#1B1B2F', name: 'Midnight Navy',   tip: 'Navy is a smarter alternative to basic black' },
      { hex: '#2C2C2C', name: 'Classic Black',   tip: 'Timeless black works with everything' },
      { hex: '#C8A97E', name: 'Nude Beige',      tip: 'Leg-elongating nude in a shade slightly deeper than your skin' },
      { hex: '#4B2D8F', name: 'Deep Purple',     tip: 'Statement purple footwear for festive looks' },
    ],
    seasons: {
      spring: { tip: 'Soft pastels with a warm blush — peach, lilac, warm mint', colours: ['#F4A7A0','#B5A4D8','#89C4A3','#F7C5A0'] },
      summer: { tip: 'Crisp jewel tones — cobalt, fuchsia, clear red', colours: ['#1B5E8F','#E91E8C','#C62828','#00838F'] },
      autumn: { tip: 'Deep spiced earth tones — rust, burnt sienna, forest green', colours: ['#C94B27','#7B3F00','#2E7D32','#880E4F'] },
      winter: { tip: 'Bold contrasts — pure white, black, vivid jewel tones', colours: ['#1C1C1C','#FFFFFF','#4B2D8F','#8B0000'] },
    },
    styleTip: 'Bold jewel tones and deep earthy shades create stunning contrast. Avoid colors too close to your skin tone.',
  },

  wheatish: {
    name: 'Wheatish',
    range: 'Golden · Medium · Warm',
    swatch: '#C8956C',
    desc: 'Golden-brown warm undertones with a sun-kissed glow. The most common Indian skin tone.',
    clothing: {
      best: [
        { hex: '#FF8C00', name: 'Deep Orange',  why: 'Warm orange mirrors your golden undertones — instant radiance booster', rating: 5, occasion: 'Festive & casual' },
        { hex: '#B8860B', name: 'Dark Golden',  why: 'Golden-brown is your most natural power colour — made for wheatish skin', rating: 5, occasion: 'Weddings & parties' },
        { hex: '#6B3FA0', name: 'Purple',       why: 'Warm-cool contrast that makes wheatish skin glow', rating: 4, occasion: 'Evening & formal' },
        { hex: '#CC0000', name: 'Cherry Red',   why: 'Bold red is a timeless match for warm golden complexion', rating: 5, occasion: 'All occasions' },
        { hex: '#008B8B', name: 'Dark Cyan',    why: 'Deep teal creates a refreshing contrast with warm undertones', rating: 4, occasion: 'Office & semi-formal' },
        { hex: '#556B2F', name: 'Olive Green',  why: 'Earthy olive echoes warm undertones for a natural harmony', rating: 4, occasion: 'Casual & outdoors' },
        { hex: '#FF69B4', name: 'Hot Pink',     why: 'Vibrant pink against golden skin creates a stunning Indian look', rating: 5, occasion: 'Celebrations & parties' },
        { hex: '#1F4E79', name: 'Cobalt Blue',  why: 'Deep cobalt offers cool contrast that makes warm skin radiant', rating: 4, occasion: 'Formal & office' },
      ],
      avoid: [
        { hex: '#F5DEB3', name: 'Wheat',         why: 'Blends with your skin — zero contrast or definition' },
        { hex: '#FAEBD7', name: 'Antique White', why: 'Warm pale shade makes wheatish skin look dull and sallow' },
        { hex: '#C2B280', name: 'Sandy Beige',   why: 'Too close to complexion — completely washes you out' },
      ],
      traditional: [
        { hex: '#FF8C00', name: 'Orange Saree',      why: 'Warm orange is the quintessential colour for wheatish skin — pure radiance', rating: 5, occasion: 'Navratri, Diwali, weddings' },
        { hex: '#B8860B', name: 'Golden Lehenga',    why: 'Antique gold lehenga brings out the warmth in your complexion', rating: 5, occasion: 'Weddings & sangeets' },
        { hex: '#CC0000', name: 'Crimson Salwar',    why: 'Rich crimson gives wheatish skin a festive, vibrant glow', rating: 5, occasion: 'Festivals & pujas' },
        { hex: '#008B8B', name: 'Teal Kurta',        why: 'Deep teal creates a refreshing contrast with warm golden skin', rating: 4, occasion: 'Office & casual ethnic' },
        { hex: '#6B3FA0', name: 'Purple Sherwani',   why: 'Jewel-purple ethnic wear makes wheatish skin look regal', rating: 4, occasion: 'Weddings & formal ethnic' },
        { hex: '#556B2F', name: 'Olive Anarkali',    why: 'Earthy olive harmonises with your natural warm undertones', rating: 3, occasion: 'Casual & everyday ethnic' },
      ],
      western: [
        { hex: '#CC0000', name: 'Red Midi Dress',       why: 'A bold red dress is a showstopper against warm golden complexion', rating: 5, occasion: 'Dates, parties & events' },
        { hex: '#FF8C00', name: 'Burnt Orange Blazer',  why: 'Warm orange blazer channels your undertone — effortlessly stylish', rating: 5, occasion: 'Office & casual chic' },
        { hex: '#1F4E79', name: 'Dark Denim',           why: 'Deep indigo denim creates excellent contrast with wheatish skin', rating: 5, occasion: 'Everyday casual' },
        { hex: '#6B3FA0', name: 'Purple Shift Dress',   why: 'Purple dresses make golden-brown skin look luxuriously warm', rating: 4, occasion: 'Parties & evenings out' },
        { hex: '#FF69B4', name: 'Hot Pink Top',         why: 'Vivid pink paired with wheatish skin is a classic Indian pop of colour', rating: 4, occasion: 'Brunches & casual outings' },
        { hex: '#2C2C2C', name: 'Black Trousers',       why: 'Black bottoms with warm tops create a perfect balanced look', rating: 4, occasion: 'Formal & office' },
      ],
    },
    makeup: [
      { hex: '#D2691E', name: 'Copper Bronze', type: 'Highlighter', tip: 'Bronze glow on cheekbones amplifies your golden undertones' },
      { hex: '#C0392B', name: 'Brick Red',     type: 'Lipstick',    tip: 'Warm brick red lip is your ultimate everyday power shade' },
      { hex: '#8B4513', name: 'Warm Nude',     type: 'Lip & Base',  tip: 'Your nude should always lean warm-brown, never pink' },
      { hex: '#FF6B6B', name: 'Coral',         type: 'Lip & Blush', tip: 'Coral is your summer go-to — fresh and vibrant' },
      { hex: '#B5451B', name: 'Terracotta',    type: 'Blush',       tip: 'Terracotta blush mimics a natural sun-kissed flush' },
      { hex: '#A52A2A', name: 'Brown-Red',     type: 'Lipstick',    tip: 'Deep brown-red for an effortlessly warm evening look' },
    ],
    jewelry: [
      { hex: '#FFD700', name: 'Gold',         metal: true,  tip: 'Yellow gold is your perfect metal — always wear it boldly' },
      { hex: '#B8860B', name: 'Antique Gold', metal: true,  tip: 'Antique gold jewelry complements your warm, earthy undertones' },
      { hex: '#FF8C00', name: 'Amber',        metal: false, tip: 'Warm amber stones mirror your golden skin beautifully' },
      { hex: '#228B22', name: 'Forest Green', metal: false, tip: 'Deep green stones create rich contrast with warm skin' },
      { hex: '#DC143C', name: 'Crimson Ruby', metal: false, tip: 'Red stones are your most traditional and flattering gem choice' },
      { hex: '#1F4E79', name: 'Lapis Blue',   metal: false, tip: 'Deep blue lapis creates stunning cool-warm contrast' },
    ],
    footwear: [
      { hex: '#8B4513', name: 'Saddle Brown', tip: 'Warm brown leather is your most versatile footwear choice' },
      { hex: '#D2691E', name: 'Warm Camel',   tip: 'Camel tones harmonise with golden undertones naturally' },
      { hex: '#800000', name: 'Maroon',        tip: 'Deep maroon is timeless and flattering for warm complexions' },
      { hex: '#2C2C2C', name: 'Black',         tip: 'Classic black works for all occasions — pair with bold clothes' },
      { hex: '#FF8C00', name: 'Rust Orange',   tip: 'Statement rust shoes are a beautiful extension of your colour palette' },
      { hex: '#B8860B', name: 'Antique Gold',  tip: 'Gold sandals for ethnic looks — always a winning combination' },
    ],
    seasons: {
      spring: { tip: 'Warm pastels — coral peach, golden yellow, marigold', colours: ['#FFAB76','#F7DC6F','#F4A460','#F08080'] },
      summer: { tip: 'Bold brights — fuchsia, turquoise, vivid red',        colours: ['#CC0000','#FF69B4','#008B8B','#FF8C00'] },
      autumn: { tip: 'Your season! Harvest tones — burnt orange, mustard, terracotta', colours: ['#FF8C00','#B8860B','#8B4513','#556B2F'] },
      winter: { tip: 'Rich deep tones — ruby, cobalt, forest green, gold',  colours: ['#CC0000','#1F4E79','#228B22','#B8860B'] },
    },
    styleTip: 'Your warm golden skin glows in earthy and spiced tones. Oranges, brick reds, and jewel-toned purples make you shine!',
  },

  dusky: {
    name: 'Dusky',
    range: 'Olive · Medium-deep · Rich',
    swatch: '#9B6347',
    desc: 'Deep warm undertone with olive or rich brown hues. Common in South and Central India. Naturally radiant skin that carries vibrant colours effortlessly.',
    clothing: {
      best: [
        { hex: '#FFD700', name: 'Gold Yellow',  why: 'Bright gold against dusky skin is breathtaking — pure radiance', rating: 5, occasion: 'Weddings & festive' },
        { hex: '#FF4500', name: 'Red Orange',   why: 'Electric red-orange creates a fiery, stunning contrast with olive skin', rating: 5, occasion: 'Festive & bold' },
        { hex: '#8B008B', name: 'Magenta',      why: 'Bold magenta makes dusky skin look vibrant and alive', rating: 5, occasion: 'Parties & celebrations' },
        { hex: '#00CED1', name: 'Turquoise',    why: 'Cool turquoise creates jaw-dropping contrast with warm olive skin', rating: 5, occasion: 'Beach & casual' },
        { hex: '#32CD32', name: 'Lime Green',   why: 'Electric lime looks extraordinary against rich dusky complexions', rating: 4, occasion: 'Casual & summer' },
        { hex: '#FF1493', name: 'Deep Pink',    why: 'Vivid hot pink is a classic match that makes dusky skin radiate', rating: 5, occasion: 'All occasions' },
        { hex: '#FFFFFF', name: 'Pure White',   why: 'Pure white creates the most powerful contrast with dusky skin', rating: 5, occasion: 'Summer & daytime' },
        { hex: '#E0E0E0', name: 'Silver Gray',  why: 'Cool silver-gray creates sophisticated contrast with warm olive skin', rating: 3, occasion: 'Formal & office' },
      ],
      avoid: [
        { hex: '#808080', name: 'Dull Gray',   why: 'Muddy gray kills the natural warmth and glow of dusky skin' },
        { hex: '#A9A9A9', name: 'Stone Gray',  why: 'Muted cool grays clash with warm olive undertones, looking ashy' },
        { hex: '#654321', name: 'Dark Brown',  why: 'Too close to your skin tone — creates a flat undefined look' },
      ],
      traditional: [
        { hex: '#FFD700', name: 'Gold Kanjivaram',    why: 'A gold Kanjivaram saree on dusky skin is the most iconic South Indian beauty look', rating: 5, occasion: 'Weddings & temple visits' },
        { hex: '#FF1493', name: 'Deep Pink Lehenga',  why: 'Hot pink lehenga makes dusky skin look absolutely electrifying', rating: 5, occasion: 'Sangeet, mehendi & parties' },
        { hex: '#00CED1', name: 'Turquoise Saree',    why: 'Teal-turquoise saree is a classic pairing that makes olive skin sing', rating: 5, occasion: 'Festivals & formal events' },
        { hex: '#8B008B', name: 'Magenta Kurta',      why: 'Bold magenta against dusky skin is a traditional showstopper', rating: 5, occasion: 'Pujas & casual ethnic' },
        { hex: '#FF4500', name: 'Bright Orange',      why: 'Saffron-orange ethnic wear brings out the warm richness of dusky skin', rating: 4, occasion: 'Navratri & festive' },
        { hex: '#32CD32', name: 'Lime Green Dupatta', why: 'A bright green dupatta accent creates a vibrant festive look', rating: 4, occasion: 'Casual ethnic & outings' },
      ],
      western: [
        { hex: '#FFFFFF', name: 'White Dress',       why: 'A crisp white dress against dusky skin is the ultimate power look', rating: 5, occasion: 'Summer, brunches & events' },
        { hex: '#FFD700', name: 'Yellow Sundress',   why: 'Sunshine yellow makes dusky skin look absolutely radiant outdoors', rating: 5, occasion: 'Casual & beach' },
        { hex: '#00CED1', name: 'Teal Blazer',       why: 'Teal blazer over neutral separates creates a bold professional statement', rating: 4, occasion: 'Office & formal' },
        { hex: '#FF1493', name: 'Hot Pink Co-ord',   why: 'Hot pink co-ord set makes dusky skin the centre of attention', rating: 5, occasion: 'Parties & nights out' },
        { hex: '#FF4500', name: 'Orange Top',        why: 'Warm orange tops bring out the natural warmth in olive-toned skin', rating: 4, occasion: 'Casual & brunches' },
        { hex: '#32CD32', name: 'Lime Linen Set',    why: 'Lime green linen sets look fresh and vibrant on dusky skin', rating: 4, occasion: 'Daytime & outdoor' },
      ],
    },
    makeup: [
      { hex: '#FF6347', name: 'Tomato Coral', type: 'Lip & Blush', tip: 'Coral with warm-red undertones is your everyday power shade' },
      { hex: '#FFD700', name: 'Gold Shimmer', type: 'Highlighter', tip: 'Gold highlighter on cheekbones makes dusky skin radiate' },
      { hex: '#DC143C', name: 'Crimson Lip',  type: 'Lipstick',    tip: 'Bold crimson lip against dusky skin is timelessly stunning' },
      { hex: '#FF8C00', name: 'Amber Glow',   type: 'Eyeshadow',   tip: 'Warm amber eye look with gold liner is your signature' },
      { hex: '#C71585', name: 'Magenta Pink', type: 'Lipstick',    tip: 'Vivid magenta lip is the boldest, most beautiful choice' },
      { hex: '#8B0000', name: 'Dark Ruby',    type: 'Lipstick',    tip: 'Deep ruby for evening — dramatic and irresistibly rich' },
    ],
    jewelry: [
      { hex: '#FFD700', name: 'Yellow Gold',  metal: true,  tip: 'Heavy gold jewelry on dusky skin is a timeless South Indian tradition' },
      { hex: '#00CED1', name: 'Turquoise',    metal: false, tip: 'Turquoise stones create a magical contrast with olive skin' },
      { hex: '#FF4500', name: 'Coral Gem',    metal: false, tip: 'Warm coral stones mirror the richness of your complexion' },
      { hex: '#ADFF2F', name: 'Jade Green',   metal: false, tip: 'Jade and green stones look extraordinary against dusky skin' },
      { hex: '#FF1493', name: 'Pink Sapphire',metal: false, tip: 'Bold pink gemstones make dusky skin look vibrant and regal' },
      { hex: '#C0C0C0', name: 'Silver',       metal: true,  tip: 'Cool silver creates a refreshing contrast with warm olive skin' },
    ],
    footwear: [
      { hex: '#FFD700', name: 'Golden Sandal', tip: 'Gold footwear with dusky skin is a classic Indian beauty combination' },
      { hex: '#FF4500', name: 'Rusty Orange',  tip: 'Warm orange shoes extend your boldest colour palette to your feet' },
      { hex: '#FFFFFF', name: 'White',          tip: 'White footwear creates maximum contrast — stunning in summer' },
      { hex: '#2C2C2C', name: 'Black',          tip: 'Classic black grounds bold outfit colours beautifully' },
      { hex: '#00CED1', name: 'Turquoise',      tip: 'Statement turquoise footwear is unexpected and breathtaking' },
      { hex: '#C0C0C0', name: 'Silver',         tip: 'Silver metallic sandals are endlessly versatile for festive looks' },
    ],
    seasons: {
      spring: { tip: 'Electric florals — bright fuchsia, lime green, vivid coral', colours: ['#FF1493','#32CD32','#FF6347','#00CED1'] },
      summer: { tip: 'White, gold and neon tones for sun-kissed radiance',         colours: ['#FFFFFF','#FFD700','#FF4500','#8B008B'] },
      autumn: { tip: 'Bold harvest brights — orange, gold, electric teal, magenta', colours: ['#FF4500','#FFD700','#00CED1','#FF1493'] },
      winter: { tip: 'Stark contrasts — pure white, black and jewel-bright pops',  colours: ['#FFFFFF','#1C1C1C','#8B008B','#32CD32'] },
    },
    styleTip: 'Bright, saturated and vibrant colours are your best friends! White, gold and electric hues create stunning contrast.',
  },

  deep: {
    name: 'Deep',
    range: 'Dark · Rich · Radiant',
    swatch: '#6B3D2E',
    desc: 'Rich deep brown with cool or warm undertones. Radiant, bold and naturally luminous skin that makes every vivid colour pop.',
    clothing: {
      best: [
        { hex: '#FFD700', name: 'Gold',          why: 'Gold against deep skin is the most stunning combination — absolute royalty', rating: 5, occasion: 'All occasions' },
        { hex: '#FF6600', name: 'Vivid Orange',  why: 'Bright orange makes deep skin look incredibly vibrant and powerful',        rating: 5, occasion: 'Festive & bold' },
        { hex: '#00FFFF', name: 'Cyan',           why: 'Electric cyan creates breathtaking cool-warm contrast with dark skin',      rating: 5, occasion: 'Parties & summer' },
        { hex: '#7FFF00', name: 'Chartreuse',    why: 'Bold yellow-green pops magnificently against deep rich complexions',        rating: 4, occasion: 'Casual & bold' },
        { hex: '#FF0080', name: 'Electric Pink', why: 'Neon pink is extraordinary on deep skin — looks regal not garish',         rating: 5, occasion: 'Parties & celebrations' },
        { hex: '#FFFFFF', name: 'White',          why: 'Pure white creates the highest contrast — the ultimate power statement',    rating: 5, occasion: 'All occasions' },
        { hex: '#E0115F', name: 'Ruby Red',       why: 'Deep ruby red makes dark skin look fiercely glamorous',                    rating: 5, occasion: 'Festive & evening' },
        { hex: '#9ACD32', name: 'Yellow Green',  why: 'Fresh yellow-green creates an unexpected and beautiful contrast',          rating: 4, occasion: 'Casual & outdoors' },
      ],
      avoid: [
        { hex: '#3B2314', name: 'Very Dark Brown', why: 'Too close to your skin tone — creates no contrast or definition' },
        { hex: '#1C1C1C', name: 'Near Black',      why: 'Blends with deep skin completely — wear as accent only, never head-to-toe' },
        { hex: '#5C4033', name: 'Deep Umber',      why: 'Dark brown-gray tones blend with deep skin, dulling your natural radiance' },
      ],
      traditional: [
        { hex: '#FFD700', name: 'Gold Banarasi',       why: 'Gold Banarasi on deep skin is the pinnacle of Indian elegance — regal',   rating: 5, occasion: 'Weddings & formal events' },
        { hex: '#FF0080', name: 'Electric Pink Lehenga',why: 'Bright fuchsia lehenga against deep skin is jaw-dropping',               rating: 5, occasion: 'Sangeet & celebrations' },
        { hex: '#FFFFFF', name: 'White Kurta',          why: 'Crisp white kurta creates the most powerful contrast against deep skin',  rating: 5, occasion: 'Casual ethnic & daytime' },
        { hex: '#FF6600', name: 'Saffron Saree/Dhoti', why: 'Saffron is sacred and stunning — radiates beautifully against deep skin', rating: 5, occasion: 'Festivals & religious events' },
        { hex: '#E0115F', name: 'Ruby Red Sherwani',    why: 'Deep ruby ethnic wear makes dark skin look dramatically glamorous',       rating: 5, occasion: 'Weddings & formal' },
        { hex: '#00FFFF', name: 'Cyan Dupatta',         why: 'Electric cyan dupatta as accent creates a bold modern ethnic look',       rating: 4, occasion: 'Festive & casual ethnic' },
      ],
      western: [
        { hex: '#FFFFFF', name: 'White Linen Suit',  why: 'A white suit on deep skin is the ultimate power look — stunning',      rating: 5, occasion: 'Office, events & formals' },
        { hex: '#FFD700', name: 'Yellow Midi Dress', why: 'Sunshine yellow dress makes deep skin absolutely radiant',              rating: 5, occasion: 'Parties & occasions' },
        { hex: '#FF0080', name: 'Fuchsia Co-ord',    why: 'Electric pink separates are a bold statement that always wins',        rating: 5, occasion: 'Parties & nights out' },
        { hex: '#00FFFF', name: 'Aqua Blazer',       why: 'Cool aqua blazer creates a striking contrast with rich dark skin',     rating: 4, occasion: 'Office & semi-formal' },
        { hex: '#7FFF00', name: 'Lime Green Set',    why: 'Lime green rewards deep skin magnificently — be bold!',                rating: 4, occasion: 'Casual & outdoor' },
        { hex: '#FF6600', name: 'Bold Orange Dress', why: 'Vivid orange dress on deep skin is an unforgettable head-turning look', rating: 5, occasion: 'Festive & casual events' },
      ],
    },
    makeup: [
      { hex: '#FF6600', name: 'Electric Coral', type: 'Lip & Blush', tip: 'Bold coral lip makes deep skin look vibrant and alive' },
      { hex: '#FFD700', name: 'Golden Bronze',  type: 'Highlighter', tip: 'Gold bronze highlighter gives deep skin an otherworldly glow' },
      { hex: '#FF0080', name: 'Fuchsia Lip',    type: 'Lipstick',    tip: 'Electric fuchsia is your most glamorous and powerful shade' },
      { hex: '#E0115F', name: 'Ruby Lip',       type: 'Lipstick',    tip: 'Deep ruby lip is classic, powerful and endlessly flattering' },
      { hex: '#FF4500', name: 'Bold Orange',    type: 'Lip & Blush', tip: 'Warm orange tones celebrate the richness of deep skin' },
      { hex: '#C71585', name: 'Violet Pink',    type: 'Lipstick',    tip: 'Cool-toned violet pink is unexpectedly gorgeous on dark skin' },
    ],
    jewelry: [
      { hex: '#FFD700', name: 'Bold Gold',      metal: true,  tip: 'Chunky yellow gold on deep skin is undeniably regal and powerful' },
      { hex: '#FF6600', name: 'Amber Orange',   metal: false, tip: 'Warm amber stones echo the richness of deep complexions' },
      { hex: '#00FFFF', name: 'Aquamarine',     metal: false, tip: 'Cool blue-green stones create breathtaking contrast with dark skin' },
      { hex: '#7FFF00', name: 'Peridot',        metal: false, tip: 'Green-gold peridot stones are an unexpected and beautiful pairing' },
      { hex: '#FF0080', name: 'Pink Sapphire',  metal: false, tip: 'Electric pink gems against deep skin is bold, regal luxury' },
      { hex: '#C0C0C0', name: 'Silver',         metal: true,  tip: 'Cool silver creates clean modern contrast with warm dark skin' },
    ],
    footwear: [
      { hex: '#FFD700', name: 'Gold',          tip: 'Gold footwear against deep skin is head-turning and magnificent' },
      { hex: '#FFFFFF', name: 'White',          tip: 'White shoes create maximum contrast — a bold and beautiful choice' },
      { hex: '#FF6600', name: 'Bold Orange',   tip: 'Vivid orange shoes are an extension of your boldest colour palette' },
      { hex: '#00FFFF', name: 'Cyan',           tip: 'Teal-cyan footwear is unexpected and extraordinarily striking' },
      { hex: '#2C2C2C', name: 'Black',          tip: 'Classic black grounds vivid outfit colours for a balanced look' },
      { hex: '#FF0080', name: 'Electric Pink', tip: 'Neon pink shoes — wear with white or neutral outfits for maximum impact' },
    ],
    seasons: {
      spring: { tip: 'Neon pastels — electric pink, citrus yellow, aqua',         colours: ['#FF0080','#FFD700','#00FFFF','#7FFF00'] },
      summer: { tip: 'Pure white and bold metallics — your ultimate summer glow',  colours: ['#FFFFFF','#FFD700','#FF6600','#C0C0C0'] },
      autumn: { tip: 'Vivid warm tones — saffron, electric orange, golden green',  colours: ['#FF6600','#FFD700','#E0115F','#9ACD32'] },
      winter: { tip: 'High contrast drama — white, black, neon accents that pop',  colours: ['#FFFFFF','#1C1C1C','#FF0080','#00FFFF'] },
    },
    styleTip: 'Your deep skin is a showstopper! Neons, bright whites and bold metallics look absolutely radiant on you!',
  },
};

// ─────────────────────────────────────────
//  SHOPPING LINKS DATA
// ─────────────────────────────────────────
const SHOPPING_DATA = {
  fair: {
    clothing: [
      { site: 'Myntra',  label: 'Deep purple sarees & suits',    url: 'https://www.myntra.com/sarees?f=Color%3APurple', logo: 'M' },
      { site: 'Myntra',  label: 'Jewel tone kurtas & western',   url: 'https://www.myntra.com/kurtas?f=Color%3ANavy+Blue', logo: 'M' },
      { site: 'Ajio',    label: 'Wine red & emerald outfits',    url: 'https://www.ajio.com/s/red-and-green-clothing', logo: 'A' },
      { site: 'Amazon',  label: 'Ethnic wear in deep tones',     url: 'https://www.amazon.in/s?k=ethnic+wear+deep+purple+wine+red+women', logo: 'Az' },
    ],
    makeup: [
      { site: 'Nykaa',   label: 'Berry & deep red lipsticks',    url: 'https://www.nykaa.com/lip-color/c/968?q=berry+deep+red+lipstick', logo: 'N' },
      { site: 'Nykaa',   label: 'Peach & rose blush',           url: 'https://www.nykaa.com/blush/c/2367?q=peach+rose+blush', logo: 'N' },
      { site: 'Amazon',  label: 'Fair skin tone makeup kits',    url: 'https://www.amazon.in/s?k=makeup+kit+for+fair+skin+indian', logo: 'Az' },
    ],
    jewelry: [
      { site: 'Myntra',  label: 'Gold & rose gold jewelry',      url: 'https://www.myntra.com/jewellery?f=Material%3AGold+Plated', logo: 'M' },
      { site: 'Amazon',  label: 'Emerald & ruby statement pieces',url: 'https://www.amazon.in/s?k=emerald+ruby+jewelry+women+india', logo: 'Az' },
    ],
    footwear: [
      { site: 'Myntra',  label: 'Burgundy & tan heels/flats',    url: 'https://www.myntra.com/heels?f=Color%3ABurgundy', logo: 'M' },
      { site: 'Ajio',    label: 'Navy & classic black footwear', url: 'https://www.ajio.com/s/navy-black-heels-women', logo: 'A' },
    ],
  },
  wheatish: {
    clothing: [
      { site: 'Myntra',  label: 'Orange & golden sarees',        url: 'https://www.myntra.com/sarees?f=Color%3AOrange', logo: 'M' },
      { site: 'Ajio',    label: 'Cherry red & hot pink outfits', url: 'https://www.ajio.com/s/red-pink-ethnic-wear-women', logo: 'A' },
      { site: 'Myntra',  label: 'Olive green & cobalt kurtas',   url: 'https://www.myntra.com/kurtas?f=Color%3AOlive', logo: 'M' },
      { site: 'Amazon',  label: 'Warm tone ethnic wear',         url: 'https://www.amazon.in/s?k=ethnic+wear+orange+mustard+women+india', logo: 'Az' },
    ],
    makeup: [
      { site: 'Nykaa',   label: 'Copper bronze & coral lipsticks',url: 'https://www.nykaa.com/lip-color/c/968?q=copper+coral+lipstick', logo: 'N' },
      { site: 'Nykaa',   label: 'Terracotta & brick red shades', url: 'https://www.nykaa.com/lip-color/c/968?q=terracotta+brick+red', logo: 'N' },
      { site: 'Amazon',  label: 'Warm-tone makeup kits',         url: 'https://www.amazon.in/s?k=makeup+wheatish+skin+indian+women', logo: 'Az' },
    ],
    jewelry: [
      { site: 'Myntra',  label: 'Antique gold & amber jewelry',  url: 'https://www.myntra.com/jewellery?f=Material%3AAntique+Gold', logo: 'M' },
      { site: 'Amazon',  label: 'Crimson & forest green gems',   url: 'https://www.amazon.in/s?k=antique+gold+jewelry+women+india', logo: 'Az' },
    ],
    footwear: [
      { site: 'Myntra',  label: 'Camel, maroon & rust sandals',  url: 'https://www.myntra.com/heels?f=Color%3ACamel', logo: 'M' },
      { site: 'Ajio',    label: 'Saddle brown ethnic footwear',  url: 'https://www.ajio.com/s/brown-ethnic-footwear-women', logo: 'A' },
    ],
  },
  dusky: {
    clothing: [
      { site: 'Myntra',  label: 'Gold & magenta sarees',         url: 'https://www.myntra.com/sarees?f=Color%3AGold', logo: 'M' },
      { site: 'Ajio',    label: 'Turquoise & lime green outfits',url: 'https://www.ajio.com/s/turquoise-green-ethnic-wear', logo: 'A' },
      { site: 'Myntra',  label: 'Deep pink & white western',     url: 'https://www.myntra.com/dresses?f=Color%3AWhite', logo: 'M' },
      { site: 'Amazon',  label: 'Vibrant ethnic wear',           url: 'https://www.amazon.in/s?k=bright+colour+saree+ethnic+wear+women', logo: 'Az' },
    ],
    makeup: [
      { site: 'Nykaa',   label: 'Crimson & magenta lipsticks',   url: 'https://www.nykaa.com/lip-color/c/968?q=crimson+magenta+lipstick', logo: 'N' },
      { site: 'Nykaa',   label: 'Gold shimmer & amber highlighter',url:'https://www.nykaa.com/highlighter/c/2382?q=gold+shimmer', logo: 'N' },
      { site: 'Amazon',  label: 'Bold makeup for dusky skin',    url: 'https://www.amazon.in/s?k=makeup+dusky+dark+skin+indian+women', logo: 'Az' },
    ],
    jewelry: [
      { site: 'Myntra',  label: 'Turquoise & coral jewelry',     url: 'https://www.myntra.com/jewellery?q=turquoise+coral', logo: 'M' },
      { site: 'Amazon',  label: 'Jade & pink sapphire pieces',   url: 'https://www.amazon.in/s?k=turquoise+jade+statement+jewelry+women', logo: 'Az' },
    ],
    footwear: [
      { site: 'Myntra',  label: 'Gold & silver sandals',         url: 'https://www.myntra.com/heels?f=Color%3AGold', logo: 'M' },
      { site: 'Ajio',    label: 'White & teal ethnic footwear',  url: 'https://www.ajio.com/s/white-gold-ethnic-footwear', logo: 'A' },
    ],
  },
  deep: {
    clothing: [
      { site: 'Myntra',  label: 'Electric pink & gold sarees',   url: 'https://www.myntra.com/sarees?f=Color%3APink', logo: 'M' },
      { site: 'Ajio',    label: 'White & vivid orange outfits',  url: 'https://www.ajio.com/s/white-orange-ethnic-wear-women', logo: 'A' },
      { site: 'Myntra',  label: 'Neon & bright western dresses', url: 'https://www.myntra.com/dresses?f=Color%3AYellow', logo: 'M' },
      { site: 'Amazon',  label: 'Bold bright wear for deep skin',url: 'https://www.amazon.in/s?k=neon+bright+colour+ethnic+wear+women+india', logo: 'Az' },
    ],
    makeup: [
      { site: 'Nykaa',   label: 'Fuchsia & ruby red lipsticks',  url: 'https://www.nykaa.com/lip-color/c/968?q=fuchsia+ruby+bold+lipstick', logo: 'N' },
      { site: 'Nykaa',   label: 'Gold bronze & electric coral',  url: 'https://www.nykaa.com/lip-color/c/968?q=gold+bronze+coral', logo: 'N' },
      { site: 'Amazon',  label: 'Deep skin tone makeup',         url: 'https://www.amazon.in/s?k=makeup+deep+dark+skin+tone+indian', logo: 'Az' },
    ],
    jewelry: [
      { site: 'Myntra',  label: 'Bold gold & aquamarine jewelry',url: 'https://www.myntra.com/jewellery?f=Material%3AGold+Plated', logo: 'M' },
      { site: 'Amazon',  label: 'Peridot & pink sapphire pieces',url: 'https://www.amazon.in/s?k=bold+statement+gold+jewelry+women+india', logo: 'Az' },
    ],
    footwear: [
      { site: 'Myntra',  label: 'Gold, white & electric heels',  url: 'https://www.myntra.com/heels?f=Color%3AGold', logo: 'M' },
      { site: 'Ajio',    label: 'Bold colour block footwear',    url: 'https://www.ajio.com/s/bright-bold-footwear-women', logo: 'A' },
    ],
  },
};

// ─────────────────────────────────────────
//  REQUEST HELPERS
// ─────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}

function getToken(req) {
  const auth = req.headers['authorization'] || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function requireAuth(req, db) {
  const token = getToken(req);
  if (!token) return null;
  return getUserFromToken(token, db);
}

// ─────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────
async function router(req, res) {
  const url    = req.url.split('?')[0];
  const method = req.method;
  const db     = readDB();

  // CORS preflight
  if (method === 'OPTIONS') return send(res, 200, {});

  // ── AUTH ROUTES ──────────────────────────

  // POST /api/auth/signup
  if (method === 'POST' && url === '/api/auth/signup') {
    const { name, email, password } = await parseBody(req);
    if (!name || !email || !password || password.length < 6) {
      return send(res, 400, { error: 'Name, email, and password (min 6 chars) are required.' });
    }
    if (db.users.find(u => u.email === email.toLowerCase())) {
      return send(res, 409, { error: 'An account with this email already exists.' });
    }
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const token = generateToken();
    db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    writeDB(db);
    return send(res, 201, {
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  }

  // POST /api/auth/login
  if (method === 'POST' && url === '/api/auth/login') {
    const { email, password } = await parseBody(req);
    if (!email || !password) return send(res, 400, { error: 'Email and password required.' });
    const user = db.users.find(u => u.email === email.toLowerCase() && u.password === hashPassword(password));
    if (!user) return send(res, 401, { error: 'Invalid email or password.' });
    const token = generateToken();
    db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    writeDB(db);
    return send(res, 200, {
      message: 'Logged in successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  }

  // POST /api/auth/logout
  if (method === 'POST' && url === '/api/auth/logout') {
    const token = getToken(req);
    if (token) {
      db.sessions = db.sessions.filter(s => s.token !== token);
      writeDB(db);
    }
    return send(res, 200, { message: 'Logged out successfully.' });
  }

  // GET /api/auth/me
  if (method === 'GET' && url === '/api/auth/me') {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Not authenticated.' });
    return send(res, 200, { user: { id: user.id, name: user.name, email: user.email } });
  }

  // ── PREFERENCES ROUTES ───────────────────

  // GET /api/preferences
  if (method === 'GET' && url === '/api/preferences') {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const prefs = db.preferences.find(p => p.userId === user.id) || null;
    return send(res, 200, { preferences: prefs });
  }

  // POST /api/preferences  — save skin tone + prefs
  if (method === 'POST' && url === '/api/preferences') {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const { skinTone, detectionMethod, notes } = await parseBody(req);
    if (!skinTone || !['fair','wheatish','dusky','deep'].includes(skinTone)) {
      return send(res, 400, { error: 'Valid skinTone required: fair, wheatish, dusky, or deep.' });
    }
    const existing = db.preferences.findIndex(p => p.userId === user.id);
    const pref = {
      userId: user.id,
      skinTone,
      detectionMethod: detectionMethod || 'manual',
      notes: notes || '',
      updatedAt: new Date().toISOString(),
    };
    if (existing >= 0) db.preferences[existing] = pref;
    else db.preferences.push(pref);
    writeDB(db);
    return send(res, 200, { message: 'Preferences saved!', preferences: pref });
  }

  // ── COLOUR RECOMMENDATION ROUTES ─────────

  // GET /api/colours  — list all tones (overview)
  if (method === 'GET' && url === '/api/colours') {
    const overview = Object.entries(COLOUR_DATA).map(([id, d]) => ({
      id,
      name: d.name,
      range: d.range,
      swatch: d.swatch,
      desc: d.desc,
    }));
    return send(res, 200, { tones: overview });
  }

  // GET /api/colours/:tone  — full data for one tone
  const toneMatch = url.match(/^\/api\/colours\/(fair|wheatish|dusky|deep)$/);
  if (method === 'GET' && toneMatch) {
    const tone = toneMatch[1];
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required to view colour recommendations.' });
    return send(res, 200, { tone, data: COLOUR_DATA[tone] });
  }

  // GET /api/colours/:tone/clothing
  const clothingMatch = url.match(/^\/api\/colours\/(fair|wheatish|dusky|deep)\/clothing$/);
  if (method === 'GET' && clothingMatch) {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const tone = clothingMatch[1];
    return send(res, 200, { tone, clothing: COLOUR_DATA[tone].clothing });
  }

  // GET /api/colours/:tone/makeup
  const makeupMatch = url.match(/^\/api\/colours\/(fair|wheatish|dusky|deep)\/makeup$/);
  if (method === 'GET' && makeupMatch) {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const tone = makeupMatch[1];
    return send(res, 200, { tone, makeup: COLOUR_DATA[tone].makeup });
  }

  // GET /api/colours/:tone/jewelry
  const jewelryMatch = url.match(/^\/api\/colours\/(fair|wheatish|dusky|deep)\/jewelry$/);
  if (method === 'GET' && jewelryMatch) {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const tone = jewelryMatch[1];
    return send(res, 200, { tone, jewelry: COLOUR_DATA[tone].jewelry });
  }

  // GET /api/colours/:tone/footwear
  const footwearMatch = url.match(/^\/api\/colours\/(fair|wheatish|dusky|deep)\/footwear$/);
  if (method === 'GET' && footwearMatch) {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const tone = footwearMatch[1];
    return send(res, 200, { tone, footwear: COLOUR_DATA[tone].footwear });
  }

  // GET /api/colours/:tone/seasonal
  const seasonalMatch = url.match(/^\/api\/colours\/(fair|wheatish|dusky|deep)\/seasonal$/);
  if (method === 'GET' && seasonalMatch) {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const tone = seasonalMatch[1];
    return send(res, 200, { tone, seasons: COLOUR_DATA[tone].seasons });
  }

  // ── SHOPPING ROUTES ───────────────────────

  // GET /api/shopping  — all shopping links
  if (method === 'GET' && url === '/api/shopping') {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    return send(res, 200, { shopping: SHOPPING_DATA });
  }

  // GET /api/shopping/:tone  — shopping for one tone
  const shopMatch = url.match(/^\/api\/shopping\/(fair|wheatish|dusky|deep)$/);
  if (method === 'GET' && shopMatch) {
    const user = requireAuth(req, db);
    if (!user) return send(res, 401, { error: 'Login required.' });
    const tone = shopMatch[1];
    return send(res, 200, { tone, shopping: SHOPPING_DATA[tone] });
  }

  // ── HEALTH CHECK ─────────────────────────
  if (method === 'GET' && url === '/api/health') {
    return send(res, 200, {
      status: 'ok',
      app: 'Aaina — Indian Skin Tone Color Analysis',
      author: 'Ananya Tyagi',
      version: '1.0.0',
      uptime: process.uptime().toFixed(1) + 's',
      users: db.users.length,
      timestamp: new Date().toISOString(),
    });
  }

  // ── 404 ──────────────────────────────────
  return send(res, 404, { error: `Route not found: ${method} ${url}` });
}

// ─────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error('Server error:', err);
    send(res, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     🪞 AAINA — Backend API Server Running      ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  URL    → http://localhost:${PORT}               ║`);
  console.log('║  Author → Ananya Tyagi                       ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  ENDPOINTS:                                  ║');
  console.log('║  POST /api/auth/signup                       ║');
  console.log('║  POST /api/auth/login                        ║');
  console.log('║  POST /api/auth/logout                       ║');
  console.log('║  GET  /api/auth/me                           ║');
  console.log('║  GET  /api/preferences                       ║');
  console.log('║  POST /api/preferences                       ║');
  console.log('║  GET  /api/colours                           ║');
  console.log('║  GET  /api/colours/:tone                     ║');
  console.log('║  GET  /api/colours/:tone/clothing            ║');
  console.log('║  GET  /api/colours/:tone/makeup              ║');
  console.log('║  GET  /api/colours/:tone/jewelry             ║');
  console.log('║  GET  /api/colours/:tone/footwear            ║');
  console.log('║  GET  /api/colours/:tone/seasonal            ║');
  console.log('║  GET  /api/shopping/:tone                    ║');
  console.log('║  GET  /api/health                            ║');
  console.log('╚══════════════════════════════════════════════╝\n');
});
