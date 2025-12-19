import { VfxType } from "@/entities/card/model/animations";
import { useSoundSystem } from "@/shared/lib/useSoundSystem";
import { useBattleVisuals } from "./useBattleVisuals";
import { BATTLE_ACTIONS } from "./model/constants";

export const useBattleEvents = (
  visuals: ReturnType<typeof useBattleVisuals>,
  sounds: ReturnType<typeof useSoundSystem> | null,
  dispatch: React.Dispatch<any>
) => {
  const { addFloatingText, triggerAnimation, triggerShake, triggerVfx, triggerDuel, sleep } = visuals;

  const handleBattleEventVisuals = async (event: any) => {
    console.log('handleBattleEventVisuals', event.type, event);
    switch(event.type) {
      case 'CHOICE_REQUIRED':
          if (event.side === 'PLAYER') {
              sounds?.playSfx('click');
              dispatch({ type: BATTLE_ACTIONS.SET_PENDING_CHOICE, choice: { options: event.options, side: 'PLAYER' } });
          }
          await sleep(300);
          break;

      case 'FATIGUE_DAMAGE':
        sounds?.playSfx('damage');
        await triggerShake();
        addFloatingText(`УСТАЛОСТЬ: -${event.value}`, 50, event.side === 'PLAYER' ? 80 : 20, 'text-purple-500 font-black text-4xl');
        await sleep(500);
        break;

      case 'ATTACK_INIT':
        sounds?.playSfx('attack');
        await triggerDuel(event.attackerId, event.targetId);
        break;

      case 'CARD_PLAYED':
        sounds?.playSfx('play_card');
        await sleep(500);
        break;

      case 'HERO_POWER_USED':
        sounds?.playSfx('play_card');
        await sleep(500);
        break;

      case 'HERO_HEALTH':
        if (event.amount < 0) {
          sounds?.playSfx('damage');
          await triggerShake();
          addFloatingText(`${event.amount}`, 50, event.target === 'PLAYER' ? 80 : 20, 'text-red-500 font-bold');
        } else {
          sounds?.playSfx('buff');
          const vfxType: VfxType = event.isLifesteal ? 'LIFESTEAL' : 'HEAL';
          await triggerVfx(vfxType, undefined, event.target === 'PLAYER' ? 'HERO_PLAYER' : 'HERO_ENEMY');
          addFloatingText(`+${event.amount}`, 50, event.target === 'PLAYER' ? 80 : 20, event.isArmor ? 'text-slate-300' : 'text-green-400');
        }
        await sleep(200);
        break;

      case 'MINION_DEATH':
        sounds?.playSfx('die');
        await triggerAnimation(event.cardId, 'die');
          await sleep(600);
        break;

      case 'DAMAGE':
        sounds?.playSfx('damage');
        if (event.isInstakill) await triggerVfx('INSTAKILL', undefined, event.targetId);
        if (event.isPoison) {
          addFloatingText(`-${event.value}`, 50, 50, 'text-green-500 font-black');
          await triggerVfx('POISON', undefined, event.targetId);
        } else {
          addFloatingText(`-${event.value}`, 50, 50, 'text-red-500 font-black');
        }
        await triggerAnimation(event.targetId, 'damage');
        break;

      case 'BUFF':
        sounds?.playSfx('buff');
        await triggerVfx('BUFF', undefined, event.cardId);
        break;

      case 'AOE_DAMAGE':
        sounds?.playSfx('damage');
        await triggerVfx('AOE_NOVA');
        await triggerShake();
        break;
        
      case 'FREEZE':
        sounds?.playSfx('click');
        await triggerVfx('FROST', undefined, event.targetId);
        break;
    }
  };

  return { handleBattleEventVisuals };
};
