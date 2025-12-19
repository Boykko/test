import { HeroPower } from "@/shared/types";
import { GameCard }  from "../../card/model/types";

export interface PlayerState {
  heroHealth: number;
  heroArmor: number; // Added armor tracking
  maxHealth: number;
  mana: number;
  maxMana: number;
  deck: GameCard[];
  hand: GameCard[];
  board: GameCard[];
  graveyard: GameCard[];
  heroPower?: HeroPower;
}
