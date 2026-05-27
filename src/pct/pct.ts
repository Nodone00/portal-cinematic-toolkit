import { PCT_ErrorLogger } from "../core/error-logger";
import { PCT_WIM } from "../ui/worldicons";
import { PCT_UI } from "../ui/ui";

/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * BY NODONE
 * May 7, 2026
 * v. 1.01
 *************************/

export namespace PCT {
  /************************
   * Enums
   *************************/

  enum DistanceType {
    XZ,
    XYZ,
  }

  enum CameraType {
    Path,
    Free,
    PlayerPreset,
  }

  enum PointSelectionType {
    PathPoint,
    MenuDelete,
    MenuMove,
  }

  enum PathPointsStatus {
    None,
    Selected,
    Moving,
  }

  enum CameraTargetType {
    Player,
    Path,
  }

  enum DirectorStateType {
    Idle,
    CameraPathSetup,
    CameraPathActive,
    FreeCamActive,
    PlayerPresetCameraActive,
  }

  /************************
   * Types
   *************************/

  type V3 = { x: number; y: number; z: number };

  // Camera

  type CameraConfig = {
    defaultMoveSpeed: number;
    defaultLookAheadDistance: number;
    defaultMaxPitchUpDeg: number;
    defaultMaxPitchDownDeg: number;
  };

  type CameraState = {
    type: CameraType;
    isRunning: boolean;
    speed: number;
    lookAheadDistance: number;
    maxPitchUpDeg: number;
    maxPitchDownDeg: number;
    reset: boolean;
    freeCamIsTracking: boolean;
    freeCamIsFocusing: boolean;
    freeCamIsDefocusing: boolean;
    freeCamIsInFocus: boolean;
    target: {
      type: CameraTargetType;
      playerObject: mod.Player | null;
      trackingActive: boolean;
      previousTargetPlayerObject: mod.Player | null;
    };
    playerPresets: PlayerPresetCameraState;
  };

  // Free Cam Player Tracking

  type TrackedPlayerState = {
    previousTrackedPlayerPos: V3 | null;
    previousTrackedPlayerPosWasZero: boolean | null;
  };

  type FreeCamTrackedPlayerState = TrackedPlayerState & {
    smoothedTrackedPlayerY: number | null;
  };

  // Player Preset

  type CameraPreset = {
    name: string;
    offset: V3; // x = right/left; y = up/down; z = forward/backward
    hOffset: number;
    vOffset: number;
    pitchOffset: number;
  };

  type PlayerPresetCameraState = {
    presets: CameraPreset[];
    selectedPresetIndex: number;
  };

  // Path Point

  type PathPoint = {
    uniqueId: number;
    orderId: number;
    pos: V3;
    playerPosY: number;
    worldIconName: string;
    selectionType: PointSelectionType;
    parentId?: number;
  };

  type PathPointConfig = {
    defaultPointCreationDistance: number;
    defaultColor: mod.Vector;
    hoverColor: mod.Vector;
    menuDefaultColor: mod.Vector;
    menuHoverColor: mod.Vector;
    selectedColor: mod.Vector;
    defaultIcon: mod.WorldIconImages;
    hoverIcon: mod.WorldIconImages;
  };

  // Path

  type PathConfig = {
    defaultCornerRadius: number;
    samplesPerCorner: number;
  };

  type PathState = {
    points: PathPoint[];
    menuPoints: PathPoint[];
    cornerRadius: number;
    locked: boolean;
    previousAimedPoint: PathPoint | null;
    inSelection: boolean;
    isMoving: boolean;
    pointCreationDistance: number;
  };

  // VFX Loop

  type VFXSpawnEntry = {
    vfx: mod.RuntimeSpawn_Common;
    weight: number;
    minDistance: number;
    maxDistance: number;
  };

  type VFXConfig = {
    radius: number;
    spawnChance: number;
    minMoveDistance: number;
    checkInterval: number;
  };

  type VFXState = {
    isRunning: boolean;
    previousCheckPos: V3 | null;
    inventory: VFXSpawnEntry[];
    spawnChance: number;
  };

  // UI (Path Points Info)

  type TrackedPathPointsUIRow = {
    id: TrackedPathPointsRowId;
    key: PCT_UI.Text;
    value: PCT_UI.Text;
    lastRenderedValue: number;
  };

  type TrackedPathPointsData = {
    status: PathPointsStatus;
    creationDistanceMeters: number;
    count: number;
    totalLengthMeters: number;
  };

  type TrackedPathPointsRowId = keyof TrackedPathPointsData;

  type TrackedPathPointsRowSchema = {
    id: TrackedPathPointsRowId;
    key: string;
  };

  // UI (Cam Settings Info)

  type TrackedCamSettingsUIRow = {
    id: TrackedCamSettingsRowId;
    key: PCT_UI.Text;
    value: PCT_UI.Text;
    lastRenderedValue: number | boolean | V3 | mod.Player | null;
  };

  type TrackedCamSettingsData = {
    cameraSpeed: number;
    maxPitchUpDeg: number;
    maxPitchDownDeg: number;
    cornerRadius: number;
    lookAheadDistance: number;
    cameraTargetType: CameraTargetType;
    cameraTarget: mod.Player | null;
    vfxFrequencyPercent: number;
  };

  type TrackedCamSettingsRowId = keyof TrackedCamSettingsData;

  type TrackedCamSettingsRowSchema = {
    id: TrackedCamSettingsRowId;
    key: string;
    step: number;
    min?: number;
    max?: number;
  };

  // Player State

  type PlayerUI = {
    targetSelectionUI: {
      root?: PCT_UI.Container | null;
      playerLabel?: PCT_UI.Text | null;
      playerCountInfo?: PCT_UI.Text | null;
      playerStats?: PCT_UI.Text | null;
      lastRenderedKills?: number | null;
      lastRenderedDeaths?: number | null;
      lastRenderedTargetId?: number | null;
    };
    directorCodeEntryUI: {
      root?: PCT_UI.Container | null;
      digitButtons?: PCT_UI.Button[] | null;
      inputEnabled?: boolean;
      closeButton?: PCT_UI.Button | null;
    };
    directorMenuUI: {
      root?: PCT_UI.Container | null;
    };
    pathCameraSetupUI: {
      pathPointsMenuRoot?: PCT_UI.Container | null;
      cameraControlMenuRoot?: PCT_UI.Container | null;
      movePointTipRoot?: PCT_UI.Container | null;
      buttons?: PCT_UI.Button[] | null;
      trackedPathPointsInfo?: TrackedPathPointsUIRow[] | null;
      trackedCamSettingsInfo?: TrackedCamSettingsUIRow[] | null;
      controlNoticeRoot?: PCT_UI.Container | null;
      pathMoveTipShown?: boolean;
    };
    playerPresetCameraUI: {
      root?: PCT_UI.Container | null;
      presetValue?: PCT_UI.Text | null;
      buttons?: PCT_UI.Button[] | null;
      lastRenderedPresetIndex?: number | null;
      portalGadgetNoticeRoot?: PCT_UI.Container | null;
    };
  };

  type PlayerActionStateBool = {
    isCrouching: boolean;
    isFiring: boolean;
    isAiming: boolean;
    isProne: boolean;
    isJumping: boolean;
    isInteracting: boolean;
    isAimingPortalGadget: boolean;
    isFiringPortalGadget: boolean;
    isPortalLaserActive: boolean;
  };

  type DirectorState = {
    currentStatus: DirectorStateType;
    pathCameraInteractPoint: mod.InteractPoint | null;
    actionState: PlayerActionStateBool;
  };

  // Config

  export type Config = {
    uiPrefix: string;
    cameraConfig: CameraConfig;
    pathPointConfig: PathPointConfig;
    pathConfig: PathConfig;
    vfxConfig: VFXConfig;
  };

  /************************
   * Private State
   *************************/

  let _fixedCameraId: number;
  let _directorPasscode: string;
  //let _showPlayerNametags: boolean; // mod.AddUIIcon appears to be bugged
  let _config: Config;

  let _directorControlRoomSpawnPos: V3;
  let _directorControlRoomSpawnedObjects: mod.SpatialObject[];

  let _cameraState: CameraState;
  let _pathState: PathState;
  let _vfxState: VFXState;

  let _cameraObject: mod.FixedCamera;
  let _cameraObjectInitialPos: V3;

  let _directorInteractPoint: mod.InteractPoint | null;
  let _freeCamInteractPoint: mod.InteractPoint | null;

  let _trackedCamSettingsInfo: TrackedCamSettingsData;
  let _trackedCamSettingsInfoUIRows: TrackedCamSettingsRowSchema[];

  let _trackedPathPointsInfo: TrackedPathPointsData;
  let _trackedPathPointsInfoUIRows: TrackedPathPointsRowSchema[];

  /************************
   * Private Constants
   *************************/

  const TICK_SECONDS = 0.033; // 0.033 assuming 30hz; 33ms per tick

  const DT = TICK_SECONDS; // Delta Time per tick
  const SD = 0.1; // Settle Delay to wait for logic

  const rtc = mod.RuntimeSpawn_Common;

  /************************
   * V3 and Vector Wrappers
   *************************/

  const V3 = {
    Create(x: number, y: number, z: number): V3 {
      return { x, y, z };
    },

    Zero(): V3 {
      return V3.Create(0, 0, 0);
    },

    Add(a: V3, b: V3): V3 {
      return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    },

    Sub(a: V3, b: V3): V3 {
      return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    },

    Scale(a: V3, s: number): V3 {
      return { x: a.x * s, y: a.y * s, z: a.z * s };
    },

    Length(a: V3): number {
      return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    },

    Dot(a: V3, b: V3): number {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    },

    Normalize(a: V3): V3 {
      const len = V3.Length(a);
      if (len <= 0) {
        return V3.Create(0, 0, 0);
      }
      return V3.Create(a.x / len, a.y / len, a.z / len);
    },

    Lerp(a: number, b: number, t: number): number {
      return a + (b - a) * t;
    },

    DistanceBetween(
      a: V3,
      b: V3,
      distanceType?: DistanceType,
      NumberOfDecimals?: number,
    ): { whole: number; fraction: number; full: number } {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;

      let dist: number;

      if (distanceType === DistanceType.XYZ) {
        dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      } else {
        dist = Math.sqrt(dx * dx + dz * dz);
      }

      const factor = 10 ** (NumberOfDecimals ?? 2);

      const scaled = Math.round(dist * factor);

      return {
        whole: Math.floor(scaled / factor),
        fraction: scaled % factor,
        full: dist,
      };
    },

    ToVector(v: V3): mod.Vector {
      return mod.CreateVector(v.x, v.y, v.z);
    },
  };

  const Vector = {
    Create(x: number, y: number, z: number): mod.Vector {
      return mod.CreateVector(x, y, z);
    },

    Zero(): mod.Vector {
      return mod.CreateVector(0, 0, 0);
    },

    ToV3(v: mod.Vector): V3 {
      return V3.Create(
        mod.XComponentOf(v),
        mod.YComponentOf(v),
        mod.ZComponentOf(v),
      );
    },
  };

  /************************
   * Public API
   *************************/

  /**
   * Initializes the Portal Camera Toolkit (PCT) module. Should be called at the top of OnGameModeStarted().
   * @param fixedCameraId - The id of the Fixed Camera object created in Godot. This must be a unique id not shared with any other Godot object. The Fixed Camera object in Godot should be positioned at a location reachable for the player to interact with it to activate Director settings.
   * @param directorPasscode - Passcode to become Director when interacting with the Fixed Camera initial position. This should be a numeric string, e.g. "1234".
   * @param showPlayerNametags - DISABLED as mod.AddUIIcon appears to be bugged *** Whether to show player nametags. Team 3 of 1 player is required for nametags to show.
   * @param defaultConfig - Optional default configuration for the PCT module.
   */
  export function Initialize(
    fixedCameraId: number,
    directorPasscode: string,
    //showPlayerNametags: boolean,
    defaultConfig?: Partial<Config>,
  ): void {
    if (_config) {
      return;
    }
    CreateConfig(
      fixedCameraId,
      directorPasscode,
      //showPlayerNametags,
      defaultConfig,
    );

    SpawnDirectorControlRoom();
  }

  export function IsPlayerDirector(player: mod.Player): boolean {
    return Player.GetIsDirector(player);
  }

  /************************
   * Config and State Creation
   *************************/

