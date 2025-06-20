import { Card } from '@/gameObjects/Card';

export const PlayingCards = {
  SUITS: ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
};

export function generateDeck() {
  return PlayingCards.SUITS.flatMap((suit) => {
    return PlayingCards.RANKS.map((rank) => {
      return new Card(suit, rank);
    });
  });
}
