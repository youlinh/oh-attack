const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TEAM = Object.freeze({
  PLAYER: 'player',
  ENEMY: 'enemy'
});

const UNIT_TYPE = Object.freeze({
  SWORDSMAN: 'swordsman',
  SPEARMAN: 'spearman',
  ARCHER: 'archer',
  ZOMBIE: 'zombie',
  GIANT: 'giant',
  WARSHIP: 'warship',
  MACHINE_GUNNER: 'machine_gunner',
  SHIELD_GUARD: 'shield_guard',
  SWORDSMAN_LEADER: 'swordsman_leader',
  SPEARMAN_LEADER: 'spearman_leader'
});

const UNIT_META = Object.freeze({
  [UNIT_TYPE.SWORDSMAN]: {
    label: '剑士',
    goldCost: 80,
    unlockCost: 0,
    unlockedByDefault: true,
    diamondReward: 4
  },
  [UNIT_TYPE.SPEARMAN]: {
    label: '长矛兵',
    goldCost: 120,
    unlockCost: 0,
    unlockedByDefault: true,
    diamondReward: 6
  },
  [UNIT_TYPE.ARCHER]: {
    label: '弓箭手',
    goldCost: 150,
    unlockCost: 0,
    unlockedByDefault: true,
    diamondReward: 10
  },
  [UNIT_TYPE.ZOMBIE]: {
    label: '僵尸',
    goldCost: 50,
    unlockCost: 0,
    unlockedByDefault: true,
    diamondReward: 4
  },
  [UNIT_TYPE.GIANT]: {
    label: '巨人',
    goldCost: 260,
    unlockCost: 90,
    unlockedByDefault: false,
    diamondReward: 14
  },
  [UNIT_TYPE.WARSHIP]: {
    label: '大战舰',
    goldCost: 500,
    unlockCost: 180,
    unlockedByDefault: false,
    diamondReward: 30
  },
  [UNIT_TYPE.MACHINE_GUNNER]: {
    label: '机枪兵',
    goldCost: 400,
    unlockCost: 250,
    unlockedByDefault: false,
    diamondReward: 20
  },
  [UNIT_TYPE.SHIELD_GUARD]: {
    label: '防盾人',
    goldCost: 180,
    unlockCost: 0,
    unlockedByDefault: true,
    diamondReward: 8
  },
  [UNIT_TYPE.SWORDSMAN_LEADER]: {
    label: '剑士首领',
    goldCost: 300,
    unlockCost: 100,
    unlockedByDefault: false,
    diamondReward: 15
  },
  [UNIT_TYPE.SPEARMAN_LEADER]: {
    label: '矛兵首领',
    goldCost: 611,
    unlockCost: 619,
    unlockedByDefault: false,
    diamondReward: 18
  }
});

const ZOMBIE_POISON_DURATION = 5;
const ZOMBIE_POISON_DPS = 9;

const UPGRADE_CONFIG = Object.freeze({
  baseHp: {
    hpBonus: 250,
    baseCost: 70,
    costStep: 55,
    maxLevel: 3
  },
  attackBuff: {
    bonusStep: 0.15,
    baseCost: 85,
    costStep: 65,
    maxLevel: 4
  }
});

const LEVELS = Object.freeze([
  {
    id: 1,
    name: '前哨试炼',
    difficulty: '简单',
    playerStartingGold: 420,
    enemyBaseHp: 900,
    victoryDiamondReward: 30,
    ai: {
      startingGold: 20,
      maxActiveUnits: 4,
      initialSpawnDelay: 2.8,
      phases: [
        {
          startAt: 0,
          goldIncome: 28,
          spawnDelay: 3.2,
          sequence: [UNIT_TYPE.SWORDSMAN]
        }
      ]
    }
  },
  {
    id: 2,
    name: '边境冲突',
    difficulty: '普通',
    playerStartingGold: 470,
    enemyBaseHp: 1080,
    victoryDiamondReward: 55,
    ai: {
      startingGold: 60,
      maxActiveUnits: 6,
      initialSpawnDelay: 2.2,
      phases: [
        {
          startAt: 0,
          goldIncome: 42,
          spawnDelay: 2.35,
          sequence: [UNIT_TYPE.SWORDSMAN, UNIT_TYPE.SPEARMAN, UNIT_TYPE.ARCHER, UNIT_TYPE.SWORDSMAN]
        },
        {
          startAt: 30,
          goldIncome: 55,
          spawnDelay: 1.95,
          sequence: [UNIT_TYPE.SPEARMAN, UNIT_TYPE.ARCHER, UNIT_TYPE.SWORDSMAN, UNIT_TYPE.SPEARMAN]
        }
      ]
    }
  },
  {
    id: 3,
    name: '钢铁洪流',
    difficulty: '困难',
    playerStartingGold: 540,
    enemyBaseHp: 1380,
    victoryDiamondReward: 95,
    ai: {
      startingGold: 130,
      maxActiveUnits: 7,
      initialSpawnDelay: 1.85,
      phases: [
        {
          startAt: 0,
          goldIncome: 66,
          spawnDelay: 1.85,
          sequence: [UNIT_TYPE.GIANT, UNIT_TYPE.ARCHER, UNIT_TYPE.SPEARMAN, UNIT_TYPE.SWORDSMAN]
        },
        {
          startAt: 34,
          goldIncome: 84,
          spawnDelay: 1.45,
          sequence: [UNIT_TYPE.GIANT, UNIT_TYPE.SPEARMAN, UNIT_TYPE.ARCHER, UNIT_TYPE.SPEARMAN, UNIT_TYPE.SWORDSMAN]
        }
      ]
    }
  },
  {
    id: 4,
    name: '终末舰队',
    difficulty: '噩梦',
    playerStartingGold: 620,
    enemyBaseHp: 1800,
    victoryDiamondReward: 145,
    ai: {
      startingGold: 240,
      maxActiveUnits: 8,
      initialSpawnDelay: 1.25,
      phases: [
        {
          startAt: 0,
          goldIncome: 92,
          spawnDelay: 1.4,
          sequence: [UNIT_TYPE.GIANT, UNIT_TYPE.SPEARMAN, UNIT_TYPE.SWORDSMAN]
        },
        {
          startAt: 28,
          goldIncome: 120,
          spawnDelay: 1.05,
          sequence: [UNIT_TYPE.WARSHIP, UNIT_TYPE.SPEARMAN, UNIT_TYPE.GIANT, UNIT_TYPE.SPEARMAN]
        },
        {
          startAt: 60,
          goldIncome: 145,
          spawnDelay: 0.9,
          sequence: [UNIT_TYPE.WARSHIP, UNIT_TYPE.GIANT, UNIT_TYPE.SPEARMAN, UNIT_TYPE.SPEARMAN, UNIT_TYPE.SWORDSMAN]
        }
      ]
    }
  }
]);

class SoundManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.noiseBuffer = null;
    this.enabled = true;
    this.initialized = false;
    this.schedulerTimer = 0;
    this.lookAheadTime = 0.18;
    this.stepDuration = 0.24;
    this.nextNoteTime = 0;
    this.sequenceIndex = 0;
    this.sequence = [
      { bass: 130.81, arp: [261.63, 329.63, 392] },
      { bass: 146.83, arp: [293.66, 369.99, 440] },
      { bass: 164.81, arp: [329.63, 415.3, 493.88] },
      { bass: 196, arp: [392, 493.88, 587.33] },
      { bass: 174.61, arp: [349.23, 440, 523.25] },
      { bass: 164.81, arp: [329.63, 392, 493.88] },
      { bass: 146.83, arp: [293.66, 369.99, 440] },
      { bass: 196, arp: [392, 493.88, 659.25] }
    ];
  }

  isEnabled() {
    return this.enabled;
  }

  canPlay() {
    return Boolean(this.enabled && this.context && this.context.state === 'running');
  }

  createContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      this.enabled = false;
      return false;
    }

    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.bgmGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.masterGain.gain.value = 0.0001;
    this.bgmGain.gain.value = 0.4;
    this.sfxGain.gain.value = 0.85;

    this.bgmGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    this.noiseBuffer = this.createNoiseBuffer();
    this.initialized = true;
    this.nextNoteTime = this.context.currentTime + 0.05;
    return true;
  }

  createNoiseBuffer() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let index = 0; index < channelData.length; index += 1) {
      channelData[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  setMasterVolume(target) {
    if (!this.masterGain || !this.context) {
      return;
    }

    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(target, now, 0.02);
  }

  startSequencer() {
    if (this.schedulerTimer || !this.context) {
      return;
    }

    this.nextNoteTime = Math.max(this.nextNoteTime, this.context.currentTime + 0.05);
    this.schedulerTimer = window.setInterval(() => {
      this.schedulerTick();
    }, 50);
  }

  schedulerTick() {
    if (!this.canPlay()) {
      return;
    }

    while (this.nextNoteTime < this.context.currentTime + this.lookAheadTime) {
      this.scheduleBgmStep(this.sequence[this.sequenceIndex], this.nextNoteTime);
      this.nextNoteTime += this.stepDuration;
      this.sequenceIndex = (this.sequenceIndex + 1) % this.sequence.length;
    }
  }

  scheduleBgmStep(step, startTime) {
    const subStep = this.stepDuration / 3;

    this.playTone(step.bass, startTime, this.stepDuration * 0.92, {
      type: 'triangle',
      volume: 0.065,
      attack: 0.004,
      release: 0.08,
      destination: this.bgmGain
    });

    step.arp.forEach((frequency, index) => {
      this.playTone(frequency, startTime + subStep * index, subStep * 0.76, {
        type: 'square',
        volume: 0.045,
        attack: 0.002,
        release: 0.05,
        destination: this.bgmGain
      });
    });
  }


  async armFromGesture() {
    if (!this.enabled) {
      return false;
    }

    return this.ensureReady();
  }

  async ensureReady() {
    if (!this.initialized && !this.createContext()) {
      return false;
    }

    if (!this.context) {
      return false;
    }

    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch {
        return false;
      }
    }

    this.nextNoteTime = this.context.currentTime + 0.05;
    this.setMasterVolume(this.enabled ? 0.75 : 0.0001);

    this.startSequencer();
    return true;
  }


  async toggleEnabled() {
    this.enabled = !this.enabled;

    if (this.enabled) {
      await this.ensureReady();
      this.playUiClick();
    } else {
      this.setMasterVolume(0.0001);
    }

    return this.enabled;
  }

  playTone(frequency, startTime, duration, options = {}) {
    if (!this.context || frequency <= 0) {
      return;
    }

    const {
      type = 'square',
      volume = 0.05,
      attack = 0.003,
      release = 0.06,
      frequencyEnd = frequency,
      destination = this.sfxGain
    } = options;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, frequencyEnd), startTime + Math.max(0.02, duration));

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    oscillator.connect(gainNode);
    gainNode.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + release + 0.02);
  }

  playNoise(startTime, duration, options = {}) {
    if (!this.context || !this.noiseBuffer) {
      return;
    }

    const {
      volume = 0.05,
      attack = 0.002,
      release = 0.08,
      filterType = 'bandpass',
      filterFrequency = 1200,
      q = 0.8,
      destination = this.sfxGain
    } = options;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    source.buffer = this.noiseBuffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFrequency, startTime);
    filter.Q.value = q;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);
    source.start(startTime);
    source.stop(startTime + duration + release + 0.02);
  }

  playSlash() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    this.playNoise(now, 0.06, {
      volume: 0.055,
      filterType: 'highpass',
      filterFrequency: 1650,
      q: 0.7
    });
    this.playTone(1080, now, 0.07, {
      type: 'triangle',
      volume: 0.03,
      frequencyEnd: 320,
      release: 0.05
    });
  }

  playHeavyThud() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    this.playTone(110, now, 0.18, {
      type: 'sine',
      volume: 0.085,
      attack: 0.001,
      release: 0.14,
      frequencyEnd: 46
    });
    this.playNoise(now, 0.12, {
      volume: 0.03,
      filterType: 'lowpass',
      filterFrequency: 420,
      q: 0.6
    });
  }

  playExplosion() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    this.playNoise(now, 0.32, {
      volume: 0.095,
      attack: 0.001,
      release: 0.18,
      filterType: 'lowpass',
      filterFrequency: 520,
      q: 0.4
    });
    this.playTone(94, now, 0.24, {
      type: 'triangle',
      volume: 0.07,
      attack: 0.001,
      release: 0.16,
      frequencyEnd: 38
    });
    this.playTone(240, now, 0.08, {
      type: 'square',
      volume: 0.022,
      attack: 0.001,
      release: 0.07,
      frequencyEnd: 120
    });
  }

  playUiClick() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    this.playTone(880, now, 0.028, {
      type: 'square',
      volume: 0.026,
      release: 0.03,
      frequencyEnd: 760
    });
    this.playTone(1180, now + 0.03, 0.025, {
      type: 'square',
      volume: 0.018,
      release: 0.03,
      frequencyEnd: 980
    });
  }

  playSuccess() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    [660, 880, 1174.66].forEach((frequency, index) => {
      this.playTone(frequency, now + index * 0.055, 0.05, {
        type: 'square',
        volume: 0.024,
        release: 0.05,
        frequencyEnd: frequency * 0.96
      });
    });
  }

  playShoot() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    this.playTone(1320, now, 0.05, {
      type: 'triangle',
      volume: 0.03,
      attack: 0.001,
      release: 0.035,
      frequencyEnd: 520
    });
    this.playTone(1760, now + 0.006, 0.035, {
      type: 'triangle',
      volume: 0.018,
      attack: 0.001,
      release: 0.03,
      frequencyEnd: 860
    });
    this.playNoise(now, 0.026, {
      volume: 0.014,
      attack: 0.001,
      release: 0.02,
      filterType: 'bandpass',
      filterFrequency: 2600,
      q: 1.2
    });
  }

  playZombieGroan() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;
    const duration = 0.72 + Math.random() * 0.18;
    const baseFrequency = 82 + Math.random() * 16;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gainNode = this.context.createGain();
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(baseFrequency, now);

    for (let step = 1; step <= 6; step += 1) {
      const time = now + duration * (step / 6);
      const jitterFrequency = baseFrequency * (0.92 + Math.random() * 0.18);
      oscillator.frequency.linearRampToValueAtTime(jitterFrequency, time);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.linearRampToValueAtTime(540, now + duration * 0.24);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    filter.Q.setValueAtTime(1.4, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2.8 + Math.random() * 1.6, now);
    lfoGain.gain.setValueAtTime(130, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gainNode.gain.linearRampToValueAtTime(0.085, now + duration * 0.55);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.14);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    oscillator.start(now);
    lfo.start(now);
    oscillator.stop(now + duration + 0.16);
    lfo.stop(now + duration + 0.16);
  }

  playZombieThrow() {
    if (!this.canPlay()) {
      return;
    }

    const now = this.context.currentTime;

    this.playTone(420, now, 0.075, {
      type: 'triangle',
      volume: 0.075,
      attack: 0.001,
      release: 0.07,
      frequencyEnd: 130
    });
    this.playTone(180, now + 0.008, 0.09, {
      type: 'sine',
      volume: 0.045,
      attack: 0.001,
      release: 0.09,
      frequencyEnd: 72
    });
    this.playNoise(now, 0.024, {
      volume: 0.016,
      attack: 0.001,
      release: 0.02,
      filterType: 'lowpass',
      filterFrequency: 700,
      q: 0.7
    });
  }


  playPoisonTrigger() {
    if (!this.canPlay() || !this.noiseBuffer) {
      return;
    }

    const now = this.context.currentTime;
    const duration = 0.08;
    const source = this.context.createBufferSource();
    const highpass = this.context.createBiquadFilter();
    const bandpass = this.context.createBiquadFilter();
    const gainNode = this.context.createGain();

    source.buffer = this.noiseBuffer;

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(2600, now);
    highpass.frequency.exponentialRampToValueAtTime(5200, now + duration);
    highpass.Q.setValueAtTime(0.9, now);

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(4300, now);
    bandpass.Q.setValueAtTime(1.8, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.05);

    source.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.sfxGain);

    source.start(now);
    source.stop(now + duration + 0.06);

    this.playTone(1900, now + 0.002, 0.025, {
      type: 'triangle',
      volume: 0.01,
      attack: 0.001,
      release: 0.03,
      frequencyEnd: 980
    });
  }

  playUnitAttack(unitType) {

    switch (unitType) {
      case UNIT_TYPE.SWORDSMAN:
      case UNIT_TYPE.SPEARMAN:
      case UNIT_TYPE.SHIELD_GUARD:
        this.playSlash();
        break;
      case UNIT_TYPE.ARCHER:
      case UNIT_TYPE.MACHINE_GUNNER:
        this.playShoot();
        break;
      case UNIT_TYPE.GIANT:
        this.playHeavyThud();
        break;
      case UNIT_TYPE.WARSHIP:
        this.playExplosion();
        break;
      case UNIT_TYPE.SWORDSMAN_LEADER:
      case UNIT_TYPE.SPEARMAN_LEADER:
        this.playSlash();
        break;
      default:
        break;
    }
  }
}

const soundManager = new SoundManager();

const ui = {
  goldValue: document.getElementById('goldValue'),
  diamondValue: document.getElementById('diamondValue'),
  levelValue: document.getElementById('levelValue'),
  playerBaseHp: document.getElementById('playerBaseHp'),
  enemyBaseHp: document.getElementById('enemyBaseHp'),
  soundToggleButton: document.getElementById('soundToggleButton'),
  soundToggleIcon: document.getElementById('soundToggleIcon'),
  soundToggleText: document.getElementById('soundToggleText'),
  unitButtons: [...document.querySelectorAll('.action-button')],
  shopButton: document.getElementById('shopButton'),
  toast: document.getElementById('gameToast'),
  shopOverlay: document.getElementById('shopOverlay'),
  shopCloseButton: document.getElementById('shopCloseButton'),
  shopDiamondValue: document.getElementById('shopDiamondValue'),
  shopBaseLevel: document.getElementById('shopBaseLevel'),
  shopAttackLevel: document.getElementById('shopAttackLevel'),
  shopUnlockGiantState: document.getElementById('shopUnlockGiantState'),
  shopUnlockWarshipState: document.getElementById('shopUnlockWarshipState'),
  shopUnlockSwordsmanLeaderState: document.getElementById('shopUnlockSwordsmanLeaderState'),
  shopUnlockSpearmanLeaderState: document.getElementById('shopUnlockSpearmanLeaderState'),
  shopUnlockMachineGunnerState: document.getElementById('shopUnlockMachineGunnerState'),
  shopBaseUpgradeState: document.getElementById('shopBaseUpgradeState'),
  shopAttackUpgradeState: document.getElementById('shopAttackUpgradeState'),
  unlockGiantButton: document.getElementById('unlockGiantButton'),
  unlockWarshipButton: document.getElementById('unlockWarshipButton'),
  unlockSwordsmanLeaderButton: document.getElementById('unlockSwordsmanLeaderButton'),
  unlockSpearmanLeaderButton: document.getElementById('unlockSpearmanLeaderButton'),
  unlockMachineGunnerButton: document.getElementById('unlockMachineGunnerButton'),
  upgradeBaseButton: document.getElementById('upgradeBaseButton'),
  upgradeAttackButton: document.getElementById('upgradeAttackButton'),
  cmdAttackBtn: document.getElementById('cmdAttackBtn'),
  cmdRetreatBtn: document.getElementById('cmdRetreatBtn'),
  resultOverlay: document.getElementById('resultOverlay'),
  resultKicker: document.getElementById('resultKicker'),
  resultTitle: document.getElementById('resultTitle'),
  resultDescription: document.getElementById('resultDescription'),
  resultReward: document.getElementById('resultReward'),
  resultPrimaryButton: document.getElementById('resultPrimaryButton'),
  resultSecondaryButton: document.getElementById('resultSecondaryButton')
};


const uiState = {
  toastTimer: 0,
  resultPrimaryAction: null,
  resultSecondaryAction: null,
  resultScreenConfig: null,
  returnToResultAfterShop: false
};


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getTeamDirection(team) {
  return team === TEAM.PLAYER ? 1 : -1;
}

function getTeamPalette(team) {
  if (team === TEAM.PLAYER) {
    return {
      primary: '#65a8ff',
      secondary: '#d8ebff',
      hp: '#67f0aa'
    };
  }

  return {
    primary: '#ff7a7a',
    secondary: '#ffe1e1',
    hp: '#ffb36b'
  };
}

function getUnitMeta(unitType) {
  return UNIT_META[unitType];
}

function getCurrentLevel() {
  return LEVELS[gameState.currentLevelIndex];
}

function getPlayerAttackMultiplier() {
  return 1 + gameState.progression.attackLevel * UPGRADE_CONFIG.attackBuff.bonusStep;
}

function formatAttackBonus() {
  return `+${Math.round((getPlayerAttackMultiplier() - 1) * 100)}%`;
}

function getBaseUpgradeCost() {
  return UPGRADE_CONFIG.baseHp.baseCost + gameState.progression.baseHpLevel * UPGRADE_CONFIG.baseHp.costStep;
}

function getAttackUpgradeCost() {
  return UPGRADE_CONFIG.attackBuff.baseCost + gameState.progression.attackLevel * UPGRADE_CONFIG.attackBuff.costStep;
}

function getPlayerBaseMaxHp() {
  return 1000 + gameState.progression.baseHpLevel * UPGRADE_CONFIG.baseHp.hpBonus;
}

function isUnitUnlocked(unitType) {
  return Boolean(gameState.unlocks[unitType]);
}