  function CreateConfig(
    fixedCameraId: number,
    directorPasscode: string,
    //showPlayerNametags: boolean,
    defaultConfig?: Partial<Config>,
  ) {
    // Core Config

    _fixedCameraId = fixedCameraId;
    _directorPasscode = directorPasscode;
    _cameraObject = mod.GetFixedCamera(_fixedCameraId);
    _cameraObjectInitialPos = Vector.ToV3(mod.GetObjectPosition(_cameraObject));

    //_showPlayerNametags = showPlayerNametags; // mod.AddUIIcon appears to be bugged

    // Director Interaction Point

    _directorInteractPoint = mod.SpawnObject(
      rtc.InteractPoint,
      V3.ToVector(_cameraObjectInitialPos),
      Vector.Zero(),
    ) as mod.InteractPoint;

    /*PCT_WIM.init().createIcon(
      "director-panel",
      V3.ToVector(_cameraObjectInitialPos),
      {
        icon: mod.WorldIconImages.SquadPing,
        iconVisible: true,
        text: mod.Message("PCT_INTERACT_HERE"),
        textVisible: true,
        color: PCT_UI.COLORS.RED,
      },
    );*/

    // General Config

    _config = {
      uiPrefix: defaultConfig?.uiPrefix ?? "pct",
      cameraConfig: {
        defaultMoveSpeed: defaultConfig?.cameraConfig?.defaultMoveSpeed ?? 6,
        defaultLookAheadDistance:
          defaultConfig?.cameraConfig?.defaultLookAheadDistance ?? 20,
        defaultMaxPitchUpDeg:
          defaultConfig?.cameraConfig?.defaultMaxPitchUpDeg ?? 10,
        defaultMaxPitchDownDeg:
          defaultConfig?.cameraConfig?.defaultMaxPitchDownDeg ?? 10,
      },
      pathPointConfig: {
        defaultPointCreationDistance:
          defaultConfig?.pathPointConfig?.defaultPointCreationDistance ?? 5,
        defaultColor: mod.CreateVector(0, 0.1, 0), // Hex: #002600
        hoverColor: mod.CreateVector(0, 1, 0), // Hex: #00FF00
        menuDefaultColor: mod.CreateVector(0, 0.1, 0), // Hex: #002600
        menuHoverColor: mod.CreateVector(1, 0, 0), // Hex: #FF0000
        selectedColor: mod.CreateVector(1, 0, 0), // Hex: #FF0000
        defaultIcon: mod.WorldIconImages.SquadPing,
        hoverIcon: mod.WorldIconImages.FilledPing,
      },
      pathConfig: {
        defaultCornerRadius:
          defaultConfig?.pathConfig?.defaultCornerRadius ?? 80,
        samplesPerCorner: defaultConfig?.pathConfig?.samplesPerCorner ?? 40,
      },
      vfxConfig: {
        radius: defaultConfig?.vfxConfig?.radius ?? 350, // Consider changing the inventory min and max distances below instead of changing this radius
        minMoveDistance: defaultConfig?.vfxConfig?.minMoveDistance ?? 0,
        spawnChance: defaultConfig?.vfxConfig?.spawnChance ?? 0,
        checkInterval: defaultConfig?.vfxConfig?.checkInterval ?? 0.25,
      },
      ...defaultConfig,
    };

    // State

    _cameraState = {
      type: CameraType.Free,
      speed: _config.cameraConfig.defaultMoveSpeed,
      lookAheadDistance: _config.cameraConfig.defaultLookAheadDistance,
      maxPitchUpDeg: _config.cameraConfig.defaultMaxPitchUpDeg,
      maxPitchDownDeg: _config.cameraConfig.defaultMaxPitchDownDeg,
      isRunning: false,
      reset: false,
      freeCamIsTracking: false,
      freeCamIsFocusing: false,
      freeCamIsDefocusing: false,
      freeCamIsInFocus: false,
      target: {
        type: CameraTargetType.Path,
        playerObject: null,
        trackingActive: false,
        previousTargetPlayerObject: null,
      },
      playerPresets: {
        selectedPresetIndex: 0,
        presets: [
          // Rear cameras
          {
            name: "PCT_PRESET_MEDIUM_REAR",
            offset: V3.Create(0, 1.4, -3),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 10, // negative: pitch down; positive: pitch up
          },
          {
            name: "PCT_PRESET_FAR_REAR",
            offset: V3.Create(0, 2.2, -8),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_CLOSE_REAR",
            offset: V3.Create(0, 0.5, -1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },
          {
            name: "PCT_PRESET_VERY_CLOSE_REAR",
            offset: V3.Create(0, 0.3, -0.35),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 40,
          },
          {
            name: "PCT_PRESET_VERY_FAR_REAR",
            offset: V3.Create(0, 5, -22),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },

          // Shoulder cameras
          {
            name: "PCT_PRESET_CLOSE_RIGHT_SHOULDER",
            offset: V3.Create(-1.4, 0.5, -1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -18,
          },
          {
            name: "PCT_PRESET_CLOSE_LEFT_SHOULDER",
            offset: V3.Create(1.4, 0.5, -1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -18,
          },

          // High rear cameras
          {
            name: "PCT_PRESET_HIGH_MEDIUM_REAR",
            offset: V3.Create(0, 8, -7),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_HIGH_FAR_REAR",
            offset: V3.Create(0, 8, -14),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_VERY_HIGH_MEDIUM_REAR",
            offset: V3.Create(0, 20, -8),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -12,
          },
          {
            name: "PCT_PRESET_VERY_HIGH_FAR_REAR",
            offset: V3.Create(0, 12, -18),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -4,
          },
          {
            name: "PCT_PRESET_HIGH_CLOSE_REAR",
            offset: V3.Create(0, 2.6, -1.2),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 28,
          },

          // Low rear cameras
          {
            name: "PCT_PRESET_LOW_MEDIUM_REAR",
            offset: V3.Create(0, -0.3, -3.8),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -5,
          },
          {
            name: "PCT_PRESET_LOW_FAR_REAR",
            offset: V3.Create(0, -0.3, -8),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -5,
          },
          {
            name: "PCT_PRESET_VERY_LOW_MEDIUM_REAR",
            offset: V3.Create(0, -0.6, -5),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -12,
          },
          {
            name: "PCT_PRESET_VERY_LOW_FAR_REAR",
            offset: V3.Create(0, -0.6, -9),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -8,
          },
          {
            name: "PCT_PRESET_EXTREMELY_LOW_MEDIUM_REAR",
            offset: V3.Create(0, -0.85, -5.5),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -14,
          },
          {
            name: "PCT_PRESET_EXTREMELY_LOW_FAR_REAR",
            offset: V3.Create(0, -0.85, -9.5),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -10,
          },

          // Right rear cameras
          {
            name: "PCT_PRESET_LOW_CLOSE_RIGHT_REAR",
            offset: V3.Create(0.55, -0.3, -0.9),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -15,
          },
          {
            name: "PCT_PRESET_VERY_CLOSE_RIGHT_REAR",
            offset: V3.Create(0.9, 0.75, -0.35),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -15,
          },
          {
            name: "PCT_PRESET_HIGH_CLOSE_RIGHT_REAR",
            offset: V3.Create(3, 2, -1.5),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },
          {
            name: "PCT_PRESET_MEDIUM_RIGHT_REAR",
            offset: V3.Create(5, 2.5, -6),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 6,
          },
          {
            name: "PCT_PRESET_WIDE_RIGHT_REAR",
            offset: V3.Create(4, 2, -6),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },
          {
            name: "PCT_PRESET_HIGH_MEDIUM_RIGHT_REAR",
            offset: V3.Create(5, 6, -9),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_HIGH_FAR_RIGHT_REAR",
            offset: V3.Create(10, 7, -7),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },

          // Left rear cameras
          {
            name: "PCT_PRESET_HIGH_CLOSE_LEFT_REAR",
            offset: V3.Create(-3, 2, -1.5),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },
          {
            name: "PCT_PRESET_MEDIUM_LEFT_REAR",
            offset: V3.Create(-5, 2.5, -6),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 6,
          },
          {
            name: "PCT_PRESET_WIDE_LEFT_REAR",
            offset: V3.Create(-4, 2, -6),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },
          {
            name: "PCT_PRESET_HIGH_MEDIUM_LEFT_REAR",
            offset: V3.Create(-5, 6, -9),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_HIGH_FAR_LEFT_REAR",
            offset: V3.Create(-10, 7, -7),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },

          // Side cameras
          {
            name: "PCT_PRESET_MEDIUM_RIGHT_SIDE",
            offset: V3.Create(6, 1.5, 0),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },
          {
            name: "PCT_PRESET_MEDIUM_LEFT_SIDE",
            offset: V3.Create(-6, 1.5, 0),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 5,
          },

          // Front cameras
          {
            name: "PCT_PRESET_CLOSE_FRONT",
            offset: V3.Create(0, 1.2, 2),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -10,
          },
          {
            name: "PCT_PRESET_MEDIUM_FRONT",
            offset: V3.Create(0, 1.7, 5),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 4,
          },
          {
            name: "PCT_PRESET_FAR_FRONT",
            offset: V3.Create(0, 2.5, 10),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_MEDIUM_RIGHT_FRONT",
            offset: V3.Create(3, 1.6, 4),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 4,
          },
          {
            name: "PCT_PRESET_MEDIUM_LEFT_FRONT",
            offset: V3.Create(-3, 1.6, 4),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 4,
          },

          // Low front cameras
          {
            name: "PCT_PRESET_LOW_MEDIUM_FRONT",
            offset: V3.Create(0, -0.5, 3.2),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -10,
          },
          {
            name: "PCT_PRESET_LOW_MEDIUM_RIGHT_FRONT",
            offset: V3.Create(2.5, -0.5, 2.6),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -10,
          },
          {
            name: "PCT_PRESET_LOW_MEDIUM_LEFT_FRONT",
            offset: V3.Create(-2.5, -0.5, 2.6),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: -10,
          },

          // Top-down cameras
          {
            name: "PCT_PRESET_CLOSE_TOP_DOWN",
            offset: V3.Create(0, 2, -0.1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_MEDIUM_TOP_DOWN",
            offset: V3.Create(0, 6, -0.1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_FAR_TOP_DOWN",
            offset: V3.Create(0, 8, -0.1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_VERY_FAR_TOP_DOWN",
            offset: V3.Create(0, 15, -0.1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_EXTREME_TOP_DOWN",
            offset: V3.Create(0, 30, -0.1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
          {
            name: "PCT_PRESET_MAXIMUM_TOP_DOWN",
            offset: V3.Create(0, 60, -0.1),
            hOffset: 0,
            vOffset: 0,
            pitchOffset: 0,
          },
        ],
      },
    };

    _pathState = {
      points: [],
      menuPoints: [],
      cornerRadius: _config.pathConfig.defaultCornerRadius,
      locked: false,
      previousAimedPoint: null,
      inSelection: false,
      isMoving: false,
      pointCreationDistance:
        _config.pathPointConfig.defaultPointCreationDistance,
    };

    _vfxState = {
      isRunning: false,
      previousCheckPos: null,
      spawnChance: _config.vfxConfig.spawnChance,
      // I tried to optimize the inventory for good visuals, but feel free to play around with this and add any VFX you think would look good in the mix.
      inventory: [
        {
          vfx: rtc.FX_Gadget_C4_Explosives_Detonation,
          weight: 15,
          minDistance: 5,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_ArtilleryStrike_Explosion_GS,
          weight: 10,
          minDistance: 10,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_CAP_AmbWar_Rocket_Strike,
          weight: 5,
          minDistance: 180,
          maxDistance: 300,
        },
        {
          vfx: rtc.FX_Carrier_Explosion_Dist,
          weight: 5,
          minDistance: 250,
          maxDistance: 350,
        },
        {
          vfx: rtc.FX_CivCar_SUV_Explosion,
          weight: 10,
          minDistance: 10,
          maxDistance: 50,
        },
        {
          vfx: rtc.FX_Gadget_AirburstLauncher_Detonation,
          weight: 10,
          minDistance: 2,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_Gadget_SmokeBarrage_Cluster_Det,
          weight: 6,
          minDistance: 2,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_Gadget_SupplyDrop_Destruction,
          weight: 50,
          minDistance: 1,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_Grenade_Fragmentation_ImpactGrenade_Detonation,
          weight: 10,
          minDistance: 2,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_LoadoutCrate_AirSpawn,
          weight: 15,
          minDistance: 10,
          maxDistance: 40,
        },
        {
          vfx: rtc.FX_Missile_MBTLAW_Hit,
          weight: 5,
          minDistance: 30,
          maxDistance: 80,
        },
      ],
    };

    // UI

    _trackedCamSettingsInfo = {
      cameraSpeed: _cameraState.speed,
      maxPitchUpDeg: _cameraState.maxPitchUpDeg,
      maxPitchDownDeg: _cameraState.maxPitchDownDeg,
      cornerRadius: _pathState.cornerRadius,
      lookAheadDistance: _cameraState.lookAheadDistance,
      cameraTargetType: _cameraState.target.type,
      cameraTarget: _cameraState.target.playerObject,
      vfxFrequencyPercent: _vfxState.spawnChance * 100,
    };

    _trackedCamSettingsInfoUIRows = [
      {
        id: "cameraSpeed",
        key: "PCT_TRACKED_CAMERA_SPEED",
        step: 1,
        min: 0,
        max: 40,
      },
      {
        id: "maxPitchUpDeg",
        key: "PCT_TRACKED_MAX_PITCH_UP",
        step: 5,
        min: 0,
        max: 90,
      },
      {
        id: "maxPitchDownDeg",
        key: "PCT_TRACKED_MAX_PITCH_DOWN",
        step: 5,
        min: 0,
        max: 90,
      },
      {
        id: "cornerRadius",
        key: "PCT_TRACKED_CORNER_RADIUS",
        step: 5,
        min: 0,
        max: 100,
      },
      {
        id: "lookAheadDistance",
        key: "PCT_TRACKED_LOOK_AHEAD_DISTANCE",
        step: 1,
        min: 1,
        max: 40,
      },
      {
        id: "cameraTargetType",
        key: "PCT_TRACKED_CAMERA_TARGET_TYPE",
        step: 1,
        min: 0,
        max: Object.keys(CameraTargetType).length / 2 - 1,
      },
      {
        id: "cameraTarget",
        key: "PCT_TRACKED_CAMERA_TARGET",
        step: 1,
        min: 0,
      },
      {
        id: "vfxFrequencyPercent",
        key: "PCT_TRACKED_VFX_FREQUENCY",
        step: 10,
        min: 0,
        max: 100,
      },
    ];

    _trackedPathPointsInfo = {
      status: PathPointsStatus.None,
      creationDistanceMeters:
        _config.pathPointConfig.defaultPointCreationDistance,
      count: 0,
      totalLengthMeters: 0,
    };

    _trackedPathPointsInfoUIRows = [
      {
        id: "status",
        key: "PCT_TRACKED_PATH_POINTS_STATUS",
      },
      {
        id: "creationDistanceMeters",
        key: "PCT_TRACKED_PATH_POINTS_CREATION_DISTANCE",
      },
      {
        id: "count",
        key: "PCT_TRACKED_PATH_POINTS_COUNT",
      },
      {
        id: "totalLengthMeters",
        key: "PCT_TRACKED_PATH_POINTS_TOTAL_LENGTH",
      },
    ];
  }

  function SpawnDirectorControlRoom(skySpawn?: boolean): mod.SpatialObject[] {
    skySpawn = skySpawn ?? false;

    const yOffset = skySpawn ? 300 : -50;
    const roomCenterPos = V3.Add(
      _cameraObjectInitialPos,
      V3.Create(0, yOffset, 0),
    );
    _directorControlRoomSpawnPos = roomCenterPos;

    const room = {
      size: 0.005,
      wallHeight: 6.4,
      wallFaceOffsetX: 0.94,
      wallFaceOffsetZ: 0.3,
      wallOverlap: 0.5,

      floor: {
        minX: 0.0,
        maxX: 5.0,
        maxY: 0.0,
        minZ: -3.56,
        maxZ: 0.0,
      },

      ceiling: {
        minX: -0.01,
        maxX: 18.01,
        minY: -0.01,
        minZ: -0.01,
        maxZ: 10.25,
      },
    };

    const halfInterior = room.size / 2;

    const coverSize = Math.max(
      room.size + room.wallFaceOffsetX * 2,
      room.size + room.wallFaceOffsetZ * 2,
    );

    const floorUniformScale = Math.max(
      coverSize / (room.floor.maxX - room.floor.minX),
      coverSize / (room.floor.maxZ - room.floor.minZ),
    );

    const ceilingUniformScale = Math.max(
      coverSize / (room.ceiling.maxX - room.ceiling.minX),
      coverSize / (room.ceiling.maxZ - room.ceiling.minZ),
    );

    const floorCenterLocalX = (room.floor.minX + room.floor.maxX) / 2;
    const floorCenterLocalZ = (room.floor.minZ + room.floor.maxZ) / 2;
    const ceilingCenterLocalX = (room.ceiling.minX + room.ceiling.maxX) / 2;
    const ceilingCenterLocalZ = (room.ceiling.minZ + room.ceiling.maxZ) / 2;

    const leftX = roomCenterPos.x - halfInterior;
    const rightX = roomCenterPos.x + halfInterior;
    const frontZ = roomCenterPos.z + halfInterior;
    const backZ = roomCenterPos.z - halfInterior;

    const spawned: mod.SpatialObject[] = [];

    function SpawnObject(
      rtc: mod.RuntimeSpawn_Common,
      pos: V3,
      rot: V3,
      scale?: { uniformScale?: number; nonUniformScale?: V3 },
    ): mod.SpatialObject {
      if (scale?.nonUniformScale) {
        return mod.SpawnObject(
          rtc,
          mod.CreateVector(pos.x, pos.y, pos.z),
          mod.CreateVector(rot.x, rot.y, rot.z),
          mod.CreateVector(
            scale.nonUniformScale.x,
            scale.nonUniformScale.y,
            scale.nonUniformScale.z,
          ),
        );
      }

      if (scale?.uniformScale !== undefined) {
        return mod.SpawnObject(
          rtc,
          mod.CreateVector(pos.x, pos.y, pos.z),
          mod.CreateVector(rot.x, rot.y, rot.z),
          mod.CreateVector(
            scale.uniformScale,
            scale.uniformScale,
            scale.uniformScale,
          ),
        );
      }

      return mod.SpawnObject(
        rtc,
        mod.CreateVector(pos.x, pos.y, pos.z),
        mod.CreateVector(rot.x, rot.y, rot.z),
      );
    }

    const walls = [
      {
        pos: V3.Create(
          leftX - room.wallOverlap,
          roomCenterPos.y,
          frontZ + room.wallFaceOffsetZ,
        ),
        rot: V3.Create(0, 0, 0),
      },
      {
        pos: V3.Create(
          rightX + room.wallOverlap,
          roomCenterPos.y,
          backZ - room.wallFaceOffsetZ,
        ),
        rot: V3.Create(0, Math.PI, 0),
      },
      {
        pos: V3.Create(
          leftX - room.wallFaceOffsetX,
          roomCenterPos.y,
          frontZ + room.wallOverlap,
        ),
        rot: V3.Create(0, Math.PI / 2, 0),
      },
      {
        pos: V3.Create(
          rightX + room.wallFaceOffsetX,
          roomCenterPos.y,
          backZ - room.wallOverlap,
        ),
        rot: V3.Create(0, -Math.PI / 2, 0),
      },
    ];

    for (const wall of walls) {
      spawned.push(
        SpawnObject(rtc.FiringRange_Wall_2048_01, wall.pos, wall.rot),
      );
    }

    spawned.push(
      SpawnObject(
        rtc.FiringRange_Floor_A,
        V3.Create(
          roomCenterPos.x - floorCenterLocalX * floorUniformScale,
          roomCenterPos.y - room.floor.maxY * floorUniformScale,
          roomCenterPos.z - floorCenterLocalZ * floorUniformScale,
        ),
        V3.Create(0, 0, 0),
        { uniformScale: floorUniformScale },
      ),
    );

    spawned.push(
      SpawnObject(
        rtc.FiringRange_Ceiling_02,
        V3.Create(
          roomCenterPos.x - ceilingCenterLocalX * ceilingUniformScale,
          roomCenterPos.y -
            room.ceiling.minY * (ceilingUniformScale + 1) +
            room.wallHeight,
          roomCenterPos.z - ceilingCenterLocalZ * ceilingUniformScale,
        ),
        V3.Create(0, 0, 0),
        {
          nonUniformScale: V3.Create(
            ceilingUniformScale,
            ceilingUniformScale + 1,
            ceilingUniformScale,
          ),
        },
      ),
    );

    _directorControlRoomSpawnedObjects = spawned;

    return spawned;
  }

  function UnspawnDirectorControlRoom(): void {
    for (const obj of _directorControlRoomSpawnedObjects) {
      mod.UnspawnObject(obj);
    }
    _directorControlRoomSpawnedObjects = [];
  }

  /************************
   * Player Class
   *************************/

  class Player {
    private static readonly registry: { [playerId: number]: Player } = {};
    private static assignedDirectorPlayerId: number | null = null;

    public readonly playerId: number;
    public playerObject: mod.Player;
    public isDirector: boolean;
    public enteredDirectorCode: string;
    public ui: PlayerUI;
    public directorState: DirectorState | null;

    private constructor(playerObject: mod.Player, playerId: number) {
      this.playerId = playerId;
      this.playerObject = playerObject;
      this.isDirector = false;
      this.enteredDirectorCode = "";
      this.directorState = null;
      this.ui = {
        targetSelectionUI: {},
        directorCodeEntryUI: {},
        directorMenuUI: {},
        pathCameraSetupUI: {
          pathMoveTipShown: false,
        },
        playerPresetCameraUI: {},
      };
    }

    public static GetId(player: mod.Player): number | null {
      if (!mod.IsPlayerValid(player)) return null;
      return mod.GetObjId(player);
    }

    public static Get(player: mod.Player): Player | null {
      const pid = Player.GetId(player);

      if (pid === null) {
        return null;
      }

      const existing = Player.registry[pid] ?? null;
      if (existing) {
        existing.playerObject = player;
      }

      return existing;
    }

    public static GetOrCreate(player: mod.Player): Player | null {
      const pid = Player.GetId(player);
      if (pid === null) return null;

      const existing = Player.registry[pid] ?? null;
      if (existing) {
        existing.playerObject = player;
        return existing;
      }

      const created = new Player(player, pid);
      Player.registry[pid] = created;
      return created;
    }

    public static GetById(playerId: number): Player | null {
      return Player.registry[playerId] ?? null;
    }

    public static RemoveById(playerId: number): void {
      const existing = Player.registry[playerId];
      if (!existing) return;

      if (Player.assignedDirectorPlayerId === playerId) {
        Player.assignedDirectorPlayerId = null;
      }

      delete Player.registry[playerId];
    }

    public static HasAssignedDirector(): boolean {
      return Player.assignedDirectorPlayerId !== null;
    }

    public static GetAssignedDirectorPlayerId(): number | null {
      return Player.assignedDirectorPlayerId;
    }

    public static GetDirectorPlayerObject(): mod.Player | null {
      const directorId = Player.GetAssignedDirectorPlayerId();
      if (directorId === null) return null;
      return Player.GetById(directorId)?.playerObject ?? null;
    }

    public static GetStateBool(
      player: mod.Player,
      state: mod.SoldierStateBool,
    ): boolean {
      if (!mod.IsPlayerValid(player)) return false;
      return mod.GetSoldierState(player, state);
    }

    public static GetStateVector(
      player: mod.Player,
      state: mod.SoldierStateVector,
    ): V3 {
      if (!mod.IsPlayerValid(player)) return V3.Zero();
      return Vector.ToV3(mod.GetSoldierState(player, state));
    }

    public static GetIsDirector(player: mod.Player): boolean {
      const ps = Player.Get(player);
      return ps ? ps.isDirector : false;
    }

    public static AssignAsDirector(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (!ps) return;

      const assignedId = Player.assignedDirectorPlayerId;
      if (assignedId !== null && assignedId !== ps.playerId) {
        PCT_ErrorLogger.New(
          Player.AssignAsDirector.name,
          "Director is already assigned.",
          3,
        );
        return;
      }

      ps.isDirector = true;

      Player.assignedDirectorPlayerId = ps.playerId;
      const msgLabel = "PCT_DIRECTOR_ASSIGNED";

      ps.directorState = {
        currentStatus: DirectorStateType.Idle,
        pathCameraInteractPoint: null,
        actionState: {
          isCrouching: Player.IsCrouching(player),
          isFiring: Player.IsFiring(player),
          isAiming: Player.IsAiming(player),
          isProne: Player.IsProne(player),
          isJumping: Player.IsJumping(player),
          isInteracting: Player.IsInteracting(player),
          isAimingPortalGadget: false,
          isFiringPortalGadget: false,
          isPortalLaserActive: true,
        },
      };

      Player.SetIncomingDamageFactor(player, 0);

      mod.DisplayHighlightedWorldLogMessage(mod.Message(msgLabel, player));
    }

    public static UnassignAsDirector(pid: number): void {
      const ps = Player.GetById(pid);
      if (!ps) return;

      const wasAssignedDirector = Player.assignedDirectorPlayerId === pid;
      const player = ps.playerObject;

      if (mod.IsPlayerValid(player)) {
        Player.SetIncomingDamageFactor(player, 100);
      }

      ps.isDirector = false;
      ps.directorState = null;
      ps.enteredDirectorCode = "";

      if (wasAssignedDirector) {
        Player.assignedDirectorPlayerId = null;

        if (mod.IsPlayerValid(player)) {
          mod.DisplayHighlightedWorldLogMessage(
            mod.Message("PCT_DIRECTOR_UNASSIGNED", player),
          );
        }
      }
    }

    public static GetDirectorCurrentStatus(
      player: mod.Player,
    ): DirectorStateType | null {
      if (!Player.GetIsDirector(player)) return null;

      const ps = Player.Get(player);
      if (!ps || !ps.directorState) return null;
      return ps.directorState.currentStatus;
    }

    public static SetDirectorCurrentStatus(
      player: mod.Player,
      state: DirectorStateType,
    ): void {
      if (!Player.GetIsDirector(player)) return;

      const ps = Player.Get(player);
      if (!ps || !ps.directorState) return;

      ps.directorState.currentStatus = state;
    }

    /**
     * @param factor between 0 and 100, where 0 means no damage taken and 100 means normal damage taken
     */
    public static SetIncomingDamageFactor(
      player: mod.Player,
      factor: number,
    ): void {
      if (!mod.IsPlayerValid(player)) return;
      mod.SetPlayerIncomingDamageFactor(player, factor);
    }

    public static IsAI(player: mod.Player): boolean {
      return Player.GetStateBool(player, mod.SoldierStateBool.IsAISoldier);
    }

    public static IsAlive(player: mod.Player): boolean {
      return Player.GetStateBool(player, mod.SoldierStateBool.IsAlive);
    }

    public static IsDead(player: mod.Player): boolean {
      return Player.GetStateBool(player, mod.SoldierStateBool.IsDead);
    }

    public static IsManDown(player: mod.Player): boolean {
      return Player.GetStateBool(player, mod.SoldierStateBool.IsManDown);
    }

    public static IsDeployed(player: mod.Player): boolean {
      return (
        Player.IsAlive(player) &&
        !Player.IsDead(player) &&
        !Player.IsManDown(player)
      );
    }

    public static IsInWater(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsInWater)
      );
    }

    public static IsInVehicle(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) && mod.GetPlayerVehicleSeat(player) !== -1
      );
    }

    public static GetPosition(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetStateVector(player, mod.SoldierStateVector.GetPosition)
        : V3.Zero();
    }

    public static GetEyePosition(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetStateVector(player, mod.SoldierStateVector.EyePosition)
        : V3.Zero();
    }

    public static GetFacingDirection(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetStateVector(
            player,
            mod.SoldierStateVector.GetFacingDirection,
          )
        : V3.Zero();
    }

    public static GetLinearVelocity(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetStateVector(
            player,
            mod.SoldierStateVector.GetLinearVelocity,
          )
        : V3.Zero();
    }

    public static IsJumping(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsJumping)
      );
    }

    public static IsCrouching(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsCrouching)
      );
    }

    public static IsSprinting(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsSprinting)
      );
    }

