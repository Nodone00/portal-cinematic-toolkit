# Portal Cinematic Toolkit (PCT)

v 1.01

**Portal Camera Toolkit (PCT)** is a Battlefield Portal camera-control module for creating and operating cinematic fixed-camera paths, player-follow cameras and free camera movement.

This script can be used in two ways:

1. **Standalone**: as the main script of a Portal experience, for example with a custom map.
2. **Integrated**: pasted into an existing Portal script and connected to your existing event hooks.

I wish to emphasize that the script is a work in progress and is not necessarily optimized as much as it could. Thanks in advance for your understanding :)

---

## Features

- Director-only camera control system.
- Passcode-protected director assignment.
- Fixed-camera setup using a Godot Fixed Camera object.
- In-world interaction point for opening the director panel.
- Path camera mode with editable path points, including controls for camera speed, path smoothness and VFX spawning along the camera path.
- Free camera mode, including player target selection and camera collision handling.
- Player camera presets, which tracks the player with a number of presets for positioning and angling.

---

## Script Structure

The file is organized into three main exported namespaces, all of which are necessary to run the script:

```ts
export namespace PCT_ErrorLogger
export namespace PCT_UI
export namespace PCT
```

If you intend on using this script as a standalone, you only need, please refer to Installation Option 1 below (all of the necessary code is already bundled).

### `PCT`

Main toolkit namespace. This contains initialization, player/director state and handling, camera logic, path logic, path camera logic, free camera cam logic, VFX logic, and the public event bridge functions.

---

# Installation Option 1: Standalone Script (Easy)

Use this option if PCT is the only script of your Battlefield Portal experience. If you will be running PCT alongside other script, please refer to Installation Option 2.

## 1. Add a Fixed Camera in Godot

Create a **Fixed Camera** object in your Godot level.

The Fixed Camera object is required because PCT uses its object ID to set the camera object controlled by the script. The Fixed Camera objId in Godot must be unique and must not be shared with another object.

The location of the Fixed Camera in Godot is important. This is where the interact point will be first spawned to open the Director menu, enter the passcode and obtain Director privileges to operate the cameras. Make sure the position of the Fixed Camera in Godot is easily accessible to you once you are in-game.

## 2. Paste the full PCT script in an existing or new experience

Create a new portal experience.

Upload your level as exported with Godot (including the FixedCamera) to your experience.

Either (i) download and import releases/script-vXX.ts as a script into your Portal experience or (ii) paste the entire contents of releases/script-vXX.ts into your Portal experience script.

Do not split the namespaces unless you are comfortable managing imports/exports in your own build setup.

## 3. Paste the full PCT strings file in an existing or new experience

Either (i) download and import releases/strings-vXX.json as the STRINGS file into your Portal experience or (ii) paste the entire contents of releases/strings-vXX.json into your Portal experience STRINGS file.

## 4. Use the included experience hooks

At the bottom of the script, make sure the required Portal event hooks are inserted. Event handler functions such as OnGameModeStarted() are functions that are built into the Portal API and are called automatically at game runtime. These are already built-in to the release script. You don't need to add them. Go to step 5 just below.

## 5. Adjust the PCT.Initialize function in OnGameModeStarted()

Find this in your newly created/imported Portal experience script:

```ts
export function OnGameModeStarted() {
  PCT.Initialize(1001, "1234");
}
```

- `1001` is the Fixed Camera object ID. Make sure this matches the objId of the Fixed Camera that you created in Godot.
- `"1234"` is the director passcode. Feel free to change it.

Change those two values accordig to your needs.

---

# Installation Option 2: Integrating into an Existing Script

Use this option if your Portal experience already has gameplay logic, existing event hooks, UI, player state, etc. If your experience only has one script file, you can integrate PCT into the same script. Most advanced users utilize modular TS source structure and bundle the files into one final Battlefield Portal script. If this is you, you most likely know how to integrate this into your project.

## 1. Add a Fixed Camera in Godot

Create a **Fixed Camera** object in your Godot level.

