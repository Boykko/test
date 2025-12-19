import React              from "react";
import { CardFrame }      from "@/entities/card/ui/CardFrame";
import { useCardVisuals } from "@/shared/hooks/useCardVisuals";
import { CardData }       from "@/shared/types";

interface AdminCardProps {
  data: CardData;
  size?: 'xs' | 'sm';
}

export const AdminCard: React.FC<AdminCardProps> = ({ data, size = 'sm' }) => {
  const visuals = useCardVisuals(data, size);

  return (
    <CardFrame
      data={data}
      size={size}
      rankStyle={visuals.rankStyle}
      keywords={visuals.keywords}
      stats={{ 
          attack: data.baseAttack, 
          health: data.baseHealth, 
          cost: data.baseCost, 
          armor: data.baseArmor 
      }}
      isSpell={visuals.isSpell}
      activeRank={visuals.activeRank}
      isInteractable={false}
    />
  );
};