function drawHealthBar(x, y, width, height, ratio, fillColor) {
  ctx.save();
  ctx.fillStyle = 'rgba(6, 10, 18, 0.68)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width * clamp(ratio, 0, 1), height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

function updateSoundToggleButton() {
  const enabled = soundManager.isEnabled();
  ui.soundToggleButton.classList.toggle('is-off', !enabled);
  ui.soundToggleButton.setAttribute('aria-pressed', String(enabled));
  ui.soundToggleIcon.textContent = enabled ? '🔊' : '🔇';
  ui.soundToggleText.textContent = enabled ? '音效开' : '音效关';
}

async function toggleSound() {
  const enabled = await soundManager.toggleEnabled();
  updateSoundToggleButton();
  showToast(enabled ? '音效已开启' : '音效已关闭', 1000);
}

function showToast(message, duration = 1600) {

  ui.toast.textContent = message;
  ui.toast.classList.add('show');

  window.clearTimeout(uiState.toastTimer);
  uiState.toastTimer = window.setTimeout(() => {
    ui.toast.classList.remove('show');
  }, duration);
}

function syncOverlayLock() {
  const hasOverlay = !ui.shopOverlay.classList.contains('hidden') || !ui.resultOverlay.classList.contains('hidden');
  document.body.classList.toggle('modal-open', hasOverlay);
}

function setShopVisible(visible) {
  ui.shopOverlay.classList.toggle('hidden', !visible);
  ui.shopOverlay.setAttribute('aria-hidden', String(!visible));
  syncOverlayLock();
}

function setResultVisible(visible) {
  ui.resultOverlay.classList.toggle('hidden', !visible);
  ui.resultOverlay.setAttribute('aria-hidden', String(!visible));
  syncOverlayLock();
}

function showResultScreen(config) {
  const { kicker, title, description, rewardText, primaryLabel, primaryAction, secondaryLabel, secondaryAction } = config;

  ui.resultKicker.textContent = kicker;
  ui.resultTitle.textContent = title;
  ui.resultDescription.textContent = description;
  ui.resultReward.textContent = rewardText;
  ui.resultPrimaryButton.textContent = primaryLabel;
  ui.resultSecondaryButton.textContent = secondaryLabel;
  uiState.resultPrimaryAction = primaryAction;
  uiState.resultSecondaryAction = secondaryAction;
  uiState.resultScreenConfig = config;
  uiState.returnToResultAfterShop = false;
  setResultVisible(true);
}

function hideResultScreen() {
  uiState.resultPrimaryAction = null;
  uiState.resultSecondaryAction = null;
  uiState.resultScreenConfig = null;
  uiState.returnToResultAfterShop = false;
  setResultVisible(false);
}


function updateTopBar() {
  const currentLevel = getCurrentLevel();

  ui.goldValue.textContent = Math.floor(gameState.resources.gold);
  ui.diamondValue.textContent = Math.floor(gameState.resources.diamonds);
  ui.levelValue.textContent = `第 ${currentLevel.id} 关 · ${currentLevel.name}`;
  ui.playerBaseHp.textContent = `${Math.ceil(gameState.bases.player.hp)} / ${gameState.bases.player.maxHp}`;
  ui.enemyBaseHp.textContent = `${Math.ceil(gameState.bases.enemy.hp)} / ${gameState.bases.enemy.maxHp}`;
}

// ─── 兵种小图标绘制（48×48 canvas，复用各兵种真实 drawIcon 绘制逻辑）────────
function renderUnitMiniIcon(canvas, unitType) {
  const SIZE = 48;
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, SIZE, SIZE);

  // 创建临时单位实例（仅用于调用 drawIcon，不加入游戏逻辑）
  const dummyConfig = { id: -1, team: TEAM.PLAYER, x: 0, y: 0 };
  let unit = null;

  switch (unitType) {
    case UNIT_TYPE.SWORDSMAN:       unit = new Swordsman(dummyConfig);       break;
    case UNIT_TYPE.SPEARMAN:        unit = new Spearman(dummyConfig);        break;
    case UNIT_TYPE.ARCHER:          unit = new Archer(dummyConfig);          break;
    case UNIT_TYPE.ZOMBIE:          unit = new Zombie(dummyConfig);          break;
    case UNIT_TYPE.GIANT:           unit = new Giant(dummyConfig);           break;
    case UNIT_TYPE.WARSHIP:         unit = new Battleship(dummyConfig);      break;
    case UNIT_TYPE.MACHINE_GUNNER:  unit = new MachineGunner(dummyConfig);   break;
    case UNIT_TYPE.SHIELD_GUARD:    unit = new ShieldGuard(dummyConfig);     break;
    case UNIT_TYPE.SWORDSMAN_LEADER: unit = new SwordsmanLeader(dummyConfig); break;
    case UNIT_TYPE.SPEARMAN_LEADER:  unit = new SpearmanLeader(dummyConfig);  break;
    default: {
      // 兜底：问号圆
      c.fillStyle = '#3a6ab5';
      c.beginPath();
      c.arc(SIZE / 2, SIZE / 2, SIZE * 0.38, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = `bold ${Math.round(SIZE * 0.44)}px sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('?', SIZE / 2, SIZE / 2 + 1);
      return;
    }
  }

  if (!unit) return;

  // sz 参数：以兵种原始 size 换算出适合 48px canvas 的绘制尺寸
  // 目标是让角色占满约 68% 的画布高度
  const targetHeight = SIZE * 0.68;
  const sz = targetHeight / 1.6;  // 1.6 ≈ 各兵种 bodyHeight/size 的平均比例

  // 居中偏下（留出头顶羽饰空间）
  const cx = SIZE / 2;
  const cy = SIZE * 0.56;

  unit.drawIcon(c, cx, cy, sz);
}

function updateActionButtonLabel(button, unitType) {
  const unitMeta = getUnitMeta(unitType);
  const unlocked = isUnitUnlocked(unitType);
  const affordable = gameState.resources.gold >= unitMeta.goldCost;

  // 找到已有 canvas（HTML 中预置的占位），若没有则创建
  let iconCanvas = button.querySelector('.unit-icon');
  if (!iconCanvas) {
    iconCanvas = document.createElement('canvas');
    iconCanvas.className = 'unit-icon';
    button.prepend(iconCanvas);
  }
  iconCanvas.width  = 48;
  iconCanvas.height = 48;
  renderUnitMiniIcon(iconCanvas, unitType);

  // 未解锁时图标半透明，让小朋友感知到「锁定」状态
  iconCanvas.style.opacity = unlocked ? '1' : '0.55';

  let titleEl = button.querySelector('.button-title');
  let metaEl  = button.querySelector('.button-meta');
  if (!titleEl) {
    titleEl = document.createElement('span');
    titleEl.className = 'button-title';
    button.appendChild(titleEl);
  }
  if (!metaEl) {
    metaEl = document.createElement('span');
    metaEl.className = 'button-meta';
    button.appendChild(metaEl);
  }
  titleEl.textContent = unitMeta.label + (unlocked ? '' : ' · 未解锁');
  metaEl.textContent  = unlocked ? `${unitMeta.goldCost} 金币 / 次` : `需 ${unitMeta.unlockCost} 钻解锁`;

  button.classList.toggle('is-locked', !unlocked);
  button.classList.toggle('is-unaffordable', unlocked && !affordable);
  button.setAttribute('aria-disabled', String(!unlocked || !affordable));
}

function refreshUnitButtons() {
  ui.unitButtons.forEach((button) => {
    updateActionButtonLabel(button, button.dataset.unit);
  });
}

function decorateShopActionButton(button, isComplete, canAfford) {
  button.disabled = isComplete;
  button.classList.toggle('is-unaffordable', !isComplete && !canAfford);
}

function renderShop() {
  const diamonds = gameState.resources.diamonds;
  const giantUnlocked = isUnitUnlocked(UNIT_TYPE.GIANT);
  const warshipUnlocked = isUnitUnlocked(UNIT_TYPE.WARSHIP);
  const swordsmanLeaderUnlocked = isUnitUnlocked(UNIT_TYPE.SWORDSMAN_LEADER);
  const spearmanLeaderUnlocked = isUnitUnlocked(UNIT_TYPE.SPEARMAN_LEADER);
  const machineGunnerUnlocked = isUnitUnlocked(UNIT_TYPE.MACHINE_GUNNER);
  const baseUpgradeMaxed = gameState.progression.baseHpLevel >= UPGRADE_CONFIG.baseHp.maxLevel;
  const attackUpgradeMaxed = gameState.progression.attackLevel >= UPGRADE_CONFIG.attackBuff.maxLevel;
  const giantCost = getUnitMeta(UNIT_TYPE.GIANT).unlockCost;
  const warshipCost = getUnitMeta(UNIT_TYPE.WARSHIP).unlockCost;
  const swordsmanLeaderCost = getUnitMeta(UNIT_TYPE.SWORDSMAN_LEADER).unlockCost;
  const spearmanLeaderCost = getUnitMeta(UNIT_TYPE.SPEARMAN_LEADER).unlockCost;
  const machineGunnerCost = getUnitMeta(UNIT_TYPE.MACHINE_GUNNER).unlockCost;
  const baseUpgradeCost = getBaseUpgradeCost();
  const attackUpgradeCost = getAttackUpgradeCost();
  const currentAttackPercent = Math.round((getPlayerAttackMultiplier() - 1) * 100);
  const nextAttackPercent = Math.round((gameState.progression.attackLevel + 1) * UPGRADE_CONFIG.attackBuff.bonusStep * 100);

  ui.shopDiamondValue.textContent = Math.floor(diamonds);
  ui.shopBaseLevel.textContent = `Lv.${gameState.progression.baseHpLevel + 1}`;
  ui.shopAttackLevel.textContent = formatAttackBonus();

  ui.shopUnlockGiantState.textContent = giantUnlocked ? '已解锁' : `${giantCost} 钻石`;
  ui.unlockGiantButton.textContent = giantUnlocked ? '已解锁' : '解锁';
  decorateShopActionButton(ui.unlockGiantButton, giantUnlocked, diamonds >= giantCost);

  ui.shopUnlockWarshipState.textContent = warshipUnlocked ? '已解锁' : `${warshipCost} 钻石`;
  ui.unlockWarshipButton.textContent = warshipUnlocked ? '已解锁' : '解锁';
  decorateShopActionButton(ui.unlockWarshipButton, warshipUnlocked, diamonds >= warshipCost);

  ui.shopUnlockSwordsmanLeaderState.textContent = swordsmanLeaderUnlocked ? '已解锁' : `${swordsmanLeaderCost} 钻石`;
  ui.unlockSwordsmanLeaderButton.textContent = swordsmanLeaderUnlocked ? '已解锁' : '解锁';
  decorateShopActionButton(ui.unlockSwordsmanLeaderButton, swordsmanLeaderUnlocked, diamonds >= swordsmanLeaderCost);

  ui.shopUnlockSpearmanLeaderState.textContent = spearmanLeaderUnlocked ? '已解锁' : `${spearmanLeaderCost} 钻石`;
  ui.unlockSpearmanLeaderButton.textContent = spearmanLeaderUnlocked ? '已解锁' : '解锁';
  decorateShopActionButton(ui.unlockSpearmanLeaderButton, spearmanLeaderUnlocked, diamonds >= spearmanLeaderCost);

  ui.shopUnlockMachineGunnerState.textContent = machineGunnerUnlocked ? '已解锁' : `${machineGunnerCost} 钻石`;
  ui.unlockMachineGunnerButton.textContent = machineGunnerUnlocked ? '已解锁' : '解锁';
  decorateShopActionButton(ui.unlockMachineGunnerButton, machineGunnerUnlocked, diamonds >= machineGunnerCost);

  ui.shopBaseUpgradeState.textContent = baseUpgradeMaxed
    ? `已满级 · Lv.${gameState.progression.baseHpLevel + 1}`
    : `Lv.${gameState.progression.baseHpLevel + 1} → Lv.${gameState.progression.baseHpLevel + 2} · ${baseUpgradeCost} 钻石`;
  ui.upgradeBaseButton.textContent = baseUpgradeMaxed ? '已满级' : '购买升级';
  decorateShopActionButton(ui.upgradeBaseButton, baseUpgradeMaxed, diamonds >= baseUpgradeCost);

  ui.shopAttackUpgradeState.textContent = attackUpgradeMaxed
    ? `已满级 · +${currentAttackPercent}%`
    : `+${currentAttackPercent}% → +${nextAttackPercent}% · ${attackUpgradeCost} 钻石`;
  ui.upgradeAttackButton.textContent = attackUpgradeMaxed ? '已满级' : '购买升级';
  decorateShopActionButton(ui.upgradeAttackButton, attackUpgradeMaxed, diamonds >= attackUpgradeCost);
}

function refreshUi() {
  updateTopBar();
  updateSoundToggleButton();
  refreshUnitButtons();
  renderShop();
}


class Base {
  constructor({ team, label, maxHp, width, height, color }) {
    this.team = team;
    this.label = label;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.collisionRadius = width * 0.42;
  }

  isAlive() {
    return this.hp > 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  reset(maxHp) {
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  upgradeMaxHp(amount) {
    this.maxHp += amount;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  draw() {
    const left = this.x - this.width / 2;
    const top = this.y - this.height / 2;
    const labelY = top - 32;
    const healthBarY = top - 16;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
    ctx.lineWidth = 3;
    ctx.fillRect(left, top, this.width, this.height);
    ctx.strokeRect(left, top, this.width, this.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(left + 14, top + 16, this.width - 28, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x, labelY);

    drawHealthBar(
      left,
      healthBarY,
      this.width,
      10,
      this.hp / this.maxHp,
      this.team === TEAM.PLAYER ? '#5eff9f' : '#ff8c72'
    );

    // 当玩家基地处于危险时绘制守卫弓箭手剪影
    if (this.team === TEAM.PLAYER) {
      const threatEnemies = gameState.units.filter((unit) => {
        return unit.isAlive() && unit.team === TEAM.ENEMY && Math.abs(unit.x - this.x) <= 150;
      });

      if (threatEnemies.length > 0) {
        const guardPositions = [
          { x: left + this.width * 0.22, y: top },
          { x: left + this.width * 0.78, y: top }
        ];

        const now = performance.now();
        const pulse = 0.82 + Math.sin(now * 0.005) * 0.18;
        // 射击动画：每1.5s循环，模拟拉弓-放箭
        const shootCycle = (now % 1500) / 1500;
        const drawCycle = shootCycle < 0.6 ? shootCycle / 0.6 : Math.max(0, 1 - (shootCycle - 0.6) / 0.4);
        const arrowFlying = shootCycle > 0.55 && shootCycle < 0.72;

        for (const pos of guardPositions) {
          const sz = 22; // 单位尺寸，略小于普通弓箭手(27)
          const bw = sz * 1.08;
          const bh = sz * 1.64;

          const cloakColor  = '#507d49';
          const hoodColor   = '#3a6134';
          const trimColor   = '#5eff9f';
          const woodColor   = '#8c643e';
          const leatherColor= '#5d412b';
          const stringColor = 'rgba(244,238,222,0.96)';
          const metalColor  = '#cbd5df';
          const skinColor   = '#f0c9a4';

          const bowX       = bw * 0.3;
          const bowTopY    = -bh * 0.42;
          const bowBottomY = bh * 0.18;
          const bowGripY   = -bh * 0.08;
          const bowCurveX  = bowX + bw * 0.34 + drawCycle * bw * 0.05;

          const stringAnchorX = bowX - bw * 0.02;
          const pulledNotchX  = stringAnchorX - bw * 0.08 - drawCycle * bw * 0.42;
          const stringNotchX  = arrowFlying ? stringAnchorX : pulledNotchX;

          const loadedArrowTailX = pulledNotchX - bw * 0.18;
          const loadedArrowHeadX = bowX + bw * 0.28;
          const showLoadedArrow  = !arrowFlying && drawCycle > 0.05;

          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.scale(1, 1); // 面朝右（朝向敌方）
          ctx.lineJoin = 'round';
          ctx.lineCap  = 'round';
          ctx.globalAlpha = pulse;
          ctx.shadowColor = 'rgba(170,255,150,0.9)';
          ctx.shadowBlur  = 14;

          ctx.save();

          // 腿
          ctx.fillStyle = leatherColor;
          ctx.fillRect(-bw * 0.18, bh * 0.18, bw * 0.11, bh * 0.34);
          ctx.fillRect( bw * 0.02, bh * 0.18, bw * 0.11, bh * 0.34);

          // 箭袋
          ctx.fillStyle = woodColor;
          ctx.fillRect(-bw * 0.34, -bh * 0.16, bw * 0.16, bh * 0.48);

          // 箭袋纹饰
          ctx.fillStyle = trimColor;
          ctx.fillRect(-bw * 0.3, -bh * 0.22, bw * 0.04, bh * 0.14);
          ctx.fillRect(-bw * 0.24,-bh * 0.20, bw * 0.04, bh * 0.12);

          // 身体披风
          ctx.fillStyle = cloakColor;
          ctx.beginPath();
          ctx.moveTo(-bw * 0.2,  -bh * 0.14);
          ctx.lineTo( bw * 0.14, -bh * 0.16);
          ctx.lineTo( bw * 0.22,  bh * 0.26);
          ctx.lineTo( 0,          bh * 0.36);
          ctx.lineTo(-bw * 0.24,  bh * 0.24);
          ctx.closePath();
          ctx.fill();

          // 腰带
          ctx.fillStyle = trimColor;
          ctx.fillRect(-bw * 0.04, -bh * 0.12, bw * 0.08, bh * 0.34);

          // 头
          ctx.fillStyle = skinColor;
          ctx.beginPath();
          ctx.arc(-bw * 0.01, -bh * 0.34, bw * 0.16, 0, Math.PI * 2);
          ctx.fill();

          // 兜帽
          ctx.fillStyle = hoodColor;
          ctx.beginPath();
          ctx.moveTo(-bw * 0.2,  -bh * 0.36);
          ctx.lineTo(-bw * 0.04, -bh * 0.56);
          ctx.lineTo( bw * 0.16, -bh * 0.38);
          ctx.lineTo( bw * 0.1,  -bh * 0.16);
          ctx.lineTo(-bw * 0.16, -bh * 0.18);
          ctx.closePath();
          ctx.fill();

          // 持弓手臂
          ctx.strokeStyle = leatherColor;
          ctx.lineWidth = bw * 0.1;
          ctx.beginPath();
          ctx.moveTo(-bw * 0.02, -bh * 0.1);
          ctx.lineTo(stringNotchX + bw * 0.04, bowGripY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo( bw * 0.06, -bh * 0.08);
          ctx.lineTo(bowX + bw * 0.02, bowGripY);
          ctx.stroke();

          // 弓身
          ctx.strokeStyle = woodColor;
          ctx.lineWidth = bw * 0.13;
          ctx.beginPath();
          ctx.moveTo(bowX, bowTopY);
          ctx.quadraticCurveTo(bowCurveX, bowGripY, bowX, bowBottomY);
          ctx.stroke();

          // 弓弦
          ctx.strokeStyle = stringColor;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(stringAnchorX, bowTopY  + bh * 0.03);
          ctx.lineTo(stringNotchX,  bowGripY);
          ctx.lineTo(stringAnchorX, bowBottomY - bh * 0.03);
          ctx.stroke();

          // 搭弦箭
          if (showLoadedArrow) {
            ctx.strokeStyle = metalColor;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(loadedArrowTailX, bowGripY);
            ctx.lineTo(loadedArrowHeadX, bowGripY);
            ctx.stroke();

            ctx.fillStyle = metalColor;
            ctx.beginPath();
            ctx.moveTo(loadedArrowHeadX, bowGripY);
            ctx.lineTo(loadedArrowHeadX - bw * 0.11, bowGripY - bh * 0.06);
            ctx.lineTo(loadedArrowHeadX - bw * 0.11, bowGripY + bh * 0.06);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = trimColor;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(loadedArrowTailX, bowGripY);
            ctx.lineTo(loadedArrowTailX - bw * 0.08, bowGripY - bh * 0.05);
            ctx.moveTo(loadedArrowTailX, bowGripY);
            ctx.lineTo(loadedArrowTailX - bw * 0.08, bowGripY + bh * 0.05);
            ctx.stroke();
          }

          ctx.restore();
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }
}

class Unit {
  constructor({ id, team, type, label, x, y, maxHp, attackPower, attackRange, moveSpeed, attackCooldown, size, cost, aoeRadius = 0, diamondReward = 0 }) {
    this.id = id;
    this.team = team;
    this.type = type;
    this.label = label;
    this.x = x;
    this.y = y;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.baseAttackPower = attackPower;
    this.attackPower = attackPower;
    this.attackRange = attackRange;
    this.moveSpeed = moveSpeed;
    this.attackCooldown = attackCooldown;
    this.attackTimer = Math.random() * attackCooldown * 0.35;
    this.size = size;
    this.cost = cost;
    this.aoeRadius = aoeRadius;
    this.diamondReward = diamondReward;
    this.collisionRadius = size * 0.5;
    this.formationPadding = Math.max(6, size * 0.12);
    this.direction = getTeamDirection(team);
    this.palette = getTeamPalette(team);
    this.hitFlash = 0;
    this.attackFlash = 0;
    this.state = 'marching';
    this.poisoned = false;
    this.poisonTimer = 0;
    this.poisonSource = null;
    this.deathHandled = false;
  }


  isAlive() {
    return this.hp > 0;
  }

  applyAttackBonus(multiplier) {
    this.attackPower = Math.round(this.baseAttackPower * multiplier);
  }

  move(deltaTime, battlefield) {
    const retreating = this.team === TEAM.PLAYER && gameState.playerCommand === 'retreat';
    const effectiveDirection = retreating ? -1 : this.direction;
    const nextX = this.x + effectiveDirection * this.moveSpeed * deltaTime;
    this.x = clamp(nextX, battlefield.minX + this.collisionRadius, battlefield.maxX - this.collisionRadius);
  }

  attack(target, attackEvents) {
    if (this.attackTimer > 0 || !target || !target.isAlive()) {
      return;
    }

    this.attackTimer = this.attackCooldown;
    this.attackFlash = 0.12;
    soundManager.playUnitAttack(this.type);
    attackEvents.push({
      source: this,
      target,
      damage: this.attackPower,
      aoeRadius: this.aoeRadius,
      impactX: target.x,
      impactY: target.y,
      targetTeam: target.team
    });
  }


  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.hitFlash = 0.16;
  }

  applyPoison(source) {
    if (!this.isAlive()) {
      return;
    }

    this.poisoned = true;
    this.poisonTimer = ZOMBIE_POISON_DURATION;
    this.poisonSource = source || null;
    this.hitFlash = Math.max(this.hitFlash, 0.08);
  }

  clearPoison() {
    this.poisoned = false;
    this.poisonTimer = 0;
    this.poisonSource = null;
  }

  die() {
    if (this.deathHandled) {
      return { poisonApplied: false };
    }

    this.deathHandled = true;
    this.hp = 0;
    this.state = 'dead';
    this.clearPoison();
    return { poisonApplied: false };
  }


  getForwardDistanceTo(target) {

    return (target.x - this.x) * this.direction;
  }

  getEdgeGapTo(target) {
    return this.getForwardDistanceTo(target) - (this.collisionRadius + target.collisionRadius);
  }

  canAttack(target) {
    if (!target || !target.isAlive()) {
      return false;
    }

    return this.getForwardDistanceTo(target) >= 0 && this.getEdgeGapTo(target) <= this.attackRange;
  }

  findNearestEnemyAhead(enemies) {
    let nearestEnemy = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) {
        continue;
      }

      const forwardDistance = this.getForwardDistanceTo(enemy);
      if (forwardDistance < -enemy.collisionRadius) {
        continue;
      }

      if (forwardDistance < nearestDistance) {
        nearestDistance = forwardDistance;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  findNearestAllyAhead(allies) {
    let nearestAlly = null;
    let nearestGap = Number.POSITIVE_INFINITY;

    for (const ally of allies) {
      if (ally === this || !ally.isAlive()) {
        continue;
      }

      const forwardDistance = this.getForwardDistanceTo(ally);
      if (forwardDistance <= 0) {
        continue;
      }

      const edgeGap = this.getEdgeGapTo(ally);
      if (edgeGap < nearestGap) {
        nearestGap = edgeGap;
        nearestAlly = ally;
      }
    }

    return nearestAlly;
  }

  update(deltaTime, frame) {
    if (!this.isAlive()) {
      return;
    }

    this.attackTimer = Math.max(0, this.attackTimer - deltaTime);
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);
    this.attackFlash = Math.max(0, this.attackFlash - deltaTime);

    if (this.poisoned) {
      this.poisonTimer = Math.max(0, this.poisonTimer - deltaTime);
      this.hp = Math.max(0, this.hp - ZOMBIE_POISON_DPS * deltaTime);
      this.hitFlash = Math.max(this.hitFlash, 0.05);

      if (!this.isAlive()) {
        defeatTarget(this, this.poisonSource);
        return;
      }

      if (this.poisonTimer <= 0) {
        this.clearPoison();
      }
    }

    const retreating = this.team === TEAM.PLAYER && gameState.playerCommand === 'retreat';

    if (retreating) {
      const playerBase = gameState.bases.player;
      const distToBase = Math.abs(this.x - playerBase.x) - this.collisionRadius - playerBase.collisionRadius;

      // 撤退时如果敌人在攻击范围内，仍可反击
      const nearestEnemy = this.findNearestEnemyAhead(frame.enemies);
      if (nearestEnemy && this.canAttack(nearestEnemy)) {
        this.state = 'attacking';
        this.attack(nearestEnemy, frame.attackEvents);
        return;
      }

      // 到达基地附近时驻守
      if (distToBase <= 50) {
        this.state = 'defending';
        // 驻守时如果有敌人在范围内则攻击
        const nearestEnemyAny = frame.enemies.find(e => e.isAlive() && this.canAttack(e));
        if (nearestEnemyAny) {
          this.attack(nearestEnemyAny, frame.attackEvents);
        }
        return;
      }

      this.state = 'marching';
      this.move(deltaTime, frame.battlefield);
      return;
    }

    const nearestEnemy = this.findNearestEnemyAhead(frame.enemies);
    const primaryTarget = nearestEnemy || frame.enemyBase;

    if (this.canAttack(primaryTarget)) {
      this.state = 'attacking';
      this.attack(primaryTarget, frame.attackEvents);
      return;
    }

    const blockingAlly = this.findNearestAllyAhead(frame.allies);
    if (blockingAlly && this.getEdgeGapTo(blockingAlly) <= this.formationPadding) {
      this.state = 'holding';
      return;
    }

    this.state = 'marching';
    this.move(deltaTime, frame.battlefield);
  }

  getBodyFlashColor(color) {

    return this.hitFlash > 0 ? '#ffffff' : color;
  }

  getGlowColor(activeGlow = 'rgba(255, 244, 160, 0.72)', idleGlow = 'rgba(255, 255, 255, 0.08)') {
    return this.attackFlash > 0 ? activeGlow : idleGlow;
  }

  getAttackAnimationState() {
    const active = this.state === 'attacking' || this.attackFlash > 0;
    const cycle = this.attackCooldown > 0 ? clamp(1 - this.attackTimer / this.attackCooldown, 0, 1) : 0;
    const pulse = active ? Math.sin(cycle * Math.PI) : 0;
    const flash = clamp(this.attackFlash / 0.12, 0, 1);

    return { active, cycle, pulse, flash };
  }

  drawPoisonOverlay(bodyWidth, bodyHeight) {
    if (!this.poisoned || !this.isAlive()) {
      return;
    }

    const poisonRatio = clamp(this.poisonTimer / ZOMBIE_POISON_DURATION, 0, 1);
    const pulse = 0.72 + Math.sin(performance.now() * 0.01 + this.id * 0.8) * 0.16;
    const radius = Math.max(bodyWidth, bodyHeight) * (0.58 + poisonRatio * 0.08);

    ctx.save();
    ctx.translate(this.x, this.y);

    const gradient = ctx.createRadialGradient(0, 0, radius * 0.18, 0, 0, radius);
    gradient.addColorStop(0, `rgba(176, 255, 120, ${0.12 + poisonRatio * 0.08})`);
    gradient.addColorStop(0.55, `rgba(121, 214, 86, ${0.18 + poisonRatio * 0.1})`);
    gradient.addColorStop(1, 'rgba(84, 148, 44, 0)');

    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pulse;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, -bodyHeight * 0.04, radius, radius * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.38 + poisonRatio * 0.18;
    ctx.fillStyle = 'rgba(166, 240, 112, 0.95)';
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.2, -bodyHeight * 0.18, bodyWidth * 0.08, 0, Math.PI * 2);
    ctx.arc(bodyWidth * 0.18, bodyHeight * 0.04, bodyWidth * 0.06, 0, Math.PI * 2);
    ctx.arc(0, bodyHeight * 0.2, bodyWidth * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawStatus(bodyWidth, bodyHeight) {
    this.drawPoisonOverlay(bodyWidth, bodyHeight);
    drawHealthBar(this.x - bodyWidth / 2, this.y - bodyHeight / 2 - 16, bodyWidth, 6, this.hp / this.maxHp, this.palette.hp);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x, this.y + bodyHeight / 2 + 16);
    ctx.restore();
  }


  draw() {

    const bodyWidth = this.size;
    const bodyHeight = this.size * 0.76;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.shadowColor = this.getGlowColor();
    ctx.shadowBlur = this.attackFlash > 0 ? 18 : 8;
    ctx.fillStyle = this.getBodyFlashColor(this.palette.primary);
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.drawStatus(bodyWidth, bodyHeight);
  }

  // 子类覆盖此方法以在独立 canvas 上绘制兵种图标（不绘制血条/特效）
  // c: CanvasRenderingContext2D, cx/cy: 中心点坐标, sz: 绘制尺寸参考值
  drawIcon(c, cx, cy, sz) {
    // 默认：蓝色圆圈占位
    c.save();
    c.fillStyle = this.palette.primary;
    c.beginPath();
    c.arc(cx, cy, sz * 0.38, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

class Swordsman extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.SWORDSMAN);

    super({
      ...config,
      type: UNIT_TYPE.SWORDSMAN,
      label: meta.label,
      maxHp: 90,
      attackPower: 18,
      attackRange: 10,
      moveSpeed: 74,
      attackCooldown: 0.72,
      size: 30,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.24;
    const bodyHeight = this.size * 1.52;
    const armorColor = this.getBodyFlashColor(this.palette.primary);
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const clothColor = this.hitFlash > 0 ? '#eef4ff' : (this.team === TEAM.PLAYER ? '#284579' : '#7b2c34');
    const metalColor = this.hitFlash > 0 ? '#ffffff' : '#c8d2df';
    const leatherColor = this.hitFlash > 0 ? '#f5f5f5' : '#5c3f2a';
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';
    const attackAnim = this.getAttackAnimationState();
    const slashMotion = attackAnim.active ? Math.min(1, attackAnim.pulse * 0.45 + attackAnim.flash * 0.9) : 0;
    const swordAngle = -Math.PI * 0.58 + slashMotion * Math.PI * 0.46;
    const torsoTilt = attackAnim.active ? -attackAnim.pulse * 0.04 + attackAnim.flash * 0.03 : 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(255, 223, 126, 0.9)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = this.attackFlash > 0 ? 22 : 8;

    ctx.save();
    ctx.rotate(torsoTilt);

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.18, bodyHeight * 0.14, bodyWidth * 0.13, bodyHeight * 0.36);
    ctx.fillRect(bodyWidth * 0.04, bodyHeight * 0.14, bodyWidth * 0.13, bodyHeight * 0.36);

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.28, -bodyHeight * 0.1);
    ctx.lineTo(bodyWidth * 0.2, -bodyHeight * 0.1);
    ctx.lineTo(bodyWidth * 0.28, bodyHeight * 0.2);
    ctx.lineTo(-bodyWidth * 0.2, bodyHeight * 0.28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.06, -bodyHeight * 0.1, bodyWidth * 0.1, bodyHeight * 0.32);

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.32, -bodyHeight * 0.06, bodyWidth * 0.12, bodyHeight * 0.24);

    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.44, bodyHeight * 0.02, bodyWidth * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.44, bodyHeight * 0.02, bodyWidth * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -bodyHeight * 0.34, bodyWidth * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.22, -bodyHeight * 0.38);
    ctx.lineTo(0, -bodyHeight * 0.58);
    ctx.lineTo(bodyWidth * 0.2, -bodyHeight * 0.38);
    ctx.lineTo(bodyWidth * 0.16, -bodyHeight * 0.18);
    ctx.lineTo(-bodyWidth * 0.18, -bodyHeight * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-bodyWidth * 0.03, -bodyHeight * 0.32, bodyWidth * 0.06, bodyHeight * 0.2);

    ctx.restore();

    ctx.save();
    ctx.translate(bodyWidth * 0.14, -bodyHeight * 0.08);
    ctx.rotate(swordAngle);
    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.02, -bodyHeight * 0.02, bodyWidth * 0.11, bodyHeight * 0.3);
    ctx.fillStyle = leatherColor;
    ctx.fillRect(bodyWidth * 0.06, bodyHeight * 0.18, bodyWidth * 0.08, bodyHeight * 0.08);
    ctx.fillStyle = trimColor;
    ctx.fillRect(bodyWidth * 0.12, bodyHeight * 0.12, bodyWidth * 0.06, bodyHeight * 0.16);
    ctx.fillStyle = metalColor;
    ctx.fillRect(bodyWidth * 0.18, bodyHeight * 0.16, bodyWidth * 0.42, bodyWidth * 0.1);
    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.6, bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.82, bodyHeight * 0.21);
    ctx.lineTo(bodyWidth * 0.6, bodyHeight * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();

    this.drawStatus(bodyWidth, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.24;
    const bh = sz * 1.52;
    const armorColor = '#65a8ff';
    const trimColor = '#d8ebff';
    const clothColor = '#284579';
    const metalColor = '#c8d2df';
    const skinColor = '#f0c9a4';
    const leatherColor = '#5c3f2a';

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 腿部布料
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.18, bh * 0.14, bw * 0.13, bh * 0.36);
    c.fillRect(bw * 0.04, bh * 0.14, bw * 0.13, bh * 0.36);

    // 躯干甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.28, -bh * 0.1);
    c.lineTo(bw * 0.2, -bh * 0.1);
    c.lineTo(bw * 0.28, bh * 0.2);
    c.lineTo(-bw * 0.2, bh * 0.28);
    c.closePath();
    c.fill();

    // 躯干中线
    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.06, -bh * 0.1, bw * 0.1, bh * 0.32);

    // 左臂
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.32, -bh * 0.06, bw * 0.12, bh * 0.24);

    // 肩甲
    c.fillStyle = trimColor;
    c.beginPath();
    c.arc(-bw * 0.44, bh * 0.02, bw * 0.22, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = armorColor;
    c.beginPath();
    c.arc(-bw * 0.44, bh * 0.02, bw * 0.12, 0, Math.PI * 2);
    c.fill();

    // 头部
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(0, -bh * 0.34, bw * 0.18, 0, Math.PI * 2);
    c.fill();

    // 头盔
    c.fillStyle = metalColor;
    c.beginPath();
    c.moveTo(-bw * 0.22, -bh * 0.38);
    c.lineTo(0, -bh * 0.58);
    c.lineTo(bw * 0.2, -bh * 0.38);
    c.lineTo(bw * 0.16, -bh * 0.18);
    c.lineTo(-bw * 0.18, -bh * 0.18);
    c.closePath();
    c.fill();
    c.fillRect(-bw * 0.03, -bh * 0.32, bw * 0.06, bh * 0.2);

    // 剑（竖剑，无攻击动画，静止位置）
    c.save();
    c.translate(bw * 0.14, -bh * 0.08);
    c.rotate(-Math.PI * 0.58);
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.02, -bh * 0.02, bw * 0.11, bh * 0.3);
    c.fillStyle = leatherColor;
    c.fillRect(bw * 0.06, bh * 0.18, bw * 0.08, bh * 0.08);
    c.fillStyle = trimColor;
    c.fillRect(bw * 0.12, bh * 0.12, bw * 0.06, bh * 0.16);
    c.fillStyle = metalColor;
    c.fillRect(bw * 0.18, bh * 0.16, bw * 0.42, bw * 0.1);
    c.beginPath();
    c.moveTo(bw * 0.6, bh * 0.14);
    c.lineTo(bw * 0.82, bh * 0.21);
    c.lineTo(bw * 0.6, bh * 0.28);
    c.closePath();
    c.fill();
    c.restore();

    c.restore();
  }

}

class Spearman extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.SPEARMAN);

    super({
      ...config,
      type: UNIT_TYPE.SPEARMAN,
      label: meta.label,
      maxHp: 82,
      attackPower: 15,
      attackRange: 48,
      moveSpeed: 62,
      attackCooldown: 0.9,
      size: 28,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.12;
    const bodyHeight = this.size * 1.66;
    const armorColor = this.getBodyFlashColor(this.palette.primary);
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const clothColor = this.hitFlash > 0 ? '#eef4ff' : (this.team === TEAM.PLAYER ? '#375895' : '#8c3641');
    const metalColor = this.hitFlash > 0 ? '#ffffff' : '#d0d9e4';
    const darkMetalColor = this.hitFlash > 0 ? '#f6f8ff' : '#6c7788';
    const woodColor = this.hitFlash > 0 ? '#f5f5f5' : '#7a5734';
    const leatherColor = this.hitFlash > 0 ? '#f5f5f5' : '#5c3f2a';
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';
    const spearLength = this.size * 2.05;
    const attackAnim = this.getAttackAnimationState();
    const pushOffset = attackAnim.active ? (attackAnim.flash * 0.76 + attackAnim.pulse * 0.46) * this.size * 0.8 : 0;
    const bodyLean = attackAnim.active ? attackAnim.pulse * 0.035 + attackAnim.flash * 0.04 : 0;
    const rearLegOffset = attackAnim.active ? attackAnim.pulse * bodyHeight * 0.018 : 0;
    const frontLegOffset = attackAnim.active ? attackAnim.pulse * bodyHeight * 0.012 : 0;
    const shieldWidth = bodyWidth * 0.45;
    const shieldHeight = bodyHeight * 0.5;
    const shieldX = bodyWidth * 0.15;
    const shieldY = bodyHeight * 0.05;
    const shieldRadius = bodyWidth * 0.08;
    const spearBaseX = shieldX + shieldWidth * 0.58 + pushOffset;

    const spearBaseY = -bodyHeight * 0.015;
    const spearButt = bodyWidth * 0.16;

    const drawShieldPath = () => {
      const left = shieldX - shieldWidth / 2;
      const top = shieldY - shieldHeight / 2;
      const right = left + shieldWidth;
      const bottom = top + shieldHeight;
      const r = Math.min(shieldRadius, shieldWidth * 0.22, shieldHeight * 0.18);

      ctx.beginPath();
      ctx.moveTo(left + r, top);
      ctx.lineTo(right - r, top);
      ctx.quadraticCurveTo(right, top, right, top + r);
      ctx.lineTo(right, bottom - r);
      ctx.quadraticCurveTo(right, bottom, right - r, bottom);
      ctx.lineTo(left + r, bottom);
      ctx.quadraticCurveTo(left, bottom, left, bottom - r);
      ctx.lineTo(left, top + r);
      ctx.quadraticCurveTo(left, top, left + r, top);
      ctx.closePath();
    };

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(255, 226, 146, 0.86)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = this.attackFlash > 0 ? 20 : 8;

    ctx.save();
    ctx.rotate(bodyLean);

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.15, bodyHeight * 0.18 + rearLegOffset, bodyWidth * 0.12, bodyHeight * 0.36);
    ctx.fillRect(bodyWidth * 0.01, bodyHeight * 0.18 - frontLegOffset, bodyWidth * 0.12, bodyHeight * 0.36);

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.16);
    ctx.lineTo(bodyWidth * 0.14, -bodyHeight * 0.16);
    ctx.lineTo(bodyWidth * 0.24, bodyHeight * 0.22);
    ctx.lineTo(0, bodyHeight * 0.34);
    ctx.lineTo(-bodyWidth * 0.24, bodyHeight * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.045, -bodyHeight * 0.14, bodyWidth * 0.09, bodyHeight * 0.42);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.01, -bodyHeight * 0.37, bodyWidth * 0.17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.21, -bodyHeight * 0.4);
    ctx.lineTo(0, -bodyHeight * 0.6);
    ctx.lineTo(bodyWidth * 0.16, -bodyHeight * 0.42);
    ctx.lineTo(bodyWidth * 0.11, -bodyHeight * 0.18);
    ctx.lineTo(-bodyWidth * 0.15, -bodyHeight * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-bodyWidth * 0.022, -bodyHeight * 0.32, bodyWidth * 0.044, bodyHeight * 0.14);

    ctx.fillStyle = leatherColor;
    ctx.fillRect(bodyWidth * 0.02, -bodyHeight * 0.02, bodyWidth * 0.1, bodyHeight * 0.19);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(bodyWidth * 0.14, bodyHeight * 0.2, bodyWidth * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = leatherColor;
    ctx.fillRect(bodyWidth * 0.04, -bodyHeight * 0.005, bodyWidth * 0.18, bodyHeight * 0.06);
    ctx.fillRect(bodyWidth * 0.05, bodyHeight * 0.11, bodyWidth * 0.18, bodyHeight * 0.06);

    drawShieldPath();
    ctx.fillStyle = armorColor;
    ctx.fill();

    ctx.lineWidth = bodyWidth * 0.08;
    ctx.strokeStyle = darkMetalColor;
    ctx.stroke();

    ctx.fillStyle = trimColor;
    ctx.globalAlpha = 0.28;
    drawShieldPath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.arc(shieldX, shieldY, bodyWidth * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = metalColor;
    ctx.lineWidth = bodyWidth * 0.065;
    ctx.beginPath();
    ctx.moveTo(shieldX - shieldWidth * 0.18, shieldY);
    ctx.lineTo(shieldX + shieldWidth * 0.18, shieldY);
    ctx.moveTo(shieldX, shieldY - shieldHeight * 0.18);
    ctx.lineTo(shieldX, shieldY + shieldHeight * 0.18);
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(pushOffset, 0);

    ctx.fillStyle = clothColor;
    ctx.fillRect(bodyWidth * 0.02, -bodyHeight * 0.035, bodyWidth * 0.1, bodyHeight * 0.24);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(bodyWidth * 0.14, bodyHeight * 0.17, bodyWidth * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = woodColor;
    ctx.fillRect(spearBaseX - spearButt, spearBaseY - bodyWidth * 0.03, spearLength + spearButt, bodyWidth * 0.06);

    ctx.fillStyle = leatherColor;
    ctx.fillRect(spearBaseX - bodyWidth * 0.08, spearBaseY - bodyWidth * 0.055, bodyWidth * 0.16, bodyWidth * 0.11);

    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.moveTo(spearBaseX + spearLength - bodyWidth * 0.15, spearBaseY - bodyHeight * 0.11);
    ctx.lineTo(spearBaseX + spearLength + bodyWidth * 0.09, spearBaseY);
    ctx.lineTo(spearBaseX + spearLength - bodyWidth * 0.15, spearBaseY + bodyHeight * 0.11);
    ctx.lineTo(spearBaseX + spearLength - bodyWidth * 0.28, spearBaseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = clothColor;
    ctx.fillRect(spearBaseX - bodyWidth * 0.22, spearBaseY - bodyHeight * 0.06, bodyWidth * 0.08, bodyHeight * 0.2);

    ctx.restore();
    ctx.restore();

    this.drawStatus(this.size * 1.72, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.12;
    const bh = sz * 1.66;
    const armorColor = '#65a8ff';
    const trimColor = '#d8ebff';
    const clothColor = '#375895';
    const metalColor = '#d0d9e4';
    const darkMetalColor = '#6c7788';
    const woodColor = '#7a5734';
    const leatherColor = '#5c3f2a';
    const skinColor = '#f0c9a4';
    const spearLen = sz * 2.05;
    const shieldW = bw * 0.45;
    const shieldH = bh * 0.5;
    const shieldX = bw * 0.15;
    const shieldY = bh * 0.05;
    const shieldR = bw * 0.08;
    const spearBaseX = shieldX + shieldW * 0.58;
    const spearBaseY = -bh * 0.015;
    const spearButt = bw * 0.16;

    const drawShieldPath = () => {
      const left = shieldX - shieldW / 2;
      const top = shieldY - shieldH / 2;
      const right = left + shieldW;
      const bottom = top + shieldH;
      const r = Math.min(shieldR, shieldW * 0.22, shieldH * 0.18);
      c.beginPath();
      c.moveTo(left + r, top);
      c.lineTo(right - r, top);
      c.quadraticCurveTo(right, top, right, top + r);
      c.lineTo(right, bottom - r);
      c.quadraticCurveTo(right, bottom, right - r, bottom);
      c.lineTo(left + r, bottom);
      c.quadraticCurveTo(left, bottom, left, bottom - r);
      c.lineTo(left, top + r);
      c.quadraticCurveTo(left, top, left + r, top);
      c.closePath();
    };

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 腿
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.15, bh * 0.18, bw * 0.12, bh * 0.36);
    c.fillRect(bw * 0.01, bh * 0.18, bw * 0.12, bh * 0.36);

    // 躯干甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.2, -bh * 0.16);
    c.lineTo(bw * 0.14, -bh * 0.16);
    c.lineTo(bw * 0.24, bh * 0.22);
    c.lineTo(0, bh * 0.34);
    c.lineTo(-bw * 0.24, bh * 0.22);
    c.closePath();
    c.fill();

    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.045, -bh * 0.14, bw * 0.09, bh * 0.42);

    // 头
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(-bw * 0.01, -bh * 0.37, bw * 0.17, 0, Math.PI * 2);
    c.fill();

    // 头盔
    c.fillStyle = metalColor;
    c.beginPath();
    c.moveTo(-bw * 0.21, -bh * 0.4);
    c.lineTo(0, -bh * 0.6);
    c.lineTo(bw * 0.16, -bh * 0.42);
    c.lineTo(bw * 0.11, -bh * 0.18);
    c.lineTo(-bw * 0.15, -bh * 0.18);
    c.closePath();
    c.fill();

    // 右手臂
    c.fillStyle = leatherColor;
    c.fillRect(bw * 0.02, -bh * 0.02, bw * 0.1, bh * 0.19);

    // 盾
    drawShieldPath();
    c.fillStyle = armorColor;
    c.fill();
    c.lineWidth = bw * 0.08;
    c.strokeStyle = darkMetalColor;
    c.stroke();
    c.fillStyle = trimColor;
    c.globalAlpha = 0.28;
    drawShieldPath();
    c.fill();
    c.globalAlpha = 1;
    c.fillStyle = metalColor;
    c.beginPath();
    c.arc(shieldX, shieldY, bw * 0.08, 0, Math.PI * 2);
    c.fill();

    // 矛杆
    c.fillStyle = woodColor;
    c.fillRect(spearBaseX - spearButt, spearBaseY - bw * 0.03, spearLen + spearButt, bw * 0.06);

    // 矛头
    c.fillStyle = metalColor;
    c.beginPath();
    c.moveTo(spearBaseX + spearLen - bw * 0.15, spearBaseY - bh * 0.11);
    c.lineTo(spearBaseX + spearLen + bw * 0.09, spearBaseY);
    c.lineTo(spearBaseX + spearLen - bw * 0.15, spearBaseY + bh * 0.11);
    c.lineTo(spearBaseX + spearLen - bw * 0.28, spearBaseY);
    c.closePath();
    c.fill();

    c.restore();
  }

}

class Archer extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.ARCHER);

    super({
      ...config,
      type: UNIT_TYPE.ARCHER,
      label: meta.label,
      maxHp: 55,
      attackPower: 22,
      attackRange: 190,
      moveSpeed: 68,
      attackCooldown: 1.2,
      size: 27,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.08;
    const bodyHeight = this.size * 1.64;
    const cloakColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#507d49' : '#7a593a');
    const hoodColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#3a6134' : '#66452f');
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const woodColor = this.hitFlash > 0 ? '#ffffff' : '#8c643e';
    const leatherColor = this.hitFlash > 0 ? '#f5f5f5' : '#5d412b';
    const stringColor = this.hitFlash > 0 ? '#ffffff' : 'rgba(244, 238, 222, 0.96)';
    const metalColor = this.getBodyFlashColor('#cbd5df');
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';

    const attackAnim = this.getAttackAnimationState();
    const drawCycle = attackAnim.active
      ? (attackAnim.cycle < 0.72
        ? attackAnim.cycle / 0.72
        : Math.max(0, 1 - (attackAnim.cycle - 0.72) / 0.28))
      : 0;

    const bowX = bodyWidth * 0.3;
    const bowTopY = -bodyHeight * 0.42;
    const bowBottomY = bodyHeight * 0.18;
    const bowGripY = -bodyHeight * 0.08;
    const bowCurveX = bowX + bodyWidth * 0.34 + drawCycle * bodyWidth * 0.05;

    const stringAnchorX = bowX - bodyWidth * 0.02;
    const pulledNotchX = stringAnchorX - bodyWidth * 0.08 - drawCycle * bodyWidth * 0.42 - attackAnim.flash * bodyWidth * 0.08;

    const flightWindow = 0.15;
    const flashRatio = clamp(this.attackFlash / flightWindow, 0, 1);
    const shotProgress = this.attackFlash > 0 ? 1 - flashRatio : 0;
    const easedProgress = 1 - Math.pow(1 - shotProgress, 2.35);
    const stringNotchX = pulledNotchX + (stringAnchorX - pulledNotchX) * easedProgress;

    const loadedArrowTailX = pulledNotchX - bodyWidth * 0.18;
    const loadedArrowHeadX = bowX + bodyWidth * 0.28;
    const bodyLean = attackAnim.active ? -drawCycle * 0.06 + attackAnim.flash * 0.035 : 0;
    const showLoadedArrow = attackAnim.active && this.attackFlash <= 0;

    const bowFrontLocalX = bowX + bodyWidth * 0.14;
    const bowFrontLocalY = bowGripY;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(170, 255, 150, 0.88)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = this.attackFlash > 0 ? 18 : 8;

    ctx.save();
    ctx.rotate(bodyLean);

    ctx.fillStyle = leatherColor;
    ctx.fillRect(-bodyWidth * 0.18, bodyHeight * 0.18, bodyWidth * 0.11, bodyHeight * 0.34);
    ctx.fillRect(bodyWidth * 0.02, bodyHeight * 0.18, bodyWidth * 0.11, bodyHeight * 0.34);

    ctx.fillStyle = woodColor;
    ctx.fillRect(-bodyWidth * 0.34, -bodyHeight * 0.16, bodyWidth * 0.16, bodyHeight * 0.48);

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.3, -bodyHeight * 0.22, bodyWidth * 0.04, bodyHeight * 0.14);
    ctx.fillRect(-bodyWidth * 0.24, -bodyHeight * 0.2, bodyWidth * 0.04, bodyHeight * 0.12);

    ctx.fillStyle = cloakColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.14, -bodyHeight * 0.16);
    ctx.lineTo(bodyWidth * 0.22, bodyHeight * 0.26);
    ctx.lineTo(0, bodyHeight * 0.36);
    ctx.lineTo(-bodyWidth * 0.24, bodyHeight * 0.24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.04, -bodyHeight * 0.12, bodyWidth * 0.08, bodyHeight * 0.34);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.01, -bodyHeight * 0.34, bodyWidth * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hoodColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.36);
    ctx.lineTo(-bodyWidth * 0.04, -bodyHeight * 0.56);
    ctx.lineTo(bodyWidth * 0.16, -bodyHeight * 0.38);
    ctx.lineTo(bodyWidth * 0.1, -bodyHeight * 0.16);
    ctx.lineTo(-bodyWidth * 0.16, -bodyHeight * 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = leatherColor;
    ctx.lineWidth = bodyWidth * 0.1;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.02, -bodyHeight * 0.1);
    ctx.lineTo(stringNotchX + bodyWidth * 0.04, bowGripY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.06, -bodyHeight * 0.08);
    ctx.lineTo(bowX + bodyWidth * 0.02, bowGripY);
    ctx.stroke();

    ctx.strokeStyle = woodColor;
    ctx.lineWidth = bodyWidth * 0.13;
    ctx.beginPath();
    ctx.moveTo(bowX, bowTopY);
    ctx.quadraticCurveTo(bowCurveX, bowGripY, bowX, bowBottomY);
    ctx.stroke();

    ctx.strokeStyle = stringColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(stringAnchorX, bowTopY + bodyHeight * 0.03);
    ctx.lineTo(stringNotchX, bowGripY);
    ctx.lineTo(stringAnchorX, bowBottomY - bodyHeight * 0.03);
    ctx.stroke();

    if (showLoadedArrow) {
      ctx.strokeStyle = metalColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(loadedArrowTailX, bowGripY);
      ctx.lineTo(loadedArrowHeadX, bowGripY);
      ctx.stroke();

      ctx.fillStyle = metalColor;
      ctx.beginPath();
      ctx.moveTo(loadedArrowHeadX, bowGripY);
      ctx.lineTo(loadedArrowHeadX - bodyWidth * 0.11, bowGripY - bodyHeight * 0.06);
      ctx.lineTo(loadedArrowHeadX - bodyWidth * 0.11, bowGripY + bodyHeight * 0.06);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(loadedArrowTailX, bowGripY);
      ctx.lineTo(loadedArrowTailX - bodyWidth * 0.08, bowGripY - bodyHeight * 0.05);
      ctx.moveTo(loadedArrowTailX, bowGripY);
      ctx.lineTo(loadedArrowTailX - bodyWidth * 0.08, bowGripY + bodyHeight * 0.05);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();

    if (this.attackFlash > 0) {
      const startX = this.x + this.direction * bowFrontLocalX;
      const startY = this.y + bowFrontLocalY;
      const endX = this.x + this.direction * this.attackRange;
      const endY = this.y - 12;

      const arrowX = startX + (endX - startX) * easedProgress;
      const arrowY = startY + (endY - startY) * easedProgress;

      const flightAngle = Math.atan2(endY - startY, endX - startX);
      const arrowLength = 15;
      const tailX = arrowX - Math.cos(flightAngle) * arrowLength;
      const tailY = arrowY - Math.sin(flightAngle) * arrowLength;

      const normalX = Math.cos(flightAngle + Math.PI * 0.5);
      const normalY = Math.sin(flightAngle + Math.PI * 0.5);

      const trailGradient = ctx.createLinearGradient(startX, startY, tailX, tailY);
      trailGradient.addColorStop(0, 'rgba(216, 222, 230, 0)');
      trailGradient.addColorStop(0.55, `rgba(216, 222, 230, ${0.08 + shotProgress * 0.12})`);
      trailGradient.addColorStop(1, `rgba(232, 238, 244, ${0.32 + (1 - shotProgress) * 0.22})`);

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.strokeStyle = metalColor;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();

      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(tailX - Math.cos(flightAngle) * 4 + normalX * 3.4, tailY - Math.sin(flightAngle) * 4 + normalY * 3.4);
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(tailX - Math.cos(flightAngle) * 4 - normalX * 3.4, tailY - Math.sin(flightAngle) * 4 - normalY * 3.4);
      ctx.stroke();

      ctx.fillStyle = metalColor;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - Math.cos(flightAngle) * 7 + normalX * 3.2,
        arrowY - Math.sin(flightAngle) * 7 + normalY * 3.2
      );
      ctx.lineTo(
        arrowX - Math.cos(flightAngle) * 7 - normalX * 3.2,
        arrowY - Math.sin(flightAngle) * 7 - normalY * 3.2
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    this.drawStatus(this.size * 1.55, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.08;
    const bh = sz * 1.64;
    const cloakColor = '#507d49';
    const hoodColor = '#3a6134';
    const trimColor = '#d8ebff';
    const woodColor = '#8c643e';
    const leatherColor = '#5d412b';
    const stringColor = 'rgba(244, 238, 222, 0.96)';
    const metalColor = '#cbd5df';
    const skinColor = '#f0c9a4';

    // 弓参数（静止状态，不拉弓）
    const bowX = bw * 0.3;
    const bowTopY = -bh * 0.42;
    const bowBottomY = bh * 0.18;
    const bowGripY = -bh * 0.08;
    const bowCurveX = bowX + bw * 0.34;
    const stringAnchorX = bowX - bw * 0.02;

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 腿
    c.fillStyle = leatherColor;
    c.fillRect(-bw * 0.18, bh * 0.18, bw * 0.11, bh * 0.34);
    c.fillRect(bw * 0.02, bh * 0.18, bw * 0.11, bh * 0.34);

    // 背上箭袋
    c.fillStyle = woodColor;
    c.fillRect(-bw * 0.34, -bh * 0.16, bw * 0.16, bh * 0.48);
    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.3, -bh * 0.22, bw * 0.04, bh * 0.14);
    c.fillRect(-bw * 0.24, -bh * 0.2, bw * 0.04, bh * 0.12);

    // 披风身体
    c.fillStyle = cloakColor;
    c.beginPath();
    c.moveTo(-bw * 0.2, -bh * 0.14);
    c.lineTo(bw * 0.14, -bh * 0.16);
    c.lineTo(bw * 0.22, bh * 0.26);
    c.lineTo(0, bh * 0.36);
    c.lineTo(-bw * 0.24, bh * 0.24);
    c.closePath();
    c.fill();

    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.04, -bh * 0.12, bw * 0.08, bh * 0.34);

    // 头
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(-bw * 0.01, -bh * 0.34, bw * 0.16, 0, Math.PI * 2);
    c.fill();

    // 兜帽
    c.fillStyle = hoodColor;
    c.beginPath();
    c.moveTo(-bw * 0.2, -bh * 0.36);
    c.lineTo(-bw * 0.04, -bh * 0.56);
    c.lineTo(bw * 0.16, -bh * 0.38);
    c.lineTo(bw * 0.1, -bh * 0.16);
    c.lineTo(-bw * 0.16, -bh * 0.18);
    c.closePath();
    c.fill();

    // 持弓手臂（皮革）
    c.strokeStyle = leatherColor;
    c.lineWidth = bw * 0.1;
    c.beginPath();
    c.moveTo(-bw * 0.02, -bh * 0.1);
    c.lineTo(stringAnchorX + bw * 0.04, bowGripY);
    c.stroke();
    c.beginPath();
    c.moveTo(bw * 0.06, -bh * 0.08);
    c.lineTo(bowX + bw * 0.02, bowGripY);
    c.stroke();

    // 弓身
    c.strokeStyle = woodColor;
    c.lineWidth = bw * 0.13;
    c.beginPath();
    c.moveTo(bowX, bowTopY);
    c.quadraticCurveTo(bowCurveX, bowGripY, bowX, bowBottomY);
    c.stroke();

    // 弓弦
    c.strokeStyle = stringColor;
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(stringAnchorX, bowTopY + bh * 0.03);
    c.lineTo(stringAnchorX, bowGripY);
    c.lineTo(stringAnchorX, bowBottomY - bh * 0.03);
    c.stroke();

    // 搭在弦上的箭
    c.strokeStyle = metalColor;
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(stringAnchorX - bw * 0.26, bowGripY);
    c.lineTo(bowX + bw * 0.28, bowGripY);
    c.stroke();
    c.fillStyle = metalColor;
    c.beginPath();
    c.moveTo(bowX + bw * 0.28, bowGripY);
    c.lineTo(bowX + bw * 0.17, bowGripY - bh * 0.06);
    c.lineTo(bowX + bw * 0.17, bowGripY + bh * 0.06);
    c.closePath();
    c.fill();

    c.restore();
  }

}

class Zombie extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.ZOMBIE);

    super({
      ...config,
      type: UNIT_TYPE.ZOMBIE,
      label: meta.label,
      maxHp: 75,
      attackPower: 16,
      attackRange: 170,
      moveSpeed: 40,
      attackCooldown: 1.1,
      size: 29,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 0.98;
    const bodyHeight = this.size * 1.3;
    const skinColor = this.hitFlash > 0 ? '#ffffff' : (this.team === TEAM.PLAYER ? '#8da287' : '#9f8b77');
    const torsoColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#5b6c4f' : '#6b5848');
    const clothColor = this.hitFlash > 0 ? '#eef2eb' : (this.team === TEAM.PLAYER ? '#40483a' : '#58463c');
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const rockColor = this.hitFlash > 0 ? '#ffffff' : '#6e5238';
    const rockShadeColor = this.hitFlash > 0 ? '#f4f4f4' : '#4f3b29';
    const eyeColor = this.hitFlash > 0 ? '#ffffff' : '#d5ec7d';
    const mudColor = this.hitFlash > 0 ? '#f8f8f8' : '#5c4937';

    const crawlTime = performance.now() * 0.004 + this.id * 0.48;
    const locomotionBlend = this.state === 'marching' ? 1 : 0.4;
    const stepWave = Math.sin(crawlTime);
    const dragWave = Math.sin(crawlTime - Math.PI * 0.38);
    const bobOffset = (Math.abs(stepWave) * bodyHeight * 0.046 + (dragWave + 1) * bodyHeight * 0.01) * locomotionBlend;
    const bodyLean = -0.18 + stepWave * 0.05 * locomotionBlend;
    const headTilt = -0.09 + stepWave * 0.035 * locomotionBlend;
    const leftLegAngle = -0.22 + stepWave * 0.28 * locomotionBlend;
    const rightLegAngle = 0.08 - stepWave * 0.22 * locomotionBlend;
    const leftArmAngle = -0.5 + dragWave * 0.12 * locomotionBlend;

    const flightWindow = 0.12;
    const flashRatio = clamp(this.attackFlash / flightWindow, 0, 1);
    const throwProgress = this.attackFlash > 0 ? 1 - flashRatio : 0;
    const throwEase = 1 - Math.pow(1 - throwProgress, 2.4);
    const windUp = this.attackFlash > 0 ? Math.pow(flashRatio, 0.72) : 0;
    const rightArmAngle = 0.34 - dragWave * 0.08 * locomotionBlend - windUp * 0.96 + throwEase * 0.58;
    const heldRockScale = 1 + windUp * 0.42;
    const showHeldRock = this.attackFlash <= 0 || throwProgress < 0.18;

    ctx.save();
    ctx.translate(this.x, this.y + bobOffset);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(188, 224, 126, 0.55)', 'rgba(255, 255, 255, 0.06)');
    ctx.shadowBlur = this.attackFlash > 0 ? 16 : 6;

    ctx.save();
    ctx.rotate(bodyLean);

    ctx.fillStyle = mudColor;
    ctx.beginPath();
    ctx.ellipse(-bodyWidth * 0.05, bodyHeight * 0.56, bodyWidth * 0.56, bodyHeight * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-bodyWidth * 0.14, bodyHeight * 0.18);
    ctx.rotate(leftLegAngle);
    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.09, 0, bodyWidth * 0.18, bodyHeight * 0.38);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-bodyWidth * 0.1, bodyHeight * 0.34, bodyWidth * 0.2, bodyHeight * 0.08);
    ctx.restore();

    ctx.save();
    ctx.translate(bodyWidth * 0.08, bodyHeight * 0.22);
    ctx.rotate(rightLegAngle);
    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.085, 0, bodyWidth * 0.17, bodyHeight * 0.36);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-bodyWidth * 0.1, bodyHeight * 0.32, bodyWidth * 0.2, bodyHeight * 0.08);
    ctx.restore();

    ctx.fillStyle = torsoColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.28, -bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.12, -bodyHeight * 0.2);
    ctx.lineTo(bodyWidth * 0.26, bodyHeight * 0.2);
    ctx.lineTo(0, bodyHeight * 0.36);
    ctx.lineTo(-bodyWidth * 0.3, bodyHeight * 0.24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.06, -bodyHeight * 0.08, bodyWidth * 0.1, bodyHeight * 0.31);
    ctx.fillRect(-bodyWidth * 0.24, bodyHeight * 0.04, bodyWidth * 0.1, bodyHeight * 0.07);

    ctx.save();
    ctx.translate(-bodyWidth * 0.18, -bodyHeight * 0.03);
    ctx.rotate(leftArmAngle);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-bodyWidth * 0.06, 0, bodyWidth * 0.12, bodyHeight * 0.34);
    ctx.beginPath();
    ctx.arc(0, bodyHeight * 0.36, bodyWidth * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(bodyWidth * 0.16, -bodyHeight * 0.08);
    ctx.rotate(rightArmAngle);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-bodyWidth * 0.06, 0, bodyWidth * 0.12, bodyHeight * 0.3);
    ctx.beginPath();
    ctx.arc(0, bodyHeight * 0.32, bodyWidth * 0.09, 0, Math.PI * 2);
    ctx.fill();

    if (showHeldRock) {
      const rockRadius = bodyWidth * 0.12 * heldRockScale;
      ctx.save();
      ctx.translate(bodyWidth * 0.04, bodyHeight * 0.41);
      ctx.scale(heldRockScale, heldRockScale);
      ctx.fillStyle = rockColor;
      ctx.beginPath();
      ctx.moveTo(rockRadius * 0.95, -rockRadius * 0.12);
      ctx.lineTo(rockRadius * 0.4, -rockRadius * 0.78);
      ctx.lineTo(-rockRadius * 0.48, -rockRadius * 0.64);
      ctx.lineTo(-rockRadius * 0.9, 0);
      ctx.lineTo(-rockRadius * 0.38, rockRadius * 0.74);
      ctx.lineTo(rockRadius * 0.58, rockRadius * 0.62);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = rockShadeColor;
      ctx.globalAlpha = 0.34;
      ctx.beginPath();
      ctx.arc(-rockRadius * 0.18, -rockRadius * 0.1, rockRadius * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    ctx.save();
    ctx.translate(-bodyWidth * 0.02, -bodyHeight * 0.35);
    ctx.rotate(headTilt);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, bodyWidth * 0.21, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.055, -bodyHeight * 0.01, bodyWidth * 0.024, 0, Math.PI * 2);
    ctx.arc(bodyWidth * 0.03, bodyHeight * 0.01, bodyWidth * 0.024, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = clothColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.03, bodyHeight * 0.075);
    ctx.lineTo(bodyWidth * 0.08, bodyHeight * 0.105);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = trimColor;
    ctx.globalAlpha = 0.42;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.12, bodyHeight * 0.1, bodyWidth * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();

    if (this.attackFlash > 0) {
      const startX = this.x + this.direction * (bodyWidth * 0.42);
      const startY = this.y - bodyHeight * 0.08 + bobOffset * 0.25;
      const endX = this.x + this.direction * this.attackRange;
      const endY = this.y - bodyHeight * 0.22;
      const arcHeight = Math.min(48, bodyHeight * 0.78 + this.attackRange * 0.08);

      const rockX = startX + (endX - startX) * throwEase;
      const rockY = startY + (endY - startY) * throwEase - Math.sin(throwEase * Math.PI) * arcHeight;
      const shadowX = startX + (endX - startX) * throwEase;
      const shadowY = startY + (endY - startY) * throwEase;

      const spin = throwEase * 13 + this.id * 0.7;
      const rockRadius = 7.5 + windUp * 3.4;

      ctx.save();
      ctx.globalAlpha = 0.22 + flashRatio * 0.12;
      ctx.strokeStyle = 'rgba(111, 82, 56, 0.45)';
      ctx.lineWidth = rockRadius * 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo((startX + rockX) * 0.5, Math.min(startY, rockY) - arcHeight * 0.18, rockX, rockY);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#2d2017';
      ctx.beginPath();
      ctx.ellipse(shadowX, shadowY + bodyHeight * 0.2, rockRadius * 1.05, rockRadius * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(rockX, rockY);
      ctx.rotate(spin);
      ctx.fillStyle = rockColor;
      ctx.beginPath();
      ctx.moveTo(rockRadius * 1.02, -rockRadius * 0.08);
      ctx.lineTo(rockRadius * 0.48, -rockRadius * 0.82);
      ctx.lineTo(-rockRadius * 0.4, -rockRadius * 0.7);
      ctx.lineTo(-rockRadius * 0.98, -rockRadius * 0.08);
      ctx.lineTo(-rockRadius * 0.58, rockRadius * 0.76);
      ctx.lineTo(rockRadius * 0.5, rockRadius * 0.64);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = rockShadeColor;
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      ctx.arc(-rockRadius * 0.16, -rockRadius * 0.18, rockRadius * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    this.drawStatus(this.size * 1.4, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 0.98;
    const bh = sz * 1.3;
    const skinColor = '#8da287';
    const torsoColor = '#5b6c4f';
    const clothColor = '#40483a';
    const eyeColor = '#d5ec7d';
    const mudColor = '#5c4937';

    // 固定静止动画值
    const bLean = -0.18;
    const hTilt = -0.09;
    const leftLegAngle = -0.22;
    const rightLegAngle = 0.08;
    const leftArmAngle = -0.5;
    const rightArmAngle = 0.34;


    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    c.save();
    c.rotate(bLean);

    // 地面泥迹
    c.fillStyle = mudColor;
    c.beginPath();
    c.ellipse(-bw * 0.05, bh * 0.56, bw * 0.56, bh * 0.09, 0, 0, Math.PI * 2);
    c.fill();

    // 左腿
    c.save();
    c.translate(-bw * 0.14, bh * 0.18);
    c.rotate(leftLegAngle);
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.09, 0, bw * 0.18, bh * 0.38);
    c.fillStyle = skinColor;
    c.fillRect(-bw * 0.1, bh * 0.34, bw * 0.2, bh * 0.08);
    c.restore();

    // 右腿
    c.save();
    c.translate(bw * 0.08, bh * 0.22);
    c.rotate(rightLegAngle);
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.085, 0, bw * 0.17, bh * 0.36);
    c.fillStyle = skinColor;
    c.fillRect(-bw * 0.1, bh * 0.32, bw * 0.2, bh * 0.08);
    c.restore();

    // 躯干
    c.fillStyle = torsoColor;
    c.beginPath();
    c.moveTo(-bw * 0.28, -bh * 0.14);
    c.lineTo(bw * 0.12, -bh * 0.2);
    c.lineTo(bw * 0.26, bh * 0.2);
    c.lineTo(0, bh * 0.36);
    c.lineTo(-bw * 0.3, bh * 0.24);
    c.closePath();
    c.fill();

    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.06, -bh * 0.08, bw * 0.1, bh * 0.31);

    // 左臂（伸出）
    c.save();
    c.translate(-bw * 0.18, -bh * 0.03);
    c.rotate(leftArmAngle);
    c.fillStyle = skinColor;
    c.fillRect(-bw * 0.06, 0, bw * 0.12, bh * 0.34);
    c.beginPath();
    c.arc(0, bh * 0.36, bw * 0.09, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // 右臂（持石块）
    c.save();
    c.translate(bw * 0.16, -bh * 0.08);
    c.rotate(rightArmAngle);
    c.fillStyle = skinColor;
    c.fillRect(-bw * 0.06, 0, bw * 0.12, bh * 0.3);
    c.beginPath();
    c.arc(0, bh * 0.32, bw * 0.09, 0, Math.PI * 2);
    c.fill();

    // 石块
    const rockR = bw * 0.12;
    c.save();
    c.translate(bw * 0.04, bh * 0.41);
    c.fillStyle = '#6e5238';
    c.beginPath();
    c.moveTo(rockR * 0.95, -rockR * 0.12);
    c.lineTo(rockR * 0.4, -rockR * 0.78);
    c.lineTo(-rockR * 0.48, -rockR * 0.64);
    c.lineTo(-rockR * 0.9, 0);
    c.lineTo(-rockR * 0.38, rockR * 0.74);
    c.lineTo(rockR * 0.58, rockR * 0.62);
    c.closePath();
    c.fill();
    c.restore();

    c.restore(); // rightArm

    // 头
    c.save();
    c.translate(-bw * 0.02, -bh * 0.35);
    c.rotate(hTilt);
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(0, 0, bw * 0.21, 0, Math.PI * 2);
    c.fill();

    // 发光眼睛
    c.fillStyle = eyeColor;
    c.beginPath();
    c.arc(-bw * 0.055, -bh * 0.01, bw * 0.024, 0, Math.PI * 2);
    c.arc(bw * 0.03, bh * 0.01, bw * 0.024, 0, Math.PI * 2);
    c.fill();

    // 嘴
    c.strokeStyle = clothColor;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-bw * 0.03, bh * 0.075);
    c.lineTo(bw * 0.08, bh * 0.105);
    c.stroke();
    c.restore(); // head

    c.restore(); // body lean
    c.restore(); // translate
  }

  die(source = null) {
    if (this.deathHandled) {
      return { poisonApplied: false };
    }

    let poisonTarget = null;

    if (source instanceof Unit && source.team !== this.team && source.isAlive()) {
      poisonTarget = source;
    } else {
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const unit of gameState.units) {
        if (unit === this || unit.team === this.team || !unit.isAlive()) {
          continue;
        }

        const distance = Math.hypot(unit.x - this.x, unit.y - this.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          poisonTarget = unit;
        }
      }
    }

    let poisonApplied = false;

    if (poisonTarget) {
      poisonTarget.applyPoison(this);
      poisonApplied = true;
    }

    super.die(source);
    return { poisonApplied };
  }

}

class Giant extends Unit {

  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.GIANT);

    super({
      ...config,
      type: UNIT_TYPE.GIANT,
      label: meta.label,
      maxHp: 320,
      attackPower: 42,
      attackRange: 16,
      moveSpeed: 34,
      attackCooldown: 1.45,
      size: 46,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.44;
    const bodyHeight = this.size * 1.62;
    const skinColor = this.hitFlash > 0 ? '#ffffff' : (this.team === TEAM.PLAYER ? '#7b93c5' : '#b16c74');
    const armorColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#3b5486' : '#6c3137');
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const fistColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#d4deef' : '#f2c0c0');
    const attackAnim = this.getAttackAnimationState();
    const liftPhase = attackAnim.active ? Math.sin(clamp(attackAnim.cycle / 0.42, 0, 1) * Math.PI * 0.5) : 0;
    const slamPhase = attackAnim.active ? Math.sin(clamp((attackAnim.cycle - 0.42) / 0.58, 0, 1) * Math.PI * 0.5) : 0;
    const bodyLean = -liftPhase * 0.14 + slamPhase * 0.08 + attackAnim.flash * 0.02;
    const bodyDip = slamPhase * bodyHeight * 0.04;
    const leftArmAngle = -0.55 - liftPhase * 0.82 + slamPhase * 0.76;
    const rightArmAngle = 0.1 + liftPhase * 0.68 - slamPhase * 0.92;

    ctx.save();
    ctx.translate(this.x, this.y + bodyDip);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(255, 213, 112, 0.92)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = this.attackFlash > 0 ? 26 : 10;

    ctx.save();
    ctx.rotate(bodyLean);

    ctx.fillStyle = skinColor;
    ctx.fillRect(-bodyWidth * 0.18, bodyHeight * 0.22, bodyWidth * 0.14, bodyHeight * 0.34);
    ctx.fillRect(bodyWidth * 0.04, bodyHeight * 0.22, bodyWidth * 0.14, bodyHeight * 0.34);

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.5, -bodyHeight * 0.14);
    ctx.lineTo(-bodyWidth * 0.22, -bodyHeight * 0.42);
    ctx.lineTo(bodyWidth * 0.32, -bodyHeight * 0.42);
    ctx.lineTo(bodyWidth * 0.54, -bodyHeight * 0.08);
    ctx.lineTo(bodyWidth * 0.3, bodyHeight * 0.38);
    ctx.lineTo(-bodyWidth * 0.26, bodyHeight * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.1, -bodyHeight * 0.28, bodyWidth * 0.16, bodyHeight * 0.52);
    ctx.fillRect(-bodyWidth * 0.32, -bodyHeight * 0.02, bodyWidth * 0.58, bodyHeight * 0.08);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -bodyHeight * 0.5, bodyWidth * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.06, -bodyHeight * 0.52, bodyWidth * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bodyWidth * 0.08, -bodyHeight * 0.52, bodyWidth * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = armorColor;
    ctx.save();
    ctx.translate(-bodyWidth * 0.3, -bodyHeight * 0.08);
    ctx.rotate(leftArmAngle);
    ctx.fillRect(-bodyWidth * 0.08, -bodyHeight * 0.03, bodyWidth * 0.18, bodyHeight * 0.26);
    ctx.fillStyle = fistColor;
    ctx.beginPath();
    ctx.arc(0, bodyHeight * 0.28, bodyWidth * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = armorColor;
    ctx.save();
    ctx.translate(bodyWidth * 0.2, -bodyHeight * 0.12);
    ctx.rotate(rightArmAngle);
    ctx.fillRect(-bodyWidth * 0.08, -bodyHeight * 0.03, bodyWidth * 0.2, bodyHeight * 0.28);
    ctx.fillStyle = fistColor;
    ctx.beginPath();
    ctx.arc(bodyWidth * 0.03, bodyHeight * 0.32, bodyWidth * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    this.drawStatus(bodyWidth, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.44;
    const bh = sz * 1.62;
    const skinColor = '#7b93c5';
    const armorColor = '#3b5486';
    const trimColor = '#d8ebff';
    const fistColor = '#d4deef';

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 腿
    c.fillStyle = skinColor;
    c.fillRect(-bw * 0.18, bh * 0.22, bw * 0.14, bh * 0.34);
    c.fillRect(bw * 0.04, bh * 0.22, bw * 0.14, bh * 0.34);

    // 躯干甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.5, -bh * 0.14);
    c.lineTo(-bw * 0.22, -bh * 0.42);
    c.lineTo(bw * 0.32, -bh * 0.42);
    c.lineTo(bw * 0.54, -bh * 0.08);
    c.lineTo(bw * 0.3, bh * 0.38);
    c.lineTo(-bw * 0.26, bh * 0.4);
    c.closePath();
    c.fill();

    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.1, -bh * 0.28, bw * 0.16, bh * 0.52);
    c.fillRect(-bw * 0.32, -bh * 0.02, bw * 0.58, bh * 0.08);

    // 头
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(0, -bh * 0.5, bw * 0.18, 0, Math.PI * 2);
    c.fill();

    // 眼睛（愤怒橙眼）
    c.fillStyle = trimColor;
    c.beginPath();
    c.arc(-bw * 0.06, -bh * 0.52, bw * 0.05, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(bw * 0.08, -bh * 0.52, bw * 0.05, 0, Math.PI * 2);
    c.fill();

    // 左臂
    c.fillStyle = armorColor;
    c.save();
    c.translate(-bw * 0.3, -bh * 0.08);
    c.rotate(-0.55);
    c.fillRect(-bw * 0.08, -bh * 0.03, bw * 0.18, bh * 0.26);
    c.fillStyle = fistColor;
    c.beginPath();
    c.arc(0, bh * 0.28, bw * 0.18, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // 右臂
    c.fillStyle = armorColor;
    c.save();
    c.translate(bw * 0.2, -bh * 0.12);
    c.rotate(0.1);
    c.fillRect(-bw * 0.08, -bh * 0.03, bw * 0.2, bh * 0.28);
    c.fillStyle = fistColor;
    c.beginPath();
    c.arc(bw * 0.03, bh * 0.32, bw * 0.22, 0, Math.PI * 2);
    c.fill();
    c.restore();

    c.restore();
  }

}

class Battleship extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.WARSHIP);

    super({
      ...config,
      type: UNIT_TYPE.WARSHIP,
      label: meta.label,
      maxHp: 520,
      attackPower: 74,
      attackRange: 90,
      moveSpeed: 22,
      attackCooldown: 2.1,
      size: 62,
      cost: meta.goldCost,
      aoeRadius: 54,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.92;
    const bodyHeight = this.size * 0.98;
    const hullColor = this.getBodyFlashColor(this.palette.primary);
    const armorColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#274778' : '#6b2f37');
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const metalColor = this.getBodyFlashColor('#8fa3bd');
    const attackAnim = this.getAttackAnimationState();
    const recoil = Math.pow(attackAnim.flash, 0.72) * this.size * 0.22;
    const hoverDrift = attackAnim.active ? Math.sin(attackAnim.cycle * Math.PI * 2) * this.size * 0.01 : 0;
    const engineGlow = attackAnim.flash > 0 ? 'rgba(114, 236, 255, 0.95)' : 'rgba(89, 205, 255, 0.82)';
    const muzzleFlashVisible = this.attackFlash > 0.05;
    const muzzleFlashScale = clamp((this.attackFlash - 0.05) / 0.07, 0, 1);

    ctx.save();
    ctx.translate(this.x, this.y + hoverDrift);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(102, 229, 255, 0.95)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = this.attackFlash > 0 ? 26 : 10;

    ctx.fillStyle = engineGlow;
    ctx.globalAlpha = 0.68;
    ctx.beginPath();
    ctx.ellipse(-bodyWidth * 0.38, bodyHeight * 0.52, bodyWidth * 0.12, bodyHeight * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, bodyHeight * 0.6, bodyWidth * 0.14, bodyHeight * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(bodyWidth * 0.34, bodyHeight * 0.5, bodyWidth * 0.12, bodyHeight * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.52, bodyHeight * 0.2);
    ctx.lineTo(-bodyWidth * 0.34, -bodyHeight * 0.3);
    ctx.lineTo(bodyWidth * 0.24, -bodyHeight * 0.34);
    ctx.lineTo(bodyWidth * 0.56, -bodyHeight * 0.08);
    ctx.lineTo(bodyWidth * 0.48, bodyHeight * 0.24);
    ctx.lineTo(-bodyWidth * 0.2, bodyHeight * 0.34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = hullColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.38, bodyHeight * 0.1);
    ctx.lineTo(-bodyWidth * 0.22, -bodyHeight * 0.18);
    ctx.lineTo(bodyWidth * 0.16, -bodyHeight * 0.22);
    ctx.lineTo(bodyWidth * 0.42, -bodyHeight * 0.04);
    ctx.lineTo(bodyWidth * 0.34, bodyHeight * 0.16);
    ctx.lineTo(-bodyWidth * 0.14, bodyHeight * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.1, -bodyHeight * 0.08, bodyWidth * 0.18, bodyHeight * 0.12);
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.02, 0, bodyHeight * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-recoil, 0);
    ctx.fillStyle = metalColor;
    ctx.fillRect(bodyWidth * 0.12, -bodyHeight * 0.14, bodyWidth * 0.2, bodyHeight * 0.12);
    ctx.fillRect(bodyWidth * 0.26, -bodyHeight * 0.06, bodyWidth * 0.48, bodyHeight * 0.1);
    ctx.beginPath();
    ctx.arc(bodyWidth * 0.76, -bodyHeight * 0.01, bodyHeight * 0.06, 0, Math.PI * 2);
    ctx.fill();

    if (muzzleFlashVisible) {
      ctx.save();
      ctx.translate(bodyWidth * 0.78, -bodyHeight * 0.01);
      ctx.fillStyle = `rgba(255, 248, 226, ${0.95 * muzzleFlashScale})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bodyWidth * 0.12 * muzzleFlashScale, -bodyHeight * 0.12 * muzzleFlashScale);
      ctx.lineTo(bodyWidth * 0.34 * muzzleFlashScale, 0);
      ctx.lineTo(bodyWidth * 0.12 * muzzleFlashScale, bodyHeight * 0.12 * muzzleFlashScale);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 183, 54, ${0.92 * muzzleFlashScale})`;
      ctx.beginPath();
      ctx.moveTo(bodyWidth * 0.04 * muzzleFlashScale, 0);
      ctx.lineTo(bodyWidth * 0.2 * muzzleFlashScale, -bodyHeight * 0.18 * muzzleFlashScale);
      ctx.lineTo(bodyWidth * 0.42 * muzzleFlashScale, 0);
      ctx.lineTo(bodyWidth * 0.2 * muzzleFlashScale, bodyHeight * 0.18 * muzzleFlashScale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.28, bodyHeight * 0.2, bodyWidth * 0.14, bodyHeight * 0.06);
    ctx.fillRect(bodyWidth * 0.08, bodyHeight * 0.18, bodyWidth * 0.16, bodyHeight * 0.06);

    ctx.restore();

    this.drawStatus(bodyWidth, bodyHeight + this.size * 0.24);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.92;
    const bh = sz * 0.98;
    const hullColor = '#65a8ff';
    const armorColor = '#274778';
    const trimColor = '#d8ebff';
    const metalColor = '#8fa3bd';
    const engineGlow = 'rgba(89, 205, 255, 0.82)';

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 引擎光晕
    c.fillStyle = engineGlow;
    c.globalAlpha = 0.68;
    c.beginPath();
    c.ellipse(-bw * 0.38, bh * 0.52, bw * 0.12, bh * 0.16, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(0, bh * 0.6, bw * 0.14, bh * 0.18, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(bw * 0.34, bh * 0.5, bw * 0.12, bh * 0.16, 0, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;

    // 外壳装甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.52, bh * 0.2);
    c.lineTo(-bw * 0.34, -bh * 0.3);
    c.lineTo(bw * 0.24, -bh * 0.34);
    c.lineTo(bw * 0.56, -bh * 0.08);
    c.lineTo(bw * 0.48, bh * 0.24);
    c.lineTo(-bw * 0.2, bh * 0.34);
    c.closePath();
    c.fill();

    // 内层舰体
    c.fillStyle = hullColor;
    c.beginPath();
    c.moveTo(-bw * 0.38, bh * 0.1);
    c.lineTo(-bw * 0.22, -bh * 0.18);
    c.lineTo(bw * 0.16, -bh * 0.22);
    c.lineTo(bw * 0.42, -bh * 0.04);
    c.lineTo(bw * 0.34, bh * 0.16);
    c.lineTo(-bw * 0.14, bh * 0.22);
    c.closePath();
    c.fill();

    // 甲板装饰
    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.1, -bh * 0.08, bw * 0.18, bh * 0.12);

    // 核心发光体
    c.fillStyle = engineGlow;
    c.beginPath();
    c.arc(-bw * 0.02, 0, bh * 0.14, 0, Math.PI * 2);
    c.fill();

    // 炮塔底座
    c.fillStyle = metalColor;
    c.fillRect(bw * 0.12, -bh * 0.14, bw * 0.2, bh * 0.12);

    // 炮管
    c.fillRect(bw * 0.26, -bh * 0.06, bw * 0.48, bh * 0.1);
    c.beginPath();
    c.arc(bw * 0.76, -bh * 0.01, bh * 0.06, 0, Math.PI * 2);
    c.fill();

    // 舰尾装饰
    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.28, bh * 0.2, bw * 0.14, bh * 0.06);
    c.fillRect(bw * 0.08, bh * 0.18, bw * 0.16, bh * 0.06);

    c.restore();
  }

}


// ─── MachineGunner ───────────────────────────────────────────────────────────
class MachineGunner extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.MACHINE_GUNNER);

    super({
      ...config,
      type: UNIT_TYPE.MACHINE_GUNNER,
      label: meta.label,
      maxHp: 150,
      attackPower: 5,
      attackRange: 180,
      moveSpeed: 55,
      attackCooldown: 0.2,
      size: 30,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });

    // 狙击模式独立计时
    this.sniperCooldown = 2.5;
    this.sniperTimer = Math.random() * 2.5;
  }

  update(deltaTime, frame) {
    if (!this.isAlive()) {
      return;
    }

    this.attackTimer = Math.max(0, this.attackTimer - deltaTime);
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);
    this.attackFlash = Math.max(0, this.attackFlash - deltaTime);
    this.sniperTimer = Math.max(0, this.sniperTimer - deltaTime);

    if (this.poisoned) {
      this.poisonTimer = Math.max(0, this.poisonTimer - deltaTime);
      this.hp = Math.max(0, this.hp - ZOMBIE_POISON_DPS * deltaTime);
      this.hitFlash = Math.max(this.hitFlash, 0.05);
      if (!this.isAlive()) {
        defeatTarget(this, this.poisonSource);
        return;
      }
      if (this.poisonTimer <= 0) {
        this.clearPoison();
      }
    }

    const retreating = this.team === TEAM.PLAYER && gameState.playerCommand === 'retreat';
    if (retreating) {
      const playerBase = gameState.bases.player;
      const distToBase = Math.abs(this.x - playerBase.x) - this.collisionRadius - playerBase.collisionRadius;
      if (distToBase <= 50) {
        this.state = 'defending';
        return;
      }
      this.state = 'marching';
      this.move(deltaTime, frame.battlefield);
      return;
    }

    const nearestEnemy = this.findNearestEnemyAhead(frame.enemies);
    const primaryTarget = nearestEnemy || frame.enemyBase;

    if (primaryTarget && this.canAttack(primaryTarget)) {
      this.state = 'attacking';

      // 狙击高伤
      if (this.sniperTimer <= 0) {
        this.sniperTimer = this.sniperCooldown;
        this.attackFlash = 0.18;
        soundManager.playUnitAttack(this.type);
        frame.attackEvents.push({
          source: this,
          target: primaryTarget,
          damage: 45,
          aoeRadius: 0,
          impactX: primaryTarget.x,
          impactY: primaryTarget.y,
          targetTeam: primaryTarget.team
        });
      }

      // 机枪普通射击
      if (this.attackTimer <= 0) {
        this.attackTimer = this.attackCooldown;
        this.attackFlash = Math.max(this.attackFlash, 0.06);
        soundManager.playShoot();
        frame.attackEvents.push({
          source: this,
          target: primaryTarget,
          damage: this.attackPower,
          aoeRadius: 0,
          impactX: primaryTarget.x,
          impactY: primaryTarget.y,
          targetTeam: primaryTarget.team
        });
      }

      return;
    }

    const blockingAlly = this.findNearestAllyAhead(frame.allies);
    if (blockingAlly && this.getEdgeGapTo(blockingAlly) <= this.formationPadding) {
      this.state = 'holding';
      return;
    }

    this.state = 'marching';
    this.move(deltaTime, frame.battlefield);
  }

  draw() {
    const bodyWidth = this.size * 1.18;
    const bodyHeight = this.size * 1.55;
    const armorColor = this.getBodyFlashColor(this.palette.primary);
    const darkColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#1a3055' : '#5a1820');
    const metalColor = this.hitFlash > 0 ? '#ffffff' : '#9ab0c8';
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';
    const barrelColor = this.hitFlash > 0 ? '#ffffff' : '#4a5568';
    const attackAnim = this.getAttackAnimationState();
    const recoilOffset = attackAnim.flash > 0 ? -attackAnim.flash * this.size * 0.12 : 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(180, 255, 220, 0.9)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = this.attackFlash > 0 ? 20 : 8;

    // 腿部
    ctx.fillStyle = darkColor;
    ctx.fillRect(-bodyWidth * 0.15, bodyHeight * 0.18, bodyWidth * 0.13, bodyHeight * 0.36);
    ctx.fillRect(bodyWidth * 0.02, bodyHeight * 0.18, bodyWidth * 0.13, bodyHeight * 0.36);

    // 躯干装甲
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.26, -bodyHeight * 0.12);
    ctx.lineTo(bodyWidth * 0.18, -bodyHeight * 0.12);
    ctx.lineTo(bodyWidth * 0.26, bodyHeight * 0.22);
    ctx.lineTo(-bodyWidth * 0.18, bodyHeight * 0.3);
    ctx.closePath();
    ctx.fill();

    // 头盔
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.38);
    ctx.lineTo(0, -bodyHeight * 0.56);
    ctx.lineTo(bodyWidth * 0.18, -bodyHeight * 0.38);
    ctx.lineTo(bodyWidth * 0.14, -bodyHeight * 0.18);
    ctx.lineTo(-bodyWidth * 0.16, -bodyHeight * 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -bodyHeight * 0.32, bodyWidth * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 护目镜
    ctx.fillStyle = this.attackFlash > 0 ? 'rgba(255,255,120,0.95)' : 'rgba(80,200,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(bodyWidth * 0.04, -bodyHeight * 0.33, bodyWidth * 0.1, bodyWidth * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // 机枪枪管
    ctx.save();
    ctx.translate(recoilOffset, 0);
    ctx.fillStyle = barrelColor;
    ctx.fillRect(bodyWidth * 0.14, -bodyHeight * 0.06, bodyWidth * 0.7, bodyWidth * 0.1);
    ctx.fillRect(bodyWidth * 0.78, -bodyHeight * 0.1, bodyWidth * 0.08, bodyWidth * 0.18);
    ctx.fillStyle = metalColor;
    ctx.fillRect(bodyWidth * 0.14, -bodyHeight * 0.04, bodyWidth * 0.6, bodyWidth * 0.06);
    // 散热孔
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = armorColor;
      ctx.fillRect(bodyWidth * (0.28 + i * 0.12), -bodyHeight * 0.05, bodyWidth * 0.06, bodyWidth * 0.08);
    }
    ctx.restore();

    ctx.restore();
    this.drawStatus(bodyWidth, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.18;
    const bh = sz * 1.55;
    const armorColor = '#65a8ff';
    const darkColor = '#1a3055';
    const metalColor = '#9ab0c8';
    const skinColor = '#f0c9a4';
    const barrelColor = '#4a5568';

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 腿
    c.fillStyle = darkColor;
    c.fillRect(-bw * 0.15, bh * 0.18, bw * 0.13, bh * 0.36);
    c.fillRect(bw * 0.02, bh * 0.18, bw * 0.13, bh * 0.36);

    // 躯干装甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.26, -bh * 0.12);
    c.lineTo(bw * 0.18, -bh * 0.12);
    c.lineTo(bw * 0.26, bh * 0.22);
    c.lineTo(-bw * 0.18, bh * 0.3);
    c.closePath();
    c.fill();

    // 头盔
    c.fillStyle = darkColor;
    c.beginPath();
    c.moveTo(-bw * 0.2, -bh * 0.38);
    c.lineTo(0, -bh * 0.56);
    c.lineTo(bw * 0.18, -bh * 0.38);
    c.lineTo(bw * 0.14, -bh * 0.18);
    c.lineTo(-bw * 0.16, -bh * 0.18);
    c.closePath();
    c.fill();

    // 脸
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(0, -bh * 0.32, bw * 0.15, 0, Math.PI * 2);
    c.fill();

    // 护目镜（亮蓝色）
    c.fillStyle = 'rgba(80, 200, 255, 0.85)';
    c.beginPath();
    c.ellipse(bw * 0.04, -bh * 0.33, bw * 0.1, bw * 0.06, 0, 0, Math.PI * 2);
    c.fill();

    // 机枪枪管
    c.fillStyle = barrelColor;
    c.fillRect(bw * 0.14, -bh * 0.06, bw * 0.7, bw * 0.1);
    c.fillRect(bw * 0.78, -bh * 0.1, bw * 0.08, bw * 0.18);
    c.fillStyle = metalColor;
    c.fillRect(bw * 0.14, -bh * 0.04, bw * 0.6, bw * 0.06);

    // 散热孔
    for (let i = 0; i < 4; i++) {
      c.fillStyle = armorColor;
      c.fillRect(bw * (0.28 + i * 0.12), -bh * 0.05, bw * 0.06, bw * 0.08);
    }

    // 枪口火光
    c.fillStyle = '#ffcc40';
    c.globalAlpha = 0.9;
    c.beginPath();
    c.moveTo(bw * 0.88, -bh * 0.01);
    c.lineTo(bw * 1.02, -bh * 0.08);
    c.lineTo(bw * 1.02, bh * 0.06);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;

    c.restore();
  }
}


// ─── ShieldGuard ─────────────────────────────────────────────────────────────
class ShieldGuard extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.SHIELD_GUARD);

    super({
      ...config,
      type: UNIT_TYPE.SHIELD_GUARD,
      label: meta.label,
      maxHp: 260,
      attackPower: 12,
      attackRange: 12,
      moveSpeed: 50,
      attackCooldown: 0.9,
      size: 34,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  takeDamage(amount) {
    const retreating = this.team === TEAM.PLAYER && gameState.playerCommand === 'retreat';
    const defending = this.state === 'defending';
    const reduced = (retreating || defending) ? amount * 0.5 : amount;
    this.hp = Math.max(0, this.hp - reduced);
    this.hitFlash = 0.16;
  }

  draw() {
    const bodyWidth = this.size * 1.3;
    const bodyHeight = this.size * 1.58;
    const armorColor = this.getBodyFlashColor(this.palette.primary);
    const trimColor = this.getBodyFlashColor(this.palette.secondary);
    const shieldColor = this.getBodyFlashColor(this.team === TEAM.PLAYER ? '#3a8fbf' : '#a03030');
    const metalColor = this.hitFlash > 0 ? '#ffffff' : '#cad3e0';
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';
    const retreating = this.team === TEAM.PLAYER && gameState.playerCommand === 'retreat';
    const defending = retreating || this.state === 'defending';
    const attackAnim = this.getAttackAnimationState();
    const slamOffset = attackAnim.active ? attackAnim.flash * this.size * 0.28 : 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = defending
      ? 'rgba(100, 200, 255, 0.7)'
      : this.getGlowColor('rgba(255, 220, 120, 0.9)', 'rgba(255, 255, 255, 0.08)');
    ctx.shadowBlur = defending ? 16 : (this.attackFlash > 0 ? 22 : 8);

    // 腿
    ctx.fillStyle = armorColor;
    ctx.fillRect(-bodyWidth * 0.17, bodyHeight * 0.2, bodyWidth * 0.15, bodyHeight * 0.34);
    ctx.fillRect(bodyWidth * 0.02, bodyHeight * 0.2, bodyWidth * 0.15, bodyHeight * 0.34);

    // 躯干
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.3, -bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.2, -bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.3, bodyHeight * 0.28);
    ctx.lineTo(-bodyWidth * 0.22, bodyHeight * 0.36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.05, -bodyHeight * 0.12, bodyWidth * 0.1, bodyHeight * 0.42);

    // 头部
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -bodyHeight * 0.35, bodyWidth * 0.17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.42);
    ctx.lineTo(0, -bodyHeight * 0.58);
    ctx.lineTo(bodyWidth * 0.18, -bodyHeight * 0.42);
    ctx.lineTo(bodyWidth * 0.14, -bodyHeight * 0.2);
    ctx.lineTo(-bodyWidth * 0.16, -bodyHeight * 0.2);
    ctx.closePath();
    ctx.fill();

    // 大盾牌（防守时放大并带光效）
    const shieldScale = defending ? 1.18 : 1;
    const shieldX = -bodyWidth * 0.38;
    const shieldY = bodyHeight * 0.04;
    const sw = bodyWidth * 0.48 * shieldScale;
    const sh = bodyHeight * 0.62 * shieldScale;

    ctx.save();
    ctx.translate(shieldX + slamOffset, shieldY);
    ctx.fillStyle = shieldColor;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.5, -sh * 0.5);
    ctx.lineTo(sw * 0.5, -sh * 0.5);
    ctx.lineTo(sw * 0.5, sh * 0.1);
    ctx.lineTo(0, sh * 0.5);
    ctx.lineTo(-sw * 0.5, sh * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = metalColor;
    ctx.lineWidth = bodyWidth * 0.06;
    ctx.stroke();

    // 盾纹
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = bodyWidth * 0.04;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.18, -sh * 0.22);
    ctx.lineTo(sw * 0.18, -sh * 0.22);
    ctx.moveTo(0, -sh * 0.38);
    ctx.lineTo(0, sh * 0.28);
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (defending) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.lineWidth = bodyWidth * 0.07;
      ctx.beginPath();
      ctx.moveTo(-sw * 0.5, -sh * 0.5);
      ctx.lineTo(sw * 0.5, -sh * 0.5);
      ctx.lineTo(sw * 0.5, sh * 0.1);
      ctx.lineTo(0, sh * 0.5);
      ctx.lineTo(-sw * 0.5, sh * 0.1);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();

    this.drawStatus(bodyWidth, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.3;
    const bh = sz * 1.58;
    const armorColor = '#65a8ff';
    const trimColor = '#d8ebff';
    const shieldColor = '#3a8fbf';
    const metalColor = '#cad3e0';
    const skinColor = '#f0c9a4';

    const sw = bw * 0.48;
    const sh = bh * 0.62;
    const shieldX = -bw * 0.38;
    const shieldY = bh * 0.04;

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 腿
    c.fillStyle = armorColor;
    c.fillRect(-bw * 0.17, bh * 0.2, bw * 0.15, bh * 0.34);
    c.fillRect(bw * 0.02, bh * 0.2, bw * 0.15, bh * 0.34);

    // 躯干甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.3, -bh * 0.14);
    c.lineTo(bw * 0.2, -bh * 0.14);
    c.lineTo(bw * 0.3, bh * 0.28);
    c.lineTo(-bw * 0.22, bh * 0.36);
    c.closePath();
    c.fill();

    c.fillStyle = trimColor;
    c.fillRect(-bw * 0.05, -bh * 0.12, bw * 0.1, bh * 0.42);

    // 头
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(0, -bh * 0.35, bw * 0.17, 0, Math.PI * 2);
    c.fill();

    // 头盔
    c.fillStyle = metalColor;
    c.beginPath();
    c.moveTo(-bw * 0.2, -bh * 0.42);
    c.lineTo(0, -bh * 0.58);
    c.lineTo(bw * 0.18, -bh * 0.42);
    c.lineTo(bw * 0.14, -bh * 0.2);
    c.lineTo(-bw * 0.16, -bh * 0.2);
    c.closePath();
    c.fill();

    // 大盾牌
    c.save();
    c.translate(shieldX, shieldY);
    c.fillStyle = shieldColor;
    c.beginPath();
    c.moveTo(-sw * 0.5, -sh * 0.5);
    c.lineTo(sw * 0.5, -sh * 0.5);
    c.lineTo(sw * 0.5, sh * 0.1);
    c.lineTo(0, sh * 0.5);
    c.lineTo(-sw * 0.5, sh * 0.1);
    c.closePath();
    c.fill();

    c.strokeStyle = metalColor;
    c.lineWidth = bw * 0.06;
    c.stroke();

    // 盾纹十字
    c.strokeStyle = trimColor;
    c.lineWidth = bw * 0.04;
    c.globalAlpha = 0.8;
    c.beginPath();
    c.moveTo(-sw * 0.18, -sh * 0.22);
    c.lineTo(sw * 0.18, -sh * 0.22);
    c.moveTo(0, -sh * 0.38);
    c.lineTo(0, sh * 0.28);
    c.stroke();
    c.globalAlpha = 1;
    c.restore();

    c.restore();
  }
}


// ─── SwordsmanLeader ─────────────────────────────────────────────────────────
class SwordsmanLeader extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.SWORDSMAN_LEADER);
    const baseSize = 30 * 1.2;

    super({
      ...config,
      type: UNIT_TYPE.SWORDSMAN_LEADER,
      label: meta.label,
      maxHp: Math.round(90 * 2.5),
      attackPower: Math.round(18 * 2.5),
      attackRange: 12,
      moveSpeed: 70,
      attackCooldown: 0.72,
      size: baseSize,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.24;
    const bodyHeight = this.size * 1.52;
    // 金色披风颜色覆盖常规配色
    const goldColor = this.hitFlash > 0 ? '#ffffff' : '#f0c040';
    const goldTrim = this.hitFlash > 0 ? '#ffffff' : '#ffd700';
    const armorColor = this.getBodyFlashColor(this.palette.primary);
    const trimColor = goldTrim;
    const clothColor = this.hitFlash > 0 ? '#fff8e0' : (this.team === TEAM.PLAYER ? '#5a3a00' : '#6b1a00');
    const metalColor = this.hitFlash > 0 ? '#ffffff' : '#e8d488';
    const leatherColor = this.hitFlash > 0 ? '#f5f5f5' : '#7a5500';
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';
    const attackAnim = this.getAttackAnimationState();
    const slashMotion = attackAnim.active ? Math.min(1, attackAnim.pulse * 0.45 + attackAnim.flash * 0.9) : 0;
    const swordAngle = -Math.PI * 0.58 + slashMotion * Math.PI * 0.46;
    const torsoTilt = attackAnim.active ? -attackAnim.pulse * 0.04 + attackAnim.flash * 0.03 : 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(255, 230, 80, 0.95)', 'rgba(255, 215, 0, 0.25)');
    ctx.shadowBlur = this.attackFlash > 0 ? 28 : 14;

    ctx.save();
    ctx.rotate(torsoTilt);

    // 金色披风
    ctx.fillStyle = goldColor;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.38, -bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.3, -bodyHeight * 0.14);
    ctx.lineTo(bodyWidth * 0.18, bodyHeight * 0.52);
    ctx.lineTo(-bodyWidth * 0.28, bodyHeight * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.18, bodyHeight * 0.14, bodyWidth * 0.13, bodyHeight * 0.36);
    ctx.fillRect(bodyWidth * 0.04, bodyHeight * 0.14, bodyWidth * 0.13, bodyHeight * 0.36);

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.28, -bodyHeight * 0.1);
    ctx.lineTo(bodyWidth * 0.2, -bodyHeight * 0.1);
    ctx.lineTo(bodyWidth * 0.28, bodyHeight * 0.2);
    ctx.lineTo(-bodyWidth * 0.2, bodyHeight * 0.28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-bodyWidth * 0.06, -bodyHeight * 0.1, bodyWidth * 0.1, bodyHeight * 0.32);

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.32, -bodyHeight * 0.06, bodyWidth * 0.12, bodyHeight * 0.24);

    // 肩甲（金色）
    ctx.fillStyle = goldTrim;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.44, bodyHeight * 0.02, bodyWidth * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.44, bodyHeight * 0.02, bodyWidth * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -bodyHeight * 0.34, bodyWidth * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 金色皇冠头盔
    ctx.fillStyle = goldTrim;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.22, -bodyHeight * 0.38);
    ctx.lineTo(-bodyWidth * 0.26, -bodyHeight * 0.62);
    ctx.lineTo(-bodyWidth * 0.14, -bodyHeight * 0.48);
    ctx.lineTo(0, -bodyHeight * 0.7);
    ctx.lineTo(bodyWidth * 0.14, -bodyHeight * 0.48);
    ctx.lineTo(bodyWidth * 0.2, -bodyHeight * 0.38);
    ctx.lineTo(bodyWidth * 0.16, -bodyHeight * 0.18);
    ctx.lineTo(-bodyWidth * 0.18, -bodyHeight * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = metalColor;
    ctx.fillRect(-bodyWidth * 0.03, -bodyHeight * 0.32, bodyWidth * 0.06, bodyHeight * 0.2);

    ctx.restore();

    ctx.save();
    ctx.translate(bodyWidth * 0.14, -bodyHeight * 0.08);
    ctx.rotate(swordAngle);
    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.02, -bodyHeight * 0.02, bodyWidth * 0.11, bodyHeight * 0.3);
    ctx.fillStyle = leatherColor;
    ctx.fillRect(bodyWidth * 0.06, bodyHeight * 0.18, bodyWidth * 0.08, bodyHeight * 0.08);
    ctx.fillStyle = goldTrim;
    ctx.fillRect(bodyWidth * 0.12, bodyHeight * 0.12, bodyWidth * 0.06, bodyHeight * 0.16);
    // 金色大剑
    ctx.fillStyle = goldColor;
    ctx.fillRect(bodyWidth * 0.18, bodyHeight * 0.16, bodyWidth * 0.52, bodyWidth * 0.12);
    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.7, bodyHeight * 0.12);
    ctx.lineTo(bodyWidth * 0.96, bodyHeight * 0.22);
    ctx.lineTo(bodyWidth * 0.7, bodyHeight * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
    this.drawStatus(bodyWidth, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.24;
    const bh = sz * 1.52;
    const goldColor = '#f0c040';
    const goldTrim = '#ffd700';
    const armorColor = '#65a8ff';
    const clothColor = '#5a3a00';
    const metalColor = '#e8d488';
    const leatherColor = '#7a5500';
    const skinColor = '#f0c9a4';

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 金色披风
    c.fillStyle = goldColor;
    c.globalAlpha = 0.88;
    c.beginPath();
    c.moveTo(-bw * 0.38, -bh * 0.14);
    c.lineTo(bw * 0.3, -bh * 0.14);
    c.lineTo(bw * 0.18, bh * 0.52);
    c.lineTo(-bw * 0.28, bh * 0.52);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;

    // 腿
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.18, bh * 0.14, bw * 0.13, bh * 0.36);
    c.fillRect(bw * 0.04, bh * 0.14, bw * 0.13, bh * 0.36);

    // 躯干甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.28, -bh * 0.1);
    c.lineTo(bw * 0.2, -bh * 0.1);
    c.lineTo(bw * 0.28, bh * 0.2);
    c.lineTo(-bw * 0.2, bh * 0.28);
    c.closePath();
    c.fill();

    c.fillStyle = goldTrim;
    c.fillRect(-bw * 0.06, -bh * 0.1, bw * 0.1, bh * 0.32);

    // 左臂
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.32, -bh * 0.06, bw * 0.12, bh * 0.24);

    // 金色肩甲
    c.fillStyle = goldTrim;
    c.beginPath();
    c.arc(-bw * 0.44, bh * 0.02, bw * 0.24, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = goldColor;
    c.beginPath();
    c.arc(-bw * 0.44, bh * 0.02, bw * 0.14, 0, Math.PI * 2);
    c.fill();

    // 头
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(0, -bh * 0.34, bw * 0.18, 0, Math.PI * 2);
    c.fill();

    // 金色皇冠头盔
    c.fillStyle = goldTrim;
    c.beginPath();
    c.moveTo(-bw * 0.22, -bh * 0.38);
    c.lineTo(-bw * 0.26, -bh * 0.62);
    c.lineTo(-bw * 0.14, -bh * 0.48);
    c.lineTo(0, -bh * 0.7);
    c.lineTo(bw * 0.14, -bh * 0.48);
    c.lineTo(bw * 0.2, -bh * 0.38);
    c.lineTo(bw * 0.16, -bh * 0.18);
    c.lineTo(-bw * 0.18, -bh * 0.18);
    c.closePath();
    c.fill();
    c.fillStyle = metalColor;
    c.fillRect(-bw * 0.03, -bh * 0.32, bw * 0.06, bh * 0.2);

    // 金色大剑
    c.save();
    c.translate(bw * 0.14, -bh * 0.08);
    c.rotate(-Math.PI * 0.58);
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.02, -bh * 0.02, bw * 0.11, bh * 0.3);
    c.fillStyle = leatherColor;
    c.fillRect(bw * 0.06, bh * 0.18, bw * 0.08, bh * 0.08);
    c.fillStyle = goldTrim;
    c.fillRect(bw * 0.12, bh * 0.12, bw * 0.06, bh * 0.16);
    c.fillStyle = goldColor;
    c.fillRect(bw * 0.18, bh * 0.16, bw * 0.52, bw * 0.12);
    c.beginPath();
    c.moveTo(bw * 0.7, bh * 0.12);
    c.lineTo(bw * 0.96, bh * 0.22);
    c.lineTo(bw * 0.7, bh * 0.32);
    c.closePath();
    c.fill();
    c.restore();

    c.restore();
  }
}


// ─── SpearmanLeader ──────────────────────────────────────────────────────────
class SpearmanLeader extends Unit {
  constructor(config) {
    const meta = getUnitMeta(UNIT_TYPE.SPEARMAN_LEADER);
    const baseSize = 28 * 1.2;

    super({
      ...config,
      type: UNIT_TYPE.SPEARMAN_LEADER,
      label: meta.label,
      maxHp: 1000,
      attackPower: 119,
      attackRange: Math.round(48 * 1.2),
      moveSpeed: 58,
      attackCooldown: 0.9,
      size: baseSize,
      cost: meta.goldCost,
      diamondReward: meta.diamondReward
    });
  }

  draw() {
    const bodyWidth = this.size * 1.12;
    const bodyHeight = this.size * 1.66;
    const goldColor = this.hitFlash > 0 ? '#ffffff' : '#f0c040';
    const goldTrim = this.hitFlash > 0 ? '#ffffff' : '#ffd700';
    const armorColor = this.getBodyFlashColor(this.palette.primary);
    const clothColor = this.hitFlash > 0 ? '#fff8e0' : (this.team === TEAM.PLAYER ? '#4a3800' : '#6b1a00');
    const metalColor = this.hitFlash > 0 ? '#ffffff' : '#e8d488';
    const woodColor = this.hitFlash > 0 ? '#ffffff' : '#9a7040';
    const skinColor = this.hitFlash > 0 ? '#ffffff' : '#f0c9a4';
    const spearLength = this.size * 2.3;
    const attackAnim = this.getAttackAnimationState();
    const pushOffset = attackAnim.active ? (attackAnim.flash * 0.76 + attackAnim.pulse * 0.46) * this.size * 0.8 : 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = this.getGlowColor('rgba(255, 230, 80, 0.95)', 'rgba(255, 215, 0, 0.25)');
    ctx.shadowBlur = this.attackFlash > 0 ? 26 : 14;

    // 金色披风
    ctx.fillStyle = goldColor;
    ctx.globalAlpha = 0.84;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.34, -bodyHeight * 0.18);
    ctx.lineTo(bodyWidth * 0.26, -bodyHeight * 0.18);
    ctx.lineTo(bodyWidth * 0.14, bodyHeight * 0.5);
    ctx.lineTo(-bodyWidth * 0.24, bodyHeight * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = clothColor;
    ctx.fillRect(-bodyWidth * 0.15, bodyHeight * 0.18, bodyWidth * 0.12, bodyHeight * 0.36);
    ctx.fillRect(bodyWidth * 0.01, bodyHeight * 0.18, bodyWidth * 0.12, bodyHeight * 0.36);

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.16);
    ctx.lineTo(bodyWidth * 0.14, -bodyHeight * 0.16);
    ctx.lineTo(bodyWidth * 0.24, bodyHeight * 0.22);
    ctx.lineTo(0, bodyHeight * 0.34);
    ctx.lineTo(-bodyWidth * 0.24, bodyHeight * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = goldTrim;
    ctx.fillRect(-bodyWidth * 0.045, -bodyHeight * 0.14, bodyWidth * 0.09, bodyHeight * 0.42);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(-bodyWidth * 0.01, -bodyHeight * 0.37, bodyWidth * 0.17, 0, Math.PI * 2);
    ctx.fill();

    // 金色头盔带羽饰
    ctx.fillStyle = goldTrim;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.21, -bodyHeight * 0.4);
    ctx.lineTo(0, -bodyHeight * 0.62);
    ctx.lineTo(bodyWidth * 0.16, -bodyHeight * 0.42);
    ctx.lineTo(bodyWidth * 0.11, -bodyHeight * 0.18);
    ctx.lineTo(-bodyWidth * 0.15, -bodyHeight * 0.18);
    ctx.closePath();
    ctx.fill();

    // 羽饰
    ctx.strokeStyle = '#ff6060';
    ctx.lineWidth = bodyWidth * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, -bodyHeight * 0.62);
    ctx.bezierCurveTo(-bodyWidth * 0.1, -bodyHeight * 0.82, bodyWidth * 0.14, -bodyHeight * 0.9, bodyWidth * 0.04, -bodyHeight * 1.02);
    ctx.stroke();

    ctx.fillStyle = metalColor;
    ctx.fillRect(-bodyWidth * 0.022, -bodyHeight * 0.32, bodyWidth * 0.044, bodyHeight * 0.14);

    // 金色大盾
    const shieldX = bodyWidth * 0.15;
    const shieldY = bodyHeight * 0.05;
    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.moveTo(shieldX - bodyWidth * 0.22, shieldY - bodyHeight * 0.26);
    ctx.lineTo(shieldX + bodyWidth * 0.22, shieldY - bodyHeight * 0.26);
    ctx.lineTo(shieldX + bodyWidth * 0.22, shieldY + bodyHeight * 0.06);
    ctx.lineTo(shieldX, shieldY + bodyHeight * 0.24);
    ctx.lineTo(shieldX - bodyWidth * 0.22, shieldY + bodyHeight * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = goldTrim;
    ctx.lineWidth = bodyWidth * 0.06;
    ctx.stroke();
    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.arc(shieldX, shieldY, bodyWidth * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // 金色巨矛
    ctx.save();
    ctx.translate(pushOffset, 0);
    const spearBaseX = shieldX + bodyWidth * 0.6;
    const spearBaseY = -bodyHeight * 0.015;
    ctx.fillStyle = woodColor;
    ctx.fillRect(spearBaseX - bodyWidth * 0.18, spearBaseY - bodyWidth * 0.035, spearLength + bodyWidth * 0.18, bodyWidth * 0.07);
    ctx.fillStyle = goldTrim;
    ctx.beginPath();
    ctx.moveTo(spearBaseX + spearLength - bodyWidth * 0.18, spearBaseY - bodyHeight * 0.14);
    ctx.lineTo(spearBaseX + spearLength + bodyWidth * 0.12, spearBaseY);
    ctx.lineTo(spearBaseX + spearLength - bodyWidth * 0.18, spearBaseY + bodyHeight * 0.14);
    ctx.lineTo(spearBaseX + spearLength - bodyWidth * 0.32, spearBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
    this.drawStatus(this.size * 1.8, bodyHeight);
  }

  drawIcon(c, cx, cy, sz) {
    const bw = sz * 1.12;
    const bh = sz * 1.66;
    const goldColor = '#f0c040';
    const goldTrim = '#ffd700';
    const armorColor = '#65a8ff';
    const clothColor = '#4a3800';
    const metalColor = '#e8d488';
    const woodColor = '#9a7040';
    const skinColor = '#f0c9a4';
    const spearLen = sz * 2.05;
    const shieldX = bw * 0.15;
    const shieldY = bh * 0.05;
    const spearBaseX = shieldX + bw * 0.6;
    const spearBaseY = -bh * 0.015;

    c.save();
    c.translate(cx, cy);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    // 金色披风
    c.fillStyle = goldColor;
    c.globalAlpha = 0.84;
    c.beginPath();
    c.moveTo(-bw * 0.34, -bh * 0.18);
    c.lineTo(bw * 0.26, -bh * 0.18);
    c.lineTo(bw * 0.14, bh * 0.5);
    c.lineTo(-bw * 0.24, bh * 0.5);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;

    // 腿
    c.fillStyle = clothColor;
    c.fillRect(-bw * 0.15, bh * 0.18, bw * 0.12, bh * 0.36);
    c.fillRect(bw * 0.01, bh * 0.18, bw * 0.12, bh * 0.36);

    // 躯干甲
    c.fillStyle = armorColor;
    c.beginPath();
    c.moveTo(-bw * 0.2, -bh * 0.16);
    c.lineTo(bw * 0.14, -bh * 0.16);
    c.lineTo(bw * 0.24, bh * 0.22);
    c.lineTo(0, bh * 0.34);
    c.lineTo(-bw * 0.24, bh * 0.22);
    c.closePath();
    c.fill();

    c.fillStyle = goldTrim;
    c.fillRect(-bw * 0.045, -bh * 0.14, bw * 0.09, bh * 0.42);

    // 头
    c.fillStyle = skinColor;
    c.beginPath();
    c.arc(-bw * 0.01, -bh * 0.37, bw * 0.17, 0, Math.PI * 2);
    c.fill();

    // 金色头盔
    c.fillStyle = goldTrim;
    c.beginPath();
    c.moveTo(-bw * 0.21, -bh * 0.4);
    c.lineTo(0, -bh * 0.62);
    c.lineTo(bw * 0.16, -bh * 0.42);
    c.lineTo(bw * 0.11, -bh * 0.18);
    c.lineTo(-bw * 0.15, -bh * 0.18);
    c.closePath();
    c.fill();

    // 红色羽饰
    c.strokeStyle = '#ff6060';
    c.lineWidth = bw * 0.06;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, -bh * 0.62);
    c.bezierCurveTo(-bw * 0.1, -bh * 0.82, bw * 0.14, -bh * 0.9, bw * 0.04, -bh * 1.02);
    c.stroke();

    c.fillStyle = metalColor;
    c.fillRect(-bw * 0.022, -bh * 0.32, bw * 0.044, bh * 0.14);

    // 金色大盾
    c.fillStyle = goldColor;
    c.beginPath();
    c.moveTo(shieldX - bw * 0.22, shieldY - bh * 0.26);
    c.lineTo(shieldX + bw * 0.22, shieldY - bh * 0.26);
    c.lineTo(shieldX + bw * 0.22, shieldY + bh * 0.06);
    c.lineTo(shieldX, shieldY + bh * 0.24);
    c.lineTo(shieldX - bw * 0.22, shieldY + bh * 0.06);
    c.closePath();
    c.fill();
    c.strokeStyle = goldTrim;
    c.lineWidth = bw * 0.06;
    c.stroke();
    c.fillStyle = metalColor;
    c.beginPath();
    c.arc(shieldX, shieldY, bw * 0.07, 0, Math.PI * 2);
    c.fill();

    // 金色巨矛
    c.fillStyle = woodColor;
    c.fillRect(spearBaseX - bw * 0.18, spearBaseY - bw * 0.035, spearLen + bw * 0.18, bw * 0.07);
    c.fillStyle = goldTrim;
    c.beginPath();
    c.moveTo(spearBaseX + spearLen - bw * 0.18, spearBaseY - bh * 0.14);
    c.lineTo(spearBaseX + spearLen + bw * 0.12, spearBaseY);
    c.lineTo(spearBaseX + spearLen - bw * 0.18, spearBaseY + bh * 0.14);
    c.lineTo(spearBaseX + spearLen - bw * 0.32, spearBaseY);
    c.closePath();
    c.fill();

    c.restore();
  }
}


class EnemyController {
  constructor() {
    this.levelConfig = null;
    this.gold = 0;
    this.elapsed = 0;
    this.spawnCooldown = 0;
    this.sequencePointers = [];
  }

  loadLevel(levelConfig) {
    this.levelConfig = levelConfig;
    this.gold = levelConfig.startingGold;
    this.elapsed = 0;
    this.spawnCooldown = levelConfig.initialSpawnDelay;
    this.sequencePointers = levelConfig.phases.map(() => 0);
  }

  getActivePhase() {
    if (!this.levelConfig) {
      return { phase: null, index: -1 };
    }

    let activeIndex = 0;
    for (let index = 0; index < this.levelConfig.phases.length; index += 1) {
      if (this.elapsed >= this.levelConfig.phases[index].startAt) {
        activeIndex = index;
      }
    }

    return {
      phase: this.levelConfig.phases[activeIndex],
      index: activeIndex
    };
  }

  update(deltaTime) {
    if (!this.levelConfig || gameState.gameOver) {
      return;
    }

    this.elapsed += deltaTime;
    this.spawnCooldown = Math.max(0, this.spawnCooldown - deltaTime);

    const { phase, index } = this.getActivePhase();
    if (!phase) {
      return;
    }

    this.gold += phase.goldIncome * deltaTime;

    if (this.spawnCooldown > 0) {
      return;
    }

    const activeEnemyCount = gameState.units.filter((unit) => unit.team === TEAM.ENEMY && unit.isAlive()).length;
    if (activeEnemyCount >= this.levelConfig.maxActiveUnits) {
      return;
    }

    const pointer = this.sequencePointers[index] % phase.sequence.length;
    const nextType = phase.sequence[pointer];
    const unitMeta = getUnitMeta(nextType);

    if (this.gold < unitMeta.goldCost) {
      return;
    }

    if (spawnUnit(nextType, TEAM.ENEMY)) {
      this.gold -= unitMeta.goldCost;
      this.sequencePointers[index] += 1;
      this.spawnCooldown = phase.spawnDelay;
    }
  }
}

const gameState = {
  time: 0,
  currentLevelIndex: 0,
  playerCommand: 'attack',
  baseDefenseTimer: 0,
  resources: {
    gold: 500,
    diamonds: 80
  },
  incomeTimer: 0,
  battlefield: {
    width: 0,
    height: 0,
    laneY: 0,
    groundY: 0,
    minX: 0,
    maxX: 0
  },
  unlocks: Object.fromEntries(
    Object.entries(UNIT_META).map(([unitType, meta]) => [unitType, meta.unlockedByDefault])
  ),
  progression: {
    baseHpLevel: 0,
    attackLevel: 0
  },
  bases: {
    player: new Base({
      team: TEAM.PLAYER,
      label: '我方基地',
      maxHp: 1000,
      width: 104,
      height: 136,
      color: '#4a7dff'
    }),
    enemy: new Base({
      team: TEAM.ENEMY,
      label: '敌方基地',
      maxHp: 900,
      width: 104,
      height: 136,
      color: '#ff6a6a'
    })
  },
  units: [],
  damageTexts: [],
  nextUnitId: 1,
  gameOver: false,
  outcome: ''
};

const enemyController = new EnemyController();
let lastTimestamp = 0;

function applyPlayerBuffsToUnit(unit) {
  if (unit.team === TEAM.PLAYER) {
    unit.applyAttackBonus(getPlayerAttackMultiplier());
  }
}

function refreshPlayerUnitsAttack() {
  gameState.units.forEach((unit) => {
    applyPlayerBuffsToUnit(unit);
  });
}

// 领袖光环：每帧根据场上首领是否存活刷新被动BUFF
function applyLeaderAuras() {
  const playerUnits = gameState.units.filter(u => u.team === TEAM.PLAYER && u.isAlive());
  const hasSwordsmanLeader = playerUnits.some(u => u.type === UNIT_TYPE.SWORDSMAN_LEADER);
  const hasSpearmanLeader = playerUnits.some(u => u.type === UNIT_TYPE.SPEARMAN_LEADER);
  const attackMult = getPlayerAttackMultiplier();

  for (const unit of playerUnits) {
    if (unit.type === UNIT_TYPE.SWORDSMAN) {
      unit.moveSpeed = hasSwordsmanLeader ? 74 * 1.2 : 74;
      unit.attackPower = hasSwordsmanLeader
        ? Math.round(unit.baseAttackPower * attackMult * 1.15)
        : Math.round(unit.baseAttackPower * attackMult);
    }

    if (unit.type === UNIT_TYPE.SPEARMAN) {
      unit.attackRange = hasSpearmanLeader ? Math.round(48 * 1.2) : 48;
    }
  }
}

function createUnit(type, team) {
  const unitId = gameState.nextUnitId;
  gameState.nextUnitId += 1;

  const config = {
    id: unitId,
    team,
    x: 0,
    y: 0
  };

  let unit = null;

  switch (type) {
    case UNIT_TYPE.SWORDSMAN:
      unit = new Swordsman(config);
      break;
    case UNIT_TYPE.SPEARMAN:
      unit = new Spearman(config);
      break;
    case UNIT_TYPE.ARCHER:
      unit = new Archer(config);
      break;
    case UNIT_TYPE.ZOMBIE:
      unit = new Zombie(config);
      break;
    case UNIT_TYPE.GIANT:
      unit = new Giant(config);
      break;
    case UNIT_TYPE.WARSHIP:
      unit = new Battleship(config);
      break;
    case UNIT_TYPE.MACHINE_GUNNER:
      unit = new MachineGunner(config);
      break;
    case UNIT_TYPE.SHIELD_GUARD:
      unit = new ShieldGuard(config);
      break;
    case UNIT_TYPE.SWORDSMAN_LEADER:
      unit = new SwordsmanLeader(config);
      break;
    case UNIT_TYPE.SPEARMAN_LEADER:
      unit = new SpearmanLeader(config);
      break;
    default:
      return null;
  }

  applyPlayerBuffsToUnit(unit);
  return unit;
}

function placeZombieAtSpawn(unit) {
  const battlefield = gameState.battlefield;
  const base = unit.team === TEAM.PLAYER ? gameState.bases.player : gameState.bases.enemy;
  const allies = gameState.units.filter((candidate) => candidate.team === unit.team && candidate.isAlive());
  const forwardOffset = 15 + Math.random() * 25;
  const xJitter = (Math.random() - 0.5) * 10;
  const yOffset = -2 + Math.random() * 12;

  unit.x = base.x + unit.direction * (base.collisionRadius + unit.collisionRadius + forwardOffset) + xJitter;
  unit.y = battlefield.groundY - unit.collisionRadius - 8 + yOffset;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const overlap = allies.some((ally) => Math.abs(ally.x - unit.x) < ally.collisionRadius + unit.collisionRadius + unit.formationPadding);
    if (!overlap) {
      break;
    }

    unit.x -= unit.direction * 10;
  }

  unit.x = clamp(unit.x, battlefield.minX + unit.collisionRadius, battlefield.maxX - unit.collisionRadius);
}

function placeUnitAtSpawn(unit) {
  if (unit.type === UNIT_TYPE.ZOMBIE) {
    placeZombieAtSpawn(unit);
    return;
  }

  const battlefield = gameState.battlefield;
  const base = unit.team === TEAM.PLAYER ? gameState.bases.player : gameState.bases.enemy;
  const allies = gameState.units.filter((candidate) => candidate.team === unit.team && candidate.isAlive());

  unit.x = base.x + unit.direction * (base.collisionRadius + unit.collisionRadius + 20);
  unit.y = battlefield.groundY - unit.collisionRadius - 8;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const overlap = allies.some((ally) => Math.abs(ally.x - unit.x) < ally.collisionRadius + unit.collisionRadius + unit.formationPadding);
    if (!overlap) {
      break;
    }

    unit.x -= unit.direction * 12;
  }

  unit.x = clamp(unit.x, battlefield.minX + unit.collisionRadius, battlefield.maxX - unit.collisionRadius);
}

function spawnUnit(type, team) {
  if (gameState.gameOver) {
    return false;
  }

  const unit = createUnit(type, team);
  if (!unit) {
    return false;
  }

  placeUnitAtSpawn(unit);
  gameState.units.push(unit);

  if (unit.type === UNIT_TYPE.ZOMBIE) {
    soundManager.playZombieGroan();
  }

  return true;
}


function requestPlayerSpawn(unitType) {
  const unitMeta = getUnitMeta(unitType);

  if (gameState.gameOver) {
    showToast('当前关卡已结束');
    return;
  }

  if (!isUnitUnlocked(unitType)) {
    showToast(`需要 ${unitMeta.unlockCost} 钻石解锁 ${unitMeta.label}`);
    return;
  }

  if (gameState.resources.gold < unitMeta.goldCost) {
    showToast(`${unitMeta.label} 需要 ${unitMeta.goldCost} 金币`);
    return;
  }

  gameState.resources.gold -= unitMeta.goldCost;
  spawnUnit(unitType, TEAM.PLAYER);
  refreshUi();
}

function awardDiamonds(amount, reason) {
  gameState.resources.diamonds += amount;
  refreshUi();
  showToast(`${reason}，获得 ${amount} 钻石`);
}

function handleUnitDefeat(target, source, defeatMeta = { poisonApplied: false }) {
  if (!(target instanceof Unit)) {
    return;
  }

  if (target.type === UNIT_TYPE.ZOMBIE && defeatMeta.poisonApplied) {
    soundManager.playPoisonTrigger();
  }

  if (source && source.team === TEAM.PLAYER && target.team === TEAM.ENEMY) {
    awardDiamonds(target.diamondReward, `击杀 ${target.label}`);
  }
}

function defeatTarget(target, source) {
  if (!target || target.isAlive()) {
    return;
  }

  const defeatMeta = target instanceof Unit
    ? (target.die(source) || { poisonApplied: false })
    : { poisonApplied: false };

  handleUnitDefeat(target, source, defeatMeta);
}


function pushDamageText(target, damage, source) {
  const amount = Math.round(damage);
  if (amount <= 0) {
    return;
  }

  const targetTopY = target instanceof Base
    ? target.y - target.height / 2 - 8
    : target.y - ((target.size ?? target.collisionRadius * 2 ?? 48) * 0.72);

  const isPoison = source?.type === UNIT_TYPE.ZOMBIE && amount < 10;

  gameState.damageTexts.push({
    x: target.x + (Math.random() - 0.5) * 18,
    y: targetTopY,
    amount,
    life: 1,
    maxLife: 1,
    color: isPoison ? '#a5ff5a' : '#ff5a5a'
  });
}

function dealDamage(target, damage, source) {
  if (!target || !target.isAlive()) {
    return;
  }

  if (damage > 0) {
    pushDamageText(target, damage, source);
  }

  target.takeDamage(damage);

  if (!target.isAlive()) {
    defeatTarget(target, source);
  }
}


function purchaseUnitUnlock(unitType) {
  const unitMeta = getUnitMeta(unitType);

  if (isUnitUnlocked(unitType)) {
    showToast(`${unitMeta.label} 已解锁`);
    return;
  }

  if (gameState.resources.diamonds < unitMeta.unlockCost) {
    showToast(`钻石不足，解锁 ${unitMeta.label} 需要 ${unitMeta.unlockCost} 钻石`);
    return;
  }

  gameState.resources.diamonds -= unitMeta.unlockCost;
  gameState.unlocks[unitType] = true;
  refreshUi();
  soundManager.playSuccess();
  showToast(`${unitMeta.label} 解锁成功`);
}


function purchaseBaseUpgrade() {
  if (gameState.progression.baseHpLevel >= UPGRADE_CONFIG.baseHp.maxLevel) {
    showToast('基地装甲已满级');
    return;
  }

  const cost = getBaseUpgradeCost();
  if (gameState.resources.diamonds < cost) {
    showToast(`钻石不足，基地升级需要 ${cost} 钻石`);
    return;
  }

  gameState.resources.diamonds -= cost;
  gameState.progression.baseHpLevel += 1;
  gameState.bases.player.upgradeMaxHp(UPGRADE_CONFIG.baseHp.hpBonus);
  refreshUi();
  soundManager.playSuccess();
  showToast(`基地生命上限提升 ${UPGRADE_CONFIG.baseHp.hpBonus}`);
}


function purchaseAttackUpgrade() {
  if (gameState.progression.attackLevel >= UPGRADE_CONFIG.attackBuff.maxLevel) {
    showToast('战争号令已满级');
    return;
  }

  const cost = getAttackUpgradeCost();
  if (gameState.resources.diamonds < cost) {
    showToast(`钻石不足，攻击升级需要 ${cost} 钻石`);
    return;
  }

  gameState.resources.diamonds -= cost;
  gameState.progression.attackLevel += 1;
  refreshPlayerUnitsAttack();
  refreshUi();
  soundManager.playSuccess();
  showToast(`全局攻击增益提升至 ${formatAttackBonus()}`);
}


function handleShopAction(action, unitType) {
  switch (action) {
    case 'unlock-unit':
      purchaseUnitUnlock(unitType);
      break;
    case 'upgrade-base':
      purchaseBaseUpgrade();
      break;
    case 'upgrade-attack':
      purchaseAttackUpgrade();
      break;
    default:
      break;
  }
}

function updateBaseLayout() {
  const { width, laneY } = gameState.battlefield;
  const playerBase = gameState.bases.player;
  const enemyBase = gameState.bases.enemy;

  const compactLayout = width < 640;
  const baseWidth = compactLayout ? 54 : 104;
  const baseHeight = compactLayout ? 72 : 136;
  const margin = compactLayout ? 6 : 36;

  playerBase.width = baseWidth;
  playerBase.height = baseHeight;
  playerBase.collisionRadius = baseWidth * 0.42;

  enemyBase.width = baseWidth;
  enemyBase.height = baseHeight;
  enemyBase.collisionRadius = baseWidth * 0.42;

  const baseY = laneY - baseHeight * 0.14;

  playerBase.setPosition(margin + baseWidth / 2, baseY);
  enemyBase.setPosition(width - margin - baseWidth / 2, baseY);
}

function realignUnitsToGround() {
  gameState.units.forEach((unit) => {
    unit.y = gameState.battlefield.groundY - unit.collisionRadius - 8;
    unit.x = clamp(unit.x, gameState.battlefield.minX + unit.collisionRadius, gameState.battlefield.maxX - unit.collisionRadius);
  });
}

function resizeCanvas() {
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  gameState.battlefield.width = width;
  gameState.battlefield.height = height;
  gameState.battlefield.laneY = height * 0.58;
  gameState.battlefield.groundY = height * 0.76;
  gameState.battlefield.minX = 0;
  gameState.battlefield.maxX = width;

  updateBaseLayout();
  realignUnitsToGround();
}

function updateEconomy(deltaTime) {
  gameState.incomeTimer += deltaTime;

  if (gameState.incomeTimer >= 1) {
    gameState.incomeTimer -= 1;
    gameState.resources.gold += 18;
    refreshUi();
  }
}

function processAttackEvents(attackEvents) {
  for (const event of attackEvents) {
    if (!event.source.isAlive()) {
      continue;
    }

    if (event.source.type === UNIT_TYPE.ZOMBIE) {
      soundManager.playZombieThrow();
    }

    if (event.aoeRadius > 0 && !(event.target instanceof Base)) {

      const splashTargets = gameState.units.filter((candidate) => {
        if (!candidate.isAlive() || candidate.team !== event.targetTeam) {
          return false;
        }

        const dx = candidate.x - event.impactX;
        const dy = candidate.y - event.impactY;
        return Math.hypot(dx, dy) <= event.aoeRadius + candidate.collisionRadius;
      });

      if (splashTargets.length > 0) {
        splashTargets.forEach((target) => {
          dealDamage(target, event.damage, event.source);
        });
        continue;
      }
    }

    dealDamage(event.target, event.damage, event.source);
  }
}

function resolveFormation(team) {
  const units = gameState.units
    .filter((unit) => unit.team === team && unit.isAlive())
    .sort((a, b) => (team === TEAM.PLAYER ? b.x - a.x : a.x - b.x));

  for (let index = 0; index < units.length - 1; index += 1) {
    const front = units[index];
    const back = units[index + 1];
    const desiredSpacing = front.collisionRadius + back.collisionRadius + back.formationPadding;
    const actualSpacing = Math.abs(front.x - back.x);

    if (actualSpacing >= desiredSpacing) {
      continue;
    }

    const correction = desiredSpacing - actualSpacing;
    back.x -= back.direction * correction;
    back.x = clamp(back.x, gameState.battlefield.minX + back.collisionRadius, gameState.battlefield.maxX - back.collisionRadius);
  }
}

function updateUnits(deltaTime) {
  applyLeaderAuras();

  const livingUnits = gameState.units.filter((unit) => unit.isAlive());
  const playerUnits = livingUnits.filter((unit) => unit.team === TEAM.PLAYER);
  const enemyUnits = livingUnits.filter((unit) => unit.team === TEAM.ENEMY);
  const attackEvents = [];

  for (const unit of livingUnits) {
    unit.update(deltaTime, {
      allies: unit.team === TEAM.PLAYER ? playerUnits : enemyUnits,
      enemies: unit.team === TEAM.PLAYER ? enemyUnits : playerUnits,
      enemyBase: unit.team === TEAM.PLAYER ? gameState.bases.enemy : gameState.bases.player,
      battlefield: gameState.battlefield,
      attackEvents
    });
  }

  resolveFormation(TEAM.PLAYER);
  resolveFormation(TEAM.ENEMY);
  processAttackEvents(attackEvents);
  gameState.units = gameState.units.filter((unit) => unit.isAlive());
}

function startLevel(levelIndex) {
  gameState.currentLevelIndex = clamp(levelIndex, 0, LEVELS.length - 1);
  gameState.gameOver = false;
  gameState.outcome = '';
  gameState.time = 0;
  gameState.incomeTimer = 0;
  gameState.playerCommand = 'attack';
  gameState.baseDefenseTimer = 0;
  gameState.units = [];
  gameState.damageTexts = [];
  gameState.nextUnitId = 1;
  lastTimestamp = 0;

  const currentLevel = getCurrentLevel();

  gameState.resources.gold = currentLevel.playerStartingGold;
  gameState.bases.player.reset(getPlayerBaseMaxHp());
  gameState.bases.enemy.reset(currentLevel.enemyBaseHp);
  enemyController.loadLevel(currentLevel.ai);

  hideResultScreen();
  setShopVisible(false);
  resizeCanvas();
  refreshUi();

  // 重置指令按钮UI
  if (ui.cmdAttackBtn && ui.cmdRetreatBtn) {
    ui.cmdAttackBtn.classList.add('is-active');
    ui.cmdRetreatBtn.classList.remove('is-active');
    ui.cmdAttackBtn.setAttribute('aria-pressed', 'true');
    ui.cmdRetreatBtn.setAttribute('aria-pressed', 'false');
  }

  showToast(`进入第 ${currentLevel.id} 关：${currentLevel.name}`);
}

function updateDamageTexts(deltaTime) {
  gameState.damageTexts = gameState.damageTexts.filter((text) => {
    text.y -= 34 * deltaTime;
    text.life -= deltaTime;
    return text.life > 0;
  });
}


function openShopFromResult() {
  uiState.returnToResultAfterShop = true;
  setResultVisible(false);
  setShopVisible(true);
  renderShop();
}

function closeShop() {
  setShopVisible(false);

  if (uiState.returnToResultAfterShop && uiState.resultScreenConfig) {
    uiState.returnToResultAfterShop = false;
    setResultVisible(true);
  }
}


function endBattle(outcome) {
  if (gameState.gameOver) {
    return;
  }

  gameState.gameOver = true;
  gameState.outcome = outcome;
  setShopVisible(false);

  const currentLevel = getCurrentLevel();

  if (outcome === 'win') {
    awardDiamonds(currentLevel.victoryDiamondReward, `${currentLevel.name} 通关`);
    const hasNextLevel = gameState.currentLevelIndex < LEVELS.length - 1;

    showResultScreen({
      kicker: '关卡胜利',
      title: `${currentLevel.name} 已攻克`,
      description: hasNextLevel
        ? `你已摧毁敌方基地，下一关将面对更高的敌军资源与更复杂的混编阵容。`
        : '你已完成全部关卡，整条战线已被成功推进到底。',
      rewardText: `胜利奖励：${currentLevel.victoryDiamondReward} 钻石`,
      primaryLabel: hasNextLevel ? '进入下一关' : '重新开始战役',
      primaryAction: () => {
        startLevel(hasNextLevel ? gameState.currentLevelIndex + 1 : 0);
      },
      secondaryLabel: '重玩本关',
      secondaryAction: () => {
        startLevel(gameState.currentLevelIndex);
      }
    });

    return;
  }

  showResultScreen({
    kicker: '关卡失败',
    title: `${currentLevel.name} 失守`,
    description: `敌方资源压制了你的推进节奏。尝试调整解锁与升级策略，再次挑战这条战线。`,
    rewardText: `当前难度：${currentLevel.difficulty}`,
    primaryLabel: '重试本关',
    primaryAction: () => {
      startLevel(gameState.currentLevelIndex);
    },
    secondaryLabel: '前往商店',
    secondaryAction: openShopFromResult
  });
}

function checkGameOver() {
  if (gameState.gameOver) {
    return;
  }

  if (!gameState.bases.player.isAlive()) {
    endBattle('lose');
    return;
  }

  if (!gameState.bases.enemy.isAlive()) {
    endBattle('win');
  }
}

function updateBaseDefense(deltaTime) {
  if (!gameState.bases.player.isAlive()) {
    return;
  }

  const playerBase = gameState.bases.player;
  const dangerRadius = 150;

  const threatEnemies = gameState.units.filter((unit) => {
    if (!unit.isAlive() || unit.team !== TEAM.ENEMY) {
      return false;
    }
    return Math.abs(unit.x - playerBase.x) <= dangerRadius;
  });

  if (threatEnemies.length === 0) {
    return;
  }

  gameState.baseDefenseTimer = Math.max(0, gameState.baseDefenseTimer - deltaTime);

  if (gameState.baseDefenseTimer > 0) {
    return;
  }

  gameState.baseDefenseTimer = 1.5;

  // 找最近的敌人
  let nearestEnemy = null;
  let minDist = Number.POSITIVE_INFINITY;

  for (const enemy of threatEnemies) {
    const d = Math.abs(enemy.x - playerBase.x);
    if (d < minDist) {
      minDist = d;
      nearestEnemy = enemy;
    }
  }

  if (!nearestEnemy) {
    return;
  }

  // 模拟基地弓箭手发射
  soundManager.playShoot();
  pushDamageText(nearestEnemy, 116, null);
  nearestEnemy.takeDamage(116);

  if (!nearestEnemy.isAlive()) {
    defeatTarget(nearestEnemy, null);
  }
}

function update(deltaTime) {
  gameState.time += deltaTime;

  if (!gameState.gameOver) {
    updateEconomy(deltaTime);
    enemyController.update(deltaTime);
    updateUnits(deltaTime);
    updateBaseDefense(deltaTime);
    checkGameOver();
  }

  updateDamageTexts(deltaTime);
  updateTopBar();
}

function drawBackground() {
  const { width, height, groundY } = gameState.battlefield;

  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#16336f');
  skyGradient.addColorStop(0.6, '#3058a5');
  skyGradient.addColorStop(1, '#5e88c8');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
  groundGradient.addColorStop(0, '#597236');
  groundGradient.addColorStop(1, '#243112');

  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundY, width, height - groundY);
}

function drawLane() {
  const { width, laneY } = gameState.battlefield;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(0, laneY);
  ctx.lineTo(width, laneY);
  ctx.stroke();
  ctx.restore();
}

function drawUnits() {
  gameState.units.forEach((unit) => unit.draw());
}

function drawDamageTexts() {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px Segoe UI';
  ctx.lineJoin = 'round';

  gameState.damageTexts.forEach((text) => {
    const alpha = clamp(text.life / text.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(28, 12, 12, 0.95)';
    ctx.fillStyle = text.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.strokeText(String(text.amount), text.x, text.y);
    ctx.fillText(String(text.amount), text.x, text.y);
  });

  ctx.restore();
}

function drawTips() {
  const { width, height } = gameState.battlefield;
  const currentLevel = getCurrentLevel();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 22px Segoe UI';
  ctx.fillText(`第 ${currentLevel.id} 关：${currentLevel.name} · ${currentLevel.difficulty}`, width / 2, height * 0.14);

  ctx.font = '15px Segoe UI';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.74)';
  ctx.fillText('敌方会随时间提升资源效率并自动混编出兵，注意利用商店解锁与强化节奏', width / 2, height * 0.14 + 28);
  ctx.restore();
}

function draw() {
  const { width, height } = gameState.battlefield;
  ctx.clearRect(0, 0, width, height);

  drawBackground();
  drawLane();
  gameState.bases.player.draw();
  gameState.bases.enemy.draw();
  drawUnits();
  drawDamageTexts();
  drawTips();
}

function gameLoop(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = timestamp;

  update(deltaTime);
  draw();

  window.requestAnimationFrame(gameLoop);
}

function speakCommand(text) {
  if (!window.speechSynthesis) return;
  if (!soundManager.isEnabled()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 1.2;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

function bindEvents() {
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('pointerdown', () => {
    soundManager.armFromGesture();
  }, { once: true });

  ui.soundToggleButton.addEventListener('click', async () => {
    await toggleSound();
  });

  ui.unitButtons.forEach((button) => {
    button.addEventListener('click', () => {
      soundManager.armFromGesture();
      soundManager.playUiClick();
      requestPlayerSpawn(button.dataset.unit);
    });
  });

  ui.shopButton.addEventListener('click', () => {
    soundManager.armFromGesture();
    soundManager.playUiClick();
    setShopVisible(true);
    renderShop();
  });

  ui.shopCloseButton.addEventListener('click', () => {
    soundManager.playUiClick();
    closeShop();
  });

  ui.shopOverlay.addEventListener('click', (event) => {
    if (event.target === ui.shopOverlay) {
      soundManager.playUiClick();
      closeShop();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !ui.shopOverlay.classList.contains('hidden')) {
      closeShop();
    }
  });

  [ui.unlockGiantButton, ui.unlockWarshipButton, ui.unlockSwordsmanLeaderButton, ui.unlockSpearmanLeaderButton, ui.unlockMachineGunnerButton, ui.upgradeBaseButton, ui.upgradeAttackButton].forEach((button) => {
    button.addEventListener('click', () => {
      soundManager.armFromGesture();
      soundManager.playUiClick();
      handleShopAction(button.dataset.shopAction, button.dataset.unit);
    });
  });

  ui.resultPrimaryButton.addEventListener('click', () => {
    soundManager.armFromGesture();
    soundManager.playUiClick();
    if (typeof uiState.resultPrimaryAction === 'function') {
      uiState.resultPrimaryAction();
    }
  });

  ui.resultSecondaryButton.addEventListener('click', () => {
    soundManager.armFromGesture();
    soundManager.playUiClick();
    if (typeof uiState.resultSecondaryAction === 'function') {
      uiState.resultSecondaryAction();
    }
  });

  ui.cmdAttackBtn.addEventListener('click', () => {
    soundManager.armFromGesture();
    soundManager.playUiClick();
    if (gameState.playerCommand !== 'attack') {
      gameState.playerCommand = 'attack';
      ui.cmdAttackBtn.classList.add('is-active');
      ui.cmdRetreatBtn.classList.remove('is-active');
      ui.cmdAttackBtn.setAttribute('aria-pressed', 'true');
      ui.cmdRetreatBtn.setAttribute('aria-pressed', 'false');
      showToast('⚔️ 全军出击！向敌方基地推进', 1400);
      speakCommand('全军出击！');
    }
  });

  ui.cmdRetreatBtn.addEventListener('click', () => {
    soundManager.armFromGesture();
    soundManager.playUiClick();
    if (gameState.playerCommand !== 'retreat') {
      gameState.playerCommand = 'retreat';
      ui.cmdRetreatBtn.classList.add('is-active');
      ui.cmdAttackBtn.classList.remove('is-active');
      ui.cmdRetreatBtn.setAttribute('aria-pressed', 'true');
      ui.cmdAttackBtn.setAttribute('aria-pressed', 'false');
      showToast('🛡️ 撤回基地！驻守防御', 1400);
      speakCommand('撤回基地！');
    }
  });
}


function init() {
  bindEvents();
  resizeCanvas();
  startLevel(0);
  window.requestAnimationFrame(gameLoop);
}

init();
