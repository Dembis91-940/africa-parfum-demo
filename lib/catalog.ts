/**
 * catalog.ts — Catalogue de DÉMONSTRATION « Africa Parfum » (2026-10-01)
 *
 * Finalité : démonstration pour de futurs clients — aucune vente, aucun paiement.
 * Hermes orchestre la boutique ET conseille les visiteurs : `family` + `notes` +
 * `description` sont les seules sources autorisées pour la conseillère vocale /
 * le chatbot (aucun prix, aucun stock, aucune promesse commerciale ici).
 *
 * Périmètre des données :
 * - Maisons et parfums cités à titre de référence nominative de démonstration
 *   (aucune affiliation, aucun partenariat revendiqué).
 * - `id` est l'identifiant stable (= SKU interne) : ne jamais le réécrire.
 * - `volume` est en millilitres — format courant annoncé par la maison, à
 *   revérifier auprès de la source officielle avant toute publication.
 * - `color` est la couleur d'identité utilisée par l'UI (hex).
 * - `shape` est une silhouette de substitution pour le rendu 3D de la démo
 *   (rectangular | round | tall) : ce n'est PAS une description du flacon réel.
 * - Aucun prix, aucun stock, aucune disponibilité : ces champs ne doivent
 *   jamais être déduits ni complétés par un modèle, seulement par une source
 *   vérifiée.
 */

/** Silhouette de substitution utilisée par le moteur 3D de la démonstration. */
export type Shape = 'rectangular' | 'round' | 'tall';

/** Fiche produit du catalogue de démonstration. */
export interface Product {
  id: string;
  brand: string;
  name: string;
  family: string;
  notes: string[];
  description: string;
  color: string;
  shape: Shape;
  volume: number;
}

export const products: Product[] = [
  {
    id: 'dior-sauvage',
    brand: 'Dior',
    name: 'Sauvage',
    family: 'Frais ambré',
    notes: ['bergamote de Calabre', 'vanille'],
    description:
      "Une bergamote fraîche et épicée, prolongée par un accord de vanille.",
    color: '#1B3A5C',
    shape: 'rectangular',
    volume: 100,
  },
  {
    id: 'chanel-n5',
    brand: 'Chanel',
    name: 'N°5',
    family: 'Floral aldéhydé',
    notes: ['aldéhydes', 'rose de mai', 'jasmin'],
    description:
      "Le bouquet floral aldéhydé qui a durablement marqué l'histoire du parfum.",
    color: '#C2A24B',
    shape: 'rectangular',
    volume: 100,
  },
  {
    id: 'ysl-libre',
    brand: 'Yves Saint Laurent',
    name: 'Libre',
    family: 'Floral lavandé',
    notes: ["lavande", "fleur d'oranger", 'vanille', 'musc'],
    description:
      "Un floral lavandé contemporain, entre fleur d'oranger et vanille.",
    color: '#7A69B8',
    shape: 'tall',
    volume: 90,
  },
  {
    id: 'tom-ford-oud-wood',
    brand: 'Tom Ford',
    name: 'Oud Wood',
    family: 'Boisé oriental',
    notes: ['oud', 'bois de santal', 'bois de rose', 'cardamome', 'vanille', 'fève tonka'],
    description:
      "L'oud adouci par les épices et la vanille, signature boisée de la collection Private Blend.",
    color: '#5C3A2E',
    shape: 'tall',
    volume: 50,
  },
  {
    id: 'guerlain-shalimar',
    brand: 'Guerlain',
    name: 'Shalimar',
    family: 'Oriental ambré',
    notes: ['bergamote', 'iris', 'vanille'],
    description:
      "Une signature ambrée de Guerlain autour de la bergamote, de l’iris et de la vanille.",
    color: '#9C6B3C',
    shape: 'round',
    volume: 75,
  },
  {
    id: 'mfk-baccarat-rouge-540',
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    family: 'Floral ambré',
    notes: ['safran', 'jasmin', 'bois d’ambre', 'résine de sapin', 'cèdre'],
    description:
      "Un floral ambré lumineux : safran et jasmin sur un fond de résine et de bois d'ambre.",
    color: '#C0392B',
    shape: 'rectangular',
    volume: 70,
  },
];