The Fixed Camera object is required because PCT uses its object ID to set the camera object controlled by the script. The Fixed Camera objId in Godot must be unique and must not be shared with another object.

The location of the Fixed Camera in Godot is important. This is where the interact point will be first spawned to open the Director menu, enter the passcode and obtain Director privileges to operate the cameras. Make sure the position of the Fixed Camera in Godot is easily accessible to you once you are in-game.

## 2. Paste the entire contents of the PCT strings file in your existing strings file

Paste the entire releases/strings-vXX.json strings file into your Portal STRINGS file.

## 3. Insert PCT_ErrorLogger, PCT_UI and PCT namespaces

Import/paste the full PCT code into your script before your existing exported Portal event functions, or in a distinct files to import and bundle.

Recommended order:

```ts
// Your imports / constants, if any

// PCT_ErrorLogger namespace
// PCT_UI namespace
// PCT namespace

// Your own game systems
// Your exported Portal event hooks
```

This keeps PCT available to your event hooks.

## 4. Adjust the event functions. Do not simply duplicate them

You need to adjust your event functions to create PCT hooks. The default event functions are already built into the release script, if this is what you are using. This means you will need to make some adjustments to your script(s) to ensure there is no duplicate event handler function, such as OnGameModeStarted(). Please refer to the section **Minimal Standalone Template** at the end of this page, which includes a template for the experience hooks.

Portal expects one exported function per event name.

For example, do not have two separate functions like this:

```ts
export function OnGameModeStarted() {
  PCT.Initialize(1001, "1234");
}

export function OnGameModeStarted() {
  StartMyOwnGameMode();
}
```

Instead, merge them:

```ts
export function OnGameModeStarted() {
  PCT.Initialize(1001, "1234");

  StartMyOwnGameMode();
}
```

## 5. Call PCT first when possible

For most hooks, call the PCT handler near the top of the event function.

Example:

```ts
export function OnPlayerInteract(
  eventPlayer: mod.Player,
  eventInteractPoint: mod.InteractPoint,
): void {
  PCT.PCTOnPlayerInteract(eventPlayer, eventInteractPoint).catch(
    (error: unknown) => {
      void PCT_ErrorLogger.New(
        OnPlayerInteract.name,
        `PCTOnPlayerInteract failed: ${String(error)}`,
        10,
      );
    },
  );

  // Your existing interaction logic here
}
```

Calling PCT first helps ensure the director panel, path setup interaction points, and freecam interaction points are handled before your own general interaction logic.

## 6. Keep your own logic after PCT

Example integrated `OnPlayerDeployed`:

```ts
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  PCT.PCTOnPlayerDeployed(eventPlayer).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerDeployed.name,
      `PCTOnPlayerDeployed failed: ${String(error)}`,
      10,
    );
  });

  // Existing script logic
  GiveDefaultLoadout(eventPlayer);
  ShowWelcomeMessage(eventPlayer);
}
```

## 7. Preserve your own conditions

If your script already filters players, teams, bots, or game phases, keep those conditions around your own code.

Example:

```ts
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  PCT.PCTOnPlayerDeployed(eventPlayer).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerDeployed.name,
      `PCTOnPlayerDeployed failed: ${String(error)}`,
      10,
    );
  });

  if (IsSpectator(eventPlayer)) return;

  SetupRegularPlayer(eventPlayer);
}
```

Do not do this unless you specifically want PCT disabled for that player. That pattern can prevent PCT from creating or updating player state.

```ts
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  if (IsSpectator(eventPlayer)) return;

  PCT.PCTOnPlayerDeployed(eventPlayer);
}
```

---

# Required Event Hook Mapping

Use this table when integrating PCT into an existing script.