    public static IsProne(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsProne)
      );
    }

    public static IsFiring(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsFiring)
      );
    }

    public static IsAiming(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsZooming)
      );
    }

    public static IsInteracting(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetStateBool(player, mod.SoldierStateBool.IsInteracting)
      );
    }

    public static RemoveAllEquipment(player: mod.Player): void {
      if (!Player.IsDeployed(player)) return;

      mod.RemoveEquipment(player, mod.InventorySlots.Callins);
      mod.RemoveEquipment(player, mod.InventorySlots.ClassGadget);
      mod.RemoveEquipment(player, mod.InventorySlots.GadgetOne);
      mod.RemoveEquipment(player, mod.InventorySlots.GadgetTwo);
      mod.RemoveEquipment(player, mod.InventorySlots.MeleeWeapon);
      mod.RemoveEquipment(player, mod.InventorySlots.PrimaryWeapon);
      mod.RemoveEquipment(player, mod.InventorySlots.SecondaryWeapon);
      mod.RemoveEquipment(player, mod.InventorySlots.Throwable);
    }

    public static GivePistolSecondary(player: mod.Player): void {
      if (!Player.IsDeployed(player)) return;
      Player.RemoveAllEquipment(player);

      mod.AddEquipment(
        player,
        mod.Weapons.Sidearm_ES_57,
        mod.InventorySlots.SecondaryWeapon,
      );
      mod.ForceSwitchInventory(player, mod.InventorySlots.SecondaryWeapon);
    }

    public static GivePortalGadget(player: mod.Player): void {
      if (!Player.IsDeployed(player)) return;
      Player.RemoveAllEquipment(player);

      mod.AddEquipment(
        player,
        mod.Gadgets.Misc_PortalGadget,
        mod.InventorySlots.GadgetOne,
      );
      mod.AddEquipment(
        player,
        mod.Weapons.Sidearm_ES_57,
        mod.InventorySlots.SecondaryWeapon,
      );
      mod.ForceSwitchInventory(player, mod.InventorySlots.GadgetOne);
    }

    public static RemovePortalGadget(player: mod.Player): void {
      if (!Player.IsDeployed(player)) return;
      mod.RemoveEquipment(player, mod.Gadgets.Misc_PortalGadget);
    }

    public static GetAimedPathPoint(
      player: mod.Player,
      maxAngleDeg = 4,
      maxDistance = 200,
    ): PathPoint | null {
      if (!mod.IsPlayerValid(player)) return null;

      const eyePos = Player.GetEyePosition(player);
      const facing = V3.Normalize(Player.GetFacingDirection(player));

      const maxAngleRad = (maxAngleDeg * Math.PI) / 180;
      const minDot = Math.cos(maxAngleRad);

      let bestPoint: PathPoint | null = null;
      let bestDot = -1;
      let bestDist = Number.MAX_VALUE;

      for (const p of _pathState.points.concat(_pathState.menuPoints)) {
        const toPoint = V3.Sub(p.pos, eyePos);
        const dist = V3.Length(toPoint);

        if (dist <= 0.001 || dist > maxDistance) {
          continue;
        }

        const dirToPoint = V3.Normalize(toPoint);
        const dot = V3.Dot(facing, dirToPoint);

        if (dot < minDot) {
          continue;
        }

        if (
          dot > bestDot ||
          (Math.abs(dot - bestDot) < 0.0001 && dist < bestDist)
        ) {
          bestDot = dot;
          bestDist = dist;
          bestPoint = p;
        }
      }

      return bestPoint;
    }
  }

  async function InitializeDirectorChecks(
    dirPlayer: mod.Player,
  ): Promise<void> {
    const ps = Player.GetOrCreate(dirPlayer);
    if (!ps || !ps.directorState) return;

    const WI = PCT_WIM.init();

    const pointPositioningSoundIncreasing = mod.SpawnObject(
      rtc.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTick_IsFriendly_SimpleLoop2D,
      Vector.Zero(),
      Vector.Zero(),
    ) as mod.SFX;
    const pointPositioningSoundDecreasing = mod.SpawnObject(
      rtc.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTick_IsEnemy_SimpleLoop2D,
      Vector.Zero(),
      Vector.Zero(),
    ) as mod.SFX;
    let pointPositioningSoundPlaying = false;
    let pointCreationDistanceIncreasing = false;

    let uiRefreshElapsed = 0;
    const uiRefreshInterval = 1;

    while (mod.IsPlayerValid(dirPlayer) && Player.GetIsDirector(dirPlayer)) {
      if (!Player.IsDeployed(dirPlayer)) {
        ps.directorState.actionState.isJumping = false;
        ps.directorState.actionState.isFiring = false;
        ps.directorState.actionState.isAiming = false;
        ps.directorState.actionState.isCrouching = false;
        ps.directorState.actionState.isProne = false;
        await mod.Wait(1);
        continue;
      }

      await mod.Wait(DT);
      uiRefreshElapsed += DT;

      const isJumping = Player.IsJumping(dirPlayer);
      const isFiring = Player.IsFiring(dirPlayer);
      const isCrouching = Player.IsCrouching(dirPlayer);
      const isAiming = Player.IsAiming(dirPlayer);
      const isProne = Player.IsProne(dirPlayer);

      if (
        _cameraState.type === CameraType.Free //&&
        //_cameraState.freeCamIsTracking
      ) {
        if (isJumping && ps.directorState.actionState.isJumping === false) {
          ps.directorState.actionState.isJumping = true;
          PlayerTracking.InitNextTarget(dirPlayer);
        }

        TargetSelectionUI.Refresh(dirPlayer);
      } else if (_cameraState.type === CameraType.Path) {
        // Icon Aim
        const playerEyePos = Player.GetEyePosition(dirPlayer);
        const playerFacing = Player.GetFacingDirection(dirPlayer);
        const aimedPoint = Player.GetAimedPathPoint(dirPlayer);

        if (
          isAiming &&
          ps.directorState.actionState.isAiming === false &&
          _pathState.isMoving
        ) {
          ps.directorState.actionState.isAiming = true;
          pointCreationDistanceIncreasing = !pointCreationDistanceIncreasing;
        }

        if (isAiming && _pathState.isMoving) {
          const minDistance = 1;
          const maxDistance = 100;
          const step = pointCreationDistanceIncreasing ? 1 : -1;

          if (!pointPositioningSoundPlaying) {
            mod.PlaySound(
              pointCreationDistanceIncreasing
                ? pointPositioningSoundIncreasing
                : pointPositioningSoundDecreasing,
              1,
              dirPlayer,
            );
            pointPositioningSoundPlaying = true;
          }

          _pathState.pointCreationDistance = Math.max(
            minDistance,
            Math.min(maxDistance, _pathState.pointCreationDistance + step),
          );

          if (
            _pathState.pointCreationDistance === minDistance ||
            _pathState.pointCreationDistance === maxDistance
          ) {
            if (pointPositioningSoundPlaying) {
              mod.StopSound(pointPositioningSoundIncreasing);
              mod.StopSound(pointPositioningSoundDecreasing);
              pointPositioningSoundPlaying = false;
            }
          }

          if (uiRefreshElapsed >= uiRefreshInterval) {
            PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
            uiRefreshElapsed = 0;
          }
        }

        if (_pathState.inSelection && aimedPoint) {
          for (const p of _pathState.menuPoints) {
            if (aimedPoint && p.uniqueId === aimedPoint.uniqueId) {
              WI.setColor(
                p.worldIconName,
                _config.pathPointConfig.menuHoverColor,
              );
            } else {
              WI.setColor(
                p.worldIconName,
                _config.pathPointConfig.menuDefaultColor,
              );
            }
          }
        } else if (!_pathState.locked) {
          for (const p of _pathState.points) {
            if (aimedPoint && p.uniqueId === aimedPoint.uniqueId) {
              WI.setColor(p.worldIconName, _config.pathPointConfig.hoverColor);
              WI.setIcon(p.worldIconName, _config.pathPointConfig.hoverIcon);
            } else {
              WI.setColor(
                p.worldIconName,
                _config.pathPointConfig.defaultColor,
              );
              WI.setIcon(p.worldIconName, _config.pathPointConfig.defaultIcon);
            }
          }
        }

        //Icon Fire Action
        if (
          isFiring &&
          ps.directorState.actionState.isFiring === false &&
          (isCrouching || _pathState.isMoving) //&&
          //PLAYERS[pid].state.isCrouching === false
        ) {
          ps.directorState.actionState.isFiring = true;
          ps.directorState.actionState.isCrouching = true;

          if (_pathState.isMoving) {
            _pathState.isMoving = false;
            continue;
          }

          if (aimedPoint) {
            if (aimedPoint.selectionType === PointSelectionType.MenuDelete) {
              _pathState.locked = true;
              const pointToDelete = aimedPoint.parentId;
              if (!pointToDelete) continue;
              Path.RemovePoint(dirPlayer, pointToDelete);
              _pathState.locked = false;
            } else if (
              aimedPoint.selectionType === PointSelectionType.MenuMove
            ) {
              _pathState.locked = true;
              const pointToMoveId = aimedPoint.parentId;
              if (!pointToMoveId) continue;
              _pathState.isMoving = true;
              Path.MovePoint(dirPlayer, { uniqueId: pointToMoveId });
              _pathState.locked = false;
            } else {
              if (_pathState.inSelection) {
                Path.ClearPointsSelection(dirPlayer);
                continue;
              }

              if (_pathState.locked) continue;

              Path.SelectPoint(aimedPoint);
            }
          } else {
            if (_pathState.inSelection) {
              Path.ClearPointsSelection(dirPlayer);
              continue;
            }

            if (_pathState.locked) continue;

            _pathState.locked = true;
            _pathState.previousAimedPoint = null;

            const forwardPoint = V3.Add(
              playerEyePos,
              V3.Scale(playerFacing, _pathState.pointCreationDistance),
            );
            const newIconName = Path.CreatePointIcon(forwardPoint);

            const newPoint = Path.AddPoint(
              dirPlayer,
              forwardPoint,
              newIconName,
            );
            _pathState.locked = false;

            _pathState.isMoving = true;
            void Path.MovePoint(dirPlayer, { object: newPoint });
          }

          SyncTrackedCamSettingsInfo();
          PathCameraSetupUI.RefreshCameraControlMenu(dirPlayer);
        }

        if (
          isProne &&
          ps.directorState.actionState.isProne === false &&
          isFiring &&
          ps.directorState.actionState.isFiring === false
        ) {
          ps.directorState.actionState.isProne = true;
          ps.directorState.actionState.isFiring = true;

          if (!_cameraState.isRunning) {
            const points = _pathState.points.map((p) => p.pos);
            StartCamera(dirPlayer, points);

            SpawnPathCameraInteractPoint(dirPlayer);
          }
        }
      }

      if (!isFiring && ps.directorState.actionState.isFiring === true) {
        ps.directorState.actionState.isFiring = false;
      }

      if (!isAiming && ps.directorState.actionState.isAiming === true) {
        ps.directorState.actionState.isAiming = false;
        if (pointPositioningSoundPlaying) {
          mod.StopSound(pointPositioningSoundIncreasing);
          mod.StopSound(pointPositioningSoundDecreasing);
          pointPositioningSoundPlaying = false;
        }
        PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
      }

      if (!isCrouching && ps.directorState.actionState.isCrouching === true) {
        ps.directorState.actionState.isCrouching = false;
      }

      if (!isProne && ps.directorState.actionState.isProne === true) {
        ps.directorState.actionState.isProne = false;
      }

      if (!isJumping && ps.directorState.actionState.isJumping === true) {
        ps.directorState.actionState.isJumping = false;
      }
    }
  }

  namespace PlayerTracking {
    export function InitNextTarget(dirPlayer: mod.Player): void {
      if (_cameraState.isRunning && _cameraState.type === CameraType.Free) {
        const currentTarget = _cameraState.target.playerObject;

        if (_cameraState.freeCamIsTracking) {
          if (CurrentTargetIsValid()) {
            _cameraState.target.previousTargetPlayerObject =
              _cameraState.target.playerObject;
          }

          FindNextTarget(currentTarget);

          _cameraState.freeCamIsFocusing = true;
          _cameraState.freeCamIsDefocusing = false;
        } else {
          let resumedPreviousTarget = false;

          if (
            PreviousTargetIsValid() &&
            Player.IsDeployed(_cameraState.target.previousTargetPlayerObject!)
          ) {
            _cameraState.target.playerObject =
              _cameraState.target.previousTargetPlayerObject;
            resumedPreviousTarget = true;
          } else {
            FindNextTarget(currentTarget);

            resumedPreviousTarget = CurrentTargetIsValid();
          }

          if (resumedPreviousTarget) {
            _cameraState.freeCamIsTracking = true;
            _cameraState.freeCamIsFocusing = true;
            _cameraState.freeCamIsDefocusing = false;
          }
        }

        TargetSelectionUI.Refresh(dirPlayer);
      }
    }

    export function FindNextTarget(currentTarget: mod.Player | null): void {
      FindTargetFrom(currentTarget, 1);
    }

    export function FindPreviousTarget(currentTarget: mod.Player | null): void {
      FindTargetFrom(currentTarget, -1);
    }

    export function GetFirstDeployedNonDirectorPlayer(): mod.Player | null {
      const allPlayers = mod.AllPlayers();
      const allPlayersCount = mod.CountOf(allPlayers);
      const director = Player.GetDirectorPlayerObject();

      for (let i = 0; i < allPlayersCount; i++) {
        const player = mod.ValueInArray(allPlayers, i) as mod.Player | null;

        if (!player) continue;
        if (!mod.IsPlayerValid(player)) continue;
        if (director && mod.Equals(player, director)) continue;
        if (!Player.IsDeployed(player)) continue;

        return player;
      }

      return null;
    }

    function FindTargetFrom(
      currentTarget: mod.Player | null,
      direction: number,
    ): void {
      const allPlayers = mod.AllPlayers();
      const allPlayersCount = mod.CountOf(allPlayers);
      if (allPlayersCount <= 0) return;

      const stepDirection = direction >= 0 ? 1 : -1;

      if (currentTarget === null || !mod.IsPlayerValid(currentTarget)) {
        _cameraState.target.playerObject = GetFirstDeployedNonDirectorPlayer();
        SyncTargetPlayerInfo();
        return;
      }

      const currentIndex = GetTargetPlayerIndex(currentTarget);
      const startIndex = currentIndex < 0 ? 0 : currentIndex;

      for (let step = 1; step <= allPlayersCount; step++) {
        const index =
          (((startIndex + step * stepDirection) % allPlayersCount) +
            allPlayersCount) %
          allPlayersCount;

        const possibleTarget = mod.ValueInArray(
          allPlayers,
          index,
        ) as mod.Player | null;

        if (!possibleTarget) continue;
        //if (mod.Equals(Player.GetDirectorPlayerObject(), possibleTarget)) TODO: RE-INSERT
        //  continue;
        if (!mod.IsPlayerValid(possibleTarget)) continue;
        if (!Player.IsDeployed(possibleTarget)) continue;
        if (mod.Equals(possibleTarget, currentTarget)) continue;

        _cameraState.target.playerObject = possibleTarget;
        SyncTargetPlayerInfo();
        return;
      }
    }

    export function SyncTargetPlayerInfo(): void {
      if (!CurrentTargetIsValid()) {
        _trackedCamSettingsInfo.cameraTarget = null;
        return;
      }
      _trackedCamSettingsInfo.cameraTarget = _cameraState.target.playerObject;
    }

    export function GetTargetPlayerIndex(targetPlayer: mod.Player): number {
      const allPlayers = mod.AllPlayers();
      const count = mod.CountOf(allPlayers);

      for (let i = 0; i < count; i++) {
        const currentPlayer = mod.ValueInArray(allPlayers, i) as mod.Player;

        if (mod.Equals(currentPlayer, targetPlayer)) {
          return i;
        }
      }

      return -1;
    }

    export function GetDeployedPlayersCount(): number {
      let count = 0;
      const allPlayers = mod.AllPlayers();
      const allPlayersCount = mod.CountOf(allPlayers);
      const dirPlayer = Player.GetDirectorPlayerObject();

      for (let i = 0; i < allPlayersCount; i++) {
        const p = mod.ValueInArray(allPlayers, i) as mod.Player | null;
        if (!p || !mod.IsPlayerValid(p)) continue;
        if (dirPlayer && mod.Equals(p, dirPlayer)) continue;
        if (!Player.IsDeployed(p)) continue;

        count++;
      }
      return count;
    }

    function GetTargetPosition(player: mod.Player | null): V3 {
      if (!player || !mod.IsPlayerValid(player) || !Player.IsDeployed(player)) {
        return V3.Zero();
      }

      /*try {
        const seat = mod.GetPlayerVehicleSeat(player);

        if (seat !== -1) {
          const vehicle = mod.GetVehicleFromPlayer(player);

          return Vector.ToV3(
            mod.GetVehicleState(
              vehicle,
              mod.VehicleStateVector.VehiclePosition,
            ),
          );
        }
      } catch (error: unknown) { void error; }*/

      return Player.GetEyePosition(player);
    }

    function GetFacingDirection(player: mod.Player): V3 {
      if (!Player.IsDeployed(player)) {
        return V3.Zero();
      }

      /*if (mod.GetPlayerVehicleSeat(player) !== -1) {
        return Vector.ToV3(
          mod.GetVehicleState(
            mod.GetVehicleFromPlayer(player),
            mod.VehicleStateVector.FacingDirection,
          ),
        );
      }*/

      return Player.GetFacingDirection(player);
    }

    export function GetPosition(
      player: mod.Player,
      state: TrackedPlayerState,
    ): { effectivePos: V3 | null; isZeroVec: boolean } | null {
      if (!CurrentTargetIsValid()) return null;

      const trackedPlayerPos = GetTargetPosition(
        _cameraState.target.playerObject,
      );

      const isZeroVec =
        trackedPlayerPos.x === 0 &&
        trackedPlayerPos.y === 0 &&
        trackedPlayerPos.z === 0;

      const effectivePos = isZeroVec
        ? state.previousTrackedPlayerPos
        : trackedPlayerPos;

      if (state.previousTrackedPlayerPosWasZero !== isZeroVec) {
        //PCT_RefreshPlayerUI(player);
      }

      state.previousTrackedPlayerPosWasZero = isZeroVec;

      if (!isZeroVec) {
        state.previousTrackedPlayerPos = trackedPlayerPos;
      }

      return { effectivePos, isZeroVec };
    }

    export function GetFollowTarget(
      trackedPlayerPos: V3,
      trackedPlayer: mod.Player,
      backDistance: number,
      heightOffset: number,
      pitchOffsetRad: number,
      minPitch: number,
      maxPitch: number,
    ): { pos: V3; rot: V3 } {
      const facing = GetFacingDirection(trackedPlayer);
      const flatFacing = V3.Normalize(V3.Create(facing.x, 0, facing.z));

      const pos = V3.Create(
        trackedPlayerPos.x - flatFacing.x * backDistance,
        trackedPlayerPos.y + heightOffset,
        trackedPlayerPos.z - flatFacing.z * backDistance,
      );

      const yaw = YawTowards(pos, trackedPlayerPos);
      const pitch = Clamp(
        PitchTowards(pos, trackedPlayerPos) - pitchOffsetRad,
        minPitch,
        maxPitch,
      );

      return {
        pos,
        rot: V3.Create(pitch, yaw, 0),
      };
    }

    export function GetPositionWithSmoothedY(
      player: mod.Player,
      state: FreeCamTrackedPlayerState,
      ySmoothing: number,
    ): V3 | null {
      const tracked = GetPosition(player, state);
      if (!tracked?.effectivePos) return null;

      state.smoothedTrackedPlayerY =
        state.smoothedTrackedPlayerY === null || tracked.isZeroVec
          ? tracked.effectivePos.y
          : V3.Lerp(
              state.smoothedTrackedPlayerY,
              tracked.effectivePos.y,
              ySmoothing,
            );

      return V3.Create(
        tracked.effectivePos.x,
        state.smoothedTrackedPlayerY,
        tracked.effectivePos.z,
      );
    }

    export function CurrentTargetIsValid(): boolean {
      return (
        _cameraState.target.type === CameraTargetType.Player &&
        _cameraState.target.playerObject !== null &&
        mod.IsPlayerValid(_cameraState.target.playerObject)
      );
    }

    export function PreviousTargetIsValid(): boolean {
      return (
        _cameraState.target.type === CameraTargetType.Player &&
        _cameraState.target.previousTargetPlayerObject !== null &&
        mod.IsPlayerValid(_cameraState.target.previousTargetPlayerObject)
      );
    }
  }

  /************************
   * Math Helpers
   *************************/

  function YawTowards(from: V3, to: V3): number {
    const dx = to.x - from.x;
    const dz = to.z - from.z;

    return Math.atan2(dx, dz); // radians
  }

  function PitchTowards(from: V3, to: V3): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;

    const horizontalDist = Math.max(Math.sqrt(dx * dx + dz * dz), 0.0001);
    return -Math.atan2(dy, horizontalDist);
  }

  function Clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function DegToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  function NormalizeAngleRad(angle: number): number {
    let a = angle;
    const twoPi = Math.PI * 2;

    while (a > Math.PI) a -= twoPi;
    while (a < -Math.PI) a += twoPi;

    return a;
  }

  function LerpAngleRad(a: number, b: number, t: number): number {
    const delta = NormalizeAngleRad(b - a);
    return NormalizeAngleRad(a + delta * t);
  }

  function GetQuadraticBezierPoint(p0: V3, p1: V3, p2: V3, t: number): V3 {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    return V3.Create(
      uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
      uu * p0.y + 2 * u * t * p1.y + tt * p2.y,
      uu * p0.z + 2 * u * t * p1.z + tt * p2.z,
    );
  }

  /************************
   * Path Helpers
   *************************/

  const Path = {
    AddPoint(dirPlayer: mod.Player, pos: V3, worldIconName: string): PathPoint {
      const uniqueId = Math.floor(Math.random() * 1000000);

      _pathState.points.push({
        uniqueId,
        orderId: _pathState.points.length,
        pos: pos,
        playerPosY: Player.GetPosition(dirPlayer).y,
        worldIconName,
        selectionType: PointSelectionType.PathPoint,
      });

      Path.ResetPointsOrderIds();

      const orderId = _pathState.points[_pathState.points.length - 1].orderId;

      console.log(
        `Pathpoint Added (orderId: ${orderId}) at (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`,
      );

      PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);

      return _pathState.points[
        _pathState.points.findIndex((p) => p.uniqueId === uniqueId)
      ];
    },

    CreatePointIcon(newPointPos: V3): string {
      for (let i = 0; i < _pathState.points.length; i++) {
        const p = _pathState.points[i];
        p.orderId = i + 1;
        PCT_WIM.init().createIcon(p.worldIconName, V3.ToVector(p.pos), {
          textVisible: true,
          text: mod.Message("PCT_{}", p.orderId),
          icon: _config.pathPointConfig.defaultIcon,
          iconVisible: true,
          color: _config.pathPointConfig.defaultColor,
        });
      }

      const newIconName = `path_point_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const newIconOrderId = _pathState.points.length + 1;

      PCT_WIM.init().createIcon(newIconName, V3.ToVector(newPointPos), {
        textVisible: true,
        text: mod.Message("PCT_{}", newIconOrderId),
        icon: _config.pathPointConfig.hoverIcon,
        iconVisible: true,
        color: _config.pathPointConfig.hoverColor,
      });

      return newIconName;
    },

    ResetPointsOrderIds() {
      for (let i = 0; i < _pathState.points.length; i++) {
        const orderId = i + 1;
        _pathState.points[i].orderId = orderId;
        if (PCT_WIM.init().getIconExists(_pathState.points[i].worldIconName)) {
          PCT_WIM.init().setText(
            _pathState.points[i].worldIconName,
            mod.Message("PCT_{}", orderId),
          );
        }
      }
    },

    SelectPoint(pathPoint: PathPoint) {
      _pathState.locked = true;
      Path.SetPointsInSelection(true);

      const currentDirectionPlayerObject = Player.GetDirectorPlayerObject();
      if (currentDirectionPlayerObject) {
        PathCameraSetupUI.RefreshPathControlMenu(currentDirectionPlayerObject);
      }

      const WI = PCT_WIM.init();

      if (WI.getIconExists(pathPoint.worldIconName)) {
        WI.setColor(
          pathPoint.worldIconName,
          _config.pathPointConfig.selectedColor,
        );

        const menuWorldIcons = [
          {
            name: pathPoint.worldIconName + "_deleteWI",
            pos: {
              x: pathPoint.pos.x,
              y: pathPoint.pos.y - 1,
              z: pathPoint.pos.z,
            },
            msg: mod.Message("PCT_DELETE_POINT"),
            type: PointSelectionType.MenuDelete,
          },
          {
            name: pathPoint.worldIconName + "_moveWI",
            pos: {
              x: pathPoint.pos.x,
              y: pathPoint.pos.y + 0.5,
              z: pathPoint.pos.z,
            },
            msg: mod.Message("PCT_MOVE_POINT"),
            type: PointSelectionType.MenuMove,
          },
        ];

        for (const menuIcon of menuWorldIcons) {
          WI.createIcon(menuIcon.name, V3.ToVector(menuIcon.pos), {
            iconVisible: false,
            textVisible: true,
            text: menuIcon.msg,
            color: _config.pathPointConfig.defaultColor,
          });

          _pathState.menuPoints.push({
            uniqueId: pathPoint.uniqueId + Math.floor(Math.random() * 1000000),
            orderId: 0,
            pos: menuIcon.pos,
            playerPosY: pathPoint.playerPosY,
            worldIconName: menuIcon.name,
            selectionType: menuIcon.type,
            parentId: pathPoint.uniqueId,
          });
        }
      }

      _pathState.previousAimedPoint = pathPoint;
    },

    RemovePoint(dirPlayer: mod.Player, uniqueId: number) {
      Path.ClearPointsSelection(dirPlayer);

      const index = _pathState.points.findIndex((p) => p.uniqueId === uniqueId);

      PCT_WIM.init().deleteIcon(_pathState.points[index].worldIconName);

      if (index !== -1) {
        const pos = _pathState.points[index].pos;
        const orderId = _pathState.points[index].orderId;
        console.log(
          `Pathpoint Removed (orderId: ${orderId}) at (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`,
        );
        _pathState.points.splice(index, 1);
        Path.ResetPointsOrderIds();
      }

      _pathState.previousAimedPoint = null;

      PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
    },

    SetPointsInSelection(enabled: boolean) {
      if (!enabled) {
        _pathState.menuPoints.forEach((menuPoint) => {
          if (PCT_WIM.init().getIconExists(menuPoint.worldIconName)) {
            PCT_WIM.init().deleteIcon(menuPoint.worldIconName);
          }
        });
        _pathState.menuPoints.length = 0;
      }

      _pathState.inSelection = enabled;

      const currentDirectionPlayerObject = Player.GetDirectorPlayerObject();
      if (currentDirectionPlayerObject) {
        PathCameraSetupUI.RefreshPathControlMenu(currentDirectionPlayerObject);
      }
    },

    ClearPointsSelection(dirPlayer: mod.Player) {
      _pathState.previousAimedPoint = null;
      Path.SetPointsInSelection(false);

      SyncTrackedCamSettingsInfo();
      PathCameraSetupUI.RefreshCameraControlMenu(dirPlayer);

      _pathState.locked = false;

      PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
    },

    async MovePoint(
      dirPlayer: mod.Player,
      pathPoint: { object?: PathPoint; uniqueId?: number },
    ) {
      Path.ClearPointsSelection(dirPlayer);

      const point =
        pathPoint.object ??
        _pathState.points.find((p) => p.uniqueId === pathPoint.uniqueId);
      if (!point) {
        _pathState.isMoving = false;
        PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
        return;
      }

      const initialFxPos = V3.Create(
        point.pos.x,
        Player.GetPosition(dirPlayer).y,
        point.pos.z,
      );

      const pointFx = await VFX.Spawn(
        rtc.FX_Gadget_DeployableMortar_Target_Area,
        V3.ToVector(initialFxPos),
        true,
        { isContinuous: true },
      );

      PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
      PathCameraSetupUI.InitMovePointTipWindow(dirPlayer);

      while (
        mod.IsPlayerValid(dirPlayer) &&
        Player.IsDeployed(dirPlayer) &&
        _pathState.isMoving === true &&
        _cameraState.type === CameraType.Path
      ) {
        await mod.Wait(DT);

        const eyePos = Player.GetEyePosition(dirPlayer);
        const dirPlayerPos = Player.GetPosition(dirPlayer);
        const facing = V3.Normalize(Player.GetFacingDirection(dirPlayer));
        const newPos = V3.Add(
          eyePos,
          V3.Scale(facing, _pathState.pointCreationDistance),
        );

        point.pos = newPos;
        PCT_WIM.init().setPosition(point.worldIconName, V3.ToVector(newPos));

        mod.MoveVFX(
          pointFx,
          V3.ToVector(V3.Create(newPos.x, dirPlayerPos.y, newPos.z)),
          Vector.Zero(),
        );
      }

      mod.UnspawnObject(pointFx);
      PathCameraSetupUI.HideMovePointTipWindow(dirPlayer);

      mod.SetInventoryMagazineAmmo(
        dirPlayer,
        mod.InventorySlots.SecondaryWeapon,
        99,
      );

      _pathState.isMoving = false;
      _pathState.locked = false;
      PathCameraSetupUI.RefreshPathControlMenu(dirPlayer);
    },

    CalculateLength(pathPoints: PathPoint[]): number {
      let length = 0;
      for (let i = 1; i < pathPoints.length; i++) {
        length += V3.DistanceBetween(
          pathPoints[i - 1].pos,
          pathPoints[i].pos,
        ).whole;
      }

      return length;
    },
  };

  /************************
   * Camera Helpers
   *************************/

  function SetCameraTransform(
    cam: mod.FixedCamera,
    pos: V3,
    pitch: number,
    yaw: number,
  ): void {
    mod.SetObjectTransform(
      cam,
      mod.CreateTransform(
        mod.CreateVector(pos.x, pos.y, pos.z),
        mod.CreateVector(pitch, yaw, 0),
      ),
    );
  }

  function GetPointTowards(from: V3, to: V3, distance: number): V3 {
    const dir = V3.Normalize(V3.Sub(to, from));
    return V3.Add(from, V3.Scale(dir, distance));
  }

  /*function GetSegmentDuration(a: V3, b: V3): number {
    const dist = V3.DistanceBetween(a, b, DistanceType.XZ, 2).full;

    return Math.max(dist / _cameraState.speed, 0.05);
  }*/

  function BuildSmoothedCameraPath(route: V3[]): V3[] {
    if (route.length <= 2) return route;

    const smoothPath: V3[] = [];

    smoothPath.push(route[0]);

    for (let i = 1; i < route.length - 1; i++) {
      const prev = route[i - 1];
      const curr = route[i];
      const next = route[i + 1];

      const distPrev = V3.DistanceBetween(prev, curr).full;
      const distNext = V3.DistanceBetween(curr, next).full;

      const trimIn = Math.min(_pathState.cornerRadius, distPrev * 0.35);
      const trimOut = Math.min(_pathState.cornerRadius, distNext * 0.35);

      const curveStart = GetPointTowards(curr, prev, trimIn);
      const curveEnd = GetPointTowards(curr, next, trimOut);

      const last = smoothPath[smoothPath.length - 1];
      if (V3.DistanceBetween(last, curveStart).full > 0.05) {
        smoothPath.push(curveStart);
      }

      for (let s = 1; s <= _config.pathConfig.samplesPerCorner; s++) {
        const t = s / (_config.pathConfig.samplesPerCorner + 1);
        smoothPath.push(GetQuadraticBezierPoint(curveStart, curr, curveEnd, t));
      }

      smoothPath.push(curveEnd);
    }

    return smoothPath;
  }

  function SpawnPathCameraInteractPoint(dirPlayer: mod.Player): void {
    const ps = Player.GetOrCreate(dirPlayer);
    if (!ps || !ps.directorState) return;

    if (ps.directorState.pathCameraInteractPoint) {
      UnspawnPathCameraInteractPoint(dirPlayer);
    }

    ps.directorState.pathCameraInteractPoint = mod.SpawnObject(
      rtc.InteractPoint,
      V3.ToVector(Player.GetEyePosition(dirPlayer)),
      Vector.Zero(),
    ) as mod.InteractPoint;
  }

  function UnspawnPathCameraInteractPoint(dirPlayer: mod.Player): void {
    const ps = Player.GetOrCreate(dirPlayer);
    if (!ps || !ps.directorState) return;

    if (ps.directorState.pathCameraInteractPoint) {
      mod.UnspawnObject(ps.directorState.pathCameraInteractPoint);
      ps.directorState.pathCameraInteractPoint = null;
    }
  }

  function GetCurrentCameraPreset(): CameraPreset {
    const presets = _cameraState.playerPresets.presets;

    if (presets.length === 0) {
      return {
        name: "Default",
        offset: V3.Create(0, 2.2, -8),
        hOffset: 0,
        vOffset: 0,
        pitchOffset: 0,
      };
    }

    const index = Clamp(
      _cameraState.playerPresets.selectedPresetIndex,
      0,
      presets.length - 1,
    );

    return presets[index];
  }

  function AdjustCameraPreset(delta: number): void {
    const presetsCount = _cameraState.playerPresets.presets.length;
    if (presetsCount <= 0) return;

    _cameraState.playerPresets.selectedPresetIndex =
      (((_cameraState.playerPresets.selectedPresetIndex + delta) %
        presetsCount) +
        presetsCount) %
      presetsCount;
  }

  function GetPlayerPresetCameraTransform(
    trackedPlayer: mod.Player,
    preset: CameraPreset,
    minPitch: number,
    maxPitch: number,
    sprintLookAhead: number,
  ): { pos: V3; rot: V3 } | null {
    if (
      !mod.IsPlayerValid(trackedPlayer) ||
      !Player.IsDeployed(trackedPlayer)
    ) {
      return null;
    }

    const eyePos = Player.GetEyePosition(trackedPlayer);
    const facing = Player.GetFacingDirection(trackedPlayer);

    let flatForward = V3.Create(facing.x, 0, facing.z);

    if (V3.Length(flatForward) <= 0.001) {
      flatForward = V3.Create(0, 0, 1);
    } else {
      flatForward = V3.Normalize(flatForward);
    }

    const trackingPos = V3.Add(eyePos, V3.Scale(flatForward, sprintLookAhead));

    const right = V3.Create(flatForward.z, 0, -flatForward.x);

    const offsetWorld = V3.Add(
      V3.Add(
        V3.Scale(right, preset.offset.x),
        V3.Create(0, preset.offset.y, 0),
      ),
      V3.Scale(flatForward, preset.offset.z),
    );

    let camPos = V3.Add(trackingPos, offsetWorld);

    const lookDir = V3.Normalize(V3.Sub(trackingPos, camPos));

    let lateral = V3.Create(lookDir.z, 0, -lookDir.x);

    if (V3.Length(lateral) <= 0.001) {
      lateral = right;
    } else {
      lateral = V3.Normalize(lateral);
    }

    camPos = V3.Add(
      camPos,
      V3.Add(
        V3.Scale(lateral, preset.hOffset),
        V3.Create(0, preset.vOffset, 0),
      ),
    );

    const yaw = YawTowards(camPos, trackingPos);
    const pitchOffsetRad = DegToRad(preset.pitchOffset);
    const pitch = Clamp(
      PitchTowards(camPos, trackingPos) - pitchOffsetRad,
      minPitch,
      maxPitch,
    );

    return {
      pos: camPos,
      rot: V3.Create(pitch, yaw, 0),
    };
  }

  namespace FreeCamCollision {
    type RayState = {
      active: boolean;
      hit: boolean;
      point: V3 | null;
      normal: V3 | null;
      missCount: number;
    };

    const states = new Map<number, RayState>();

    const CAMERA_WALL_PADDING = 0.35;
    const RAY_START_HEIGHT_OFFSET = 1.2;

    function GetState(dirPlayer: mod.Player): RayState {
      const pid = mod.GetObjId(dirPlayer);
      let state = states.get(pid);

      if (!state) {
        state = {
          active: false,
          hit: false,
          point: null,
          normal: null,
          missCount: 0,
        };

        states.set(pid, state);
      }

      return state;
    }

    export function Request(
      dirPlayer: mod.Player,
      trackedPlayerPos: V3,
      desiredCamPos: V3,
    ): void {
      const state = GetState(dirPlayer);

      const rayStart = V3.Create(
        trackedPlayerPos.x,
        trackedPlayerPos.y + RAY_START_HEIGHT_OFFSET,
        trackedPlayerPos.z,
      );

      state.active = true;

      mod.RayCast(dirPlayer, V3.ToVector(rayStart), V3.ToVector(desiredCamPos));
    }

    export function GetCameraOffsetScale(
      trackedPlayerPos: V3,
      desiredCamPos: V3,
      correctedCamPos: V3,
    ): number {
      const desiredDistance = V3.DistanceBetween(
        trackedPlayerPos,
        desiredCamPos,
        DistanceType.XYZ,
      ).full;

      if (desiredDistance <= 0.001) {
        return 0;
      }

      const correctedDistance = V3.DistanceBetween(
        trackedPlayerPos,
        correctedCamPos,
        DistanceType.XYZ,
      ).full;

      return Clamp(correctedDistance / desiredDistance, 0, 1);
    }

    export function CorrectPosition(
      dirPlayer: mod.Player,
      desiredCamPos: V3,
    ): V3 {
      const state = GetState(dirPlayer);

      if (!state.active || !state.hit || !state.point || !state.normal) {
        return desiredCamPos;
      }

      return V3.Add(
        state.point,
        V3.Scale(V3.Normalize(state.normal), CAMERA_WALL_PADDING),
      );
    }

    export function OnHit(
      eventPlayer: mod.Player,
      eventPoint: mod.Vector,
      eventNormal: mod.Vector,
    ): void {
      if (!mod.IsPlayerValid(eventPlayer)) return;

      const state = GetState(eventPlayer);

      state.active = true;
      state.hit = true;
      state.missCount = 0;
      state.point = Vector.ToV3(eventPoint);
      state.normal = Vector.ToV3(eventNormal);
    }

    export function OnMissed(eventPlayer: mod.Player): void {
      if (!mod.IsPlayerValid(eventPlayer)) return;

      const state = GetState(eventPlayer);

      state.active = true;
      state.missCount++;

      if (state.missCount < 3) {
        return;
      }

      state.hit = false;
      state.point = null;
      state.normal = null;
    }

    export function Clear(dirPlayer: mod.Player): void {
      if (!mod.IsPlayerValid(dirPlayer)) return;
      states.delete(mod.GetObjId(dirPlayer));
    }
  }

  /************************
   * Camera Initialization
   *************************/

  async function StartCamera(
    dirPlayer: mod.Player,
    points: V3[],
  ): Promise<void> {
    const ps = Player.GetOrCreate(dirPlayer);
    if (ps === null) return;

    if (_cameraState.type === CameraType.Path) {
      if (points.length === 0) return;

      if (points.length === 1) {
        //await PCT_MoveCamera_Stationary(dirPlayer, points); WORK IN PROGRESS
      } else if (points.length >= 2) {
        PathCameraSetupUI.ShowCameraControlMenu(dirPlayer);
        PathCameraSetupUI.HidePathControlMenu(dirPlayer);

        await StartPathCamera(dirPlayer, points);
      }
    } else if (_cameraState.type === CameraType.Free) {
      mod.EnableInputRestriction(dirPlayer, mod.RestrictedInputs.Prone, true);
      //mod.EnableInputRestriction(dp, mod.RestrictedInputs.CameraPitch, true);
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.CycleFire,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.CyclePrimary,
        true,
      );
      mod.EnableInputRestriction(dirPlayer, mod.RestrictedInputs.Reload, true);
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.SelectMelee,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.SelectThrowable,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.SelectSecondary,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.SelectPrimary,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.SelectOpenGadget,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.FireWeapon,
        true,
      );
      mod.EnableInputRestriction(
        dirPlayer,
        mod.RestrictedInputs.SelectCharacterGadget,
        true,
      );

      await mod.Wait(SD);

      SpawnFreeCamInteractPoint();

      mod.EnableInputRestriction(dirPlayer, mod.RestrictedInputs.Prone, false);

      while (!Player.IsDeployed(dirPlayer)) {
        await mod.Wait(1);
      }

      mod.Teleport(dirPlayer, V3.ToVector(_directorControlRoomSpawnPos), 0);
      WaterCheck();

      async function WaterCheck() {
        await mod.Wait(1);

        if (Player.IsInWater(dirPlayer)) {
          await UnspawnDirectorControlRoom();
          await SpawnDirectorControlRoom(true);
          mod.Teleport(dirPlayer, V3.ToVector(_directorControlRoomSpawnPos), 0);
          SpawnFreeCamInteractPoint();
        }
      }

      await StartFreeCamera(dirPlayer);
    } else if (_cameraState.type === CameraType.PlayerPreset) {
      PlayerPresetCameraUI.ShowCameraControlMenu(dirPlayer);

      Player.GivePortalGadget(dirPlayer);
      PlayerPresetCameraUI.InitPortalGadgetNotice(dirPlayer);
      PlayerPresetCameraUI.ShowPortalGadgetNotice(dirPlayer);

      await StartPlayerPresetCamera(dirPlayer);
    }
  }

  function SpawnFreeCamInteractPoint(): void {
    if (_freeCamInteractPoint) {
      mod.UnspawnObject(_freeCamInteractPoint);
    }

    _freeCamInteractPoint = mod.SpawnObject(
      rtc.InteractPoint,
      V3.ToVector(_directorControlRoomSpawnPos),
      Vector.Zero(),
    ) as mod.InteractPoint;
  }

  /************************
   * Camera Type: Free
   *************************/

  async function StartFreeCamera(
    dirPlayer: mod.Player,
    zoomOutBetweenTargets: boolean = true,
  ): Promise<void> {
    const ps = Player.GetOrCreate(dirPlayer);
    if (ps === null) return;

    _cameraState.freeCamIsTracking = true;
    _cameraState.target.type = CameraTargetType.Player;

    if (_cameraState.target.playerObject === null) {
      PlayerTracking.FindNextTarget(null);
    }

    if (PlayerTracking.CurrentTargetIsValid()) {
      _cameraState.target.previousTargetPlayerObject =
        _cameraState.target.playerObject;
    }

    const cam = _cameraObject;
    const playerPos = Player.GetPosition(dirPlayer);
    const playerFacing = Player.GetFacingDirection(dirPlayer);
    const camStartPos = V3.Add(playerPos, V3.Scale(playerFacing, -10));
    camStartPos.y += 60;

    const camParamsRefreshTicks = 10;
    const freeCamCollisionRaycastTicks = 5; // Raycast Call Throttle. You could increase this to improve performance at the cost of collision correction smoothness

    const trackedPlayerPitchOffsetRad = DegToRad(10); // how much the camera should pitch upwards when directly behind the player
    const trackedRotationSmoothingYaw = 0.12; // how much the camera should smooth the yaw rotation when tracking a player
    const trackedRotationSmoothingPitch = 0.12; // how much the camera should smooth the pitch rotation when tracking a player
    const trackedPlayerYSmoothing = 0.08; // how much the camera should smooth the Y position when tracking a player (reduce jitter up/down on uneven terrain)

    const focusPositionSmoothing = 0.1;
    const focusRotationSmoothing = 0.1;
    const focusArriveDistance = 0.01;
    const focusArriveAngle = 0.01;
    const focusPullbackDistance = 3; // horizontal offset of camera behind player
    const focusHeightOffset = 0.9; // vertical offset of camera from player position when in focus mode

    const focusedInputSideOffsetMax = 0.9;
    const focusedInputForwardOffsetMax = 0.7;
    const focusedInputSideSmoothing = 0.12;
    const focusedInputForwardSmoothing = 0.12;

    const freeMoveRotationSmoothing = 0.18; // how much the camera should smooth the rotation when in free move mode
    const freeMoveForwardSmoothing = 0.12; // how much the camera should smooth the forward movement when in free move mode
    const freeMoveStrafeSmoothing = 0.12; // how much the camera should smooth the strafing movement when in free move mode

    // Applies if ZoomOutBetweenTargets is enabled
    const targetSwitchDistanceThreshold = 100; // minimum distance between current and new target for the zoom out/in transition to trigger
    const targetSwitchZoomOutHeight = 100; // height to zoom out during target switch
    const targetSwitchZoomOutPositionSmoothing = 0.08;
    const targetSwitchZoomInPositionSmoothing = 0.1;
    const targetSwitchRotationSmoothing = 0.16;
    const targetSwitchArriveDistance = 0.8;

    const minPitch = -DegToRad(89);
    const maxPitch = DegToRad(89);

    let cachedMinPitch = minPitch;
    let cachedMaxPitch = maxPitch;
    let tickCounter = 0;

    const trackedState: FreeCamTrackedPlayerState = {
      previousTrackedPlayerPos: null,
      previousTrackedPlayerPosWasZero: null,
      smoothedTrackedPlayerY: null,
    };

    let smoothedTrackedYaw: number | null = null;
    let smoothedTrackedPitch: number | null = null;
    let smoothedCollisionCamPos: V3 | null = null;
    let previousDesiredTrackedCamPos: V3 | null = null;

    let focusTransitionTargetPos: V3 | null = null;
    let focusTransitionTargetRot: V3 | null = null;

    enum TargetSwitchPhase {
      None,
      ZoomOut,
      ZoomIn,
    }

    let targetSwitchYaw: number | null = null;
    let targetSwitchPitch: number | null = null;

    let targetSwitchPhase = TargetSwitchPhase.None;
    let targetSwitchZoomOutPos: V3 | null = null;
    let targetSwitchTargetPlayer: mod.Player | null = null;

    let lastTrackedTargetPlayer: mod.Player | null =
      PlayerTracking.CurrentTargetIsValid()
        ? (_cameraState.target.playerObject as mod.Player)
        : null;

    function TargetSwitchIsActive(): boolean {
      return targetSwitchPhase !== TargetSwitchPhase.None;
    }

    function ClearTargetSwitchTransition(): void {
      targetSwitchPhase = TargetSwitchPhase.None;
      targetSwitchZoomOutPos = null;
      targetSwitchTargetPlayer = null;
      targetSwitchYaw = null;
      targetSwitchPitch = null;
    }

    function GetCurrentFollowTarget(
      trackedPlayerPos: V3,
      trackedPlayer: mod.Player,
    ): { pos: V3; rot: V3 } {
      const useCloseFollow =
        _cameraState.freeCamIsFocusing || _cameraState.freeCamIsInFocus;

      return PlayerTracking.GetFollowTarget(
        trackedPlayerPos,
        trackedPlayer,
        useCloseFollow ? focusPullbackDistance : 15,
        useCloseFollow ? focusHeightOffset : 12,
        trackedPlayerPitchOffsetRad,
        cachedMinPitch,
        cachedMaxPitch,
      );
    }

    function TryStartTargetSwitchTransition(
      previousTarget: mod.Player | null,
      nextTarget: mod.Player,
      nextTargetPos: V3,
      currentCamPos: V3,
    ): void {
      if (!zoomOutBetweenTargets) return;
      if (previousTarget === null) return;
      if (!mod.IsPlayerValid(previousTarget)) return;
      if (!mod.IsPlayerValid(nextTarget)) return;
      if (mod.Equals(previousTarget, nextTarget)) return;

      const previousTargetPos = Player.GetPosition(previousTarget);
      const nextTargetFeetPos = Player.GetPosition(nextTarget);

      const distanceBetweenTargets = V3.DistanceBetween(
        previousTargetPos,
        nextTargetFeetPos,
        DistanceType.XZ,
      ).full;

      if (distanceBetweenTargets <= targetSwitchDistanceThreshold) {
        return;
      }

      targetSwitchPhase = TargetSwitchPhase.ZoomOut;
      targetSwitchTargetPlayer = nextTarget;

      const initialYaw = YawTowards(currentCamPos, nextTargetPos);

      const initialPitch = Clamp(
        PitchTowards(currentCamPos, nextTargetPos),
        cachedMinPitch,
        cachedMaxPitch,
      );

      targetSwitchYaw = initialYaw;
      targetSwitchPitch = initialPitch;

      targetSwitchZoomOutPos = V3.Create(
        currentCamPos.x,
        currentCamPos.y + targetSwitchZoomOutHeight,
        currentCamPos.z,
      );

      focusTransitionTargetPos = null;
      focusTransitionTargetRot = null;

      focusedInputSideOffsetCurrent = 0;
      focusedInputForwardOffsetCurrent = 0;

      smoothedTrackedYaw = null;
      smoothedTrackedPitch = null;
    }

    let focusedInputSideOffsetCurrent = 0;
    let focusedInputForwardOffsetCurrent = 0;

    let freeMoveSmoothedForwardAmount = 0;
    let freeMoveSmoothedRightAmount = 0;
    let freeMoveSmoothedYaw: number | null = null;
    let freeMoveSmoothedPitch: number | null = null;

    let camStartYaw = YawTowards(camStartPos, playerPos);
    let camStartPitch = 0;

    const initialTrackedPlayerPos = PlayerTracking.GetPositionWithSmoothedY(
      dirPlayer,
      trackedState,
      trackedPlayerYSmoothing,
    );

    if (initialTrackedPlayerPos) {
      camStartYaw = YawTowards(camStartPos, initialTrackedPlayerPos);

      camStartPitch = Clamp(
        PitchTowards(camStartPos, initialTrackedPlayerPos) -
          trackedPlayerPitchOffsetRad,
        cachedMinPitch,
        cachedMaxPitch,
      );
    }

    smoothedTrackedYaw = camStartYaw;
    smoothedTrackedPitch = camStartPitch;

    SetCameraTransform(cam, camStartPos, camStartPitch, camStartYaw);

    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.Fixed, _fixedCameraId);

    await mod.Wait(SD);

    _cameraState.isRunning = true;

    // mod.AddUIIcon appears to be bugged
    /*if (_showPlayerNametags) {
      const allPlayers = mod.AllPlayers()
      const allPlayersCount = mod.CountOf(allPlayers);

      for (let i = 0; i < allPlayersCount; i++) {
        const p = mod.ValueInArray(allPlayers, i) as mod.Player;
        if (!p || !mod.IsPlayerValid(p) || !Player.IsDeployed(p)) continue;
        mod.AddUIIcon(
          p,
          mod.WorldIconImages.Triangle,
          1,
          mod.GetObjId(mod.GetTeam(p)) === 1 ?
          PCT_UI.COLORS.BLUE :
          PCT_UI.COLORS.RED,
          mod.Message("PCT_{}", p),
          dirPlayer
        )
      }

      await mod.Wait(5);
      mod.UndeployPlayer(dirPlayer);
    }*/

    while (_cameraState.isRunning === true && _cameraState.reset === false) {
      await mod.Wait(DT);

      if (!Player.GetOrCreate(dirPlayer)) {
        _cameraState.isRunning = false; //Todo: Actually remove director/reset state in GetValidDirectorState instead of just stopping the camera, and handle that case properly here instead of just breaking out of the loop
        break;
      }

      if (tickCounter % camParamsRefreshTicks === 0) {
        cachedMinPitch = -DegToRad(89);
        cachedMaxPitch = DegToRad(89);
      }
      tickCounter++;

      const playerFacingDirection = Player.GetFacingDirection(dirPlayer);
      const playerLinearVelocity = Player.GetLinearVelocity(dirPlayer);
      const camPos = Vector.ToV3(mod.GetObjectPosition(cam));

      let effectiveTrackedPlayerPosForLoop: V3 | null = null;

      if (_cameraState.freeCamIsTracking) {
        effectiveTrackedPlayerPosForLoop =
          PlayerTracking.GetPositionWithSmoothedY(
            dirPlayer,
            trackedState,
            trackedPlayerYSmoothing,
          );

        if (
          effectiveTrackedPlayerPosForLoop &&
          PlayerTracking.CurrentTargetIsValid()
        ) {
          const trackedPlayer = _cameraState.target.playerObject as mod.Player;

          if (
            lastTrackedTargetPlayer !== null &&
            !mod.Equals(trackedPlayer, lastTrackedTargetPlayer)
          ) {
            previousDesiredTrackedCamPos = null;
            smoothedCollisionCamPos = null;

            TryStartTargetSwitchTransition(
              lastTrackedTargetPlayer,
              trackedPlayer,
              effectiveTrackedPlayerPosForLoop,
              camPos,
            );

            lastTrackedTargetPlayer = trackedPlayer;
          }

          if (lastTrackedTargetPlayer === null) {
            lastTrackedTargetPlayer = trackedPlayer;
          }

          if (!TargetSwitchIsActive()) {
            if (_cameraState.freeCamIsFocusing) {
              const focusTarget = PlayerTracking.GetFollowTarget(
                effectiveTrackedPlayerPosForLoop,
                trackedPlayer,
                focusPullbackDistance,
                focusHeightOffset,
                trackedPlayerPitchOffsetRad,
                cachedMinPitch,
                cachedMaxPitch,
              );

              focusTransitionTargetPos = focusTarget.pos;
              focusTransitionTargetRot = focusTarget.rot;
            }

            if (_cameraState.freeCamIsDefocusing) {
              // NOTE: Defocusing is currently not triggered in this script version, but logic is here and can be enabled
              const defocusTarget = PlayerTracking.GetFollowTarget(
                effectiveTrackedPlayerPosForLoop,
                trackedPlayer,
                15,
                12,
                trackedPlayerPitchOffsetRad,
                cachedMinPitch,
                cachedMaxPitch,
              );

              focusTransitionTargetPos = defocusTarget.pos;
              focusTransitionTargetRot = defocusTarget.rot;
            }
          }
        }
      }

      const horizontalVelocity = V3.Create(
        playerLinearVelocity.x,
        0,
        playerLinearVelocity.z,
      );

      const horizontalSpeedSq =
        horizontalVelocity.x * horizontalVelocity.x +
        horizontalVelocity.z * horizontalVelocity.z;

      const minMoveSpeed = 0.05;
      const hasMoveInput = horizontalSpeedSq > minMoveSpeed * minMoveSpeed;

      if (hasMoveInput && !TargetSwitchIsActive()) {
        if (
          _cameraState.freeCamIsTracking &&
          PlayerTracking.CurrentTargetIsValid()
        ) {
          _cameraState.target.previousTargetPlayerObject =
            _cameraState.target.playerObject;
        }

        _cameraState.freeCamIsTracking = false;

        _cameraState.freeCamIsFocusing = false;
        _cameraState.freeCamIsDefocusing = false;
        _cameraState.freeCamIsInFocus = false;

        focusTransitionTargetPos = null;
        focusTransitionTargetRot = null;

        previousDesiredTrackedCamPos = null;
        smoothedCollisionCamPos = null;
      }

      let inputDirection = V3.Zero();

      if (hasMoveInput && !TargetSwitchIsActive()) {
        const moveInput = V3.Normalize(horizontalVelocity);

        const horizontalFacing = V3.Normalize(
          V3.Create(playerFacingDirection.x, 0, playerFacingDirection.z),
        );

        const fullForward = V3.Normalize(playerFacingDirection);

        const rightFromFacing = V3.Normalize(
          V3.Create(-horizontalFacing.z, 0, horizontalFacing.x),
        );

        const targetForwardAmount =
          moveInput.x * horizontalFacing.x + moveInput.z * horizontalFacing.z;

        const targetRightAmount =
          moveInput.x * -horizontalFacing.z + moveInput.z * horizontalFacing.x;

        freeMoveSmoothedForwardAmount = V3.Lerp(
          freeMoveSmoothedForwardAmount,
          targetForwardAmount,
          freeMoveForwardSmoothing,
        );

        freeMoveSmoothedRightAmount = V3.Lerp(
          freeMoveSmoothedRightAmount,
          targetRightAmount,
          freeMoveStrafeSmoothing,
        );

        inputDirection = V3.Normalize(
          V3.Add(
            V3.Scale(fullForward, freeMoveSmoothedForwardAmount),
            V3.Scale(rightFromFacing, freeMoveSmoothedRightAmount),
          ),
        );
      } else {
        freeMoveSmoothedForwardAmount = V3.Lerp(
          freeMoveSmoothedForwardAmount,
          0,
          freeMoveForwardSmoothing,
        );

        freeMoveSmoothedRightAmount = V3.Lerp(
          freeMoveSmoothedRightAmount,
          0,
          freeMoveStrafeSmoothing,
        );
      }

      const freeCamSpeed = Player.IsSprinting(dirPlayer)
        ? _cameraState.speed * 3
        : _cameraState.speed;

      const nextCamPos = V3.Add(
        camPos,
        V3.Scale(inputDirection, freeCamSpeed * DT),
      );

      let nextYaw = YawTowards(
        nextCamPos,
        V3.Add(nextCamPos, V3.Scale(playerFacingDirection, 10)),
      );

      let nextPitch = 0;

      if (!_cameraState.freeCamIsTracking) {
        const freeTargetYaw = YawTowards(
          nextCamPos,
          V3.Add(nextCamPos, playerFacingDirection),
        );

        const freeTargetPitch = Clamp(
          PitchTowards(nextCamPos, V3.Add(nextCamPos, playerFacingDirection)),
          cachedMinPitch,
          cachedMaxPitch,
        );

        if (freeMoveSmoothedYaw === null) {
          freeMoveSmoothedYaw = freeTargetYaw;
        } else {
          freeMoveSmoothedYaw = LerpAngleRad(
            freeMoveSmoothedYaw,
            freeTargetYaw,
            freeMoveRotationSmoothing,
          );
        }

        if (freeMoveSmoothedPitch === null) {
          freeMoveSmoothedPitch = freeTargetPitch;
        } else {
          freeMoveSmoothedPitch = LerpAngleRad(
            freeMoveSmoothedPitch,
            freeTargetPitch,
            freeMoveRotationSmoothing,
          );
        }

        nextYaw = freeMoveSmoothedYaw;
        nextPitch = freeMoveSmoothedPitch;
      }

      if (_cameraState.freeCamIsTracking && effectiveTrackedPlayerPosForLoop) {
        freeMoveSmoothedYaw = null;
        freeMoveSmoothedPitch = null;

        const targetYaw = YawTowards(
          nextCamPos,
          effectiveTrackedPlayerPosForLoop,
        );

        const targetPitch = Clamp(
          PitchTowards(nextCamPos, effectiveTrackedPlayerPosForLoop) -
            trackedPlayerPitchOffsetRad,
          cachedMinPitch,
          cachedMaxPitch,
        );

        if (smoothedTrackedYaw === null) {
          smoothedTrackedYaw = targetYaw;
        } else {
          smoothedTrackedYaw = LerpAngleRad(
            smoothedTrackedYaw,
            targetYaw,
            trackedRotationSmoothingYaw,
          );
        }

        if (smoothedTrackedPitch === null) {
          smoothedTrackedPitch = targetPitch;
        } else {
          smoothedTrackedPitch = LerpAngleRad(
            smoothedTrackedPitch,
            targetPitch,
            trackedRotationSmoothingPitch,
          );
        }

        nextYaw = smoothedTrackedYaw;
        nextPitch = smoothedTrackedPitch;
      } else {
        smoothedTrackedYaw = null;
        smoothedTrackedPitch = null;
      }

      let finalCamPos = nextCamPos;
      let finalCamRot = V3.Create(nextPitch, nextYaw, 0);

      if (
        !TargetSwitchIsActive() &&
        _cameraState.freeCamIsTracking &&
        _cameraState.freeCamIsInFocus &&
        effectiveTrackedPlayerPosForLoop &&
        PlayerTracking.CurrentTargetIsValid()
      ) {
        const shoulderForwardBias = 0.35;

        const trackedFacingRaw = Player.GetFacingDirection(
          _cameraState.target.playerObject as mod.Player,
        );
        const trackedPlayerFacing = V3.Normalize(
          V3.Create(trackedFacingRaw.x, 0, trackedFacingRaw.z),
        );

        const trackedRight = V3.Create(
          -trackedPlayerFacing.z,
          0,
          trackedPlayerFacing.x,
        );

        let forwardAmount = 0;
        let rightAmount = 0;

        if (horizontalSpeedSq > minMoveSpeed * minMoveSpeed) {
          const moveInput = V3.Normalize(horizontalVelocity);

          forwardAmount =
            moveInput.x * playerFacingDirection.x +
            moveInput.z * playerFacingDirection.z;

          rightAmount =
            moveInput.x * -playerFacingDirection.z +
            moveInput.z * playerFacingDirection.x;
        }

        const targetSideOffset = rightAmount * focusedInputSideOffsetMax;
        const targetForwardOffset =
          forwardAmount * focusedInputForwardOffsetMax +
          Math.abs(rightAmount) * shoulderForwardBias;

        focusedInputSideOffsetCurrent = V3.Lerp(
          focusedInputSideOffsetCurrent,
          targetSideOffset,
          focusedInputSideSmoothing,
        );

        focusedInputForwardOffsetCurrent = V3.Lerp(
          focusedInputForwardOffsetCurrent,
          targetForwardOffset,
          focusedInputForwardSmoothing,
        );

        const baseFocusPos = V3.Create(
          effectiveTrackedPlayerPosForLoop.x -
            trackedPlayerFacing.x * focusPullbackDistance,
          effectiveTrackedPlayerPosForLoop.y + focusHeightOffset,
          effectiveTrackedPlayerPosForLoop.z -
            trackedPlayerFacing.z * focusPullbackDistance,
        );

        const sideOffset = V3.Scale(
          trackedRight,
          focusedInputSideOffsetCurrent,
        );

        const forwardOffset = V3.Scale(
          trackedPlayerFacing,
          focusedInputForwardOffsetCurrent,
        );

        finalCamPos = V3.Add(baseFocusPos, V3.Add(sideOffset, forwardOffset));

        finalCamRot = V3.Create(nextPitch, nextYaw, 0);
      } else {
        focusedInputSideOffsetCurrent = V3.Lerp(
          focusedInputSideOffsetCurrent,
          0,
          focusedInputSideSmoothing,
        );

        focusedInputForwardOffsetCurrent = V3.Lerp(
          focusedInputForwardOffsetCurrent,
          0,
          focusedInputForwardSmoothing,
        );
      }

      if (focusTransitionTargetPos && focusTransitionTargetRot) {
        finalCamPos = V3.Create(
          V3.Lerp(
            nextCamPos.x,
            focusTransitionTargetPos.x,
            focusPositionSmoothing,
          ),
          V3.Lerp(
            nextCamPos.y,
            focusTransitionTargetPos.y,
            focusPositionSmoothing,
          ),
          V3.Lerp(
            nextCamPos.z,
            focusTransitionTargetPos.z,
            focusPositionSmoothing,
          ),
        );

        let focusArrivalTargetYaw = focusTransitionTargetRot.y;
        let focusArrivalTargetPitch = focusTransitionTargetRot.x;

        if (effectiveTrackedPlayerPosForLoop) {
          focusArrivalTargetYaw = YawTowards(
            finalCamPos,
            effectiveTrackedPlayerPosForLoop,
          );

          focusArrivalTargetPitch = Clamp(
            PitchTowards(finalCamPos, effectiveTrackedPlayerPosForLoop) -
              trackedPlayerPitchOffsetRad,
            cachedMinPitch,
            cachedMaxPitch,
          );
        }

        finalCamRot = V3.Create(
          LerpAngleRad(
            nextPitch,
            focusArrivalTargetPitch,
            focusRotationSmoothing,
          ),
          LerpAngleRad(nextYaw, focusArrivalTargetYaw, focusRotationSmoothing),
          0,
        );

        const arrivedDistance = V3.DistanceBetween(
          finalCamPos,
          focusTransitionTargetPos,
        ).full;

        const arrivedYaw = Math.abs(
          NormalizeAngleRad(finalCamRot.y - focusArrivalTargetYaw),
        );

        const arrivedPitch = Math.abs(
          NormalizeAngleRad(finalCamRot.x - focusArrivalTargetPitch),
        );

        if (
          arrivedDistance <= focusArriveDistance &&
          arrivedYaw <= focusArriveAngle &&
          arrivedPitch <= focusArriveAngle
        ) {
          finalCamPos = focusTransitionTargetPos;
          finalCamRot = V3.Create(
            focusArrivalTargetPitch,
            focusArrivalTargetYaw,
            0,
          );

          if (_cameraState.freeCamIsFocusing) {
            _cameraState.freeCamIsFocusing = false;
            _cameraState.freeCamIsInFocus = true;
          }

          if (_cameraState.freeCamIsDefocusing) {
            _cameraState.freeCamIsDefocusing = false;
            _cameraState.freeCamIsInFocus = false;
          }

          focusTransitionTargetPos = null;
          focusTransitionTargetRot = null;
        }
      }

      if (
        TargetSwitchIsActive() &&
        targetSwitchTargetPlayer !== null &&
        targetSwitchZoomOutPos !== null &&
        effectiveTrackedPlayerPosForLoop !== null &&
        PlayerTracking.CurrentTargetIsValid()
      ) {
        if (!mod.IsPlayerValid(targetSwitchTargetPlayer)) {
          ClearTargetSwitchTransition();
        } else {
          const currentTargetSwitchPhase =
            targetSwitchPhase as TargetSwitchPhase;

          const updatedFollowTarget = GetCurrentFollowTarget(
            effectiveTrackedPlayerPosForLoop,
            targetSwitchTargetPlayer,
          );

          const phaseTargetPos =
            currentTargetSwitchPhase === TargetSwitchPhase.ZoomOut
              ? targetSwitchZoomOutPos
              : updatedFollowTarget.pos;

          const phasePositionSmoothing =
            currentTargetSwitchPhase === TargetSwitchPhase.ZoomOut
              ? targetSwitchZoomOutPositionSmoothing
              : targetSwitchZoomInPositionSmoothing;

          finalCamPos = V3.Create(
            V3.Lerp(camPos.x, phaseTargetPos.x, phasePositionSmoothing),
            V3.Lerp(camPos.y, phaseTargetPos.y, phasePositionSmoothing),
            V3.Lerp(camPos.z, phaseTargetPos.z, phasePositionSmoothing),
          );

          const targetYaw = YawTowards(
            finalCamPos,
            effectiveTrackedPlayerPosForLoop,
          );

          const targetPitch = Clamp(
            PitchTowards(finalCamPos, effectiveTrackedPlayerPosForLoop),
            cachedMinPitch,
            cachedMaxPitch,
          );

          if (targetSwitchYaw === null) {
            targetSwitchYaw = targetYaw;
          } else {
            targetSwitchYaw = LerpAngleRad(
              targetSwitchYaw,
              targetYaw,
              targetSwitchRotationSmoothing,
            );
          }

          if (targetSwitchPitch === null) {
            targetSwitchPitch = targetPitch;
          } else {
            targetSwitchPitch = LerpAngleRad(
              targetSwitchPitch,
              targetPitch,
              targetSwitchRotationSmoothing,
            );
          }

          finalCamRot = V3.Create(targetSwitchPitch, targetSwitchYaw, 0);

          const arrivedDistance = V3.DistanceBetween(
            finalCamPos,
            phaseTargetPos,
            DistanceType.XYZ,
          ).full;

          const targetSwitchReachedPosition =
            arrivedDistance <= targetSwitchArriveDistance;

          if (
            currentTargetSwitchPhase === TargetSwitchPhase.ZoomOut &&
            targetSwitchReachedPosition
          ) {
            targetSwitchPhase = TargetSwitchPhase.ZoomIn;
          } else if (
            currentTargetSwitchPhase === TargetSwitchPhase.ZoomIn &&
            targetSwitchReachedPosition
          ) {
            finalCamPos = updatedFollowTarget.pos;
            finalCamRot = V3.Create(targetPitch, targetYaw, 0);

            if (_cameraState.freeCamIsFocusing) {
              _cameraState.freeCamIsFocusing = false;
              _cameraState.freeCamIsInFocus = true;
            }

            _cameraState.freeCamIsDefocusing = false;

            smoothedTrackedYaw = targetYaw;
            smoothedTrackedPitch = targetPitch;

            ClearTargetSwitchTransition();
          }
        }
      }

      if (
        _cameraState.freeCamIsTracking &&
        targetSwitchPhase === TargetSwitchPhase.None &&
        !_cameraState.freeCamIsFocusing &&
        !_cameraState.freeCamIsDefocusing &&
        focusTransitionTargetPos === null &&
        effectiveTrackedPlayerPosForLoop !== null &&
        PlayerTracking.CurrentTargetIsValid()
      ) {
        let desiredTrackedCamPos: V3;

        if (previousDesiredTrackedCamPos === null) {
          desiredTrackedCamPos = finalCamPos;
        } else {
          desiredTrackedCamPos = V3.Create(
            V3.Lerp(previousDesiredTrackedCamPos.x, finalCamPos.x, 0.2),
            V3.Lerp(previousDesiredTrackedCamPos.y, finalCamPos.y, 0.2),
            V3.Lerp(previousDesiredTrackedCamPos.z, finalCamPos.z, 0.2),
          );
        }

        previousDesiredTrackedCamPos = desiredTrackedCamPos;

        if (tickCounter % freeCamCollisionRaycastTicks === 0) {
          FreeCamCollision.Request(
            dirPlayer,
            effectiveTrackedPlayerPosForLoop,
            desiredTrackedCamPos,
          );
        }

        const correctedCamPos = FreeCamCollision.CorrectPosition(
          dirPlayer,
          desiredTrackedCamPos,
        );

        smoothedCollisionCamPos =
          smoothedCollisionCamPos === null
            ? correctedCamPos
            : V3.Create(
                V3.Lerp(smoothedCollisionCamPos.x, correctedCamPos.x, 0.18),
                V3.Lerp(smoothedCollisionCamPos.y, correctedCamPos.y, 0.18),
                V3.Lerp(smoothedCollisionCamPos.z, correctedCamPos.z, 0.18),
              );

        finalCamPos = smoothedCollisionCamPos;

        const trackedPlayerPitchOffsetScale =
          FreeCamCollision.GetCameraOffsetScale(
            effectiveTrackedPlayerPosForLoop,
            desiredTrackedCamPos,
            finalCamPos,
          );

        const directTrackedPitch = Clamp(
          PitchTowards(finalCamPos, effectiveTrackedPlayerPosForLoop) -
            trackedPlayerPitchOffsetRad,
          cachedMinPitch,
          cachedMaxPitch,
        );

        const finalTargetPitch = Clamp(
          V3.Lerp(0, directTrackedPitch, trackedPlayerPitchOffsetScale),
          cachedMinPitch,
          cachedMaxPitch,
        );

        finalCamRot = V3.Create(finalTargetPitch, finalCamRot.y, 0);

        smoothedTrackedPitch = finalTargetPitch;
      } else {
        smoothedCollisionCamPos = null;
        previousDesiredTrackedCamPos = null;
      }

      SetCameraTransform(
        _cameraObject,
        finalCamPos,
        finalCamRot.x,
        finalCamRot.y,
      );
    }

    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.FirstPerson);

    TargetSelectionUI.Destroy(mod.GetObjId(dirPlayer));

    Player.SetDirectorCurrentStatus(dirPlayer, DirectorStateType.Idle);
  }

  /************************
   * Camera Type: Path
   *************************/

  async function StartPathCamera(
    dirPlayer: mod.Player,
    points: V3[],
  ): Promise<void> {
    const path = BuildSmoothedCameraPath(points);
    if (path.length <= 1) return;

    const originalLast = points[points.length - 1];
    const pathLast = path[path.length - 1];

    if (
      V3.DistanceBetween(pathLast, originalLast, DistanceType.XYZ).full > 0.01
    ) {
      path.push(originalLast);
    }

    const cam = _cameraObject;

    const rotationSmoothing = 0.15;
    const camParamsRefreshTicks = 10;

    const minPitch = -DegToRad(_cameraState.maxPitchUpDeg);
    const maxPitch = DegToRad(_cameraState.maxPitchDownDeg);

    const segmentLengths: number[] = [];
    const cumulativeDistances: number[] = [0];

    let totalLength = 0;

    for (let i = 1; i < path.length; i++) {
      const len = V3.DistanceBetween(
        path[i - 1],
        path[i],
        DistanceType.XYZ,
      ).full;
      segmentLengths.push(len);
      totalLength += len;
      cumulativeDistances.push(totalLength);
    }

    if (totalLength <= 0) return;

    const first = path[0];
    const firstLook = path[Math.min(1, path.length - 1)];

    const firstYaw = YawTowards(first, firstLook);

    const firstPitch = Clamp(
      PitchTowards(first, firstLook),
      minPitch,
      maxPitch,
    );

    SetCameraTransform(cam, first, firstPitch, firstYaw);

    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.Fixed, _fixedCameraId);
    mod.EnableAllInputRestrictions(dirPlayer, true);
    mod.EnableInputRestriction(dirPlayer, mod.RestrictedInputs.Interact, false);

    await mod.Wait(SD);

    const trackedState: TrackedPlayerState = {
      previousTrackedPlayerPos: null,
      previousTrackedPlayerPosWasZero: null,
    };

    let previousYaw = firstYaw;
    let previousPitch = firstPitch;

    let traveled = 0;
    let segmentIndex = 0;
    let cachedSpeed = _cameraState.speed;
    let cachedLookAheadDistance = _cameraState.lookAheadDistance;
    let cachedMinPitch = minPitch;
    let cachedMaxPitch = maxPitch;
    let tickCounter = 0;

    _cameraState.isRunning = true;
    PathCameraSetupUI.RefreshControlNotice(dirPlayer);

    Player.SetDirectorCurrentStatus(
      dirPlayer,
      DirectorStateType.CameraPathActive,
    );

    while (
      traveled < totalLength &&
      _cameraState.isRunning === true &&
      _cameraState.reset === false
    ) {
      if (tickCounter % camParamsRefreshTicks === 0) {
        cachedSpeed = _cameraState.speed;
        cachedLookAheadDistance = _cameraState.lookAheadDistance;
        cachedMinPitch = -DegToRad(_cameraState.maxPitchUpDeg);
        cachedMaxPitch = DegToRad(_cameraState.maxPitchDownDeg);
      }
      tickCounter++;

      traveled = Math.min(
        traveled + Math.max(cachedSpeed, 0.001) * DT,
        totalLength,
      );

      while (
        segmentIndex < segmentLengths.length - 1 &&
        traveled > cumulativeDistances[segmentIndex + 1]
      ) {
        segmentIndex++;
      }

      const segStart = path[segmentIndex];
      const segEnd = path[segmentIndex + 1];
      const segLen = segmentLengths[segmentIndex];
      const segStartDist = cumulativeDistances[segmentIndex];

      const localT = segLen <= 0 ? 1 : (traveled - segStartDist) / segLen;

      const posX = V3.Lerp(segStart.x, segEnd.x, localT);
      const posY = V3.Lerp(segStart.y, segEnd.y, localT);
      const posZ = V3.Lerp(segStart.z, segEnd.z, localT);

      const tracked = PlayerTracking.GetPosition(dirPlayer, trackedState);
      const trackedPlayerPos = tracked ? tracked.effectivePos : null;

      const lookDistance = Math.min(
        traveled + cachedLookAheadDistance,
        totalLength,
      );

      let lookSegmentIndex = segmentIndex;
      while (
        lookSegmentIndex < segmentLengths.length - 1 &&
        lookDistance > cumulativeDistances[lookSegmentIndex + 1]
      ) {
        lookSegmentIndex++;
      }

      const lookStart = path[lookSegmentIndex];
      const lookEnd = path[lookSegmentIndex + 1];
      const lookSegLen = segmentLengths[lookSegmentIndex];
      const lookSegStartDist = cumulativeDistances[lookSegmentIndex];

      const lookT =
        lookSegLen <= 0 ? 1 : (lookDistance - lookSegStartDist) / lookSegLen;

      const lookX = V3.Lerp(lookStart.x, lookEnd.x, lookT);
      const lookY = V3.Lerp(lookStart.y, lookEnd.y, lookT);
      const lookZ = V3.Lerp(lookStart.z, lookEnd.z, lookT);

      const targetX = trackedPlayerPos ? trackedPlayerPos.x : lookX;
      const targetY = trackedPlayerPos ? trackedPlayerPos.y : lookY;
      const targetZ = trackedPlayerPos ? trackedPlayerPos.z : lookZ;

      const targetYaw = YawTowards(
        V3.Create(posX, posY, posZ),
        V3.Create(targetX, targetY, targetZ),
      );
      const targetPitch = Clamp(
        PitchTowards(
          V3.Create(posX, posY, posZ),
          V3.Create(targetX, targetY, targetZ),
        ),
        cachedMinPitch,
        cachedMaxPitch,
      );

      const isFinalTick = traveled >= totalLength;

      const yaw = isFinalTick
        ? targetYaw
        : LerpAngleRad(previousYaw, targetYaw, rotationSmoothing);

      const pitch = isFinalTick
        ? targetPitch
        : LerpAngleRad(previousPitch, targetPitch, rotationSmoothing);

      previousYaw = yaw;
      previousPitch = pitch;

      SetCameraTransform(cam, V3.Create(posX, posY, posZ), pitch, yaw);

      await mod.Wait(DT);
    }

    FinalizeLoopedCameraMove(dirPlayer, points, StartPathCamera);
  }

  function FinalizeLoopedCameraMove(
    dirPlayer: mod.Player,
    points?: V3[],
    restartFn?: (player: mod.Player, points: V3[]) => Promise<void> | void,
  ): void {
    if (!mod.IsPlayerValid(dirPlayer)) {
      _cameraState.isRunning = false;
      _cameraState.reset = false;
      return;
    }

    if (_cameraState.reset === true) {
      _cameraState.reset = false;
      if (restartFn && points) restartFn(dirPlayer, points);
      return;
    }

    if (_cameraState.isRunning === true) {
      if (restartFn && points) restartFn(dirPlayer, points);
      return;
    }

    //DeletePlayerUI(dirPlayer);
    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.FirstPerson);
    Player.SetDirectorCurrentStatus(
      dirPlayer,
      DirectorStateType.CameraPathSetup,
    );

    UnspawnPathCameraInteractPoint(dirPlayer);
    PathCameraSetupUI.RefreshControlNotice(dirPlayer);
    PathCameraSetupUI.HideCameraControlMenu(dirPlayer);
    PathCameraSetupUI.ShowPathControlMenu(dirPlayer);
    mod.EnableAllInputRestrictions(dirPlayer, false);
  }

  /************************
   * Camera Type: Player Preset
   *************************/

  async function StartPlayerPresetCamera(dirPlayer: mod.Player): Promise<void> {
    const ps = Player.GetOrCreate(dirPlayer);
    if (ps === null) return;

    const forwardFacingDirection = Player.GetFacingDirection(dirPlayer);
    const yaw = Math.atan2(forwardFacingDirection.x, forwardFacingDirection.z);

    mod.EnableInputRestriction(
      dirPlayer,
      mod.RestrictedInputs.CameraPitch,
      true,
    );

    mod.Teleport(dirPlayer, V3.ToVector(Player.GetPosition(dirPlayer)), yaw);

    const cam = _cameraObject;

    const positionSmoothing = 0.18;
    const rotationSmoothing = 0.18;

    const sprintLookAheadMax = 1.2;
    const sprintTransitionSeconds = 1.2;
    let sprintLookAhead = 0;

    const minPitch = -DegToRad(89);
    const maxPitch = DegToRad(89);

    const firstPreset = GetCurrentCameraPreset();
    const firstTarget = GetPlayerPresetCameraTransform(
      dirPlayer,
      firstPreset,
      minPitch,
      maxPitch,
      sprintLookAhead,
    );

    if (firstTarget === null) return;

    let smoothedPos: V3 | null = firstTarget.pos;
    let smoothedYaw: number | null = firstTarget.rot.y;
    let smoothedPitch: number | null = firstTarget.rot.x;

    SetCameraTransform(
      cam,
      firstTarget.pos,
      firstTarget.rot.x,
      firstTarget.rot.y,
    );

    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.Fixed, _fixedCameraId);

    await mod.Wait(SD);

    _cameraState.isRunning = true;

    Player.SetDirectorCurrentStatus(
      dirPlayer,
      DirectorStateType.PlayerPresetCameraActive,
    );

    while (
      _cameraState.isRunning === true &&
      _cameraState.type === CameraType.PlayerPreset
    ) {
      await mod.Wait(DT);

      if (!mod.IsPlayerValid(dirPlayer) || !Player.IsDeployed(dirPlayer)) {
        _cameraState.isRunning = false;
        break;
      }

      const targetSprintLookAhead = Player.IsSprinting(dirPlayer)
        ? sprintLookAheadMax
        : 0;

      const sprintStep = sprintLookAheadMax * (DT / sprintTransitionSeconds);

      if (sprintLookAhead < targetSprintLookAhead) {
        sprintLookAhead = Math.min(
          sprintLookAhead + sprintStep,
          targetSprintLookAhead,
        );
      } else if (sprintLookAhead > targetSprintLookAhead) {
        sprintLookAhead = Math.max(
          sprintLookAhead - sprintStep,
          targetSprintLookAhead,
        );
      }

      const preset = GetCurrentCameraPreset();

      const target = GetPlayerPresetCameraTransform(
        dirPlayer,
        preset,
        minPitch,
        maxPitch,
        sprintLookAhead,
      );

      if (target === null) continue;

      smoothedPos =
        smoothedPos === null
          ? target.pos
          : V3.Create(
              V3.Lerp(smoothedPos.x, target.pos.x, positionSmoothing),
              V3.Lerp(smoothedPos.y, target.pos.y, positionSmoothing),
              V3.Lerp(smoothedPos.z, target.pos.z, positionSmoothing),
            );

      smoothedYaw =
        smoothedYaw === null
          ? target.rot.y
          : LerpAngleRad(smoothedYaw, target.rot.y, rotationSmoothing);

      smoothedPitch =
        smoothedPitch === null
          ? target.rot.x
          : LerpAngleRad(smoothedPitch, target.rot.x, rotationSmoothing);

      SetCameraTransform(cam, smoothedPos, smoothedPitch, smoothedYaw);

      PlayerPresetCameraUI.RefreshCameraControlMenu(dirPlayer);
    }

    mod.EnableInputRestriction(
      dirPlayer,
      mod.RestrictedInputs.CameraPitch,
      false,
    );

    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.FirstPerson);
    Player.SetDirectorCurrentStatus(dirPlayer, DirectorStateType.Idle);
    PlayerPresetCameraUI.RefreshCameraControlMenu(dirPlayer);
  }

  /************************
   * VFX
   *************************/

  namespace VFX {
    export function StartLoop(): void {
      LoopSpawnAroundCamera(_cameraObject);
    }

    export function StopLoop(): void {
      _vfxState.isRunning = false;
    }

    async function LoopSpawnAroundCamera(cam: mod.FixedCamera): Promise<void> {
      if (_vfxState.isRunning) return;

      _vfxState.isRunning = true;
      _vfxState.previousCheckPos = null;

      while (_vfxState.isRunning === true && _cameraState.isRunning === true) {
        await mod.Wait(_config.vfxConfig.checkInterval);

        const camPos = Vector.ToV3(mod.GetObjectPosition(cam));

        if (_vfxState.previousCheckPos === null) {
          _vfxState.previousCheckPos = camPos;
          continue;
        }

        const movedDistance = V3.DistanceBetween(
          _vfxState.previousCheckPos,
          camPos,
          DistanceType.XYZ,
        ).full;
        _vfxState.previousCheckPos = camPos;

        if (movedDistance < _config.vfxConfig.minMoveDistance) {
          continue;
        }

        if (Math.random() > _vfxState.spawnChance) {
          continue;
        }

        const selectedVFX = GetWeightedRandomVFX(_vfxState.inventory);
        if (selectedVFX === null) {
          continue;
        }

        const spawnPos = GetRandomPointAroundCameraXZ(
          camPos,
          selectedVFX,
          _config.vfxConfig.radius,
        );

        Spawn(selectedVFX, V3.ToVector(spawnPos));
      }

      _vfxState.isRunning = false;
      _vfxState.previousCheckPos = null;
    }

    export async function Spawn(
      vfx: mod.RuntimeSpawn_Common,
      pos: mod.Vector,
      enabled: boolean = true,
      params?: { isContinuous?: boolean; duration?: number; rotation?: V3 },
    ): Promise<mod.VFX> {
      const nParams = {
        isContinuous: params?.isContinuous ?? false,
        duration: params?.duration ?? 30,
        rotation: params?.rotation ?? V3.Zero(),
      };

      const spawnedVFX: mod.VFX = mod.SpawnObject(
        vfx,
        pos,
        V3.ToVector(nParams.rotation),
      );
      await mod.Wait(SD);

      mod.EnableVFX(spawnedVFX, enabled);

      if (!nParams.isContinuous) {
        (async () => {
          await mod.Wait(nParams.duration);
          mod.EnableVFX(spawnedVFX, false);
          await mod.Wait(2);
          mod.UnspawnObject(spawnedVFX);
        })();
      }

      return spawnedVFX;
    }

    function GetClosestPathPointToCamera(
      cam: mod.FixedCamera,
    ): PathPoint | null {
      if (_pathState.points.length === 0) return null;

      const camPos = Vector.ToV3(mod.GetObjectPosition(cam));

      let closestPoint: PathPoint | null = null;
      let closestDistance = Number.MAX_VALUE;

      for (const point of _pathState.points) {
        const dist = V3.DistanceBetween(
          camPos,
          point.pos,
          DistanceType.XYZ,
        ).full;

        if (dist < closestDistance) {
          closestDistance = dist;
          closestPoint = point;
        }
      }

      return closestPoint;
    }

    function GetRandomPointAroundCameraXZ(
      camPos: V3,
      selectedFx: mod.RuntimeSpawn_Common,
      radius: number,
    ): V3 {
      const safeRadius = Math.max(0, radius);

      const camRot = Vector.ToV3(mod.GetObjectRotation(_cameraObject));

      const halfConeRad = Math.PI / 2; // 180 degree cone in front of the camera (90 degrees left and 90 degrees right)
      const angle = camRot.y + (Math.random() * Math.PI - halfConeRad);

      const entry = _vfxState.inventory.find((e) => e.vfx === selectedFx);

      const rawMinDistance = entry?.minDistance ?? 0;
      const rawMaxDistance = entry?.maxDistance ?? safeRadius;

      const minDistance = Math.min(Math.max(0, rawMinDistance), safeRadius);
      const maxDistance = Math.min(
        Math.max(minDistance, rawMaxDistance),
        safeRadius,
      );

      const distance =
        Math.random() * (maxDistance - minDistance) + minDistance;

      const closestPoint = GetClosestPathPointToCamera(_cameraObject);
      const pointGroundY = closestPoint ? closestPoint.playerPosY : camPos.y;

      return V3.Create(
        camPos.x + Math.sin(angle) * distance,
        pointGroundY,
        camPos.z + Math.cos(angle) * distance,
      );
    }

    function GetWeightedRandomVFX(
      entries: VFXSpawnEntry[],
    ): mod.RuntimeSpawn_Common | null {
      let totalWeight = 0;

      for (const entry of entries) {
        if (entry.weight > 0) {
          totalWeight += entry.weight;
        }
      }

      if (totalWeight <= 0) return null;

      let roll = Math.random() * totalWeight;

      for (const entry of entries) {
        if (entry.weight <= 0) continue;

        roll -= entry.weight;

        if (roll <= 0) {
          return entry.vfx;
        }
      }

      return entries[entries.length - 1]?.vfx ?? null;
    }
  }

  /************************
   * UI HELPERS
   *************************/

  function FormatMessageForValue(
    rowId: TrackedCamSettingsRowId | TrackedPathPointsRowId,
  ): mod.Message {
    const value =
      rowId in _trackedCamSettingsInfo
        ? _trackedCamSettingsInfo[rowId as TrackedCamSettingsRowId]
        : _trackedPathPointsInfo[rowId as TrackedPathPointsRowId];

    if (value == null) {
      return mod.Message("PCT_NA");
    }

    if (typeof value === "object" && mod.IsPlayerValid(value as mod.Player)) {
      return mod.Message("PCT_{}", value as mod.Player);
    } else if (typeof value === "boolean") {
      return mod.Message(value ? "PCT_YES" : "PCT_NO");
    } else if (typeof value === "number") {
      if (rowId.includes("Deg")) {
        return mod.Message("PCT_NUMBER_DEGREE", value);
      } else if (rowId.includes("PERCENT")) {
        return mod.Message("PCT_NUMBER_PERCENT", value);
      } else if (rowId.includes("Meters")) {
        return mod.Message("PCT_NUMBER_METERS", value);
      } else if (rowId.includes("status")) {
        if (value === PathPointsStatus.None) {
          return mod.Message("PCT_PATH_POINTS_STATUS_READY");
        } else if (value === PathPointsStatus.Selected) {
          return mod.Message("PCT_PATH_POINTS_STATUS_SELECTED");
        } else if (value === PathPointsStatus.Moving) {
          return mod.Message("PCT_PATH_POINTS_STATUS_MOVING");
        } else {
          return mod.Message("PCT_ERROR");
        }
      } else if (rowId.includes("TargetType")) {
        if (value === CameraTargetType.Path) {
          return mod.Message("PCT_TARGET_TYPE_PATH");
        } else if (value === CameraTargetType.Player) {
          return mod.Message("PCT_TARGET_TYPE_PLAYER");
        } else {
          return mod.Message("PCT_ERROR");
        }
      } else {
        return mod.Message("PCT_{}", value);
      }
    } else if (
      typeof value === "object" &&
      "x" in value &&
      "y" in value &&
      "z" in value
    ) {
      return mod.Message(
        "PCT_V3_XZ",
        Math.round(value.x as number),
        Math.round(value.z as number),
      );
    } else {
      return mod.Message("PCT_ERROR");
    }
  }

  function SyncTrackedCamSettingsInfo() {
    _trackedCamSettingsInfo.cameraSpeed = _cameraState.speed;
    _trackedCamSettingsInfo.maxPitchUpDeg = _cameraState.maxPitchUpDeg;
    _trackedCamSettingsInfo.maxPitchDownDeg = _cameraState.maxPitchDownDeg;
    _trackedCamSettingsInfo.cornerRadius = _pathState.cornerRadius;
    _trackedCamSettingsInfo.lookAheadDistance = _cameraState.lookAheadDistance;
    _trackedCamSettingsInfo.cameraTargetType = _cameraState.target.type;
    _trackedCamSettingsInfo.cameraTarget = _cameraState.target.playerObject;
    _trackedCamSettingsInfo.vfxFrequencyPercent = _vfxState.spawnChance * 100;
  }

  function SyncTrackedPathPointsInfo() {
    _trackedPathPointsInfo.status = _pathState.inSelection
      ? PathPointsStatus.Selected
      : _pathState.isMoving
        ? PathPointsStatus.Moving
        : PathPointsStatus.None;
    _trackedPathPointsInfo.count = _pathState.points.length;
    _trackedPathPointsInfo.creationDistanceMeters =
      _pathState.pointCreationDistance;
    _trackedPathPointsInfo.totalLengthMeters = Path.CalculateLength(
      _pathState.points,
    );
  }

  function FormatCameraPresetMessage(): mod.Message {
    const preset = GetCurrentCameraPreset();
    return mod.Message("PCT_{}", preset.name);
  }

  /************************
   * UI
   *************************/

  namespace DirectorCodeEntryUI {
    export function Init(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;

      mod.EnableUIInputMode(true, player);

      if (ps.ui.directorCodeEntryUI.root) {
        ps.enteredDirectorCode = "";
        ps.ui.directorCodeEntryUI.root.show();
        return;
      }

      ps.ui.directorCodeEntryUI.inputEnabled = true;

      const layout = {
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        titleHeight: 60,
        buttonWidth: 90,
        buttonHeight: 70,
        buttonGap: 15,
        keypadStartY: 170,
        closeButtonWidth: 120,
        closeButtonHeight: 50,
      };

      ps.ui.directorCodeEntryUI.root = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.Center,
          depth: mod.UIDepth.AboveGameUI,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              bgFill: mod.UIBgFill.Solid,
              bgAlpha: 0.6,
              bgColor: PCT_UI.COLORS.BLACK,
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.titleHeight,
              message: mod.Message("PCT_ENTER_PASSCODE"),
              textAnchor: mod.UIAnchor.Center,
              textSize: 24,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
            },
          ],
        },
        player,
      );

      const codeLabel = new PCT_UI.Text(
        {
          type: PCT_UI.Type.Text,
          parent: ps.ui.directorCodeEntryUI.root,
          anchor: mod.UIAnchor.TopCenter,
          x: 0,
          y: layout.titleHeight + 10,
          width: layout.width - 80,
          height: layout.titleHeight,
          message: mod.Message("PCT_EMPTY_STRING"),
          textAnchor: mod.UIAnchor.Center,
          textSize: 18,
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 1,
          bgFill: mod.UIBgFill.Solid,
          bgColor: PCT_UI.COLORS.WHITE,
          bgAlpha: 0.02,
        },
        player,
      );

      ps.ui.directorCodeEntryUI.closeButton = new PCT_UI.Button(
        {
          parent: ps.ui.directorCodeEntryUI.root,
          anchor: mod.UIAnchor.BottomCenter,
          x: 0,
          y: layout.closeButtonHeight / 2,
          width: layout.closeButtonWidth,
          height: layout.closeButtonHeight,
          label: {
            message: mod.Message("PCT_CLOSE"),
            textSize: 18,
            textColor: PCT_UI.COLORS.WHITE,
          },
          onClick: async (buttonPlayer: mod.Player) => {
            mod.EnableUIInputMode(false, buttonPlayer);
            DirectorCodeEntryUI.Destroy(mod.GetObjId(buttonPlayer));
          },
        },
        player,
      );

      const digits = [
        { digit: "1", row: 0, col: 0 },
        { digit: "2", row: 0, col: 1 },
        { digit: "3", row: 0, col: 2 },
        { digit: "4", row: 1, col: 0 },
        { digit: "5", row: 1, col: 1 },
        { digit: "6", row: 1, col: 2 },
        { digit: "7", row: 2, col: 0 },
        { digit: "8", row: 2, col: 1 },
        { digit: "9", row: 2, col: 2 },
        { digit: "0", row: 3, col: 1 },
      ];

      const totalRowWidth = layout.buttonWidth * 3 + layout.buttonGap * 2;
      const startX = Math.floor((layout.width - totalRowWidth) / 2);

      for (const entry of digits) {
        const button = CreateDigitButton(player, entry.digit);
        if (button === null) {
          PCT_ErrorLogger.New(
            DirectorCodeEntryUI.Init.name,
            `Failed to create button for digit ${entry.digit}`,
            4,
          );
          DirectorCodeEntryUI.Destroy(mod.GetObjId(player));
          return;
        }

        button.setPosition({
          x: startX + entry.col * (layout.buttonWidth + layout.buttonGap),
          y:
            layout.keypadStartY +
            entry.row * (layout.buttonHeight + layout.buttonGap),
        });

        if (!ps.ui.directorCodeEntryUI.digitButtons) {
          ps.ui.directorCodeEntryUI.digitButtons = [button];
        } else {
          ps.ui.directorCodeEntryUI.digitButtons.push(button);
        }
      }

      async function OnDigitPressed(
        pressPlayer: mod.Player,
        digit: string,
      ): Promise<void> {
        const pps = Player.GetOrCreate(pressPlayer);
        if (pps === null) return;

        const codeUI = pps.ui.directorCodeEntryUI;
        if (!codeUI.root || !codeUI.inputEnabled) return;

        pps.enteredDirectorCode += digit;

        const enteredCode = pps.enteredDirectorCode;
        const passcodeLength = _directorPasscode.length;

        if (enteredCode.length < passcodeLength) {
          const msg =
            Number(enteredCode) === 0
              ? mod.Message("PCT_EMPTY_STRING")
              : mod.Message("PCT_{}", Number(enteredCode));
          codeLabel.setMessage(msg);
          codeLabel.textColor = PCT_UI.COLORS.WHITE;
          return;
        }

        const isCorrect = enteredCode === _directorPasscode;
        const feedbackColor = isCorrect
          ? PCT_UI.COLORS.GREEN
          : PCT_UI.COLORS.RED;
        const feedbackMessage = isCorrect
          ? mod.Message("PCT_CODE_CORRECT")
          : mod.Message("PCT_CODE_INCORRECT");

        codeUI.inputEnabled = false;
        codeLabel.setMessage(feedbackMessage);
        codeLabel.textColor = feedbackColor;

        for (const button of pps.ui.directorCodeEntryUI.digitButtons || []) {
          button.setColorBase(feedbackColor);
        }

        if (isCorrect) {
          pps.ui.directorCodeEntryUI.closeButton?.setEnabled(false);
        }

        await mod.Wait(1);

        if (isCorrect) {
          Player.AssignAsDirector(player);
          InitializeDirectorChecks(player).catch((error: unknown) => {
            PCT_ErrorLogger.New(
              DirectorCodeEntryUI.Init.name + " (OnDigitPressed)",
              `Director checks failed: ${String(error)}`,
              5,
            );
          });

          mod.EnableUIInputMode(false, pressPlayer);
          codeUI.root.hide();

          DirectorMenuUI.Init(pressPlayer);
          pps.enteredDirectorCode = "";
          return;
        }

        codeUI.inputEnabled = true;
        pps.enteredDirectorCode = "";
        codeLabel.setMessage(mod.Message("PCT_EMPTY_STRING"));

        for (const button of pps.ui.directorCodeEntryUI.digitButtons || []) {
          button.setColorBase(PCT_UI.COLORS.WHITE);
        }
      }

      function CreateDigitButton(
        digitPlayer: mod.Player,
        digit: string,
      ): PCT_UI.Button | null {
        const pps = Player.GetOrCreate(digitPlayer);
        if (pps === null) return null;
        if (!pps.ui.directorCodeEntryUI.root) return null;

        const button = new PCT_UI.Button(
          {
            parent: pps.ui.directorCodeEntryUI.root,
            anchor: mod.UIAnchor.TopLeft,
            x: 0,
            y: 0,
            width: layout.buttonWidth,
            height: layout.buttonHeight,
            label: {
              message: mod.Message("PCT_{}", Number(digit)),
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
              textSize: 24,
            },
            bgFill: mod.UIBgFill.OutlineThin,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.8,
            disabledOnClick: true,
            onClick: async () => OnDigitPressed(digitPlayer, digit),
          },
          digitPlayer,
        );

        return button;
      }
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.directorCodeEntryUI.root) {
        ps.ui.directorCodeEntryUI.root.destroy();
        ps.ui.directorCodeEntryUI.root = null;
        ps.ui.directorCodeEntryUI.digitButtons = null;
      }

      ps.enteredDirectorCode = "";
    }
  }

  namespace DirectorMenuUI {
    export function Init(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      mod.EnableUIInputMode(true, dirPlayer);

      if (ps.ui.directorMenuUI.root) {
        DirectorMenuUI.Show(dirPlayer);
        return;
      }

      const menuLayout = {
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        padding: 20,
        titleHeight: 50,
        buttonWidth: 360,
        buttonHeight: 50,
      };

      const root = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.Center,
          depth: mod.UIDepth.AboveGameUI,
          x: menuLayout.x,
          y: menuLayout.y,
          width: menuLayout.width,
          height: menuLayout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: menuLayout.width,
              height: menuLayout.height,
              bgFill: mod.UIBgFill.Solid,
              bgAlpha: 0.6,
              bgColor: PCT_UI.COLORS.BLACK,
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: 0,
              width: menuLayout.width,
              height: 50,
              message: mod.Message("PCT_DIRECTOR_MENU"),
              textAnchor: mod.UIAnchor.Center,
              textSize: 24,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
            },
          ],
        },
        dirPlayer,
      );

      const menuButtons = [
        {
          label: mod.Message("PCT_FREE_CAMERA_KEY"),
          onClick: async (buttonPlayer: mod.Player) => {
            const ps = Player.GetOrCreate(buttonPlayer);
            if (ps === null) return;

            _cameraState.type = CameraType.Free;
            root.hide();
            mod.EnableUIInputMode(false, buttonPlayer);

            if (ps.ui.targetSelectionUI.root) {
              ps.ui.targetSelectionUI.root.show();
            } else {
              TargetSelectionUI.Init(buttonPlayer);
            }

            PathCameraSetupUI.Destroy(mod.GetObjId(buttonPlayer));
            PlayerPresetCameraUI.Destroy(mod.GetObjId(buttonPlayer));

            StartCamera(buttonPlayer, []).catch((error: unknown) => {
              PCT_ErrorLogger.New(
                DirectorMenuUI.Init.name,
                `Failed to start free camera: ${String(error)}`,
                6,
              );
            });
          },
        },
        {
          label: mod.Message("PCT_PATH_CAMERA_KEY"),
          onClick: async (buttonPlayer: mod.Player) => {
            const ps = Player.GetOrCreate(buttonPlayer);
            if (ps === null) return;

            _cameraState.type = CameraType.Path;
            root.hide();
            mod.EnableUIInputMode(false, buttonPlayer);

            Player.GivePistolSecondary(buttonPlayer);

            if (ps.ui.pathCameraSetupUI.pathPointsMenuRoot) {
              ps.ui.pathCameraSetupUI.pathPointsMenuRoot.show();
            } else {
              PathCameraSetupUI.InitPathControlMenu(buttonPlayer);
            }

            if (ps.ui.pathCameraSetupUI.cameraControlMenuRoot) {
              ps.ui.pathCameraSetupUI.cameraControlMenuRoot.hide();
            } else {
              PathCameraSetupUI.InitCameraControlMenu(buttonPlayer);
            }

            TargetSelectionUI.Destroy(mod.GetObjId(buttonPlayer));
            PlayerPresetCameraUI.Destroy(mod.GetObjId(buttonPlayer));
          },
        },
        {
          label: mod.Message("PCT_PLAYER_PRESET_CAMERA_KEY"),
          onClick: async (buttonPlayer: mod.Player) => {
            const ps = Player.GetOrCreate(buttonPlayer);
            if (ps === null) return;

            _cameraState.type = CameraType.PlayerPreset;
            root.hide();
            mod.EnableUIInputMode(false, buttonPlayer);

            PathCameraSetupUI.Destroy(mod.GetObjId(buttonPlayer));
            TargetSelectionUI.Destroy(mod.GetObjId(buttonPlayer));

            PlayerPresetCameraUI.InitCameraControlMenu(buttonPlayer);
            PlayerPresetCameraUI.ShowCameraControlMenu(buttonPlayer);

            StartCamera(buttonPlayer, []).catch((error: unknown) => {
              PCT_ErrorLogger.New(
                DirectorMenuUI.Init.name,
                `Failed to start player preset camera: ${String(error)}`,
                12,
              );
            });
          },
        },
      ];

      for (let i = 0; i < menuButtons.length; i++) {
        const buttonInfo = menuButtons[i];
        const button = CreateMenuButton(buttonInfo);
        button.setPosition({
          x: 0,
          y:
            menuLayout.titleHeight +
            menuLayout.padding +
            i * (menuLayout.buttonHeight + menuLayout.padding),
        });
      }

      function CreateMenuButton(buttonInfo: {
        label: mod.Message;
        onClick: (player: mod.Player) => Promise<void>;
      }): PCT_UI.Button {
        return new PCT_UI.Button({
          parent: root,
          anchor: mod.UIAnchor.TopCenter,
          x: 0,
          y: 0,
          width: menuLayout.buttonWidth,
          height: menuLayout.buttonHeight,
          label: {
            message: buttonInfo.label,
            textColor: PCT_UI.COLORS.WHITE,
            textAlpha: 1,
            textSize: 18,
          },
          bgFill: mod.UIBgFill.OutlineThin,
          bgColor: PCT_UI.COLORS.WHITE,
          bgAlpha: 0.8,
          onClick: () => buttonInfo.onClick(dirPlayer),
        });
      }
    }

    export function Show(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;
      ps.ui.directorMenuUI.root?.show();
    }

    export function Hide(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;
      ps.ui.directorMenuUI.root?.hide();
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.directorMenuUI.root) {
        ps.ui.directorMenuUI.root.destroy();
        ps.ui.directorMenuUI.root = null;
      }
    }
  }

  namespace TargetSelectionUI {
    export function Init(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      const layout = {
        x: 0,
        y: 40,
        width: 500,
        height: 60,
        padding: 15,
        buttonSize: 50,
      };

      ps.ui.targetSelectionUI.root = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.BottomCenter,
          depth: mod.UIDepth.AboveGameUI,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 0.8,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              bgFill: mod.UIBgFill.Solid,
              bgAlpha: 0.6,
              bgColor: PCT_UI.COLORS.BLACK,
            },
          ],
        },
        dirPlayer,
      );

      ps.ui.targetSelectionUI.playerLabel = new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.Center,
          x: 0,
          y: 0,
          width: layout.width,
          height: layout.height,
          message: mod.Message("PCT_EMPTY_STRING"),
          textAnchor: mod.UIAnchor.Center,
          textSize: 22,
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.8,
        },
        dirPlayer,
      );

      ps.ui.targetSelectionUI.playerStats = new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.TopLeft,
          x: 10,
          y: 10,
          width: 70,
          height: 10,
          message: mod.Message("PCT_EMPTY_STRING"),
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.8,
          textSize: 14,
          textAnchor: mod.UIAnchor.CenterLeft,
        },
        dirPlayer,
      );

      ps.ui.targetSelectionUI.playerCountInfo = new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.TopRight,
          x: 10,
          y: 10,
          width: 10,
          height: 10,
          message: mod.Message("PCT_EMPTY_STRING"),
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.8,
          textSize: 14,
          textAnchor: mod.UIAnchor.CenterRight,
        },
        dirPlayer,
      );

      new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.BottomCenter,
          x: 0,
          y: -25,
          width: layout.width,
          height: 20,
          message: mod.Message("PCT_SPACE_TO_CYCLE_TARGET"),
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.6,
          textSize: 14,
          textAnchor: mod.UIAnchor.Center,
        },
        dirPlayer,
      );
    }

    export function Refresh(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      const psui = ps.ui.targetSelectionUI;
      if (
        !psui.root ||
        !psui.playerLabel ||
        !psui.playerCountInfo ||
        !psui.playerStats
      )
        return;

      const playerTarget = _cameraState.target.playerObject as mod.Player;
      if (playerTarget == null) return;

      if (mod.IsPlayerValid(playerTarget) && Player.IsDeployed(playerTarget)) {
        psui.playerLabel.setTextColor(PCT_UI.COLORS.WHITE);
      } else if (mod.IsPlayerValid(playerTarget)) {
        psui.playerLabel.setTextColor(PCT_UI.COLORS.RED);
      } else {
        return;
      }

      const playerKills = mod.GetPlayerKills(playerTarget);
      const playerDeaths = mod.GetPlayerDeaths(playerTarget);

      if (
        psui.lastRenderedTargetId === mod.GetObjId(playerTarget) &&
        psui.lastRenderedKills === playerKills &&
        psui.lastRenderedDeaths === playerDeaths
      )
        return;

      /*const kdRatio =
        playerKills > 0 && playerDeaths > 0
          ? Math.round((playerKills / playerDeaths + Number.EPSILON) * 100) / 100
          : 0;
      const statsMsg = kdRatio === 0
        ? mod.Message("PCT_PLAYER_STATS", playerKills, playerDeaths)
        : mod.Message("PCT_PLAYER_STATS_KD", playerKills, playerDeaths, kdRatio);*/
      const statsMsg = mod.Message(
        "PCT_PLAYER_STATS",
        playerKills,
        playerDeaths,
      );

      psui.playerLabel.setMessage(mod.Message("PCT_{}", playerTarget));
      psui.playerCountInfo.setMessage(
        mod.Message(
          "PCT_PLAYER_COUNT_INFO",
          PlayerTracking.GetTargetPlayerIndex(playerTarget),
          PlayerTracking.GetDeployedPlayersCount(),
        ),
      );
      psui.playerStats.setMessage(statsMsg);
      psui.lastRenderedTargetId = mod.GetObjId(playerTarget);
      psui.lastRenderedKills = playerKills;
      psui.lastRenderedDeaths = playerDeaths;
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.targetSelectionUI.root) {
        ps.ui.targetSelectionUI.root.destroy();
        ps.ui.targetSelectionUI.root = null;
        ps.ui.targetSelectionUI.playerLabel = null;
        ps.ui.targetSelectionUI.playerCountInfo = null;
        ps.ui.targetSelectionUI.playerStats = null;
        ps.ui.targetSelectionUI.lastRenderedTargetId = null;
        ps.ui.targetSelectionUI.lastRenderedKills = null;
        ps.ui.targetSelectionUI.lastRenderedDeaths = null;
      }
    }
  }

  namespace PathCameraSetupUI {
    export function InitPathControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      if (ps.ui.pathCameraSetupUI.pathPointsMenuRoot) {
        ps.ui.pathCameraSetupUI.pathPointsMenuRoot.show();
        RefreshPathControlMenu(dirPlayer);
        return;
      }

      const layout = {
        rootX: 30,
        rootY: -50,
        rootWidth: 375,

        titleY: 10,
        titleHeight: 30,

        paramsYStart: 50,
        vPadding: 10,
        hPadding: 30,
        rowGap: 5,

        keyTextWidth: 125,
        textHeight: 25,
      };

      const rowHeight = layout.textHeight + layout.rowGap + layout.vPadding;

      const paramsHeight = _trackedPathPointsInfoUIRows.length * rowHeight;

      const rootHeight = layout.paramsYStart + paramsHeight + layout.vPadding;

      const root = new PCT_UI.Container(
        {
          x: layout.rootX,
          y: layout.rootY,
          width: layout.rootWidth,
          height: rootHeight,
          anchor: mod.UIAnchor.CenterLeft,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          depth: mod.UIDepth.AboveGameUI,
          showOutline: true,
          visible: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              x: 0,
              y: 0,
              width: layout.rootWidth,
              height: rootHeight,
              anchor: mod.UIAnchor.TopLeft,
              bgFill: mod.UIBgFill.Solid,
              bgColor: PCT_UI.COLORS.BLACK,
              bgAlpha: 0.6,
            },
            {
              type: PCT_UI.Type.Text,
              x: 0,
              y: layout.titleY,
              width: layout.rootWidth,
              height: layout.titleHeight,
              anchor: mod.UIAnchor.TopCenter,
              textSize: 18,
              textColor: PCT_UI.COLORS.WHITE,
              textAnchor: mod.UIAnchor.Center,
              message: mod.Message("PCT_PATHPOINTS_SETTINGS"),
            },
          ],
        },
        dirPlayer,
      );

      ps.ui.pathCameraSetupUI.pathPointsMenuRoot = root;
      ps.ui.pathCameraSetupUI.trackedPathPointsInfo = [];

      for (let i = 0; i < _trackedPathPointsInfoUIRows.length; i++) {
        CreatePathPointsInfoRow(i);
      }

      RefreshPathControlMenu(dirPlayer);

      function CreatePathPointsInfoRow(index: number): void {
        const schema = _trackedPathPointsInfoUIRows[index];
        const initialValue = _trackedPathPointsInfo[schema.id];

        const rowY = layout.paramsYStart + index * rowHeight;
        const keyY = rowY;

        CreateDivider(keyY);

        const keyText = CreateKeyText(schema.key, keyY);
        const valueText = CreateValueText(schema.id, keyY);

        ps!.ui.pathCameraSetupUI.trackedPathPointsInfo!.push({
          id: schema.id,
          key: keyText,
          value: valueText,
          lastRenderedValue: initialValue,
        });
      }

      function CreateDivider(y: number): void {
        new PCT_UI.Container(
          {
            parent: root,
            x: 0,
            y: y - 2,
            width: layout.rootWidth - layout.hPadding * 2,
            height: 1,
            anchor: mod.UIAnchor.TopCenter,
            bgFill: mod.UIBgFill.Solid,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.1,
          },
          dirPlayer,
        );
      }

      function CreateKeyText(messageKey: string, y: number): PCT_UI.Text {
        return new PCT_UI.Text(
          {
            parent: root,
            x: layout.hPadding,
            y: y + 4,
            width: layout.keyTextWidth,
            height: layout.textHeight,
            anchor: mod.UIAnchor.TopLeft,
            textSize: 16,
            textColor: PCT_UI.COLORS.WHITE,
            textAnchor: mod.UIAnchor.CenterLeft,
            message: mod.Message(messageKey),
          },
          dirPlayer,
        );
      }

      function CreateValueText(
        schemaId: TrackedPathPointsRowId,
        y: number,
      ): PCT_UI.Text {
        const msg = FormatMessageForValue(schemaId);

        return new PCT_UI.Text(
          {
            parent: root,
            x: layout.hPadding + layout.keyTextWidth,
            y: y + 4,
            width: layout.rootWidth - layout.hPadding * 2 - layout.keyTextWidth,
            height: layout.textHeight,
            anchor: mod.UIAnchor.TopLeft,
            textSize: 16,
            textAlpha: 0.8,
            textColor: PCT_UI.COLORS.WHITE,
            textAnchor: mod.UIAnchor.CenterRight,
            message: msg,
          },
          dirPlayer,
        );
      }
    }

    export function ShowPathControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.pathCameraSetupUI.pathPointsMenuRoot?.show();
      RefreshPathControlMenu(dirPlayer);
    }

    export function HidePathControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.pathCameraSetupUI.pathPointsMenuRoot?.hide();
    }

    export function RefreshPathControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      const trackedPathPointsInfo =
        ps.ui.pathCameraSetupUI.trackedPathPointsInfo;
      if (!trackedPathPointsInfo) return;

      SyncTrackedPathPointsInfo();

      for (const row of trackedPathPointsInfo) {
        const nextValue = _trackedPathPointsInfo[row.id];

        if (row.lastRenderedValue === nextValue) continue;

        row.value.setMessage(FormatMessageForValue(row.id));
        row.lastRenderedValue = nextValue;
      }
    }

    export async function InitMovePointTipWindow(
      dirPlayer: mod.Player,
    ): Promise<void> {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null || ps.ui.pathCameraSetupUI.pathMoveTipShown) return;

      if (ps.ui.pathCameraSetupUI.movePointTipRoot) {
        ps.ui.pathCameraSetupUI.movePointTipRoot.show();
        return;
      }

      const layout = {
        x: 0,
        y: 200,
        width: 350,
        height: 100,
      };

      ps.ui.pathCameraSetupUI.movePointTipRoot = new PCT_UI.Container(
        {
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          anchor: mod.UIAnchor.Center,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          depth: mod.UIDepth.AboveGameUI,
          showOutline: true,
          visible: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              anchor: mod.UIAnchor.TopLeft,
              bgFill: mod.UIBgFill.Solid,
              bgColor: PCT_UI.COLORS.BLACK,
              bgAlpha: 0.8,
            },
            {
              type: PCT_UI.Type.Text,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              anchor: mod.UIAnchor.Center,
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAnchor: mod.UIAnchor.Center,
              message: mod.Message("PCT_MOVE_POINT_TIP"),
            },
          ],
        },
        dirPlayer,
      );

      ps.ui.pathCameraSetupUI.pathMoveTipShown = true;

      while (!Player.IsAiming(dirPlayer)) {
        await mod.Wait(1);
      }

      ps.ui.pathCameraSetupUI.movePointTipRoot.hide();
    }

    export function ShowMovePointTipWindow(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.pathCameraSetupUI.movePointTipRoot?.show();
    }

    export function HideMovePointTipWindow(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.pathCameraSetupUI.movePointTipRoot?.hide();
    }

    export function DestroyMovePointTipWindow(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.pathCameraSetupUI.movePointTipRoot) {
        ps.ui.pathCameraSetupUI.movePointTipRoot.destroy();
        ps.ui.pathCameraSetupUI.movePointTipRoot = null;
        ps.ui.pathCameraSetupUI.pathMoveTipShown = false;
      }
    }

    export function InitCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      if (ps.ui.pathCameraSetupUI.cameraControlMenuRoot) {
        ps.ui.pathCameraSetupUI.cameraControlMenuRoot.show();
        RefreshCameraControlMenu(dirPlayer);
        return;
      }

      const layout = {
        rootX: 30,
        rootY: -50,
        rootWidth: 220,

        titleY: 10,
        titleHeight: 30,

        paramsYStart: 50,
        padding: 10,
        rowGap: 5,

        textWidth: 200,
        textHeight: 25,

        selectorButtonWidth: 25,
        stopButtonWidth: 200,
        stopButtonHeight: 30,
      };

      const rowHeight =
        layout.textHeight + layout.rowGap + layout.textHeight + layout.padding;

      const paramsHeight = _trackedCamSettingsInfoUIRows.length * rowHeight;

      const rootHeight =
        layout.paramsYStart +
        paramsHeight +
        layout.padding * 2 +
        layout.stopButtonHeight;

      const root = new PCT_UI.Container(
        {
          x: layout.rootX,
          y: layout.rootY,
          width: layout.rootWidth,
          height: rootHeight,
          anchor: mod.UIAnchor.CenterLeft,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          depth: mod.UIDepth.AboveGameUI,
          showOutline: true,
          visible: false,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              x: 0,
              y: 0,
              width: layout.rootWidth,
              height: rootHeight,
              anchor: mod.UIAnchor.TopLeft,
              bgFill: mod.UIBgFill.Solid,
              bgColor: PCT_UI.COLORS.BLACK,
              bgAlpha: 0.6,
            },
            {
              type: PCT_UI.Type.Text,
              x: 0,
              y: layout.titleY,
              width: layout.textWidth,
              height: layout.titleHeight,
              anchor: mod.UIAnchor.TopCenter,
              textSize: 18,
              textColor: PCT_UI.COLORS.WHITE,
              textAnchor: mod.UIAnchor.Center,
              message: mod.Message("PCT_CAMERA_PATH_SETTINGS"),
            },
          ],
        },
        dirPlayer,
      );

      ps.ui.pathCameraSetupUI.cameraControlMenuRoot = root;
      ps.ui.pathCameraSetupUI.buttons = [];
      ps.ui.pathCameraSetupUI.trackedCamSettingsInfo = [];

      for (let i = 0; i < _trackedCamSettingsInfoUIRows.length; i++) {
        CreateCameraSettingRow(i);
      }

      CreateStopButton();
      RefreshCameraControlMenu(dirPlayer);

      InitControlNotice(dirPlayer);

      function CreateCameraSettingRow(index: number): void {
        const schema = _trackedCamSettingsInfoUIRows[index];
        const initialValue = _trackedCamSettingsInfo[schema.id];

        const rowY = layout.paramsYStart + index * rowHeight;
        const keyY = rowY;
        const controlY = rowY + layout.textHeight;

        CreateDivider(keyY);

        const keyText = CreateKeyText(schema.key, keyY);
        const valueText = CreateValueText(schema.id, controlY);

        CreateSelectorButton(
          "PCT_<",
          controlY,
          mod.UIAnchor.TopLeft,
          async () => {
            AdjustTrackedCamSettingsValue(schema.id, -schema.step);
            RefreshCameraControlMenu(dirPlayer);
          },
        );

        CreateSelectorButton(
          "PCT_>",
          controlY,
          mod.UIAnchor.TopRight,
          async () => {
            AdjustTrackedCamSettingsValue(schema.id, schema.step);
            RefreshCameraControlMenu(dirPlayer);
          },
        );

        ps!.ui.pathCameraSetupUI.trackedCamSettingsInfo!.push({
          id: schema.id,
          key: keyText,
          value: valueText,
          lastRenderedValue: initialValue,
        });
      }

      function CreateKeyText(messageKey: string, y: number): PCT_UI.Text {
        return new PCT_UI.Text(
          {
            parent: root,
            x: 0,
            y,
            width: layout.textWidth,
            height: layout.textHeight,
            anchor: mod.UIAnchor.TopCenter,
            textSize: 16,
            textColor: PCT_UI.COLORS.WHITE,
            textAnchor: mod.UIAnchor.Center,
            message: mod.Message(messageKey),
          },
          dirPlayer,
        );
      }

      function CreateValueText(
        id: TrackedCamSettingsRowId,
        y: number,
      ): PCT_UI.Text {
        return new PCT_UI.Text(
          {
            parent: root,
            x: 0,
            y,
            width:
              layout.rootWidth -
              (layout.padding +
                layout.selectorButtonWidth +
                layout.padding * 2),
            height: layout.textHeight,
            anchor: mod.UIAnchor.TopCenter,
            textSize: 16,
            textColor: PCT_UI.COLORS.WHITE,
            textAnchor: mod.UIAnchor.Center,
            message: FormatMessageForValue(id),
          },
          dirPlayer,
        );
      }

      function CreateSelectorButton(
        label: string,
        y: number,
        anchor: mod.UIAnchor,
        onClick: (buttonPlayer: mod.Player) => Promise<void>,
      ): PCT_UI.Button {
        const button = new PCT_UI.Button(
          {
            parent: root,
            x: layout.padding,
            y,
            width: layout.selectorButtonWidth,
            height: layout.selectorButtonWidth,
            anchor,
            bgFill: mod.UIBgFill.OutlineThin,
            hoverAlpha: 0.8,
            hoverColor: PCT_UI.COLORS.WHITE,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.2,
            label: {
              message: mod.Message(label),
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
              textAnchor: mod.UIAnchor.Center,
            },
            onClick,
          },
          dirPlayer,
        );

        ps!.ui.pathCameraSetupUI.buttons!.push(button);
        return button;
      }

      function CreateDivider(y: number): void {
        new PCT_UI.Container(
          {
            parent: root,
            x: 0,
            y: y - 2,
            width: layout.textWidth,
            height: 1,
            anchor: mod.UIAnchor.TopCenter,
            bgFill: mod.UIBgFill.Solid,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.1,
          },
          dirPlayer,
        );
      }

      function CreateStopButton(): PCT_UI.Button {
        const button = new PCT_UI.Button(
          {
            parent: root,
            x: 0,
            y: layout.paramsYStart + paramsHeight + layout.padding,
            width: layout.stopButtonWidth,
            height: layout.stopButtonHeight,
            anchor: mod.UIAnchor.TopCenter,
            bgFill: mod.UIBgFill.OutlineThin,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.2,
            label: {
              message: mod.Message("PCT_STOP_CAMERA"),
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
              textAnchor: mod.UIAnchor.Center,
            },
            onClick: async (buttonPlayer: mod.Player) => {
              _cameraState.isRunning = false;
              RefreshCameraControlMenu(buttonPlayer);
            },
          },
          dirPlayer,
        );

        ps!.ui.pathCameraSetupUI.buttons!.push(button);
        return button;
      }
    }

    export function ShowCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.pathCameraSetupUI.cameraControlMenuRoot?.show();
      RefreshCameraControlMenu(dirPlayer);
    }

    export function HideCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.pathCameraSetupUI.cameraControlMenuRoot?.hide();
    }

    export function RefreshCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      const trackedCamSettingsInfo =
        ps.ui.pathCameraSetupUI.trackedCamSettingsInfo;
      if (!trackedCamSettingsInfo) return;

      SyncTrackedCamSettingsInfo();

      for (const row of trackedCamSettingsInfo) {
        const nextValue = _trackedCamSettingsInfo[row.id];

        RefreshRowState(row);

        if (row.lastRenderedValue === nextValue) continue;

        row.value.setMessage(FormatMessageForValue(row.id));
        row.lastRenderedValue = nextValue;
      }
    }

    function AdjustTrackedCamSettingsValue(
      id: TrackedCamSettingsRowId,
      delta: number,
    ): void {
      SyncTrackedCamSettingsInfo();

      if (id === "cameraTarget") {
        AdjustCameraTarget(delta);
        SyncTrackedCamSettingsInfo();
        return;
      }

      const currentValue = _trackedCamSettingsInfo[id];
      if (typeof currentValue !== "number") return;

      const schema = GetRowSchema(id);
      if (schema === null) return;

      const finalValue = ClampRowValue(currentValue + delta, schema);

      switch (id) {
        case "cameraSpeed":
          _cameraState.speed = finalValue;
          break;

        case "maxPitchUpDeg":
          _cameraState.maxPitchUpDeg = finalValue;
          break;

        case "maxPitchDownDeg":
          _cameraState.maxPitchDownDeg = finalValue;
          break;

        case "cornerRadius":
          _pathState.cornerRadius = finalValue;
          _cameraState.reset = true;
          break;

        case "lookAheadDistance":
          _cameraState.lookAheadDistance = finalValue;
          break;

        case "cameraTargetType":
          SetCameraTargetType(finalValue as CameraTargetType);
          break;

        case "vfxFrequencyPercent":
          _vfxState.spawnChance = finalValue / 100;
          if (_vfxState.spawnChance > 0 && !_vfxState.isRunning) {
            VFX.StartLoop();
          } else if (_vfxState.spawnChance === 0 && _vfxState.isRunning) {
            VFX.StopLoop();
          }
          break;
      }

      SyncTrackedCamSettingsInfo();
    }

    function SetCameraTargetType(targetType: CameraTargetType): void {
      _cameraState.target.type = targetType;

      if (targetType === CameraTargetType.Player) {
        const firstPlayer = PlayerTracking.GetFirstDeployedNonDirectorPlayer();
        _cameraState.target.playerObject = firstPlayer;
        _cameraState.target.previousTargetPlayerObject = firstPlayer;
        _cameraState.target.trackingActive = firstPlayer !== null;
        return;
      }

      _cameraState.target.playerObject = null;
      _cameraState.target.trackingActive = false;
    }

    function AdjustCameraTarget(delta: number): void {
      if (_cameraState.target.type !== CameraTargetType.Player) return;

      const currentTarget = _cameraState.target.playerObject;

      if (delta > 0) {
        PlayerTracking.FindNextTarget(currentTarget);
      } else {
        PlayerTracking.FindPreviousTarget(currentTarget);
      }

      SyncTrackedCamSettingsInfo();
    }

    function GetRowSchema(
      id: TrackedCamSettingsRowId,
    ): TrackedCamSettingsRowSchema | null {
      for (const schema of _trackedCamSettingsInfoUIRows) {
        if (schema.id === id) return schema;
      }

      return null;
    }

    function ClampRowValue(
      value: number,
      schema: TrackedCamSettingsRowSchema,
    ): number {
      const min = schema.min ?? Number.MIN_SAFE_INTEGER;
      const max = schema.max ?? Number.MAX_SAFE_INTEGER;

      return value < min ? min : value > max ? max : value;
    }

    function RefreshRowState(row: TrackedCamSettingsUIRow): void {
      const cameraInFreeMode =
        _cameraState.isRunning === true &&
        _cameraState.type === CameraType.Free;

      if (row.id === "cameraTarget") {
        RefreshCameraTargetRow(row);
        return;
      }

      if (row.id === "cameraTargetType") {
        row.key.setTextAlpha(cameraInFreeMode ? 0.2 : 1);
        row.value.setTextAlpha(cameraInFreeMode ? 0.2 : 1);
        row.value.setTextColor(PCT_UI.COLORS.WHITE);
        return;
      }

      row.key.setTextAlpha(1);
      row.value.setTextAlpha(1);
      row.value.setTextColor(PCT_UI.COLORS.WHITE);
    }

    function RefreshCameraTargetRow(row: TrackedCamSettingsUIRow): void {
      const isPlayerTarget =
        _cameraState.target.type === CameraTargetType.Player;
      const targetPlayer = _cameraState.target.playerObject;

      if (
        isPlayerTarget &&
        targetPlayer !== null &&
        mod.IsPlayerValid(targetPlayer) &&
        Player.IsDeployed(targetPlayer)
      ) {
        row.value.setTextColor(PCT_UI.COLORS.GREEN);
      } else if (isPlayerTarget) {
        row.value.setTextColor(PCT_UI.COLORS.RED);
      } else {
        row.value.setTextColor(PCT_UI.COLORS.WHITE);
      }

      row.value.setTextAlpha(isPlayerTarget ? 1 : 0.2);
      row.key.setTextAlpha(isPlayerTarget ? 1 : 0.2);
    }

    function InitControlNotice(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;

      const layout = {
        x: 0,
        y: 75,
        width: 700,
        height: 80,
      };

      ps.ui.pathCameraSetupUI.controlNoticeRoot = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.TopCenter,
          depth: mod.UIDepth.AboveGameUI,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 0.8,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              bgFill: mod.UIBgFill.Solid,
              bgColor: PCT_UI.COLORS.BLACK,
              bgAlpha: 0.6,
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: 5,
              width: layout.width,
              height: layout.height / 2,
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 0.9,
              message: mod.Message("PCT_CONTROL_NOTICE_INACTIVE_1"),
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: -5 + layout.height / 2,
              width: layout.width,
              height: layout.height / 2,
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 0.7,
              message: mod.Message("PCT_CONTROL_NOTICE_INACTIVE_2"),
            },
          ],
        },
        player,
      );
    }

    export function RefreshControlNotice(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      if (!ps.ui.pathCameraSetupUI.controlNoticeRoot) return;

      let firstTextRefreshed = false;

      ps.ui.pathCameraSetupUI.controlNoticeRoot.children.forEach((child) => {
        if (child instanceof PCT_UI.Text && !firstTextRefreshed) {
          child.setMessage(
            _cameraState.isRunning
              ? mod.Message("PCT_CONTROL_NOTICE_ACTIVE_1")
              : mod.Message("PCT_CONTROL_NOTICE_INACTIVE_1"),
          );
          firstTextRefreshed = true;
        } else if (child instanceof PCT_UI.Text) {
          child.setMessage(
            _cameraState.isRunning
              ? mod.Message("PCT_CONTROL_NOTICE_ACTIVE_2")
              : mod.Message("PCT_CONTROL_NOTICE_INACTIVE_2"),
          );
        }
      });
    }

    export function ToggleCameraControlVisible(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      if (ps.ui.pathCameraSetupUI.cameraControlMenuRoot) {
        ps.ui.pathCameraSetupUI.cameraControlMenuRoot.toggle();
      }
      if (ps.ui.pathCameraSetupUI.controlNoticeRoot) {
        ps.ui.pathCameraSetupUI.controlNoticeRoot.toggle();
      }
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;

      if (ps.ui.pathCameraSetupUI.pathPointsMenuRoot) {
        ps.ui.pathCameraSetupUI.pathPointsMenuRoot.destroy();
        ps.ui.pathCameraSetupUI.pathPointsMenuRoot = null;
      }

      if (ps.ui.pathCameraSetupUI.cameraControlMenuRoot) {
        ps.ui.pathCameraSetupUI.cameraControlMenuRoot.destroy();
        ps.ui.pathCameraSetupUI.cameraControlMenuRoot = null;
      }

      if (ps.ui.pathCameraSetupUI.controlNoticeRoot) {
        ps.ui.pathCameraSetupUI.controlNoticeRoot.destroy();
        ps.ui.pathCameraSetupUI.controlNoticeRoot = null;
      }

      ps.ui.pathCameraSetupUI.trackedCamSettingsInfo = [];
      ps.ui.pathCameraSetupUI.buttons = [];
    }
  }

  namespace PlayerPresetCameraUI {
    export function InitCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      if (ps.ui.playerPresetCameraUI.root) {
        ps.ui.playerPresetCameraUI.root.show();
        RefreshCameraControlMenu(dirPlayer);
        return;
      }

      const layout = {
        rootX: 30,
        rootY: -50,
        rootWidth: 300,

        titleY: 10,
        titleHeight: 30,

        paramsYStart: 50,
        padding: 10,
        rowGap: 5,

        textWidth: 280,
        textHeight: 25,

        selectorButtonWidth: 25,
        stopButtonWidth: 280,
        stopButtonHeight: 30,
      };

      const rowHeight =
        layout.textHeight + layout.rowGap + layout.textHeight + layout.padding;

      const paramsHeight = rowHeight;

      const rootHeight =
        layout.paramsYStart +
        paramsHeight +
        layout.padding * 2 +
        layout.stopButtonHeight;

      const root = new PCT_UI.Container(
        {
          x: layout.rootX,
          y: layout.rootY,
          width: layout.rootWidth,
          height: rootHeight,
          anchor: mod.UIAnchor.CenterLeft,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          depth: mod.UIDepth.AboveGameUI,
          showOutline: true,
          visible: false,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              x: 0,
              y: 0,
              width: layout.rootWidth,
              height: rootHeight,
              anchor: mod.UIAnchor.TopLeft,
              bgFill: mod.UIBgFill.Solid,
              bgColor: PCT_UI.COLORS.BLACK,
              bgAlpha: 0.6,
            },
            {
              type: PCT_UI.Type.Text,
              x: 0,
              y: layout.titleY,
              width: layout.textWidth,
              height: layout.titleHeight,
              anchor: mod.UIAnchor.TopCenter,
              textSize: 18,
              textColor: PCT_UI.COLORS.WHITE,
              textAnchor: mod.UIAnchor.Center,
              message: mod.Message("PCT_PLAYER_PRESET_CAMERA_SETTINGS"),
            },
          ],
        },
        dirPlayer,
      );

      ps.ui.playerPresetCameraUI.root = root;
      ps.ui.playerPresetCameraUI.buttons = [];
      ps.ui.playerPresetCameraUI.lastRenderedPresetIndex = null;

      CreatePresetRow();
      CreateStopButton();

      RefreshCameraControlMenu(dirPlayer);

      function CreatePresetRow(): void {
        const rowY = layout.paramsYStart;
        const keyY = rowY;
        const controlY = rowY + layout.textHeight;

        CreateDivider(keyY);

        new PCT_UI.Text(
          {
            parent: root,
            x: 0,
            y: keyY,
            width: layout.textWidth,
            height: layout.textHeight,
            anchor: mod.UIAnchor.TopCenter,
            textSize: 16,
            textColor: PCT_UI.COLORS.WHITE,
            textAnchor: mod.UIAnchor.Center,
            message: mod.Message("PCT_PRESET"),
          },
          dirPlayer,
        );

        ps!.ui.playerPresetCameraUI.presetValue = new PCT_UI.Text(
          {
            parent: root,
            x: 0,
            y: controlY,
            width:
              layout.rootWidth -
              (layout.padding +
                layout.selectorButtonWidth +
                layout.padding * 2),
            height: layout.textHeight,
            anchor: mod.UIAnchor.TopCenter,
            textSize: 16,
            textColor: PCT_UI.COLORS.WHITE,
            textAnchor: mod.UIAnchor.Center,
            message: FormatCameraPresetMessage(),
          },
          dirPlayer,
        );

        CreateSelectorButton(
          "PCT_<",
          controlY,
          mod.UIAnchor.TopLeft,
          async () => {
            AdjustCameraPreset(-1);
            RefreshCameraControlMenu(dirPlayer);
          },
        );

        CreateSelectorButton(
          "PCT_>",
          controlY,
          mod.UIAnchor.TopRight,
          async () => {
            AdjustCameraPreset(1);
            RefreshCameraControlMenu(dirPlayer);
          },
        );
      }

      function CreateSelectorButton(
        label: string,
        y: number,
        anchor: mod.UIAnchor,
        onClick: (buttonPlayer: mod.Player) => Promise<void>,
      ): PCT_UI.Button {
        const button = new PCT_UI.Button(
          {
            parent: root,
            x: layout.padding,
            y,
            width: layout.selectorButtonWidth,
            height: layout.selectorButtonWidth,
            anchor,
            bgFill: mod.UIBgFill.OutlineThin,
            hoverAlpha: 0.8,
            hoverColor: PCT_UI.COLORS.WHITE,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.2,
            label: {
              message: mod.Message(label),
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
              textAnchor: mod.UIAnchor.Center,
            },
            onClick,
          },
          dirPlayer,
        );

        ps!.ui.playerPresetCameraUI.buttons!.push(button);
        return button;
      }

      function CreateDivider(y: number): void {
        new PCT_UI.Container(
          {
            parent: root,
            x: 0,
            y: y - 2,
            width: layout.textWidth,
            height: 1,
            anchor: mod.UIAnchor.TopCenter,
            bgFill: mod.UIBgFill.Solid,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.1,
          },
          dirPlayer,
        );
      }

      function CreateStopButton(): PCT_UI.Button {
        const button = new PCT_UI.Button(
          {
            parent: root,
            x: 0,
            y: layout.paramsYStart + paramsHeight + layout.padding,
            width: layout.stopButtonWidth,
            height: layout.stopButtonHeight,
            anchor: mod.UIAnchor.TopCenter,
            bgFill: mod.UIBgFill.OutlineThin,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.2,
            label: {
              message: mod.Message("PCT_STOP_CAMERA"),
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
              textAnchor: mod.UIAnchor.Center,
            },
            onClick: async (buttonPlayer: mod.Player) => {
              _cameraState.isRunning = false;
              RefreshCameraControlMenu(buttonPlayer);
            },
          },
          dirPlayer,
        );

        ps!.ui.playerPresetCameraUI.buttons!.push(button);
        return button;
      }
    }

    export function ShowCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      if (!ps.ui.playerPresetCameraUI.root) {
        InitCameraControlMenu(dirPlayer);
      }

      ps.ui.playerPresetCameraUI.root?.show();
      RefreshCameraControlMenu(dirPlayer);
    }

    export function HideCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;
      ps.ui.playerPresetCameraUI.root?.hide();
    }

    export function RefreshCameraControlMenu(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) return;

      const presetIndex = _cameraState.playerPresets.selectedPresetIndex;

      if (ps.ui.playerPresetCameraUI.lastRenderedPresetIndex === presetIndex) {
        return;
      }

      ps.ui.playerPresetCameraUI.presetValue?.setMessage(
        FormatCameraPresetMessage(),
      );

      ps.ui.playerPresetCameraUI.lastRenderedPresetIndex = presetIndex;
    }

    export function InitPortalGadgetNotice(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) {
        return;
      }

      if (ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot) {
        ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot.show();
        return;
      }

      const layout = {
        x: 0,
        y: 75,
        width: 700,
        height: 80,
      };

      ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.TopCenter,
          depth: mod.UIDepth.AboveGameUI,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 0.8,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              bgFill: mod.UIBgFill.Solid,
              bgColor: PCT_UI.COLORS.BLACK,
              bgAlpha: 0.6,
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: 5,
              width: layout.width,
              height: layout.height / 2,
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 0.9,
              message: mod.Message("PCT_PORTAL_GADGET_NOTICE_1"),
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: -5 + layout.height / 2,
              width: layout.width,
              height: layout.height / 2,
              textSize: 16,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 0.7,
              message: mod.Message("PCT_PORTAL_GADGET_NOTICE_2"),
            },
          ],
        },
        dirPlayer,
      );
    }

    export function ShowPortalGadgetNotice(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) {
        return;
      }
      ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot?.show();
    }

    export function HidePortalGadgetNotice(dirPlayer: mod.Player): void {
      const ps = Player.GetOrCreate(dirPlayer);
      if (ps === null) {
        return;
      }
      ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot?.hide();
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;

      if (ps.ui.playerPresetCameraUI.root) {
        ps.ui.playerPresetCameraUI.root.destroy();
        ps.ui.playerPresetCameraUI.root = null;
      }

      if (ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot) {
        ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot.destroy();
        ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot = null;
      }

      ps.ui.playerPresetCameraUI.presetValue = null;
      ps.ui.playerPresetCameraUI.buttons = [];
      ps.ui.playerPresetCameraUI.lastRenderedPresetIndex = null;
    }
  }

  /************************
   * PCT Event Handlers
   *************************/

  export async function PCTOnPlayerUIButtonEvent(
    player: mod.Player,
    eventUIWidget: mod.UIWidget,
    eventUIButtonEvent: mod.UIButtonEvent,
  ): Promise<void> {
    await PCT_UI.OnButtonClick(player, eventUIWidget, eventUIButtonEvent);
  }

  export async function PCTOnPlayerDeployed(player: mod.Player): Promise<void> {
    if (!mod.IsPlayerValid(player)) return;

    const dirPlayer = Player.GetDirectorPlayerObject();

    if (
      !Player.IsAI(player) &&
      dirPlayer &&
      mod.GetObjId(player) === mod.GetObjId(dirPlayer)
    ) {
      if (_directorInteractPoint) {
        mod.UnspawnObject(_directorInteractPoint);
        _directorInteractPoint = null;
      }

      if (PCT_WIM.init().getIconExists("director-panel")) {
        PCT_WIM.init().deleteIcon("director-panel");
      }

      (async () => {
        await mod.Wait(0.5);

        const playerPosVector = V3.ToVector(Player.GetEyePosition(dirPlayer));

        _directorInteractPoint = mod.SpawnObject(
          rtc.InteractPoint,
          playerPosVector,
          Vector.Zero(),
        ) as mod.InteractPoint;

        PCT_WIM.init().createIcon("director-panel", playerPosVector, {
          icon: mod.WorldIconImages.SquadPing,
          iconVisible: true,
          text: mod.Message("PCT_INTERACT_HERE"),
          textVisible: true,
          color: PCT_UI.COLORS.RED,
        });
      })().catch((error: unknown) => {
        PCT_ErrorLogger.New(
          PCTOnPlayerDeployed.name,
          `Error spawning director interact point: ${String(error)}`,
          7,
        );
      });
    }

    if (
      Player.GetIsDirector(player) &&
      _cameraState.type === CameraType.Free &&
      _cameraState.isRunning
    ) {
      await mod.Wait(0.1);
      mod.Teleport(player, V3.ToVector(_directorControlRoomSpawnPos), 0);
    }

    // mod.AddUIIcon appears to be bugged
    /*if (_showPlayerNametags) {
      const dirPlayer = Player.GetDirectorPlayerObject();
      if (!dirPlayer) return;

      mod.AddUIIcon(
        player,
        mod.WorldIconImages.Triangle,
        1,
        mod.GetObjId(mod.GetTeam(player)) === 1
          ? PCT_UI.COLORS.BLUE
          : PCT_UI.COLORS.RED,
        mod.Message("PCT_{}", player),
        dirPlayer,
      );
    }*/
  }

  export function OnPlayerUndeploy(player: mod.Player): void {
    if (!mod.IsPlayerValid(player)) return;

    // mod.AddUIIcon appears to be bugged
    /*if (_showPlayerNametags) {
      mod.RemoveUIIcon(player);
    }*/
  }

  export async function PCTOnPlayerInteract(
    player: mod.Player,
    interactPoint: mod.InteractPoint,
  ): Promise<void> {
    const ipId = mod.GetObjId(interactPoint);
    const ps = Player.Get(player);

    if (
      _directorInteractPoint &&
      ipId === mod.GetObjId(_directorInteractPoint) &&
      !_cameraState.isRunning
    ) {
      if (!Player.HasAssignedDirector()) {
        DirectorCodeEntryUI.Init(player);
      } else {
        DirectorMenuUI.Init(player);
      }
    } else if (
      ps?.directorState?.pathCameraInteractPoint &&
      ipId === mod.GetObjId(ps.directorState.pathCameraInteractPoint) &&
      Player.GetIsDirector(player) &&
      _cameraState.isRunning
    ) {
      PathCameraSetupUI.ToggleCameraControlVisible(player);
    } else if (
      _freeCamInteractPoint &&
      ipId === mod.GetObjId(_freeCamInteractPoint) &&
      Player.GetIsDirector(player) &&
      _cameraState.isRunning
    ) {
      _cameraState.isRunning = false;
      mod.Teleport(player, mod.GetObjectPosition(_freeCamInteractPoint), 0);
      await mod.Wait(SD);
      mod.Kill(player);
    }
  }

  export async function PCTOnPlayerLeaveGame(pid: number): Promise<void> {
    const ps = Player.GetById(pid);
    if (!ps) return;

    DirectorMenuUI.Destroy(pid);
    DirectorCodeEntryUI.Destroy(pid);
    PathCameraSetupUI.DestroyMovePointTipWindow(pid);
    PlayerPresetCameraUI.Destroy(pid);

    if (ps.isDirector) {
      _cameraState.isRunning = false;
      _cameraState.reset = false;

      if (_freeCamInteractPoint) {
        mod.UnspawnObject(_freeCamInteractPoint);
        _freeCamInteractPoint = null;
      }

      if (ps.directorState?.pathCameraInteractPoint) {
        mod.UnspawnObject(ps.directorState.pathCameraInteractPoint);
        ps.directorState.pathCameraInteractPoint = null;
      }

      if (_directorInteractPoint) {
        mod.UnspawnObject(_directorInteractPoint);
        _directorInteractPoint = null;
      }

      if (PCT_WIM.init().getIconExists("director-panel")) {
        PCT_WIM.init().deleteIcon("director-panel");
      }

      _directorInteractPoint = mod.SpawnObject(
        rtc.InteractPoint,
        V3.ToVector(_cameraObjectInitialPos),
        Vector.Zero(),
      ) as mod.InteractPoint;

      PCT_WIM.init().createIcon(
        "director-panel",
        V3.ToVector(_cameraObjectInitialPos),
        {
          icon: mod.WorldIconImages.SquadPing,
          iconVisible: true,
          text: mod.Message("PCT_INTERACT_HERE"),
          textVisible: true,
          color: PCT_UI.COLORS.RED,
        },
      );
    }

    Player.UnassignAsDirector(pid);

    await mod.Wait(SD);

    Player.RemoveById(pid);
  }

  export function PCTOnRayCastHit(
    eventPlayer: mod.Player,
    eventPoint: mod.Vector,
    eventNormal: mod.Vector,
  ): void {
    FreeCamCollision.OnHit(eventPlayer, eventPoint, eventNormal);
  }

  export function PCTOnRayCastMissed(eventPlayer: mod.Player): void {
    FreeCamCollision.OnMissed(eventPlayer);
  }

  export function PCTOnPortalGadgetAimStart(player: mod.Player): void {
    const ps = Player.GetOrCreate(player);
    if (!ps?.directorState) return;
    ps.directorState.actionState.isAimingPortalGadget = true;
  }

  export function PCTOnPortalGadgetAimStop(player: mod.Player): void {
    const ps = Player.GetOrCreate(player);
    if (!ps?.directorState) return;
    ps.directorState.actionState.isAimingPortalGadget = false;
  }

  export function PCTOnPortalGadgetFireStart(player: mod.Player): void {
    const ps = Player.GetOrCreate(player);
    if (!ps?.directorState) return;
    ps.directorState.actionState.isFiringPortalGadget = true;

    if (_cameraState.type === CameraType.PlayerPreset) {
      AdjustCameraPreset(1);
      PlayerPresetCameraUI.RefreshCameraControlMenu(player);

      if (
        ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot &&
        ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot.visible
      ) {
        ps.ui.playerPresetCameraUI.portalGadgetNoticeRoot.hide();
      }
    }
  }

  export function PCTOnPortalGadgetFireStop(player: mod.Player): void {
    const ps = Player.GetOrCreate(player);
    if (!ps?.directorState) return;
    ps.directorState.actionState.isFiringPortalGadget = false;
  }

  export function PCTOnPortalGadgetLaserToggle(
    player: mod.Player,
    state: boolean,
  ): void {
    const ps = Player.GetOrCreate(player);
    if (!ps?.directorState) return;
    ps.directorState.actionState.isPortalLaserActive = state;

    if (_cameraState.type === CameraType.PlayerPreset && state) {
      PlayerPresetCameraUI.ShowCameraControlMenu(player);
    } else if (_cameraState.type === CameraType.PlayerPreset && !state) {
      PlayerPresetCameraUI.HideCameraControlMenu(player);
    }
  }
}
