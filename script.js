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
  WARSHIP: 'warship'
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
        this.playSlash();
        break;
      case UNIT_TYPE.ARCHER:
        this.playShoot();
        break;
      case UNIT_TYPE.GIANT:
        this.playHeavyThud();
        break;
      case UNIT_TYPE.WARSHIP:
        this.playExplosion();
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
  shopBaseUpgradeState: document.getElementById('shopBaseUpgradeState'),
  shopAttackUpgradeState: document.getElementById('shopAttackUpgradeState'),
  unlockGiantButton: document.getElementById('unlockGiantButton'),
  unlockWarshipButton: document.getElementById('unlockWarshipButton'),
  upgradeBaseButton: document.getElementById('upgradeBaseButton'),
  upgradeAttackButton: document.getElementById('upgradeAttackButton'),
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

function updateActionButtonLabel(button, unitType) {
  const unitMeta = getUnitMeta(unitType);
  const unlocked = isUnitUnlocked(unitType);
  const affordable = gameState.resources.gold >= unitMeta.goldCost;

  button.innerHTML = `
    <span class="button-title">${unitMeta.label}${unlocked ? '' : ' · 未解锁'}</span>
    <span class="button-meta">${unlocked ? `${unitMeta.goldCost} 金币 / 次` : `需 ${unitMeta.unlockCost} 钻石解锁`}</span>
  `;

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
  const baseUpgradeMaxed = gameState.progression.baseHpLevel >= UPGRADE_CONFIG.baseHp.maxLevel;
  const attackUpgradeMaxed = gameState.progression.attackLevel >= UPGRADE_CONFIG.attackBuff.maxLevel;
  const giantCost = getUnitMeta(UNIT_TYPE.GIANT).unlockCost;
  const warshipCost = getUnitMeta(UNIT_TYPE.WARSHIP).unlockCost;
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
    const nextX = this.x + this.direction * this.moveSpeed * deltaTime;
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
  const baseWidth = compactLayout ? 72 : 104;
  const baseHeight = compactLayout ? 94 : 136;
  const margin = compactLayout ? 10 : 36;

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

function update(deltaTime) {
  gameState.time += deltaTime;

  if (!gameState.gameOver) {
    updateEconomy(deltaTime);
    enemyController.update(deltaTime);
    updateUnits(deltaTime);
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

  [ui.unlockGiantButton, ui.unlockWarshipButton, ui.upgradeBaseButton, ui.upgradeAttackButton].forEach((button) => {
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
}


function init() {
  bindEvents();
  resizeCanvas();
  startLevel(0);
  window.requestAnimationFrame(gameLoop);
}

init();