| Portal event                | Required PCT call                       | Required                    |
| --------------------------- | --------------------------------------- | --------------------------- |
| `OnGameModeStarted`         | `PCT.Initialize(...)`                   | Yes                         |
| `OnPlayerDeployed`          | `PCT.PCTOnPlayerDeployed(...)`          | Yes                         |
| `OnPlayerUndeploy`          | `PCT.OnPlayerUndeploy(...)`             | Optional / Not yet utilized |
| `OnPlayerInteract`          | `PCT.PCTOnPlayerInteract(...)`          | Yes                         |
| `OnPlayerLeaveGame`         | `PCT.PCTOnPlayerLeaveGame(...)`         | Yes                         |
| `OnPlayerUIButtonEvent`     | `PCT.PCTOnPlayerUIButtonEvent(...)`     | Yes                         |
| `OnRayCastHit`              | `PCT.PCTOnRayCastHit(...)`              | Yes                         |
| `OnRayCastMissed`           | `PCT.PCTOnRayCastMissed(...)`           | Yes                         |
| `OnPortalGadgetFireStart`   | `PCT.PCTOnPortalGadgetFireStart(...)`   | Yes                         |
| `OnPortalGadgetFireStop`    | `PCT.PCTOnPortalGadgetFireStop(...)`    | Optional / Not yet utilized |
| `OnPortalGadgetLaserToggle` | `PCT.PCTOnPortalGadgetLaserToggle(...)` | Optional / Not yet utilized |

---

# Initialization

## Basic initialization

```ts
PCT.Initialize(1001, "1234");
```

Parameters:

```ts
PCT.Initialize(
  fixedCameraId: number,
  directorPasscode: string,
  defaultConfig?: Partial<PCT.Config>,
): void
```

### `fixedCameraId`

The ID of the Fixed Camera object created in Godot.

This object must exist in the level.

### `directorPasscode`

Numeric string used to become the director.

Examples:

```txt
"1234"
"2468"
"0000"
```

### `defaultConfig`

Optional partial config object used to override default toolkit settings.

IMPORTANT: The current default values are tested and optimized. Do not change unless you know what you are doing or want to experiment.

---

# Director Flow

## 1. Game starts

When `PCT.Initialize(...)` runs, PCT:

- Gets the Fixed Camera by ID.
- Reads its initial position.
- Spawns a director interaction point at that position.
- Creates internal camera, path, VFX, UI, and player state.

## 2. Player interacts with the director point

The player can interact with the PCT director panel.

The toolkit uses the configured passcode to assign a director.

## 3. Director gets special state

When assigned as director, the player is registered internally and receives director-only controls.

PCT also sets the director’s incoming damage factor to `0`.

When unassigned, the incoming damage factor is restored to `100`.

## 4. Director leaves

When the director leaves the game, PCT cleans up:

- Director menu UI.
- Code entry UI.
- Move point tip UI.
- Freecam interaction point.
- Path camera interaction point.
- Director interaction point.
- Director world icon.

Then it respawns the director panel so another player can become director.

---

# Common Setup Mistakes

## The Ineract Point to open the director panel does not appear

Check that:

- `PCT.Initialize(...)` is called in `OnGameModeStarted`.
- The Fixed Camera ID exists.
- The Fixed Camera ID matches the number passed to `PCT.Initialize`.
- The Fixed Camera is positioned somewhere reachable.
- The script did not throw an initialization error.

## The UI appears but buttons do nothing

Check that `OnPlayerUIButtonEvent` forwards to:

```ts
PCT.PCTOnPlayerUIButtonEvent(...)
```

## The camera does not start or move correctly

Check that:

- `OnRayCastHit` is connected.
- `OnRayCastMissed` is connected.
- The director is properly assigned.
- The camera path has enough path points.
- The camera is not locked in another mode/state.

## Another player cannot become director after the director leaves

Check that `OnPlayerLeaveGame` forwards to:

```ts
PCT.PCTOnPlayerLeaveGame(eventNumber);
```

This cleanup is important because PCT tracks the assigned director internally.

## Errors appear in world log

PCT uses:

```ts
PCT_ErrorLogger.New(...)
```

When an error occurs, it logs details to the console and displays `PCT_ERROR_OCCURED` in-game.

If in local server mode, check the console output for the real error message and caller trace.

---

# Best Practices for Existing Scripts

## Keep PCT isolated

Avoid modifying private PCT internals unless necessary.

