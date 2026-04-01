const ADJECTIVES = [
  'happy', 'spicy', 'crispy', 'golden', 'tangy', 'smoky', 'zesty', 'fluffy',
  'savory', 'sweet', 'salty', 'bold', 'fresh', 'crunchy', 'tender', 'juicy',
  'warm', 'rich', 'creamy', 'fiery', 'mild', 'hearty', 'rustic', 'vibrant',
  'lively', 'cozy', 'jolly', 'peppy', 'sunny', 'breezy', 'merry', 'snappy',
  'funky', 'groovy', 'peppered', 'glazed', 'stuffed', 'grilled', 'toasted',
  'saucy', 'steamy', 'buttery', 'velvety', 'silky', 'chunky', 'flaky',
  'tantalizing', 'plump', 'roasted', 'braised', 'charred', 'drizzled',
];

const FOODS = [
  'pizza', 'burger', 'taco', 'sushi', 'ramen', 'pasta', 'curry', 'kebab',
  'waffle', 'donut', 'dumpling', 'noodle', 'bento', 'nacho', 'falafel',
  'pretzel', 'churro', 'gyoza', 'pho', 'shawarma', 'bibimbap', 'pierogi',
  'empanada', 'croissant', 'bagel', 'pita', 'samosa', 'tempura', 'biryani',
  'lasagna', 'risotto', 'katsu', 'chicken', 'beef', 'cheese', 'milkshake',
  'tagine', 'biryani', 'momos', 'arepa', 'injera', 'chimichanga', 'gnocchi',
  'schnitzel', 'stroganoff', 'fajita', 'quesadilla', 'tiramisu', 'mochi',
  'pancake', 'biscuit', 'muffin', 'brownie', 'scone', 'fritter', 'croquette',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateTenantSlug(): string {
  return `${pick(ADJECTIVES)}-${pick(FOODS)}-${randomSuffix()}`;
}
