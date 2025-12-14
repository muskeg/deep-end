# Shop & Progression Contracts

## ProgressionSystem API

### save()
**Description**: Persists current progression state to LocalStorage  
**Parameters**: None  
**Returns**: `boolean` - Success status  
**Side Effects**: Writes to `localStorage['deepend_progression_v1']`  
**Error Handling**: Returns `false` on quota exceeded or storage unavailable

**Test Scenarios**:
- Given upgrades owned, when save called, then LocalStorage contains correct JSON
- Given LocalStorage full, when save called, then returns false and logs warning
- Given valid data, when save called multiple times, then latest data overwrites previous

---

### load()
**Description**: Restores progression state from LocalStorage  
**Parameters**: None  
**Returns**: `PlayerProgression` object  
**Side Effects**: Reads from LocalStorage, migrates old versions  
**Error Handling**: Returns default progression object on missing/corrupt data

**Test Scenarios**:
- Given saved data exists, when load called, then progression restored correctly
- Given no saved data, when load called, then returns default progression
- Given corrupt JSON, when load called, then returns default and logs error
- Given old version (v0), when load called, then migrates to v1 schema

---

### purchaseUpgrade(upgradeType, currentLevel)
**Description**: Attempts to purchase next level of upgrade  
**Parameters**: 
  - `upgradeType`: string (oxygen, light, speed, harpoon, dash, sonar)
  - `currentLevel`: number (0-4, level to upgrade from)
**Returns**: `{ success: boolean, newLevel: number, pearlsSpent: number, error?: string }`  
**Pre-conditions**: Player has sufficient pearls, upgrade not at max level  
**Side Effects**: Deducts pearls, increments upgrade level, saves progression

**Test Scenarios**:
- Given sufficient pearls, when purchase called, then upgrade level increases
- Given insufficient pearls, when purchase called, then returns {success: false, error}
- Given max level upgrade, when purchase called, then returns {success: false, error}
- Given successful purchase, when checking LocalStorage, then updated data saved

---

### addPearls(amount)
**Description**: Increments pearl balance  
**Parameters**: `amount`: number (positive integer)  
**Returns**: `number` - New pearl total  
**Side Effects**: Updates progression.pearls, triggers UI update event

**Test Scenarios**:
- Given amount 5, when addPearls called, then balance increases by 5
- Given amount 0, when addPearls called, then balance unchanged
- Given negative amount, when addPearls called, then throws error

---

### canAffordUpgrade(upgradeType, targetLevel)
**Description**: Checks if player has enough pearls for upgrade  
**Parameters**: 
  - `upgradeType`: string
  - `targetLevel`: number (1-5)
**Returns**: `boolean`  
**Side Effects**: None (read-only)

**Test Scenarios**:
- Given pearls >= cost, when canAfford called, then returns true
- Given pearls < cost, when canAfford called, then returns false
- Given invalid upgrade type, when canAfford called, then returns false

---

## ShopScene API

### showUpgradeList()
**Description**: Displays all available upgrades with current levels and costs  
**Parameters**: None  
**Returns**: void  
**Side Effects**: Renders UI elements on scene

**UI Elements**:
- Upgrade cards (6 total, one per type)
- Current level indicator
- Next level cost (or "MAX" if at level 5)
- Purchase button (disabled if can't afford or maxed)
- Pearl balance display (top-right)

**Test Scenarios**:
- Given player with 50 pearls, when shop shown, then affordable upgrades enabled
- Given player with 0 pearls, when shop shown, then all purchase buttons disabled
- Given oxygen level 5, when shop shown, then oxygen shows "MAX" label

---

### onUpgradeClick(upgradeType)
**Description**: Handles purchase button click  
**Parameters**: `upgradeType`: string  
**Returns**: void  
**Side Effects**: Calls ProgressionSystem.purchaseUpgrade, refreshes UI

**Test Scenarios**:
- Given sufficient pearls, when upgrade clicked, then purchase succeeds and UI updates
- Given insufficient pearls, when upgrade clicked, then error message displayed
- Given purchase success, when UI refreshes, then new level and reduced pearls shown

---

### onStartDiveClick()
**Description**: Begins new run with current upgrades  
**Parameters**: None  
**Returns**: void  
**Side Effects**: Transitions to GameScene with fresh oxygen

**Test Scenarios**:
- Given upgrades owned, when start dive clicked, then GameScene loads with upgraded values
- Given oxygen level 3, when dive starts, then player oxygen = base + (3 * 20%)

---

## UpgradeSystem API

### applyUpgrades(player, progression)
**Description**: Applies all owned upgrades to player stats  
**Parameters**: 
  - `player`: Player entity
  - `progression`: PlayerProgression object
**Returns**: void  
**Side Effects**: Modifies player oxygen, speed, light radius, etc.

**Test Scenarios**:
- Given oxygen level 2, when applyUpgrades called, then player.maxOxygen increased by 40%
- Given light level 3, when applyUpgrades called, then playerLight radius = 300 + (3 * 60) = 480px
- Given speed level 1, when applyUpgrades called, then player speed = base * 1.15

---

### getUpgradeEffect(upgradeType, level)
**Description**: Calculates effect value for specific upgrade level  
**Parameters**: 
  - `upgradeType`: string
  - `level`: number (0-5)
**Returns**: `number` - Effect value

**Examples**:
- `getUpgradeEffect('oxygen', 3)` → 160 (100 base + 3*20)
- `getUpgradeEffect('light', 2)` → 420 (300 base + 2*60)
- `getUpgradeEffect('speed', 4)` → 1.60 (1.0 + 4*0.15)

**Test Scenarios**:
- Given level 0, when getUpgradeEffect called, then returns base value
- Given level 5, when getUpgradeEffect called, then returns max value
- Given invalid type, when getUpgradeEffect called, then returns 0