Use the exported functions instead:

```ts
PCT.Initialize(...)
PCT.IsPlayerDirector(...)
PCT.PCTOnPlayerDeployed(...)
PCT.PCTOnPlayerInteract(...)
```

## Avoid duplicate global state names

PCT has its own internal state. If your script also has camera/player/path state, use clear names to avoid confusion.

## Use `PCT.IsPlayerDirector(...)`

When your own script should ignore the director, check:

```ts
if (PCT.IsPlayerDirector(player)) return;
```

Example:

```ts
export function OnPlayerInteract(
  eventPlayer: mod.Player,
  eventInteractPoint: mod.InteractPoint,
): void {
  PCT.PCTOnPlayerInteract(eventPlayer, eventInteractPoint).catch(
    (error: unknown) => {
      void PCT_ErrorLogger.New(
        OnPlayerInteract.name,
        `PCTOnPlayerInteract failed: ${String(error)}`,
        10,
      );
    },
  );

  if (PCT.IsPlayerDirector(eventPlayer)) return;

  // Normal player interaction logic
}
```

# Minimal Standalone Template

```ts
/************************
 * PORTAL CAMERA TOOLKIT
 ************************/

// Paste PCT_ErrorLogger here
// Paste PCT_UI here
// Paste PCT here

/************************
 * EXPERIENCE HOOKS
 ************************/

export function OnGameModeStarted() {
  PCT.Initialize(1001, "1234");
}

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  PCT.PCTOnPlayerDeployed(eventPlayer).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerDeployed.name,
      `PCTOnPlayerDeployed failed: ${String(error)}`,
      10,
    );
  });
}

export function OnPlayerUndeploy(eventPlayer: mod.Player): void {
  PCT.OnPlayerUndeploy(eventPlayer);
}

export function OnPlayerInteract(
  eventPlayer: mod.Player,
  eventInteractPoint: mod.InteractPoint,
): void {
  PCT.PCTOnPlayerInteract(eventPlayer, eventInteractPoint).catch(
    (error: unknown) => {
      void PCT_ErrorLogger.New(
        OnPlayerInteract.name,
        `PCTOnPlayerInteract failed: ${String(error)}`,
        10,
      );
    },
  );
}

export function OnPlayerLeaveGame(eventNumber: number): void {
  PCT.PCTOnPlayerLeaveGame(eventNumber).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerLeaveGame.name,
      `PCTOnPlayerLeaveGame failed: ${String(error)}`,
      10,
    );
  });
}

export function OnPlayerUIButtonEvent(
  eventPlayer: mod.Player,
  eventUIWidget: mod.UIWidget,
  eventUIButtonEvent: mod.UIButtonEvent,
): void {
  PCT.PCTOnPlayerUIButtonEvent(
    eventPlayer,
    eventUIWidget,
    eventUIButtonEvent,
  ).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerUIButtonEvent.name,
      `PCTOnPlayerUIButtonEvent failed: ${String(error)}`,
      10,
    );
  });
}

export function OnRayCastHit(
  eventPlayer: mod.Player,
  eventPoint: mod.Vector,
  eventNormal: mod.Vector,
): void {
  PCT.PCTOnRayCastHit(eventPlayer, eventPoint, eventNormal);
}

export function OnRayCastMissed(eventPlayer: mod.Player): void {
  PCT.PCTOnRayCastMissed(eventPlayer);
}

export function OnPortalGadgetFireStart(eventPlayer: mod.Player): void {
  if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetFireStart(eventPlayer);
  }
}

export function OnPortalGadgetFireStop(eventPlayer: mod.Player): void {
  if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetFireStop(eventPlayer);
  }
}

export function OnPortalGadgetLaserToggle(
  eventPlayer: mod.Player,
  eventBoolean: boolean,
): void {
  if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetLaserToggle(eventPlayer, eventBoolean);
  }
}
```

# Credits

Created by **NODONE**.

Portal Camera Toolkit is intended for Battlefield Portal creators who want a reusable cinematic camera/director module for custom experiences.
