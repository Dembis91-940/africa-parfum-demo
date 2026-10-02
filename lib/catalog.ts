/** Références réelles, photographies originales des maisons. Aucun prix ou stock inventé. */
export interface Product {
  id: string;
  brand: string;
  name: string;
  family: string;
  notes: string[];
  description: string;
  color: string;
  image: string;
  source: string;
}

export const products: Product[] = [
  {
    id: 'dior-sauvage',
    image: 'products/dior-sauvage.jpg',
    source: 'https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-C099700027.html',
    brand: 'Dior',
    name: 'Sauvage',
    family: 'Frais ambré',
    notes: ['bergamote de Calabre', 'vanille'],
    description:
      "Une bergamote fraîche et épicée, prolongée par un accord de vanille.",
    color: '#1B3A5C',
  },
  {
    id: 'chanel-n5',
    image: 'products/chanel-n5.png',
    source: 'https://www.chanel.com/us/fragrance/p/125530/n5-eau-de-parfum-spray/',
    brand: 'Chanel',
    name: 'N°5',
    family: 'Floral aldéhydé',
    notes: ['aldéhydes', 'rose de mai', 'jasmin'],
    description:
      "Le bouquet floral aldéhydé qui a durablement marqué l'histoire du parfum.",
    color: '#C2A24B',
  },
  {
    id: 'ysl-libre',
    image: 'products/ysl-libre.webp',
    source: 'https://www.yslbeautyus.com/fragrance/womens-fragrances/libre/libre-eau-de-parfum/109YSL.html',
    brand: 'Yves Saint Laurent',
    name: 'Libre',
    family: 'Floral lavandé',
    notes: ["lavande", "fleur d'oranger", 'vanille', 'musc'],
    description:
      "Un floral lavandé contemporain, entre fleur d'oranger et vanille.",
    color: '#7A69B8',
  },
  {
    id: 'tom-ford-oud-wood',
    image: 'products/tom-ford-oud-wood.png',
    source: 'https://www.tomfordbeauty.com/products/oud-wood-eau-de-parfum',
    brand: 'Tom Ford',
    name: 'Oud Wood',
    family: 'Boisé oriental',
    notes: ['oud', 'bois de santal', 'bois de rose', 'cardamome', 'vanille', 'fève tonka'],
    description:
      "L'oud adouci par les épices et la vanille, signature boisée de la collection Private Blend.",
    color: '#5C3A2E',
  },
  {
    id: 'guerlain-shalimar',
    image: 'products/guerlain-shalimar.png',
    source: 'https://www.guerlain.com/us/en-us/p/shalimar-eau-de-parfum-G011353.html',
    brand: 'Guerlain',
    name: 'Shalimar',
    family: 'Oriental ambré',
    notes: ['bergamote', 'iris', 'vanille'],
    description:
      "Une signature ambrée de Guerlain autour de la bergamote, de l’iris et de la vanille.",
    color: '#9C6B3C',
  },
  {
    id: 'mfk-baccarat-rouge-540',
    image: 'products/mfk-baccarat-rouge-540.png',
    source: 'https://www.franciskurkdjian.com/us-en/p/baccarat-rouge-540-eau-de-parfum-RA12232.html',
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    family: 'Floral ambré',
    notes: ['safran', 'jasmin', 'bois d’ambre', 'résine de sapin', 'cèdre'],
    description:
      "Un floral ambré lumineux : safran et jasmin sur un fond de résine et de bois d'ambre.",
    color: '#C0392B',
  },
];
